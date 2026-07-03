// frontend/src/components/chat/ChatContainer.tsx

import { useState, useEffect, useCallback } from "react";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Box, useMediaQuery, type Theme } from "@mui/material";
import { getChats, getMessages } from "../../services/chat";
import { useSocket } from "../../hooks/useSocket";
import type { ChatSummary, Message, MessageStatus } from "../../types/chat";
import Sidebar from "./Sidebar/Sidebar";
import { ChatArea } from "./ChatArea/ChatArea";
import EmptyState from "./EmptyState";
import type { ApiResponse } from "../../types";
import { sendNotification } from "../../services/notificationService";

// نوع داده برای infinite query
type MessagesPage = ApiResponse<Message[]>;
export type InfiniteMessagesData = {
  pages: MessagesPage[];
  pageParams: number[];
};

const ChatContainer = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const { socket, isConnected, onNewMessage, onMessageRead } = useSocket();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  useEffect(() => {
    socket.connect();
  }, []);

  // دریافت لیست چت‌ها
  const { data: chatsResponse, isLoading: chatsLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: getChats,
    staleTime: 60000,
    placeholderData: (previousData) => previousData,
  });

  const chats = chatsResponse?.body ?? [];

  // ========== دریافت پیام‌ها با استفاده از useInfiniteQuery ==========
  const {
    data: messagesData,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["messages", selectedChatId],
    queryFn: ({ pageParam = 1 }) => getMessages(selectedChatId!, pageParam, 30),
    enabled: !!selectedChatId,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.body.length < 30) return undefined;
      return pages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 30000,
  });

  // ترکیب پیام‌ها از تمام صفحات (به‌صورت نزولی)
  const messages =
    messagesData?.pages
      .slice() // کپی برای جلوگیری از تغییر اصلی
      .reverse()
      .flatMap((page) => page.body) ?? [];

  // انتخاب اولین چت
  useEffect(() => {
    if (chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id);
      if (isMobile) setShowMobileChat(false);
    }
  }, [chats, selectedChatId, isMobile]);

  // ========== گوش دادن به پیام‌های جدید ==========
  useEffect(() => {
    const NewMessageHandler = onNewMessage((newMessage: Message) => {
      try {
        if (selectedChatId === newMessage.chatId) {
          queryClient.setQueryData<InfiniteMessagesData>(["messages", selectedChatId], (old) => {
            if (!old) return old;
            const lastPage = old.pages[old.pages.length - 1];
            if (lastPage) {
              return {
                ...old,
                pages: [
                  ...old.pages.slice(0, -1),
                  {
                    ...lastPage,
                    body: [...lastPage.body, newMessage],
                  },
                ],
              };
            }
            return old;
          });
        } else {
          queryClient.setQueryData<ApiResponse<ChatSummary[]>>(["chats"], (old) => {
            if (!old?.body) return old;
            return {
              ...old,
              body: old.body.map((chat) =>
                chat.id === newMessage.chatId
                  ? {
                      ...chat,
                      lastMessage: newMessage,
                      updatedAt: new Date(),
                      unreadCount: (chat.unreadCount ?? 0) + 1,
                    }
                  : chat
              ),
            };
          });

          const senderName = newMessage.sender.name || newMessage.sender.username;
          sendNotification(`پیام جدید از ${senderName}`, {
            body:
              newMessage.messageType === "TEXT"
                ? newMessage.content
                : `[${newMessage.messageType}]`,
            tag: newMessage.chatId,
          });
        }

        queryClient.setQueryData<ApiResponse<ChatSummary[]>>(["chats"], (old) => {
          if (!old?.body) return old;
          return {
            ...old,
            body: old.body.map((chat) =>
              chat.id === newMessage.chatId
                ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
                : chat
            ),
          };
        });
      } catch (error) {
        console.log("onNewMessage error : ", error);
      }
    });

    return () => {
      NewMessageHandler();
    };
  }, [onNewMessage, queryClient, selectedChatId]);

  // ========== گوش دادن به رویداد خوانده شدن پیام ==========
  useEffect(() => {
    const MessageReadHandler = onMessageRead((data) => {
      try {
        queryClient.setQueryData<InfiniteMessagesData>(["messages", data.chatId], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              body: page.body.map((msg) =>
                msg.id === data.messageId
                  ? { ...msg, status: "READ" as MessageStatus, readAt: new Date() }
                  : msg
              ),
            })),
          };
        });

        queryClient.setQueryData<ApiResponse<ChatSummary[]>>(["chats"], (old) => {
          if (!old?.body) return old;
          return {
            ...old,
            body: old.body.map((chat) => {
              if (chat.id === data.chatId && chat.lastMessage?.id === data.messageId) {
                return {
                  ...chat,
                  lastMessage: {
                    ...chat.lastMessage,
                    status: "READ" as MessageStatus,
                  },
                };
              }
              return chat;
            }),
          };
        });
      } catch (error) {
        console.log("MessageReadHandler error : ", error);
      }
    });

    return () => {
      MessageReadHandler();
    };
  }, [onMessageRead, queryClient]);

  // ========== انتخاب چت ==========
  const handleSelectChat = useCallback(
    (chatId: string) => {
      setSelectedChatId(chatId);
      if (isMobile) setShowMobileChat(true);

      queryClient.setQueryData<ApiResponse<ChatSummary[]>>(["chats"], (old) => {
        if (!old?.body) return old;
        return {
          ...old,
          body: old.body.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat)),
        };
      });
    },
    [isMobile, queryClient]
  );

  const handleBackFromChat = useCallback(() => {
    setShowMobileChat(false);
  }, []);

  const handleChatCreated = useCallback(
    (chatId: string) => {
      setSelectedChatId(chatId);
      if (isMobile) setShowMobileChat(true);
    },
    [isMobile]
  );

  const chat = chats?.find((c) => c.id === selectedChatId);

  if (chatsLoading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        در حال بارگذاری چت‌ها...
      </Box>
    );
  }

  // حالت موبایل
  if (isMobile) {
    return (
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
        {!showMobileChat ? (
          <Sidebar
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            isConnected={isConnected}
            handleChatCreated={handleChatCreated}
          />
        ) : selectedChatId && chat ? (
          <ChatArea
            chat={chat}
            messages={messages}
            socket={socket}
            onBack={handleBackFromChat}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isLoading={messagesLoading}
          />
        ) : (
          <EmptyState />
        )}
      </Box>
    );
  }

  // حالت دسکتاپ
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      <Sidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        isConnected={isConnected}
        handleChatCreated={handleChatCreated}
      />
      {selectedChatId && chat ? (
        <ChatArea
          chat={chat}
          messages={messages}
          socket={socket}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={messagesLoading}
        />
      ) : (
        <EmptyState />
      )}
    </Box>
  );
};

export default ChatContainer;

// src/components/chat/ChatArea/ChatArea.tsx

import { Box, useMediaQuery, type Theme } from "@mui/material";
import { useState, useCallback } from "react";
import type { ChatSummary, Message, MessageType, SendMessagePayload } from "../../../types/chat";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useQueryClient } from "@tanstack/react-query";
import { Socket } from "socket.io-client";
import { uploadMessage } from "../../../services/upload";

interface ChatAreaProps {
  chat: ChatSummary;
  messages: Message[];
  socket: Socket;
  onBack?: () => void;
  fetchNextPage: () => Promise<any>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
}

export const ChatArea = ({
  chat,
  messages,
  socket,
  onBack,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
}: ChatAreaProps) => {
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const handleSendMessage = useCallback(
    async (content: string, file?: File, messageType?: MessageType) => {
      setIsSending(true);
      try {
        if (!chat) throw new Error("chat not defined");

        // اگر فایل وجود دارد، از مسیر آپلود استفاده کن
        if (file) {
          const result = await uploadMessage({
            chatId: chat.id,
            content,
            messageType: messageType || "FILE",
            file,
          });
        } else {
          // پیام متنی از طریق سوکت ارسال می‌شود
          const payload: SendMessagePayload = {
            chatId: chat.id,
            content,
            messageType: "TEXT",
          };
          socket.emit("sendMessage", payload);
        }
      } catch (error) {
        console.error("خطا در ارسال پیام:", error);
      } finally {
        setIsSending(false);
      }
    },
    [chat, socket, queryClient]
  );

  const handleCall = useCallback(
    (type: "VOICE" | "VIDEO") => {
      console.log(`شروع تماس ${type} با چت ${chat?.id}`);
    },
    [chat?.id]
  );

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh" }}>
      <ChatHeader chat={chat} isMobile={isMobile} onBack={onBack} onCall={handleCall} />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
      <MessageInput chatId={chat?.id} onSendMessage={handleSendMessage} isSending={isSending} />
    </Box>
  );
};

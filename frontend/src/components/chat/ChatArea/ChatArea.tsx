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
// import type { ApiResponse } from "../../../types";
// import type { InfiniteMessagesData } from "../ChatContainer";

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
            // messageType: "FILE",
            messageType: messageType || "FILE",
            file,
          });

          // پیام آپلود شده را به کش اضافه کن
          // queryClient.setQueryData<InfiniteMessagesData>(["messages", chat.id], (old) => {
          //   if (!old) return old;
          //   const lastPage = old.pages[old.pages.length - 1];
          //   if (lastPage) {
          //     return {
          //       ...old,
          //       pages: [
          //         ...old.pages.slice(0, -1),
          //         {
          //           ...lastPage,
          //           body: [...lastPage.body, result.body],
          //         },
          //       ],
          //     };
          //   }
          //   return old;
          // });

          // به‌روزرسانی لیست چت‌ها
          // queryClient.setQueryData<ApiResponse<ChatSummary[]>>(["chats"], (old) => {
          //   if (!old?.body) return old;
          //   return {
          //     ...old,
          //     body: old.body.map((c) =>
          //       c.id === chat.id ? { ...c, lastMessage: result.body, updatedAt: new Date() } : c
          //     ),
          //   };
          // });
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

// // src/components/chat/ChatArea/ChatArea.tsx

// import { Box, useMediaQuery, type Theme } from "@mui/material";
// import { useState, useCallback } from "react";
// import type { ChatSummary, Message, SendMessagePayload } from "../../../types/chat";
// import { ChatHeader } from "./ChatHeader";
// import { MessageList } from "./MessageList";
// import { MessageInput } from "./MessageInput";
// // import { sendMessage } from "../../../services/chat";
// import { useQueryClient } from "@tanstack/react-query";
// import { Socket } from "socket.io-client";
// // import { uploadMessage } from "../../../services/upload";
// // import type { ApiResponse } from "../../../types";

// interface ChatAreaProps {
//   chat: ChatSummary;
//   messages: Message[];
//   socket: Socket;
//   onBack?: () => void;
//   //new
//   // fetchNextPage: () => void;
//   fetchNextPage: () => Promise<any>;
//   hasNextPage: boolean;
//   isFetchingNextPage: boolean;
//   isLoading: boolean;
// }

// export const ChatArea = ({
//   chat,
//   messages,
//   socket,
//   onBack,
//   fetchNextPage,
//   hasNextPage,
//   isFetchingNextPage,
//   isLoading,
// }: ChatAreaProps) => {
//   const [isSending, setIsSending] = useState(false);
//   const queryClient = useQueryClient();
//   const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

//   // const handleSendMessage = useCallback(
//   //   async (content: string, file?: File) => {
//   //     setIsSending(true);
//   //     try {
//   //       if (!chat) throw Error("chat nor defined");
//   //       console.log("ChatArea chat:", chat);
//   //       const payload: SendMessagePayload = {
//   //         chatId: chat?.id,
//   //         content,
//   //         messageType: file ? "FILE" : "TEXT",
//   //         file,
//   //       };
//   //       console.log("ChatArea handleSendMessage payload:", payload);
//   //       // const newMessage = await sendMessage(payload);
//   //       let newMessage;
//   //       if (payload.messageType == "FILE") {
//   //         newMessage = await uploadMessage(payload);
//   //       } else {
//   //         newMessage = await sendMessage({
//   //           chatId: chat?.id,
//   //           content,
//   //         });
//   //       }

//   //       // console.log("queryClient.getQueryCache()", queryClient.getQueryCache());
//   //       // console.log(
//   //       //   `queryClient.getQueryData(["messages", chat.id])`,
//   //       //   queryClient.getQueryData(["messages", chat.id])
//   //       // );

//   //       // queryClient.setQueryData<Message[]>(["messages", chat.id], (old) => {
//   //       //   const safeOld = Array.isArray(old) ? old : [];
//   //       //   return [...safeOld, newMessage?.body];
//   //       // });

//   //       // به‌روزرسانی آخرین پیام در لیست چت‌ها
//   //       // queryClient.setQueryData<ChatSummary[]>(["chats"], (old = []) =>
//   //       //   old?.map((c) =>
//   //       //     c?.id === chat?.id ? { ...c, lastMessage: newMessage?.body, updatedAt: new Date() } : c
//   //       //   )
//   //       // );

//   //       console.log(
//   //         `queryClient.getQueryData(["messages", chat.id])1`,
//   //         queryClient.getQueryData(["messages", chat.id])
//   //       );
//   //       // اضافه کردن پیام به کش
//   //       // ✅ به‌روزرسانی پیام‌ها (فقط body را تغییر بده)
//   //       queryClient.setQueryData(["messages", chat.id], (old: any) => {
//   //         if (!old) return old;
//   //         // old شامل { success, body, message, status } است
//   //         return {
//   //           ...old,
//   //           body: [...old?.body, newMessage?.body],
//   //         };
//   //       });

//   //       // اضافه کردن پیام به کش
//   //       // queryClient.setQueryData<Message[]>(["messages", chat.id], (old = []) => [
//   //       //   ...old,
//   //       //   newMessage?.body,
//   //       // ]);

//   //       console.log(
//   //         `queryClient.getQueryData(["messages", chat.id])2`,
//   //         queryClient.getQueryData(["messages", chat.id])
//   //       );

//   //       console.log(`queryClient.getQueryData(["chats")1`, queryClient.getQueryData(["chats"]));

//   //       // // ✅ به‌روزرسانی لیست چت‌ها (آخرین پیام را set کن)
//   //       // // <ChatSummary[]>
//   //       queryClient.setQueryData<ApiResponse<ChatSummary[]>>(["chats"], (old) => {
//   //         return {
//   //           ...old,
//   //           body:
//   //             old?.body?.map((c) =>
//   //               c.id === chat.id
//   //                 ? { ...c, lastMessage: newMessage?.body, updatedAt: new Date() }
//   //                 : c
//   //             ) || old?.body,
//   //         };
//   //       });

//   //       // به‌روزرسانی آخرین پیام در لیست چت‌ها
//   //       // queryClient.setQueryData<ChatSummary[]>(["chats"], (old) => {
//   //       //   const safeOld = Array.isArray(old) ? old : [];
//   //       //   return safeOld.map((c) =>
//   //       //     c.id === chat?.id ? { ...c, lastMessage: newMessage?.body, updatedAt: new Date() } : c
//   //       //   );
//   //       // });

//   //       console.log(`queryClient.getQueryData(["chats")2`, queryClient.getQueryData(["chats"]));
//   //       console.log("chatarea newMessage", newMessage);
//   //       // emit از طریق socket
//   //       // socket.emit("sendMessage", newMessage);
//   //       // socket.emit("sendMessage", newMessage?.body);
//   //       socket.emit("sendMessage", payload);
//   //     } catch (error) {
//   //       console.error("خطا در ارسال پیام:", error);
//   //     } finally {
//   //       setIsSending(false);
//   //     }
//   //   },
//   //   [chat?.id, queryClient, socket]
//   // );

//   const handleSendMessage = useCallback(
//     async (content: string, file?: File) => {
//       setIsSending(true);
//       try {
//         if (!chat) throw Error("chat nor defined");
//         // console.log("ChatArea chat:", chat);
//         const payload: SendMessagePayload = {
//           chatId: chat?.id,
//           content,
//           messageType: file ? "FILE" : "TEXT",
//           file,
//         };
//         socket.emit("sendMessage", payload);
//       } catch (error) {
//         console.error("خطا در ارسال پیام:", error);
//       } finally {
//         setIsSending(false);
//       }
//     },
//     [chat?.id, queryClient, socket]
//   );

//   const handleCall = useCallback(
//     (type: "VOICE" | "VIDEO") => {
//       // پیاده‌سازی تماس در مرحله بعد
//       console.log(`شروع تماس ${type} با چت ${chat?.id}`);
//     },
//     [chat?.id]
//   );

//   return (
//     <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh" }}>
//       <ChatHeader chat={chat} isMobile={isMobile} onBack={onBack} onCall={handleCall} />
//       <MessageList
//         messages={messages}
//         isLoading={isLoading}
//         fetchNextPage={fetchNextPage}
//         hasNextPage={hasNextPage}
//         isFetchingNextPage={isFetchingNextPage}
//       />
//       <MessageInput chatId={chat?.id} onSendMessage={handleSendMessage} isSending={isSending} />
//     </Box>
//   );
// };

// src/components/chat/ChatArea/MessageItem.tsx

import { Box, Typography, Paper, Avatar } from "@mui/material";
import type { ChatSummary, Message } from "../../../types/chat";
import { Done, DoneAll } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GetMe } from "../../../services/auth";
import { useEffect, useRef } from "react";
import { markMessageAsReadSocket } from "../../../services/chat"; // <- سرویس جدید
import { useColorScheme } from "@mui/material/styles";
import type { ApiResponse } from "../../../types";

interface MessageItemProps {
  message: Message;
  isPreviousSameSender: boolean;
  fontSize: number; // ← اضافه کردن prop
}
const backend_url = import.meta.env.VITE_BACKEND_URL;
const getFileUrl = (fileUrl: string | null) => {
  if (!fileUrl) return null;
  // استخراج نام فایل از مسیر قدیمی
  const filename = fileUrl.split("/").pop();
  // return `/api/files/${filename}`;
  return `${backend_url}/api/files/${filename}`;
};

export const MessageItem = ({ message, isPreviousSameSender, fontSize }: MessageItemProps) => {
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: GetMe,
  });
  const queryClient = useQueryClient();
  const { mode: ThemeMode } = useColorScheme();

  const user = data?.body;
  const isMine = message.senderId === user?.id;

  // استفاده از ref برای جلوگیری از اجرای مجدد
  const hasMarkedAsRead = useRef(false);
  const messageRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  };

  // const renderContent = () => {
  //   switch (message.messageType) {
  //     case "TEXT":
  //       return (
  //         // <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
  //         //   {message.content}
  //         // </Typography>
  //         <Typography variant="body2" sx={{ wordBreak: "break-word", fontSize: `${fontSize}px` }}>
  //           {message.content}
  //         </Typography>
  //       );
  //     case "IMAGE":
  //       return (
  //         <Box sx={{ maxWidth: 300, maxHeight: 300, borderRadius: 1, overflow: "hidden" }}>
  //           <img
  //             src={message.fileUrl!}
  //             alt={message.fileName || "تصویر"}
  //             style={{ width: "100%", height: "auto" }}
  //           />
  //         </Box>
  //       );
  //     case "AUDIO":
  //       return (
  //         <Box sx={{ minWidth: 200 }}>
  //           <audio controls style={{ width: "100%" }}>
  //             <source src={message.fileUrl!} type={message.mimeType || "audio/mpeg"} />
  //           </audio>
  //         </Box>
  //       );
  //     case "VIDEO":
  //       return (
  //         <Box sx={{ maxWidth: 300, maxHeight: 300, borderRadius: 1, overflow: "hidden" }}>
  //           <video controls style={{ width: "100%", height: "auto" }}>
  //             <source src={message.fileUrl!} type={message.mimeType || "video/mp4"} />
  //           </video>
  //         </Box>
  //       );
  //     case "FILE":
  //       return (
  //         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  //           <Typography variant="body2">{message.fileName || "فایل"}</Typography>
  //           <Typography variant="caption" color="text.secondary">
  //             {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : ""}
  //           </Typography>
  //         </Box>
  //       );
  //     default:
  //       return <Typography variant="body2">{message.content}</Typography>;
  //   }
  // };

  // src/components/chat/ChatArea/MessageItem.tsx

  const renderContent = () => {
    switch (message.messageType) {
      case "TEXT":
        return (
          <Typography
            sx={{
              wordBreak: "break-word",
              fontSize: `${fontSize}px`,
            }}
          >
            {message.content}
          </Typography>
        );
      case "IMAGE":
        return (
          <Box sx={{ maxWidth: 300, maxHeight: 300, borderRadius: 1, overflow: "hidden" }}>
            <img
              // src={message.fileUrl!}
              src={getFileUrl(message.fileUrl)}
              alt={message.fileName || "تصویر"}
              style={{ width: "100%", height: "auto" }}
            />
          </Box>
        );
      case "AUDIO":
        return (
          <Box sx={{ minWidth: 200 }}>
            <audio controls style={{ width: "100%" }}>
              {/* <source src={message.fileUrl!} type={message.mimeType || "audio/mpeg"} /> */}
              <source src={getFileUrl(message.fileUrl)} type={message.mimeType || "audio/mpeg"} />
            </audio>
          </Box>
        );
      case "VIDEO":
        return (
          <Box sx={{ maxWidth: 300, maxHeight: 300, borderRadius: 1, overflow: "hidden" }}>
            <video controls style={{ width: "100%", height: "auto" }}>
              {/* <source src={message.fileUrl!} type={message.mimeType || "video/mp4"} /> */}
              <source src={getFileUrl(message.fileUrl)} type={message.mimeType || "video/mp4"} />
            </video>
          </Box>
        );
      case "FILE":
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: `${fontSize}px` }}>{message.fileName || "فایل"}</Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: `${fontSize - 2}px` }}
            >
              {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : ""}
            </Typography>
          </Box>
        );
      default:
        return <Typography sx={{ fontSize: `${fontSize}px` }}>{message.content}</Typography>;
    }
  };

  // مدیریت علامت‌گذاری به عنوان خوانده شده
  useEffect(() => {
    // اگر پیام متعلق به خودم باشد یا قبلاً خوانده شده یا قبلاً درخواست داده شده
    if (isMine || message.status === "READ" || hasMarkedAsRead.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasMarkedAsRead.current) {
            hasMarkedAsRead.current = true; // جلوگیری از اجرای مجدد

            // ارسال درخواست علامت‌گذاری
            markMessageAsReadSocket(message.id)
              .then(() => {
                // console.log(`Message ${message.id} marked as read`);

                // ✅ به‌روزرسانی unreadCount در لیست چت‌ها
                queryClient.setQueryData<ApiResponse<ChatSummary[]>>(["chats"], (old) => {
                  if (!old?.body) return old;

                  return {
                    ...old,
                    body: old.body.map((chat) => {
                      if (chat.id === message.chatId && chat.unreadCount > 0) {
                        return {
                          ...chat,
                          unreadCount: chat.unreadCount - 1,
                        };
                      }
                      return chat;
                    }),
                  };
                });
              })
              .catch((err) => {
                console.error("خطا در علامت‌گذاری خوانده شده", err);
                hasMarkedAsRead.current = false; // اجازه تلاش مجدد در صورت خطا
              });

            observer.disconnect(); // فقط یک بار برای این پیام
          }
        });
      },
      { threshold: 0.5 } // ۵۰٪ از پیام در ویوپورت باشد
    );

    if (messageRef.current) {
      observer.observe(messageRef.current);
    }

    return () => observer.disconnect();
  }, [isMine, message.id, message.status]);

  return (
    <Box
      ref={messageRef}
      sx={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        mb: isPreviousSameSender ? 0.5 : 2,
        px: 2,
      }}
    >
      {!isMine && !isPreviousSameSender && (
        <Avatar sx={{ width: 32, height: 32, mr: 1, mt: 0.5 }}>
          {message.sender.username?.[0] || "U"}
        </Avatar>
      )}
      {!isMine && isPreviousSameSender && <Box sx={{ width: 48 }} />}

      <Box sx={{ maxWidth: "70%" }}>
        <Paper
          sx={{
            p: 1.5,
            bgcolor: isMine ? "primary.main" : "background.paper",
            // ✅ اصلاح رنگ متن با contrastText
            color: isMine ? "primary.contrastText" : "text.primary",
            borderRadius: 2,
            borderTopRightRadius: isMine ? 0 : 2,
            borderTopLeftRadius: !isMine ? 0 : 2,
          }}
        >
          {renderContent()}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 0.5,
              mt: 0.5,
            }}
          >
            {/* <Typography
              variant="caption"
              // ✅ رنگ متن تایم‌استمپ نیز اصلاح شود
              color={isMine ? "primary.contrastText" : "text.secondary"}
              sx={{ opacity: 0.8 }}
            >
              {formatTime(message.createdAt)}
            </Typography> */}

            <Typography
              variant="caption"
              color={isMine ? "primary.contrastText" : "text.secondary"}
              sx={{ opacity: 0.8, fontSize: `${fontSize - 2}px` }} // کمی کوچکتر
            >
              {formatTime(message.createdAt)}
            </Typography>

            {/* {isMine &&
              (message.status === "READ" ? (
                <DoneAll sx={{ fontSize: 16, color: "#4fc3f7" }} />
              ) : message.status === "DELIVERED" ? (
                <DoneAll
                  sx={{
                    fontSize: 16,
                    color: isMine ? "primary.contrastText" : "text.secondary",
                    opacity: 0.7,
                  }}
                />
              ) : (
                <Done
                  sx={{
                    fontSize: 16,
                    color: isMine ? "primary.contrastText" : "text.secondary",
                    opacity: 0.7,
                  }}
                />
              ))} */}

            {/* {isMine &&
              (message.status === "READ" ? (
                <DoneAll sx={{ fontSize: 16, color: "#4fc3f7" }} />
              ) : message.status === "DELIVERED" ? (
                <DoneAll
                  sx={{
                    fontSize: 16,
                    color: "text.primary",
                    opacity: 0.5,
                  }}
                />
              ) : (
                <Done
                  sx={{
                    fontSize: 16,
                    color: "text.primary",
                    opacity: 0.5,
                  }}
                />
              ))} */}

            {isMine &&
              (message.status === "READ" ? (
                <DoneAll
                  sx={{
                    fontSize: 16,
                    // color: "#4fc3f7"
                    color: ThemeMode === "light" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                  }}
                />
              ) : message.status === "DELIVERED" ? (
                <DoneAll
                  sx={{
                    fontSize: 16,
                    color: ThemeMode === "light" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                  }}
                />
              ) : (
                <Done
                  sx={{
                    fontSize: 16,
                    color: ThemeMode !== "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                  }}
                />
              ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

// // کامپوننت MessageItem (نمایش پیام‌ها با انواع مختلف)
// // src/components/chat/ChatArea/MessageItem.tsx

// import { Box, Typography, Paper, Avatar } from "@mui/material";
// import type { Message } from "../../../types/chat";
// import { Done, DoneAll } from "@mui/icons-material";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { GetMe } from "../../../services/auth";
// // import { markMessageAsRead } from "../../../services/chat";
// import { useEffect, useRef, useState } from "react";
// import { socket } from "../../../socket";
// // import { useSocket } from "../../../hooks/useSocket";

// interface MessageItemProps {
//   message: Message;
//   isPreviousSameSender: boolean;
// }

// export const MessageItem = ({ message, isPreviousSameSender }: MessageItemProps) => {
//   const { data } = useQuery({
//     queryKey: ["me"],
//     queryFn: GetMe,
//   });
//   // console.log("MessageItem message:", message);
//   const user = data?.body;
//   const isMine = message.senderId === user?.id;

//   const formatTime = (date: Date) => {
//     return new Date(date).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
//   };

//   const renderContent = () => {
//     switch (message.messageType) {
//       case "TEXT":
//         return (
//           <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
//             {message.content}
//           </Typography>
//         );
//       case "IMAGE":
//         return (
//           <Box sx={{ maxWidth: 300, maxHeight: 300, borderRadius: 1, overflow: "hidden" }}>
//             <img
//               src={message.fileUrl!}
//               alt={message.fileName || "تصویر"}
//               style={{ width: "100%", height: "auto" }}
//             />
//           </Box>
//         );
//       case "AUDIO":
//         return (
//           <Box sx={{ minWidth: 200 }}>
//             <audio controls style={{ width: "100%" }}>
//               <source src={message.fileUrl!} type={message.mimeType || "audio/mpeg"} />
//             </audio>
//           </Box>
//         );
//       case "VIDEO":
//         return (
//           <Box sx={{ maxWidth: 300, maxHeight: 300, borderRadius: 1, overflow: "hidden" }}>
//             <video controls style={{ width: "100%", height: "auto" }}>
//               <source src={message.fileUrl!} type={message.mimeType || "video/mp4"} />
//             </video>
//           </Box>
//         );
//       case "FILE":
//         return (
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             <Typography variant="body2">{message.fileName || "فایل"}</Typography>
//             <Typography variant="caption" color="text.secondary">
//               {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : ""}
//             </Typography>
//           </Box>
//         );
//       default:
//         return <Typography variant="body2">{message.content}</Typography>;
//     }
//   };

//   const [readRequested, setReadRequested] = useState(false);
//   const messageRef = useRef<HTMLDivElement | null>(null);
//   // const queryClient = useQueryClient();
//   useEffect(() => {
//     // شرط: پیام متعلق به خودم نباشد و هنوز خوانده نشده باشد
//     if (isMine || message.status === "READ" || readRequested) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             // ارسال درخواست
//             // markMessageAsRead(message.id)
//             //   .then(() => {
//             //     setReadRequested(true);
//             //     console.log("readRequested:::", readRequested);
//             //     // در صورت نیاز، وضعیت پیام را به‌روزرسانی محلی کنید (مثلاً با mutate)
//             //     console.log("observer", queryClient.getQueryData(["messages", message.chatId]));
//             //     console.log("MessageItem message:", message);
//             //     // queryClient.setQueryData(["messages", selectedChatId], (old: any) => {
//             //     //   if (!old) return old;
//             //     //   // old شامل { success, body, message, status } است
//             //     //   return {
//             //     //     ...old,
//             //     //     body: [...old?.body, newMessage],
//             //     //   };
//             //     // });

//             //     // queryClient.setQueryData(["messages", message.chatId], (oldData: any) => {
//             //     //   if (!oldData) return oldData;
//             //     //   return {
//             //     //     ...oldData,
//             //     //     body: oldData.pages?.map((page: any) => ({
//             //     //       ...page,
//             //     //       data: page.data?.map((msg: Message) =>
//             //     //         msg.id === message.id ? { ...msg, status: "READ" } : msg
//             //     //       ),
//             //     //     })),
//             //     //   };
//             //     // });
//             //   })
//             //   .catch((err) => console.error("خطا در علامت‌گذاری خوانده شده", err));

//             socket.emit("markAsRead", message.id);
//             observer.disconnect(); // فقط یک بار برای این پیام
//           }
//         });
//       },
//       { threshold: 0.5 } // ۵۰٪ از پیام در ویوپورت باشد
//     );

//     if (messageRef.current) {
//       observer.observe(messageRef.current);
//     }

//     return () => observer.disconnect();
//   }, [isMine, message.status, message.id, readRequested]);

//   // const { onMessageRead } = useSocket();
//   // useEffect(() => {
//   //   const userOnline = onMessageRead((data) => {
//   //     console.log("userOnline onMessageRead received:", data.userId);
//   //     console.log("userOnline observer", queryClient.getQueryData(["messages", message.chatId]));
//   //   });
//   //   return () => {
//   //     userOnline();
//   //   };
//   // }, [onMessageRead]);

//   return (
//     <Box
//       ref={messageRef}
//       sx={{
//         display: "flex",
//         justifyContent: isMine ? "flex-end" : "flex-start",
//         mb: isPreviousSameSender ? 0.5 : 2,
//         px: 2,
//       }}
//     >
//       {!isMine && !isPreviousSameSender && (
//         <Avatar sx={{ width: 32, height: 32, mr: 1, mt: 0.5 }}>
//           {message.sender.username?.[0] || "U"}
//         </Avatar>
//       )}
//       {!isMine && isPreviousSameSender && <Box sx={{ width: 48 }} />}
//       <Box sx={{ maxWidth: "70%" }}>
//         <Paper
//           sx={{
//             p: 1.5,
//             bgcolor: isMine ? "primary.main" : "background.paper",
//             // color: isMine ? "white" : "text.primary",
//             // color: isMine ? "text.secondary" : "text.primary",
//             color: isMine ? "primary.contrastText" : "text.primary",
//             borderRadius: 2,
//             borderTopRightRadius: isMine ? 0 : 2,
//             borderTopLeftRadius: !isMine ? 0 : 2,
//           }}
//         >
//           {renderContent()}
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "flex-end",
//               alignItems: "center",
//               gap: 0.5,
//               mt: 0.5,
//             }}
//           >
//             <Typography
//               variant="caption"
//               // color={isMine ? "rgba(255,255,255,0.7)" : "text.secondary"}
//               // color={isMine ? "textPrimary" : "textSecondary"}
//             >
//               {formatTime(message.createdAt)}
//             </Typography>
//             {isMine &&
//               (message.status === "READ" ? (
//                 <DoneAll sx={{ fontSize: 16, color: "#4fc3f7" }} />
//               ) : message.status === "DELIVERED" ? (
//                 <DoneAll sx={{ fontSize: 16, color: "rgba(255,255,255,0.7)" }} />
//               ) : (
//                 <Done sx={{ fontSize: 16, color: "rgba(255,255,255,0.7)" }} />
//               ))}
//           </Box>
//         </Paper>
//       </Box>
//     </Box>
//   );
// };

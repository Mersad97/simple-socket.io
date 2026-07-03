// src/components/chat/ChatArea/MessageInput.tsx

import { useState, useRef, useEffect } from "react";
import { TextField, IconButton, Paper, Popover } from "@mui/material";
import { Send, EmojiEmotions, AttachFile } from "@mui/icons-material";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useSocket } from "../../../hooks/useSocket";
import type { MessageType } from "../../../types/chat";

interface MessageInputProps {
  chatId: string;
  onSendMessage: (content: string, file?: File, messageType?: MessageType) => void;
  isSending?: boolean;
}

export const MessageInput = ({ chatId, onSendMessage, isSending }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { socket } = useSocket();

  // const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // تابع ارسال stopTyping و پاک کردن تایمر
  const sendStopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socket.emit("stopTyping", chatId);
  };

  // هر بار که پیام تغییر می‌کند
  useEffect(() => {
    const trimmed = message.trim();
    if (trimmed.length > 0) {
      // اگر قبلاً تایپ نبود، رویداد typing بفرست
      if (!typingTimeoutRef.current) {
        socket.emit("typing", chatId);
      }
      // ریست تایمر برای stopTyping
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", chatId);
        typingTimeoutRef.current = null;
      }, 1500); // بعد از ۱٫۵ ثانیه مکث
    } else {
      // اگر خالی شد، بلافاصله stopTyping بفرست
      sendStopTyping();
    }

    // Cleanup هنگام unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.emit("stopTyping", chatId);
      }
    };
  }, [message, chatId, socket]);

  const handleSend = () => {
    if (message.trim()) {
      sendStopTyping(); // قبل از ارسال، وضعیت تایپ را متوقف کن
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setAnchorEl(null);
  };

  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     sendStopTyping(); // قبل از آپلود فایل، stopTyping
  //     onSendMessage(file.name, file);
  //   }
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = "";
  //   }
  // };

  // تابع تشخیص نوع فایل بر اساس MIME Type
  const getMessageTypeFromFile = (file: File): "IMAGE" | "VIDEO" | "AUDIO" | "FILE" => {
    const type = file.type;
    if (type.startsWith("image/")) return "IMAGE";
    if (type.startsWith("video/")) return "VIDEO";
    if (type.startsWith("audio/")) return "AUDIO";
    return "FILE";
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      sendStopTyping();
      const fileType = getMessageTypeFromFile(file);
      // ارسال توضیح متنی (در صورت وجود) به‌عنوان content
      const content = message.trim() || file.name;
      onSendMessage(content, file, fileType);
      setMessage(""); // پاک کردن متن پس از ارسال فایل
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Paper
      sx={{
        p: 1,
        borderTop: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 1,
        bgcolor: "background.paper",
      }}
    >
      <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
        <AttachFile />
      </IconButton>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
        accept="image/*,audio/*,video/*"
      />
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <EmojiEmotions />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </Popover>

      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="پیام خود را بنویسید..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        variant="standard"
        slotProps={{
          input: {
            disableUnderline: true,
          },
        }}
        sx={{ flex: 1 }}
        disabled={isSending}
      />

      <IconButton color="primary" onClick={handleSend} disabled={!message.trim() || isSending}>
        <Send />
      </IconButton>
    </Paper>
  );
};

// // src/components/chat/ChatArea/MessageInput.tsx

// import { useState, useRef } from "react";
// import { TextField, IconButton, Paper, Popover } from "@mui/material";
// import { Send, EmojiEmotions, AttachFile, Mic, Image, VideoCall } from "@mui/icons-material";
// import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

// interface MessageInputProps {
//   chatId: string;
//   onSendMessage: (content: string, file?: File) => void;
//   isSending?: boolean;
// }

// export const MessageInput = ({ chatId, onSendMessage, isSending }: MessageInputProps) => {
//   const [message, setMessage] = useState("");
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleSend = () => {
//     if (message.trim()) {
//       onSendMessage(message.trim());
//       setMessage("");
//     }
//   };

//   // ✅ تغییر به onKeyDown
//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const handleEmojiClick = (emojiData: EmojiClickData) => {
//     setMessage((prev) => prev + emojiData.emoji);
//     setAnchorEl(null);
//   };

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       onSendMessage(file.name, file);
//     }
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   return (
//     <Paper
//       sx={{
//         p: 1,
//         borderTop: "1px solid",
//         borderColor: "divider",
//         display: "flex",
//         alignItems: "center",
//         gap: 1,
//         bgcolor: "background.paper",
//       }}
//     >
//       <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
//         <AttachFile />
//       </IconButton>
//       <input
//         type="file"
//         ref={fileInputRef}
//         style={{ display: "none" }}
//         onChange={handleFileUpload}
//         accept="image/*,audio/*,video/*"
//       />
//       <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
//         <EmojiEmotions />
//       </IconButton>
//       <Popover
//         open={Boolean(anchorEl)}
//         anchorEl={anchorEl}
//         onClose={() => setAnchorEl(null)}
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//         transformOrigin={{ vertical: "bottom", horizontal: "center" }}
//       >
//         <EmojiPicker onEmojiClick={handleEmojiClick} />
//       </Popover>

//       {/* ✅ استفاده از slotProps به‌جای InputProps */}
//       <TextField
//         fullWidth
//         multiline
//         maxRows={4}
//         placeholder="پیام خود را بنویسید..."
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onKeyDown={handleKeyDown} // ✅ تغییر از onKeyPress
//         variant="standard"
//         slotProps={{
//           input: {
//             disableUnderline: true,
//           },
//         }}
//         sx={{ flex: 1 }}
//         disabled={isSending}
//       />

//       <IconButton color="primary" onClick={handleSend} disabled={!message.trim() || isSending}>
//         <Send />
//       </IconButton>
//     </Paper>
//   );
// };

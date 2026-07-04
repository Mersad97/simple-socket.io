// کامپوننت ChatHeader (هدر چت با دکمه‌های تماس)
// src/components/chat/ChatArea/ChatHeader.tsx

import { Box, Typography, IconButton, Toolbar, Avatar } from "@mui/material";
import { ArrowBack, Phone, VideoCall, MoreVert } from "@mui/icons-material";
import type { ChatSummary } from "../../../types/chat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GetMe } from "../../../services/auth";
import { useSocket } from "../../../hooks/useSocket";
import { useEffect, useState } from "react";
import type { ApiResponse } from "../../../types";

interface ChatHeaderProps {
  chat: ChatSummary;
  isMobile: boolean;
  onBack?: () => void;
  onCall: (type: "VOICE" | "VIDEO") => void;
}

export const ChatHeader = ({ chat, isMobile, onBack, onCall }: ChatHeaderProps) => {
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: GetMe,
  });
  const user = data?.body;
  const currentUserId = user?.id;
  const queryClient = useQueryClient();

  // state برای نمایش تایپ
  const [isOtherTyping, setIsOtherTyping] = useState<boolean>(false);

  // دریافت توابع شنونده از useSocket
  const { onTyping, onStopTyping, onUserOnline, onUserOffline } = useSocket();

  // ====== گوش دادن به رویدادهای تایپ ======
  useEffect(() => {
    if (!chat?.id || !currentUserId) return;

    const unsubTyping = onTyping((data) => {
      if (data.chatId === chat.id && data.userId !== currentUserId) {
        setIsOtherTyping(true);
      }
    });

    const unsubStopTyping = onStopTyping((data) => {
      if (data.chatId === chat.id && data.userId !== currentUserId) {
        setIsOtherTyping(false);
      }
    });

    return () => {
      unsubTyping();
      unsubStopTyping();
    };
  }, [chat?.id, currentUserId, onTyping, onStopTyping]);

  // (اختیاری) تایمر ایمنی برای مخفی کردن تایپ بعد از ۵ ثانیه در صورت عدم دریافت stopTyping
  useEffect(() => {
    if (isOtherTyping) {
      const timer = setTimeout(() => {
        setIsOtherTyping(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOtherTyping]);

  useEffect(() => {
    const userOnline = onUserOnline((data) => {
      queryClient.setQueryData<ApiResponse<ChatSummary[]>>(["chats"], (old) => {
        if (!old) return old; // or return undefined
        return {
          ...old,
          body:
            old?.body?.map((c) => {
              const p = c.participants?.map((participant) =>
                participant.user.id == data.userId
                  ? { ...participant, user: { ...participant.user, isOnline: true } }
                  : { ...participant }
              );
              return { ...c, participants: p };
            }) || old?.body,
        };
      });
    });

    return () => {
      userOnline();
    };
  }, [onUserOnline]);
  useEffect(() => {
    const userOffline = onUserOffline((data) => {
      queryClient.setQueryData<ApiResponse<ChatSummary[]>>(["chats"], (old) => {
        if (!old) return old; // or return undefined
        return {
          ...old,
          body:
            old?.body?.map((c) => {
              const p = c.participants?.map((participant) =>
                participant.user.id == data.userId
                  ? { ...participant, user: { ...participant.user, isOnline: false } }
                  : { ...participant }
              );
              return { ...c, participants: p };
            }) || old?.body,
        };
      });
    });

    return () => {
      userOffline();
    };
  }, [onUserOffline]);

  if (!chat) {
    console.log("ChatHeader !chat");
    return;
  }

  const getDisplayName = () => {
    if (chat?.isGroup) {
      return chat.name || "گروه";
    }
    const otherUser = chat.participants.find((p) => p.user.id !== currentUserId);
    return otherUser?.user.name || otherUser?.user.username || "ناشناس";
  };

  const getAvatar = () => {
    if (chat?.isGroup) {
      return chat.avatar || undefined;
    }
    const otherUser = chat.participants.find((p) => p.user.id !== currentUserId);
    return otherUser?.user.avatar || undefined;
  };

  const isOnline = () => {
    if (!chat?.isGroup) {
      const otherUser = chat.participants.find((p) => p.user.id !== currentUserId);
      return otherUser?.user.isOnline || false;
    }
    return false;
  };

  // تعیین وضعیت نمایشی
  const statusText = isOtherTyping ? "در حال تایپ..." : isOnline() ? "آنلاین" : "آفلاین";
  const statusColor = isOtherTyping ? "text.secondary" : isOnline() ? "success" : "error";

  return (
    <Toolbar
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        minHeight: { xs: 56, sm: 64 },
        px: { xs: 1, sm: 2 },
      }}
    >
      {isMobile && (
        <IconButton edge="start" onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
      )}
      <Avatar src={getAvatar()} sx={{ width: 40, height: 40, mr: 1.5 }}>
        {!getAvatar() && (getDisplayName()?.[0] || "?")}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} noWrap>
          {getDisplayName()}
        </Typography>
        <Typography variant="caption" color={statusColor} sx={{ fontWeight: "bold" }}>
          {statusText}
        </Typography>
      </Box>
      <IconButton onClick={() => onCall("VOICE")}>
        <Phone />
      </IconButton>
      <IconButton onClick={() => onCall("VIDEO")}>
        <VideoCall />
      </IconButton>
      <IconButton>
        <MoreVert />
      </IconButton>
    </Toolbar>
  );
};

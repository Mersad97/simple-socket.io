// src/components/chat/Sidebar/ChatItem.tsx

import { ListItem, ListItemAvatar, ListItemText, Typography, Box } from "@mui/material";
import Avatar from "../../common/Avatar";
import type { ChatSummary } from "../../../types/chat";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { GetMe } from "../../../services/auth";

interface ChatItemProps {
  chat: ChatSummary;
  isSelected: boolean;
  onSelect: () => void;
}

const ChatItem = ({ chat, isSelected, onSelect }: ChatItemProps) => {
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: GetMe,
  });
  const user = data?.body;
  const chatName = chat.isGroup
    ? chat.name || "گروه ناشناس"
    : chat.participants[0]?.user.id == user.id
    ? chat.participants[1]?.user.name || chat.participants[1]?.user.username || "کاربر"
    : chat.participants[0]?.user.name || chat.participants[0]?.user.username || "کاربر";

  const avatarSrc = chat.isGroup ? chat.avatar : chat.participants[0]?.user.avatar;

  const isOnline = (!chat.isGroup && chat.participants[0]?.user.isOnline) || false;

  const lastMessage = chat.lastMessage;
  const lastMessageText = lastMessage?.content || "پیامی وجود ندارد";
  const lastMessageTime = lastMessage?.createdAt
    ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true, locale: faIR })
    : "";

  return (
    <ListItem
      sx={{
        cursor: "pointer",
        bgcolor: isSelected ? "action.selected" : "transparent",
        "&:hover": {
          bgcolor: "action.hover",
        },
        borderRadius: 1,
        px: 1,
      }}
      onClick={onSelect}
    >
      <ListItemAvatar>
        <Avatar src={avatarSrc} alt={chatName} isOnline={isOnline} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: isSelected ? 600 : 400 }}>
              {chatName}
            </Typography>
            {lastMessageTime && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {lastMessageTime}
              </Typography>
            )}
          </Box>
        }
        secondary={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
              {lastMessageText}
            </Typography>
            {chat.unreadCount > 0 && (
              <Box
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  ml: 1,
                }}
              >
                {chat.unreadCount}
              </Box>
            )}
          </Box>
        }
        slotProps={{ secondary: { component: "div" } }}
      />
    </ListItem>
  );
};

export default ChatItem;

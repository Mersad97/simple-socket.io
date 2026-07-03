// src/components/chat/Sidebar/ChatList.tsx

import { List, ListSubheader } from "@mui/material";
import type { ChatSummary } from "../../../types/chat";
import ChatItem from "./ChatItem";

interface ChatListProps {
  chats: ChatSummary[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

const ChatList = ({ chats, selectedChatId, onSelectChat }: ChatListProps) => {
  // ✅ اطمینان از اینکه chats آرایه است
  const safeChats = Array.isArray(chats) ? chats : [];

  // مرتب‌سازی بر اساس آخرین بروزرسانی
  const sortedChats = [...safeChats].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return (
    <List
      subheader={
        <ListSubheader sx={{ bgcolor: "transparent", fontWeight: "bold" }}>پیام‌ها</ListSubheader>
      }
      sx={{ width: "100%", bgcolor: "transparent", p: 0 }}
    >
      {sortedChats?.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isSelected={selectedChatId === chat.id}
          onSelect={() => onSelectChat(chat.id)}
        />
      ))}
    </List>
  );
};

export default ChatList;

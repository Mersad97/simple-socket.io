// src/types/chat.ts

export type UserRole = "ADMIN" | "USER";
export type GroupRole = "ADMIN" | "MEMBER";
export type MessageType = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "FILE";
export type MessageStatus = "SENT" | "DELIVERED" | "READ";
export type CallType = "VOICE" | "VIDEO";
export type CallStatus = "MISSED" | "ACCEPTED" | "REJECTED" | "ENDED";

export interface User {
  id: string;
  phone: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  lastSeen: Date;
  isOnline: boolean;
  isActive: boolean;
  role: UserRole;
  username: string;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name: string | null; // برای گروه‌ها
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  adminId: string | null; // برای گروه‌ها
  participants: GroupParticipant[];
  messages: Message[];
  call: Call[];
}

export interface GroupParticipant {
  id: string;
  chatId: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  user: User;
  chat: Chat;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string | null;
  messageType: MessageType;
  fileUrl: string | null;
  fileName: string | null;
  mimeType: string | null;
  status: MessageStatus;
  createdAt: Date;
  readAt: Date | null; // توجه: در Prisma optional است ولی در مدل به صورت readAt? تعریف شده
  deliveredTo: any | null; // JSON
  fileSize: number | null;
  sender: User;
  chat: Chat;
}

export interface Call {
  id: string;
  chatId: string;
  callerId: string;
  receiverId: string;
  type: CallType;
  status: CallStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  duration: number | null;
  chat: Chat;
  caller: User;
  receiver: User;
}

// برای استفاده در فرانت‌اند (خلاصه‌شده)
export interface ChatSummary {
  id: string;
  isGroup: boolean;
  name: string | null;
  avatar: string | null;
  lastMessage?: Message | null;
  unreadCount: number;
  updatedAt: Date;
  participants: { user: Pick<User, "id" | "name" | "username" | "avatar" | "isOnline"> }[];
}

export interface SendMessagePayload {
  chatId: string;
  content: string;
  messageType?: MessageType; // پیش‌فرض TEXT
  file?: File;
}
export interface SendTextMessagePayload {
  chatId: string;
  content: string;
}

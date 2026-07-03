// src/services/chat.ts

import { fetchData } from "./api";
import type {
  ChatSummary,
  Message,
  SendMessagePayload,
  SendTextMessagePayload,
  User,
} from "../types/chat";
import type { ApiResponse } from "../types";
import { socket } from "../socket";

// src/services/chat.ts

// import { socket } from "../socket";

// Promise<ChatSummary[]>
export async function getChats(): Promise<ApiResponse<ChatSummary[]>> {
  return fetchData("/api/chats", { method: "GET" });
}
// Promise<Message[]>
export async function getMessages(
  chatId: string,
  page = 1,
  limit = 50
): Promise<ApiResponse<Message[]>> {
  return fetchData(`/api/chats/${chatId}/messages?page=${page}&limit=${limit}`, { method: "GET" });
}

// جدید: ایجاد چت خصوصی
// Promise<ChatSummary>
export async function createPrivateChat(targetUserId: string): Promise<ApiResponse<ChatSummary>> {
  return fetchData("/api/chats", { method: "POST", body: { targetUserId } });
}

// Promise<Message>
// export async function sendMessage(payload: SendMessagePayload): Promise<ApiResponse<Message>> {
//   const formData = new FormData();
//   formData.append("chatId", payload.chatId);
//   formData.append("content", payload.content);
//   formData.append("messageType", payload.messageType || "TEXT");
//   if (payload.file) {
//     formData.append("file", payload.file);
//   }
//   return fetchData("/api/messages", {
//     method: "POST",
//     body: formData,
//     headers: undefined, // اجازه می‌دهیم fetchData از Content-Type چندبخشی استفاده نکند
//   });
// }
export async function sendMessage(payload: SendTextMessagePayload): Promise<ApiResponse<Message>> {
  return fetchData("/api/messages", { method: "POST", body: { ...payload } });
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  return fetchData(`/api/messages/${messageId}/read`, { method: "PATCH" });
}

// جدید: جستجوی کاربران
export async function searchUsers(query: string): Promise<ApiResponse<User[]>> {
  return fetchData(`/api/users/search?q=${encodeURIComponent(query)}`, { method: "GET" });
}

export const markMessageAsReadSocket = (messageId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      reject(new Error("Socket is not connected"));
      return;
    }

    try {
      socket.emit("markAsRead", messageId);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

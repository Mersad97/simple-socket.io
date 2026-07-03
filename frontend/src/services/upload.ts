// src/services/upload.ts

import type { ApiResponse } from "../types";
import type { Message, SendMessagePayload } from "../types/chat";
import { fetchData } from "./api";

export async function uploadMessage(payload: SendMessagePayload): Promise<ApiResponse<Message>> {
  const formData = new FormData();
  formData.append("chatId", payload.chatId);
  formData.append("content", payload.content);
  formData.append("messageType", payload.messageType || "TEXT");
  if (payload.file) {
    formData.append("file", payload.file);
  }
  return fetchData("/api/upload", {
    method: "POST",
    body: formData,
  });
}

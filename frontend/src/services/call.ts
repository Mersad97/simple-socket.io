// src/services/call.ts

import { fetchData } from "./api";
import type { Call } from "../types/chat";
import type { ApiResponse } from "../types";

export async function startCall(
  chatId: string,
  type: "VOICE" | "VIDEO"
): Promise<ApiResponse<Call>> {
  return fetchData("/api/calls", { method: "POST", body: { chatId, type } });
}

export async function endCall(callId: string): Promise<ApiResponse<void>> {
  return fetchData(`/api/calls/${callId}/end`, { method: "PATCH" });
}
export async function acceptCall(callId: string): Promise<ApiResponse<void>> {
  return fetchData(`/api/calls/${callId}/accept`, { method: "PATCH" });
}
export async function rejectCall(callId: string): Promise<ApiResponse<void>> {
  return fetchData(`/api/calls/${callId}/reject`, { method: "PATCH" });
}

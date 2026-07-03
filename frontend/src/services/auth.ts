// src/services/auth.ts

import type { ApiResponse } from "../types";
import { fetchData } from "./api";

export type RegisterResponse = ApiResponse<{
  name: string;
  phone: string;
}>;

export type LoginResponse = ApiResponse<{
  token?: string;
}>;
export type MeResponse = ApiResponse<{
  id: string;
  name: string;
  role: string;
  phone: string;
  profileImage: string;
  isActive: string;
  username: string;
}>;

export async function login(payload: Record<string, unknown>): Promise<LoginResponse> {
  return await fetchData("/api/auth/login", { method: "POST", body: payload });
}

export async function GetMe(): Promise<MeResponse> {
  return await fetchData("/api/auth/me", { method: "GET" });
}

export async function register(payload: {
  username: string;
  phone: string;
  name: string;
  password: string;
}): Promise<RegisterResponse> {
  return await fetchData("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function logout(): Promise<void> {
  await fetchData("/api/auth/logout", { method: "POST" });
}

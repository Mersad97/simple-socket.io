// frontens/src/socket.ts

import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const URL = BACKEND_URL;

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
  // auth: { token },               // ارسال توکن در handshake
  transports: ["websocket", "polling"], // fallback
});

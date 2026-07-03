// frontens/src/socket.ts

import { io } from "socket.io-client";

const NODE_ENV = import.meta.env.NODE_ENV;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';
// const URL = NODE_ENV === "production" ? undefined : "http://localhost:4000";
const URL = BACKEND_URL;

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
  // auth: { token },               // ارسال توکن در handshake
  transports: ["websocket", "polling"], // fallback
});

// socket.timeout(5000).emit("create-something", value, () => {
//   setIsLoading(false);
// });

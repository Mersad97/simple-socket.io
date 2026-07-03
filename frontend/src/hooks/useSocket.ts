// src/hooks/useSocket.ts

import { useEffect, useState } from "react";
import { socket } from "../socket";
import type { Message, Call } from "../types/chat";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // const onConnect = () => setIsConnected(true);
    const onConnect = () => {
      console.log("useSocket onConnect");
      setIsConnected(true);
    };
    // const onDisconnect = () => setIsConnected(false);
    const onDisconnect = () => {
      console.log("useSocket onDisconnect");
      setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const onUserOnline = (callback: (message: { userId: string; username: string }) => void) => {
    socket.on("userOnline", callback);
    return () => socket.off("userOnline", callback);
  };
  const onUserOffline = (callback: (message: { userId: string; username: string }) => void) => {
    socket.on("userOffline", callback);
    return () => socket.off("userOffline", callback);
  };

  // گوش دادن به رویدادهای پیام و تماس
  const onNewMessage = (callback: (message: Message) => void) => {
    socket.on("newMessage", callback);
    return () => socket.off("newMessage", callback);
  };

  const onMessageDelivered = (callback: (data: { messageId: string; userId: string }) => void) => {
    socket.on("messageDelivered", callback);
    return () => socket.off("messageDelivered", callback);
  };

  const onMessageRead = (
    callback: (data: { messageId: string; userId: string; chatId: string }) => void
  ) => {
    socket.on("messageRead", callback);
    return () => socket.off("messageRead", callback);
  };

  const onIncomingCall = (callback: (call: Call) => void) => {
    socket.on("incomingCall", callback);
    return () => socket.off("incomingCall", callback);
  };

  const onCallAccepted = (callback: (callId: string) => void) => {
    socket.on("callAccepted", callback);
    return () => socket.off("callAccepted", callback);
  };

  const onCallRejected = (callback: (callId: string) => void) => {
    socket.on("callRejected", callback);
    return () => socket.off("callRejected", callback);
  };

  const onCallEnded = (callback: (callId: string) => void) => {
    socket.on("callEnded", callback);
    return () => socket.off("callEnded", callback);
  };

  const onTyping = (callback: (data: { userId: string; chatId: string }) => void) => {
    socket.on("typing", callback);
    return () => socket.off("typing", callback);
  };

  const onStopTyping = (callback: (data: { userId: string; chatId: string }) => void) => {
    socket.on("stopTyping", callback);
    return () => socket.off("stopTyping", callback);
  };

  return {
    socket,
    isConnected,
    onUserOnline,
    onUserOffline,
    onNewMessage,
    onMessageDelivered,
    onMessageRead,
    onIncomingCall,
    onCallAccepted,
    onCallRejected,
    onCallEnded,
    onTyping,
    onStopTyping,
  };
}

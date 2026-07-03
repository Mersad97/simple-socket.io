// ۱. میان‌افزار احراز هویت برای Socket.io
// src/sockets/socketAuth.ts

import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../prismaDB/client.js";
import logger from "../utils/logger.js";
// import cookie from "cookie";
import * as cookie from "cookie"; // ← اصلاح import
export interface AuthSocket extends Socket {
  userId?: string;
  user?: any;
}

export const socketAuthMiddleware = async (socket: AuthSocket, next: (err?: Error) => void) => {
  // console.log("socketAuthMiddleware");
  try {
    // // استخراج توکن از کوکی یا هدر
    // const token =
    //   socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

    // 1. استخراج توکن از auth (ارسال شده توسط کلاینت)
    let token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

    // 2. اگر توکن از auth یا هدر نیامد، از کوکی بخوان
    if (!token) {
      const cookieHeader = socket.handshake.headers.cookie;
      if (cookieHeader) {
        const parsedCookies = cookie.parseCookie(cookieHeader);
        token = parsedCookies.token; // نام کوکی که در login تنظیم شده
      }
    }

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error("JWT_SECRET is not defined");
      return next(new Error("Server configuration error"));
    }

    const decoded = jwt.verify(token, secret) as { id: string };
    const userId = decoded.id;
    if (!userId) {
      return next(new Error("Invalid token"));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
      },
    });

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = userId;
    socket.user = user;
    next();
  } catch (error) {
    logger.error("Socket auth error:", error);
    next(new Error("Authentication failed"));
  }
};

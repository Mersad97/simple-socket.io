// // src/sockets/socket.handler.ts

import { Server } from "socket.io";
import { type AuthSocket, socketAuthMiddleware } from "./socketAuth.js";
import { prisma } from "../prismaDB/client.js";
import logger from "../utils/logger.js";
import type { MessageType } from "../../generated/prisma/enums.js";
// import { MessageType } from "@prisma/client";

export const setupSockets = (io: Server) => {
  // استفاده از میان‌افزار احراز هویت
  io.use(socketAuthMiddleware);

  io.on("connection", async (socket: AuthSocket) => {
    const userId = socket.userId!;
    const user = socket.user!;

    logger.info(`User connected: ${userId} (${user.username})`);
    console.log(`User connected: ${userId} (${user.username})`);
    // به‌روزرسانی وضعیت آنلاین
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: true, lastSeen: new Date() },
    });

    // اعلام آنلاین شدن به همه کاربران (به جز خودش)
    socket.broadcast.emit("userOnline", { userId, username: user.username });
    // socket.emit("connect");

    // پیوستن به روم‌های چت‌های خودکار (همه چت‌هایی که کاربر در آن عضو است)
    const userChats = await prisma.groupParticipant.findMany({
      where: { userId },
      select: { chatId: true },
    });
    userChats.forEach(({ chatId }) => {
      socket.join(`chat:${chatId}`);
    });
    logger.debug(`User ${userId} joined ${userChats.length} chat rooms`);

    // ========== رویدادهای دریافتی از کلاینت ==========

    // 1. پیوستن به یک چت خاص (در صورت نیاز)
    socket.on("joinChat", async (chatId: string) => {
      try {
        const participant = await prisma.groupParticipant.findUnique({
          where: { chatId_userId: { chatId, userId } },
        });
        if (!participant) {
          socket.emit("error", { message: "You are not a member of this chat" });
          return;
        }
        socket.join(`chat:${chatId}`);
        socket.emit("joinedChat", { chatId });
        logger.debug(`User ${userId} joined chat ${chatId}`);
      } catch (error) {
        logger.error(`joinChat error: ${error}`);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    // 2. خروج از یک چت
    socket.on("leaveChat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      logger.debug(`User ${userId} left chat ${chatId}`);
    });

    // 3. ارسال پیام
    socket.on(
      "sendMessage",
      async (payload: {
        chatId: string;
        content: string;
        messageType?: MessageType;
        fileUrl?: string;
        fileName?: string;
        mimeType?: string;
        fileSize?: number;
      }) => {
        try {
          // console.log(`socket.on("sendMessage") payload:`, payload);
          const {
            chatId,
            content,
            messageType = "TEXT",
            fileUrl,
            fileName,
            mimeType,
            fileSize,
          } = payload;

          // بررسی عضویت کاربر در چت
          const participant = await prisma.groupParticipant.findUnique({
            where: { chatId_userId: { chatId, userId } },
          });
          if (!participant) {
            socket.emit("error", { message: "You are not a member of this chat" });
            return;
          }

          // ذخیره پیام در دیتابیس
          const newMessage = await prisma.message.create({
            data: {
              chatId,
              senderId: userId,
              content,
              messageType,
              // fileUrl,
              ...(fileUrl ? { fileUrl } : {}),
              // fileName,
              ...(fileName ? { fileName } : {}),
              // mimeType,
              ...(mimeType ? { mimeType } : {}),
              // fileSize,
              ...(fileSize ? { fileSize } : {}),
              status: "SENT",
            },
            include: {
              sender: {
                select: { id: true, username: true, name: true, avatar: true },
              },
            },
          });

          // ارسال پیام به همه کاربران حاضر در روم چت (به جز فرستنده)
          socket.to(`chat:${chatId}`).emit("newMessage", newMessage);
          // همچنین به خود فرستنده هم ارسال می‌کنیم (تا UI به‌روز شود)
          socket.emit("newMessage", newMessage);

          // به‌روزرسانی آخرین پیام و زمان چت
          await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
          });

          logger.info(`Message sent in chat ${chatId} by user ${userId}`);
        } catch (error) {
          logger.error(`sendMessage error: ${error}`);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // 4. علامت‌گذاری پیام به عنوان تحویل‌شده (از سمت کلاینت)
    socket.on("messageDelivered", async (messageId: string) => {
      try {
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: { chat: { include: { participants: true } } },
        });
        if (!message) return;

        // فقط اگر پیام متعلق به کاربر نباشد و تحویل نشده باشد
        if (message.senderId === userId) return;
        if (message.status === "DELIVERED" || message.status === "READ") return;

        // به‌روزرسانی وضعیت به DELIVERED
        await prisma.message.update({
          where: { id: messageId },
          data: { status: "DELIVERED" },
        });

        // اطلاع به فرستنده
        io.to(`chat:${message.chatId}`).emit("messageDelivered", { messageId, userId });
      } catch (error) {
        logger.error(`messageDelivered error: ${error}`);
      }
    });

    // 5. علامت‌گذاری پیام به عنوان خوانده‌شده
    socket.on("markAsRead", async (messageId: string) => {
      try {
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: { chat: { include: { participants: true } } },
        });
        if (!message) return;

        if (message.senderId === userId) return;
        if (message.status === "READ") return;

        // به‌روزرسانی وضعیت به READ
        await prisma.message.update({
          where: { id: messageId },
          data: { status: "READ", readAt: new Date() },
        });

        // اطلاع به فرستنده
        io.to(`chat:${message.chatId}`).emit("messageRead", {
          messageId,
          userId,
          chatId: message.chatId,
        });
      } catch (error) {
        logger.error(`markAsRead error: ${error}`);
      }
    });

    // 6. تایپ‌اندیکیتور
    socket.on("typing", async (chatId: string) => {
      socket.to(`chat:${chatId}`).emit("typing", { userId, chatId });
    });

    socket.on("stopTyping", (chatId: string) => {
      socket.to(`chat:${chatId}`).emit("stopTyping", { userId, chatId });
    });

    // ========== تماس صوتی/تصویری ==========

    // 7. شروع تماس
    socket.on(
      "call",
      async (payload: { chatId: string; type: "VOICE" | "VIDEO"; receiverId: string }) => {
        try {
          const { chatId, type, receiverId } = payload;

          // بررسی وجود کاربر گیرنده
          const receiver = await prisma.user.findUnique({
            where: { id: receiverId, isActive: true },
          });
          if (!receiver) {
            socket.emit("error", { message: "Receiver not found" });
            return;
          }

          // بررسی عضویت در چت
          const participant = await prisma.groupParticipant.findUnique({
            where: { chatId_userId: { chatId, userId } },
          });
          if (!participant) {
            socket.emit("error", { message: "You are not a member of this chat" });
            return;
          }

          // ثبت تماس در دیتابیس
          const call = await prisma.call.create({
            data: {
              chatId,
              callerId: userId,
              receiverId,
              type,
              status: "MISSED", // موقتاً، بعداً به‌روز می‌شود
            },
          });

          // اطلاع به گیرنده
          io.to(`user:${receiverId}`).emit("incomingCall", {
            callId: call.id,
            callerId: userId,
            callerName: socket.user.name || socket.user.username,
            chatId,
            type,
          });

          logger.info(`Call initiated by ${userId} to ${receiverId} (${type})`);
        } catch (error) {
          logger.error(`call error: ${error}`);
          socket.emit("error", { message: "Failed to start call" });
        }
      }
    );

    // 8. پذیرش تماس
    socket.on("callAccepted", async (callId: string) => {
      try {
        const call = await prisma.call.update({
          where: { id: callId },
          data: { status: "ACCEPTED", startedAt: new Date() },
        });
        // اطلاع به طرفین
        io.to(`user:${call.callerId}`).emit("callAccepted", { callId });
        io.to(`user:${call.receiverId}`).emit("callAccepted", { callId });
      } catch (error) {
        logger.error(`callAccepted error: ${error}`);
      }
    });

    // 9. رد تماس
    socket.on("callRejected", async (callId: string) => {
      try {
        const call = await prisma.call.update({
          where: { id: callId },
          data: { status: "REJECTED" },
        });
        io.to(`user:${call.callerId}`).emit("callRejected", { callId });
        io.to(`user:${call.receiverId}`).emit("callRejected", { callId });
      } catch (error) {
        logger.error(`callRejected error: ${error}`);
      }
    });

    // 10. پایان تماس
    socket.on("callEnded", async (callId: string) => {
      try {
        const call = await prisma.call.findUnique({ where: { id: callId } });
        if (!call) return;

        const duration = call.startedAt
          ? Math.floor((Date.now() - new Date(call.startedAt).getTime()) / 1000)
          : 0;

        await prisma.call.update({
          where: { id: callId },
          data: { status: "ENDED", endedAt: new Date(), duration },
        });

        io.to(`user:${call.callerId}`).emit("callEnded", { callId });
        io.to(`user:${call.receiverId}`).emit("callEnded", { callId });
      } catch (error) {
        logger.error(`callEnded error: ${error}`);
      }
    });

    // ========== قطع اتصال ==========

    socket.on("disconnect", async () => {
      logger.info(`User disconnected: ${userId}`);
      console.log(`User disconnected: ${userId}`);

      // به‌روزرسانی وضعیت آفلاین
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: false, lastSeen: new Date() },
      });

      // اعلام آفلاین شدن به دیگران
      socket.broadcast.emit("userOffline", { userId });
    });
  });

  // ========== رویدادهای اضافی (اتصال به روم کاربر) ==========

  // هر کاربر یک روم اختصاصی دارد تا پیام‌های خصوصی دریافت کند
  io.on("connection", (socket: AuthSocket) => {
    const userId = socket.userId!;
    socket.join(`user:${userId}`);
  });
};

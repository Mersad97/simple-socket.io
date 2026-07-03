// backend/src/controllers/callController.ts

import type { Request, Response } from "express";
import { prisma } from "../prismaDB/client.js";
import logger from "../utils/logger.js";

// شروع تماس
export const startCall = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { chatId, type } = req.body; // type: "VOICE" | "VIDEO"

    if (!chatId || !type) return res.fail("chatId و type الزامی هستند", 400);
    if (!userId) return res.fail("Unauthorized", 401);

    // بررسی عضویت
    const participant = await prisma.groupParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } },
    });
    if (!participant) return res.fail("شما عضو این چت نیستید", 403);

    // پیدا کردن گیرنده (کاربر دیگر در چت خصوصی)
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });
    if (!chat) return res.fail("چت یافت نشد", 404);
    if (chat.isGroup) return res.fail("تماس گروهی پشتیبانی نمی‌شود", 400);

    const receiver = chat.participants.find((p) => p.userId !== userId);
    if (!receiver) return res.fail("گیرنده یافت نشد", 404);

    // ایجاد رکورد تماس
    const call = await prisma.call.create({
      data: {
        chatId,
        callerId: userId,
        receiverId: receiver.userId,
        type,
        status: "MISSED",
      },
    });

    // اطلاع به گیرنده
    const io = req.app.get("io");
    io.to(`user:${receiver.userId}`).emit("incomingCall", {
      callId: call.id,
      callerId: userId,
      callerName: req.user?.name || req.user?.username,
      chatId,
      type,
    });

    return res.success("تماس شروع شد", call);
  } catch (error) {
    logger.error("startCall error", error);
    return res.fail("خطا در شروع تماس", 500);
  }
};

// پایان تماس
export const endCall = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    let { callId } = req.params;

    if (!userId) return res.fail("Unauthorized", 401);

    // ✅ تبدیل callId به string معتبر
    if (Array.isArray(callId)) {
      callId = callId[0];
    }
    if (typeof callId !== "string" || callId.length === 0) {
      return res.fail("شناسه تماس نامعتبر است", 400);
    }

    const call = await prisma.call.findUnique({
      where: { id: callId },
    });
    if (!call) return res.fail("تماس یافت نشد", 404);
    if (call.callerId !== userId && call.receiverId !== userId) {
      return res.fail("شما مجاز به پایان این تماس نیستید", 403);
    }

    const duration = call.startedAt
      ? Math.floor((Date.now() - new Date(call.startedAt).getTime()) / 1000)
      : 0;

    await prisma.call.update({
      where: { id: callId },
      data: {
        status: "ENDED",
        endedAt: new Date(),
        duration,
      },
    });

    const io = req.app.get("io");
    io.to(`user:${call.callerId}`).emit("callEnded", { callId });
    io.to(`user:${call.receiverId}`).emit("callEnded", { callId });

    return res.success("تماس پایان یافت");
  } catch (error) {
    logger.error("endCall error", error);
    return res.fail("خطا در پایان تماس", 500);
  }
};

// پذیرش تماس
export const acceptCall = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    let { callId } = req.params;

    if (!userId) return res.fail("Unauthorized", 401);

    // ✅ تبدیل callId به string معتبر
    if (Array.isArray(callId)) {
      callId = callId[0];
    }
    if (typeof callId !== "string" || callId.length === 0) {
      return res.fail("شناسه تماس نامعتبر است", 400);
    }

    const call = await prisma.call.findUnique({
      where: { id: callId },
    });
    if (!call) return res.fail("تماس یافت نشد", 404);
    if (call.receiverId !== userId) return res.fail("شما گیرنده نیستید", 403);

    await prisma.call.update({
      where: { id: callId },
      data: {
        status: "ACCEPTED",
        startedAt: new Date(),
      },
    });

    const io = req.app.get("io");
    io.to(`user:${call.callerId}`).emit("callAccepted", { callId });
    io.to(`user:${call.receiverId}`).emit("callAccepted", { callId });

    return res.success("تماس پذیرفته شد");
  } catch (error) {
    logger.error("acceptCall error", error);
    return res.fail("خطا در پذیرش تماس", 500);
  }
};

// رد تماس
export const rejectCall = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    let { callId } = req.params;

    if (!userId) return res.fail("Unauthorized", 401);

    // ✅ تبدیل callId به string معتبر
    if (Array.isArray(callId)) {
      callId = callId[0];
    }
    if (typeof callId !== "string" || callId.length === 0) {
      return res.fail("شناسه تماس نامعتبر است", 400);
    }

    const call = await prisma.call.findUnique({
      where: { id: callId },
    });
    if (!call) return res.fail("تماس یافت نشد", 404);
    if (call.receiverId !== userId) return res.fail("شما گیرنده نیستید", 403);

    await prisma.call.update({
      where: { id: callId },
      data: { status: "REJECTED" },
    });

    const io = req.app.get("io");
    io.to(`user:${call.callerId}`).emit("callRejected", { callId });
    io.to(`user:${call.receiverId}`).emit("callRejected", { callId });

    return res.success("تماس رد شد");
  } catch (error) {
    logger.error("rejectCall error", error);
    return res.fail("خطا در رد تماس", 500);
  }
};

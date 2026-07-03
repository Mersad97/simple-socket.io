// backend/src/controllers/messageController.ts

import type { Request, Response } from "express";
import { prisma } from "../prismaDB/client.js";
import logger from "../utils/logger.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// تنظیمات multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// middleware برای پردازش فایل
// export const uploadMessageFile = upload.single("file");
export const uploadMessageFile = upload.any();

// کنترلر sendMessage
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { chatId, content, messageType = "TEXT" } = req.body;

    if (!chatId) return res.fail("chatId الزامی است", 400);
    if (!userId) return res.fail("Unauthorized", 401);

    // بررسی عضویت
    const participant = await prisma.groupParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } },
    });
    if (!participant) return res.fail("شما عضو این چت نیستید", 403);

    // ✅ استخراج فایل از req.files (چون upload.any استفاده شده)
    const file =
      req.files && Array.isArray(req.files) && req.files.length > 0 ? req.files[0] : null;

    let fileData = {};

    if (file) {
      const fileUrl = `/api/files/${file.filename}`;
      fileData = {
        fileUrl,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        content: file.originalname,
        messageType: messageType,
      };
    }

    // اگر فایل نباشد و محتوا خالی باشد، خطا
    if (!file && !content) {
      return res.fail("محتوا یا فایل الزامی است", 400);
    }

    const newMessage = await prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        content: req.file ? req.file.originalname : content,
        messageType: req.file ? (messageType as any) : "TEXT",
        status: "SENT",
        ...fileData,
      },
      include: {
        sender: {
          select: { id: true, username: true, name: true, avatar: true },
        },
      },
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    const io = req.app.get("io");
    io.to(`chat:${chatId}`).emit("newMessage", newMessage);

    return res.success("پیام ارسال شد", newMessage);
  } catch (error) {
    logger.error("sendMessage error", error);
    return res.fail("خطا در ارسال پیام", 500);
  }
};

// علامت‌گذاری پیام به عنوان خوانده شده
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    let { messageId } = req.params;

    if (!userId) return res.fail("Unauthorized", 401);

    // ✅ تبدیل messageId به string معتبر
    if (Array.isArray(messageId)) {
      messageId = messageId[0];
    }
    if (typeof messageId !== "string" || messageId.length === 0) {
      return res.fail("شناسه پیام نامعتبر است", 400);
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: true },
    });
    if (!message) return res.fail("پیام یافت نشد", 404);
    if (message.senderId === userId) return res.fail("نمی‌توانید پیام خود را بخوانید", 400);

    // بررسی عضویت در چت
    const participant = await prisma.groupParticipant.findUnique({
      where: { chatId_userId: { chatId: message.chatId, userId } },
    });
    if (!participant) return res.fail("شما عضو این چت نیستید", 403);

    if (message.status === "READ") {
      return res.success("پیام قبلاً خوانده شده");
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { status: "READ", readAt: new Date() },
    });

    // اطلاع به فرستنده از طریق socket
    const io = req.app.get("io");
    io.to(`chat:${message.chatId}`).emit("messageRead", { messageId, userId });

    return res.success("پیام به عنوان خوانده شده علامت‌گذاری شد");
  } catch (error) {
    logger.error("markAsRead error", error);
    return res.fail("خطا در علامت‌گذاری", 500);
  }
};

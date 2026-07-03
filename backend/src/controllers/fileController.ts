// backend/src/controllers/fileController.ts

import type { Request, Response } from "express";
import { prisma } from "../prismaDB/client.js";
import path from "path";
import fs from "fs";
import logger from "../utils/logger.js";

export const getFile = async (req: Request, res: Response) => {
  try {
    // console.log("getFile");
    const userId = req.user?.id;
    let { filename } = req.params;

    if (!userId) {
      return res.fail("Unauthorized", 401);
    }

    // 1. اگر filename آرایه باشد، اولین عنصر را بگیر
    if (Array.isArray(filename)) {
      filename = filename[0];
    }

    // 2. اعتبارسنجی نهایی: باید string و غیرخالی باشد
    if (typeof filename !== "string" || filename.length === 0) {
      return res.fail("Invalid filename", 400);
    }

    // حالا filename قطعاً از نوع string است
    const message = await prisma.message.findFirst({
      where: { fileUrl: { endsWith: filename } },
      select: { chatId: true, fileUrl: true },
    });

    if (!message || !message.fileUrl) {
      return res.fail("File not found", 404);
    }

    const participant = await prisma.groupParticipant.findUnique({
      where: { chatId_userId: { chatId: message.chatId, userId } },
    });

    if (!participant) {
      return res.fail("Access denied", 403);
    }

    // ۳. ساخت مسیر کامل فایل از روی fileUrl ذخیره‌شده در دیتابیس
    //    fileUrl مثلاً "/uploads/2026/07/1783070015098-tgyjuty.jpg" است
    const filePath = path.join(process.cwd(), message.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.fail("File not found", 404);
    }

    // تنظیم هدرهای امنیتی و کش
    const mimeType = getMimeType(filename);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Cross-Origin-Resource-Policy",
      process.env.NODE_ENV == "production" ? "same-site" : "cross-origin"
    );
    // ارسال فایل
    res.sendFile(filePath, (err) => {
      if (err) {
        logger.error(`Error sending file: ${err.message}`);
        if (!res.headersSent) {
          res.fail("Error serving file", 500);
        }
      }
    });
    return;
  } catch (error) {
    logger.error("getFile error", error);
    return res.fail("Server error", 500);
  }
};

// تابع کمکی برای تشخیص MIME type
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".aac": "audio/aac",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
  };
  return mimeMap[ext] || "application/octet-stream";
}

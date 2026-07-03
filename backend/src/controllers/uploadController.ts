// upload.controller.ts (combined with service code)

import fs from "fs/promises";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import type { Request, Response } from "express";
import { sanitizeFileName } from "../utils/sanitize.js";
import logger from "../utils/logger.js";
import { parseDBError } from "../utils/parseDBError.js";
import { prisma } from "../prismaDB/client.js";
import type { MessageType } from "../../generated/prisma/enums.js";

const UPLOADS_BASE = path.join(process.cwd(), "uploads");

// اطمینان از وجود پوشه و جلوگیری از Directory Traversal
const ensureUploadsDir = async (dir: string) => {
  const relative = path.relative(UPLOADS_BASE, dir);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    const e: any = new Error("مسیر نامعتبر");
    e.code = 400;
    throw e;
  }
  await fs.mkdir(dir, { recursive: true });
};

interface SaveBufferOptions {
  buffer: Buffer;
  finalExt: string;
  originalName?: string;
  customName?: string;
}

// ذخیره بافر در دیسک با ساختار سال/ماه
export const saveBufferToUploads = async ({
  buffer,
  finalExt,
  originalName = "",
  customName = "",
}: SaveBufferOptions) => {
  try {
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const uploadDir = path.join(UPLOADS_BASE, year, month);
    await ensureUploadsDir(uploadDir);

    // تولید نام منحصربه‌فرد با استفاده از timestamp و نام پاک‌شده
    const baseName = customName || originalName;
    const sanitized = sanitizeFileName(baseName, {
      removeSpecialChars: true,
      maxLength: 50,
    });
    // const fileName = `${Date.now()}-${sanitized || "file"}.jpg`; // پسوند بعداً مشخص می‌شود
    const fileName = `${Date.now()}-${sanitized || "file"}.${finalExt}`; // پسوند بعداً مشخص می‌شود

    // توجه: پسوند واقعی را از fileType خواهیم گرفت، اینجا فقط یک نام موقت است

    const uploadPath = path.join(uploadDir, fileName);
    await fs.writeFile(uploadPath, buffer);

    return {
      fileName,
      uploadPath,
      urlPath: `/uploads/${year}/${month}/${fileName}`,
      year,
      month,
    };
  } catch (error: any) {
    logger.error(`خطا در saveBufferToUploads: ${error?.message ?? error}`, {
      stack: error?.stack,
    });
    const parsed = parseDBError(error);
    const e: any = new Error(parsed.message);
    e.code = parsed.code;
    throw e;
  }
};

// سرویس اصلی آپلود
interface UploadMediaServiceParams {
  buffer: Buffer;
  originalName: string;
  chatId: string;
  senderId: string;
  content?: string;
  messageType?: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
}

export const uploadMediaService = async (params: UploadMediaServiceParams) => {
  const { buffer, originalName, chatId, senderId, content, messageType } = params;

  try {
    // 1. تشخیص نوع فایل با بررسی بافر
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) {
      const e: any = new Error("فرمت فایل قابل تشخیص نیست");
      e.code = 400;
      throw e;
    }

    const mime = fileType.mime;
    const ext = fileType.ext;

    // 2. اعتبارسنجی نوع فایل (مجاز بودن)
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "audio/mpeg",
      "audio/ogg",
      "audio/wav",
    ];
    if (!allowedMimes.includes(mime)) {
      const e: any = new Error(
        "نوع فایل مجاز نیست. فقط تصاویر، ویدئوها و فایل‌های صوتی مشخص شده مجازند."
      );
      e.code = 400;
      throw e;
    }

    // 3. پردازش فایل بر اساس نوع
    let finalBuffer = buffer;
    let finalExt = ext;
    let detectedType: "IMAGE" | "VIDEO" | "AUDIO" | "FILE" = "FILE";

    if (mime.startsWith("image/")) {
      // پردازش تصویر: چرخش خودکار، فشرده‌سازی و تبدیل به JPEG
      const quality = buffer.length < 1 * 1024 * 1024 ? 100 : 80;
      finalBuffer = await sharp(buffer)
        .rotate() // اصلاح جهت‌گیری خودکار
        .jpeg({ quality })
        .toBuffer();
      finalExt = "jpg";
      detectedType = "IMAGE";
    } else if (mime.startsWith("video/")) {
      // برای ویدئو فعلاً فقط ذخیره می‌کنیم (می‌توان با ffmpeg پردازش کرد)
      detectedType = "VIDEO";
    } else if (mime.startsWith("audio/")) {
      detectedType = "AUDIO";
    } else {
      detectedType = "FILE";
    }

    // 4. ذخیره فایل روی دیسک
    const saved = await saveBufferToUploads({
      buffer: finalBuffer,
      originalName: originalName,
      finalExt,
      // customName: content, // اگر کاربر توضیح داده باشد
      ...(content ? { customName: content } : {}),
    });

    // 5. ساخت URL کامل
    // const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
    // const fileUrl = `${BACKEND_URL}/${saved.urlPath}`;
    const fileUrl = `${saved.urlPath}`;

    // 6. تعیین messageType نهایی
    const finalMessageType = messageType || detectedType;

    // 7. ذخیره در دیتابیس
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content: content || originalName,
        messageType: finalMessageType as any,
        fileUrl,
        fileName: originalName, // نام اصلی کاربر
        mimeType: mime,
        fileSize: buffer.length,
        status: "SENT",
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return message;
  } catch (error: any) {
    logger.error(`خطا در uploadMediaService: ${error?.message ?? error}`, {
      stack: error?.stack,
    });
    const parsed = parseDBError(error);
    const e: any = new Error(parsed.message);
    e.code = parsed.code;
    throw e;
  }
};

// ----------------------------------------------
// Controller
// ----------------------------------------------

export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. بررسی وجود فایل
    if (!req.file || !req.file.buffer) {
      res.fail("هیچ فایلی ارسال نشد", 400);
      return;
    }

    // 2. دریافت userId از احراز هویت
    const userId = req.user?.id;
    if (!userId) {
      res.fail("Unauthorized", 401);
      return;
    }

    // 3. دریافت داده‌های اعتبارسنجی‌شده
    const validated = req.validated?.body;
    if (!validated) {
      res.fail("داده‌های ورودی معتبر نیستند", 400);
      return;
    }

    const { chatId, content, messageType } = validated as {
      chatId: string;
      content: string;
      messageType: MessageType;
    };
    if (!chatId || !content || !messageType) {
      throw Error("chatId or content or messageType not found");
    }
    // 4. بررسی عضویت کاربر در چت
    const participant = await prisma.groupParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });
    if (!participant) {
      res.fail("شما عضو این چت نیستید", 403);
      return;
    }

    // 5. فراخوانی سرویس
    const message = await uploadMediaService({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      chatId,
      senderId: userId,
      content,
      messageType,
    });

    // 6. انتشار از طریق Socket.IO
    const io = req.app.get("io");
    io.to(`chat:${chatId}`).emit("newMessage", message);

    // // ارسال پیام به همه کاربران حاضر در روم چت (به جز فرستنده)
    // socket.to(`chat:${chatId}`).emit("newMessage", newMessage);
    // // همچنین به خود فرستنده هم ارسال می‌کنیم (تا UI به‌روز شود)
    // socket.emit("newMessage", newMessage);

    // 7. پاسخ موفق
    res.success("فایل با موفقیت آپلود شد", message);
  } catch (error: any) {
    logger.error(`خطا در uploadMedia controller: ${error?.message ?? error}`, {
      stack: error?.stack,
    });
    const parsed = parseDBError(error);
    res.fail(parsed.message, parsed.code);
  }
};

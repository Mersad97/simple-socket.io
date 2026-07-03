// backend/src/controllers/chatController.ts

import type { Request, Response } from "express";
import { prisma } from "../prismaDB/client.js";
import logger from "../utils/logger.js";

export const getChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.fail("Unauthorized", 401);

    const participants = await prisma.groupParticipant.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                    isOnline: true,
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                sender: {
                  select: { id: true, username: true, name: true, avatar: true },
                },
              },
            },
          },
        },
      },
    });

    const chats = await Promise.all(
      participants.map(async (p) => {
        const chat = p.chat;
        const lastMessage = chat.messages[0] || null;

        // محاسبه تعداد پیام‌های نخوانده (با وضعیت SENT و متعلق به دیگران)
        const unreadCount = await prisma.message.count({
          where: {
            chatId: chat.id,
            status: "SENT",
            senderId: { not: userId },
          },
        });

        return {
          id: chat.id,
          isGroup: chat.isGroup,
          name: chat.name,
          avatar: chat.avatar,
          updatedAt: chat.updatedAt,
          lastMessage,
          unreadCount,
          participants: chat.participants.map((p) => ({
            user: p.user,
            role: p.role,
          })),
        };
      })
    );

    return res.success("لیست چت‌ها", chats);
  } catch (error) {
    logger.error("getChats error", error);
    return res.fail("خطا در دریافت چت‌ها", 500);
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.params;
    if (!chatId) return res.fail("must be send chatid");
    if (Array.isArray(chatId)) return res.fail("must be send uniqe chatid");

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    if (!userId) return res.fail("Unauthorized", 401);

    const participant = await prisma.groupParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } },
    });
    if (!participant) return res.fail("شما عضو این چت نیستید", 403);

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        sender: {
          select: { id: true, username: true, name: true, avatar: true },
        },
      },
    });

    return res.success("تاریخچه پیام‌ها", messages.reverse());
  } catch (error) {
    logger.error("getMessages error", error);
    return res.fail("خطا در دریافت پیام‌ها", 500);
  }
};

export const createPrivateChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { targetUserId } = req.body;
    if (!targetUserId) return res.fail("شناسه کاربر مقصد الزامی است", 400);
    if (targetUserId === userId) return res.fail("نمی‌توانید با خودتان چت کنید", 400);

    const target = await prisma.user.findUnique({
      where: { id: targetUserId, isActive: true },
    });
    if (!target) return res.fail("کاربر یافت نشد", 404);

    // بررسی چت خصوصی موجود بین این دو
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
      },
    });

    if (existingChat) {
      return res.success("چت از قبل وجود دارد", existingChat);
    }

    const newChat = await prisma.chat.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: userId, role: "MEMBER" },
            { userId: targetUserId, role: "MEMBER" },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                isOnline: true,
              },
            },
          },
        },
      },
    });

    return res.success("چت ایجاد شد", newChat);
  } catch (error) {
    logger.error("createPrivateChat error", error);
    return res.fail("خطا در ایجاد چت", 500);
  }
};

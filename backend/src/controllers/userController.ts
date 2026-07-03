// backend/src/controllers/userController.ts

import type { Request, Response } from "express";
import { prisma } from "../prismaDB/client.js";
import logger from "../utils/logger.js";

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      return res.success("نتیجه جستجو", []);
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { phone: { contains: query } },
          { name: { contains: query } },
        ],
        isActive: true,
        id: { not: userId },
      },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        avatar: true,
        isOnline: true,
      },
      take: 20,
    });

    return res.success("نتیجه جستجو", users);
  } catch (error) {
    logger.error("searchUsers error", error);
    return res.fail("خطا در جستجو", 500);
  }
};

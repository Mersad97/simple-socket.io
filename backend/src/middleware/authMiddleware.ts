// src/middlewares/authMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../prismaDB/client.js";

type TokenPayload = JwtPayload & { id?: string };

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenCookie = await (req as any)?.cookies?.token;

    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined in env");
      return res.status(500).json({ message: "Server configuration error" });
    }

    if (token) {
      const decoded = jwt.verify(token, secret) as TokenPayload;
      const userId = decoded?.id;
      if (!userId) {
        return res.status(401).json({ message: "توکن معتبر نیست!" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId, isActive: true },
        select: {
          id: true,
          role: true,
          name: true,
          username: true,
          phone: true,
          // profileImage: true,
          isActive: true,
        },
      });

      if (!user) {
        return res.status(401).json({ message: "کاربر یافت نشد!" });
      }

      // attach user to request (type is declared in src/types/express.d.ts)
      // attach minimal user info to req.user (type declaration باید وجود داشته باشد)
      req.user = user as any;

      return next();
    } else if (tokenCookie) {
      const decoded: any = jwt.verify(tokenCookie, process.env.JWT_SECRET as string);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
      if (!user) {
        return res.fail("کاربر یافت نشد!", 401);
      }
      req.user = user as any;
      return next();
    } else {
      return res.fail("دسترسی غیرمجاز!", 401);
    }
  } catch (error: any) {
    return res.fail("توکن معتبر نیست!", 401);
  }
};

// backend/src/controller/authController.ts

import type { Request, Response } from "express";
import { prisma } from "../prismaDB/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { parseDBError } from "../utils/parseDBError.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.validated?.body as Record<string, any>;
    if (!username || !password) {
      return res.fail("username and password are required");
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.deletedAt) {
      return res.fail("کاربر یافت نشد!");
    }
    if (!user.isActive) {
      return res.fail("Account is deactive. call to admin");
    }

    const isMatch = bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.fail("رمز عبور نادرست است!");
    }

    const token = jwt.sign({ id: user.id, phone: user.phone }, process.env.JWT_SECRET as string, {
      expiresIn: "5d",
    });

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: isProduction,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    // return res.success("ok", { token });
    return res.success("ok");
  } catch (error: any) {
    logger.error(`خطا در login: ${error?.message ?? error}`, { stack: error?.stack });
    const parsed = parseDBError(error);
    return res.fail(parsed.message, parsed.code);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { phone, name, username, password } = req.validated?.body as Record<string, any>;
    const hashedPassword = await bcrypt.hash(password, 10);
    const oldUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, { username }],
      },
    });
    if (oldUser) {
      // console.log("oldUser", oldUser);
      return res.fail("use another phone number or username!");
    }
    const user = await prisma.user.create({
      data: { phone, name, username, password: hashedPassword },
    });
    // const token = jwt.sign(
    //   { id: user.id, phone: user.phone },
    //   process.env.JWT_SECRET as string,
    //   {
    //     expiresIn: "30d",
    //   }
    // );
    // res.success("registered successfully. wait for active your account or call to admin", { name: user.name, phone: user.phone, token });
    return res.success("registered successfully. wait for active your account or call to admin", {
      name: user.name,
      phone: user.phone,
    });
    // return;
  } catch (error: any) {
    logger.error(`خطا در register: ${error?.message ?? error}`, { stack: error?.stack });
    const parsed = parseDBError(error);
    return res.fail(parsed.message, parsed.code);
  }
};

/**
 * getUserMe
 */
export const getUserMe = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { id, name, username, role, phone, profileImage, isActive } = user;
    return res.success("user get successfully", {
      id,
      name,
      role,
      phone,
      profileImage,
      isActive,
      username,
    });
  } catch (error: any) {
    logger.error(`خطا در getUserMe: ${error?.message ?? error}`, { stack: error?.stack });
    const parsed = parseDBError(error);
    return res.fail(parsed.message, parsed.code);
  }
};

// backend/src/controller/authController.ts

// اضافه کردن تابع logout
export const logout = async (req: Request, res: Response) => {
  try {
    // پاک کردن کوکی
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.success("با موفقیت خارج شدید");
  } catch (error: any) {
    logger.error(`خطا در logout: ${error?.message ?? error}`, { stack: error?.stack });
    return res.fail("خطا در خروج از حساب");
  }
};

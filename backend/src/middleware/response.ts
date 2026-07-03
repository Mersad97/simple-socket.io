// src/middlewares/responseMiddleware.ts
import type { Request, Response, NextFunction } from "express";

/**
 * اضافه کردن متدهای استاندارد پاسخ به res:
 * - res.success(message?, body?, status?)
 * - res.fail(message?, status?, body?)
 */
export default function responseMiddleware(req: Request, res: Response, next: NextFunction) {
  res.success = (message = "", body = null, status = 200) => {
    return res.status(status).json({
      success: true,
      body,
      message,
      status,
    });
  };

  res.fail = (message = "", status = 400, body = null) => {
    return res.status(status).json({
      success: false,
      body,
      message,
      status,
    });
  };

  next();
}

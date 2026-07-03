// src/middlewares/securityHeaders.ts
import type { Request, Response, NextFunction } from "express";

/**
 * هدرهای امنیتی پایه‌ای که در همهٔ پاسخ‌ها قرار می‌گیرد.
 * در محیط production ممکن است لازم باشد مقادیر CSP را دقیق‌تر تنظیم کنید.
 */
export const setSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy پایه — در صورت نیاز منابع خارجی را اضافه کنید
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // HSTS فقط در صورتی که سرور شما HTTPS را terminate می‌کند فعال شود
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
};

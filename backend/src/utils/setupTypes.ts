// src/utils/setupTypes.ts
/**
 * این ماژول یک helper ساده است تا import آن در app.ts باعث شود
 * TypeScript declaration augmentations (مثلاً src/types/express.d.ts)
 * توسط ابزارها و bundler شناسایی شوند.
 *
 * این تابع در runtime کاری انجام نمی‌دهد و صرفاً برای خوانایی و
 * تضمین اینکه import انجام شده است نگه داشته می‌شود.
 */

export function setGlobalTypes(): void {
  // no-op: وجود این تابع و import آن کافی است
}

//   چرا لازم است
//
// بعضی IDEها یا bundlerها وقتی فایل declaration فقط در src/types است و هیچ import/usage صریحی ندارد، آن را نادیده می‌گیرند. import کردن یک no-op باعث می‌شود TypeScript و ابزارها آن را بارگذاری کنند. اگر tsconfig.json و include درست تنظیم شده باشد، این فایل اختیاری است و می‌توانی حذفش کنی.

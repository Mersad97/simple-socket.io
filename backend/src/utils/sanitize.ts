// src/utils/sanitize.ts

interface SanitizeOptions {
  removeSpecialChars?: boolean;
  maxLength?: number;
  toLowerCase?: boolean;
}

export const sanitizeFileName = (input: string, options: SanitizeOptions = {}): string => {
  if (!input || typeof input !== "string") return "";

  let result = input;

  // حذف پسوند
  result = result.replace(/\.[^/.]+$/, "");

  // تبدیل به حروف کوچک
  if (options.toLowerCase) {
    result = result.toLowerCase();
  }

  // حذف کاراکترهای خاص (به جز حروف فارسی و اعداد و خط تیره)
  if (options.removeSpecialChars) {
    result = result.replace(/[^\w\s\u0600-\u06FF\u200c\u200d-]/g, "");
  }

  // جایگزینی فاصله با خط تیره
  result = result.replace(/\s+/g, "-");

  // حذف خط تیره‌های تکراری
  result = result.replace(/-+/g, "-");

  // حذف خط تیره از ابتدا و انتها
  result = result.replace(/^-|-$/g, "");

  // محدود کردن طول
  if (options.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength);
    result = result.replace(/-$/, "");
  }

  return result || "file";
};

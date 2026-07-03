// src/utils/parseDBError.ts
export type ParsedError = { message: string; code: number };

export function parseDBError(e: any): ParsedError {
  console.error(e);

  // Prisma unique constraint (P2002)
  if (e?.code === "P2002") {
    const target = Array.isArray(e?.meta?.target)
      ? e.meta.target.join(", ")
      : e?.meta?.target ?? "field";
    return { message: `مقدار تکراری در فیلد ${target}.`, code: 409 };
  }

  // Prisma foreign key error (P2003)
  if (e?.code === "P2003") {
    return { message: "کلید خارجی نامعتبر یا مرجع وجود ندارد.", code: 404 };
  }

  // Sequelize unique constraint
  if (e?.name === "SequelizeUniqueConstraintError") {
    const duplicateField = e.errors?.[0]?.path ?? "field";
    const duplicateValue = e.errors?.[0]?.value ?? "";
    return {
      message: `مقدار '${duplicateValue}' در فیلد '${duplicateField}' قبلاً ثبت شده است.`,
      code: 409,
    };
  }

  // Sequelize foreign key (MySQL errno 1452)
  if (e?.cause?.errno === 1452 || e?.name === "SequelizeForeignKeyConstraintError") {
    const table = e.table ?? e?.fields?.[0] ?? "related table";
    const value = e.value ?? "";
    return { message: `مقدار ${value} در جدول ${table} معتبر نیست.`, code: 404 };
  }

  // Sequelize validation
  if (e?.name === "SequelizeValidationError") {
    const errorMessage = (e.errors ?? []).map((err: any) => err.message).join(", ");
    return { message: `خطای ولیدیشن: ${errorMessage}`, code: 400 };
  }

  // اتصال یا خطای عمومی دیتابیس
  if (e?.name === "SequelizeConnectionError" || e?.code === "ECONNREFUSED") {
    return { message: "خطای اتصال به پایگاه داده. لطفاً بعداً تلاش کنید.", code: 503 };
  }

  // پیام‌های سفارشی
  if (typeof e?.message === "string") {
    if (e.message === "sanitizeInput")
      return { message: "پارامترها یا اطلاعات ورودی غیرمجاز هستند.", code: 400 };
    if (e.message === "NotFound") return { message: "منبع مورد نظر یافت نشد.", code: 404 };
    if (e.message === "admin-first-login:not-first")
      return { message: "خطا در ارتباط با سرور!", code: 404 };
  }

  return { message: "خطا در پایگاه داده رخ داده است.", code: 500 };
}

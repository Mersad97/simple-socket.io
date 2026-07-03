// src/services/api.ts

// بررسی محیط اجرا
const isClient = typeof window !== "undefined";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set. Check your .env file.");
}

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown> | FormData | null;
  responseType?: "json" | "blob" | "text";
  headers?: HeadersInit;
  //   next?: RequestInit["next"];
  cache?: RequestInit["cache"];
  skipAuth?: boolean; // اگر true باشد، توکن ارسال نمی‌شود (مثلا برای لاگین اولیه)
};

type BackendErrorDetail = {
  errors: string[];
  items?: BackendErrorDetail[]; // اضافه کردن فیلد items برای پشتیبانی از ارورهای تودرتو
  properties?: Record<string, BackendErrorDetail>;
};

type BackendErrors = {
  errors?: string[];
  properties?: Record<string, BackendErrorDetail>;
};

export type BackendResponseError = {
  success?: boolean;
  message?: string;
  errors?: BackendErrors;
};

// تعریف نوع جدید برای body که تایپ‌های مجاز fetch را داشته باشد
type FetchBodyType = RequestInit["body"];

export async function fetchData<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const {
    method = "GET",
    body = null,
    responseType = "json",
    headers: extraHeaders,
    // next,
    cache,
    skipAuth = false,
  } = options;

  const url = `${BASE_URL}${endpoint}`;

  // تبدیل body به فرمت مجاز برای fetch
  // اگر FormData است همان را برمی‌گردانیم، اگر آبجکت است JSON می‌کنیم، اگر null است null می‌ماند
  let fetchBody: FetchBodyType = null;
  if (body !== null) {
    if (body instanceof FormData) {
      fetchBody = body;
    } else if (typeof body === "object") {
      fetchBody = JSON.stringify(body);
    } else {
      fetchBody = String(body);
    }
  }

  const isForm = body instanceof FormData;
  const isUnsafe = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  const headers = new Headers(extraHeaders);
  headers.set("accept", "application/json");

  // 1. مدیریت CSRF Token (فقط برای درخواست‌های ایمن/unsafe)
  if (isUnsafe && !skipAuth) {
    const csrf = getCsrfToken();
    if (csrf) headers.set("x-csrf-token", csrf);
  }

  // 2. مدیریت Authorization Token (Access Token)
  // نکته: توکن Access معمولاً در کوکی httpOnly نیست (برای اینکه JS بتواند آن را بخواند و در هدر بگذارد)
  // یا اینکه از localStorage استفاده می‌کنیم. اینجا فرض بر این است که در کوکی با نام 'access_token' ذخیره شده است.
  if (!skipAuth && isClient) {
    // const token = getCookie("access_token"); // نام کوکی را با تنظیمات بک‌اند هماهنگ کنید
    const token = getCookie("token"); // نام کوکی را با تنظیمات بک‌اند هماهنگ کنید
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // 3. تنظیم Content-Type برای فرم یا JSON
  if (body && !isForm) headers.set("Content-Type", "application/json");

  // 4. ارسال درخواست
  const res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: fetchBody,
    // next,
    cache,
  });

  // 6. بازگرداندن دیتا
  const contentType = res.headers.get("Content-Type") || "";
  const isJson = contentType.includes("application/json");
  const isText = contentType.includes("text");

  let data: unknown = null;
  if (responseType === "blob") data = await res.blob();
  else if (responseType === "text" || isText) data = await res.text();
  else if (isJson) data = await res.json().catch(() => null);

  return data as T;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getCsrfToken(): string | null {
  return getCookie("csrf_token");
}

// src/services/notificationService.ts

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  previewText: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
  };
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  vibration: true,
  previewText: true,
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
};

const SETTINGS_KEY = "notification_settings";

export const getNotificationSettings = (): NotificationSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const settings = JSON.parse(raw);
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...settings };
    }
  } catch (error) {
    console.error("Error loading notification settings:", error);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
};

export const saveNotificationSettings = (settings: NotificationSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving notification settings:", error);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.warn("Web Notifications not supported");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const sendNotification = (
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    silent?: boolean;
    vibrate?: number[];
  }
): void => {
  const settings = getNotificationSettings();

  if (!settings.enabled) {
    console.log("Notifications disabled by user");
    return;
  }

  // بررسی ساعت سکوت
  if (settings.quietHours.enabled) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = settings.quietHours.start.split(":").map(Number);
    const [endHour, endMinute] = settings.quietHours.end.split(":").map(Number);
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    let isQuiet = false;
    if (startTotal < endTotal) {
      isQuiet = currentTime >= startTotal && currentTime < endTotal;
    } else {
      isQuiet = currentTime >= startTotal || currentTime < endTotal;
    }

    if (isQuiet) {
      console.log("Quiet hours active, notification suppressed");
      return;
    }
  }

  // ساخت اعلان با استفاده از as any برای پشتیبانی از vibrate
  const notificationOptions: NotificationOptions = {
    body: settings.previewText ? options?.body : undefined,
    icon: options?.icon || "/favicon.ico",
    tag: options?.tag || "default",
    silent: !settings.sound,
  };

  // افزودن vibrate به‌صورت جداگانه
  const finalOptions: any = {
    ...notificationOptions,
    vibrate: settings.vibration ? options?.vibrate || [200, 100, 200] : [],
  };

  try {
    const notification = new Notification(title, finalOptions);
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    // فقط return; بدون مقدار برگشتی
    return;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// // src/services/notificationService.ts

// export interface NotificationSettings {
//   enabled: boolean;
//   sound: boolean;
//   vibration: boolean;
//   previewText: boolean;
//   quietHours: {
//     enabled: boolean;
//     start: string; // "22:00"
//     end: string; // "08:00"
//   };
// }

// export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
//   enabled: true,
//   sound: true,
//   vibration: true,
//   previewText: true,
//   quietHours: {
//     enabled: false,
//     start: "22:00",
//     end: "08:00",
//   },
// };

// const SETTINGS_KEY = "notification_settings";

// export const getNotificationSettings = (): NotificationSettings => {
//   try {
//     const raw = localStorage.getItem(SETTINGS_KEY);
//     if (raw) {
//       const settings = JSON.parse(raw);
//       // ادغام با مقادیر پیش‌فرض برای جلوگیری از نداشتن فیلدهای جدید
//       return { ...DEFAULT_NOTIFICATION_SETTINGS, ...settings };
//     }
//   } catch (error) {
//     console.error("Error loading notification settings:", error);
//   }
//   return DEFAULT_NOTIFICATION_SETTINGS;
// };

// export const saveNotificationSettings = (settings: NotificationSettings): void => {
//   try {
//     localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
//   } catch (error) {
//     console.error("Error saving notification settings:", error);
//   }
// };

// export const requestNotificationPermission = async (): Promise<boolean> => {
//   if (!("Notification" in window)) {
//     console.warn("Web Notifications not supported");
//     return false;
//   }

//   if (Notification.permission === "granted") {
//     return true;
//   }

//   if (Notification.permission === "denied") {
//     return false;
//   }

//   const permission = await Notification.requestPermission();
//   return permission === "granted";
// };

// export const sendNotification = (
//   title: string,
//   options?: {
//     body?: string;
//     icon?: string;
//     tag?: string;
//     silent?: boolean;
//     vibrate?: number[];
//   }
// ): void => {
//   const settings = getNotificationSettings();

//   // اگر اعلان‌ها غیرفعال باشند
//   if (!settings.enabled) {
//     console.log("Notifications disabled by user");
//     return;
//   }

//   // بررسی ساعت سکوت
//   if (settings.quietHours.enabled) {
//     const now = new Date();
//     const currentTime = now.getHours() * 60 + now.getMinutes();
//     const [startHour, startMinute] = settings.quietHours.start.split(":").map(Number);
//     const [endHour, endMinute] = settings.quietHours.end.split(":").map(Number);
//     const startTotal = startHour * 60 + startMinute;
//     const endTotal = endHour * 60 + endMinute;

//     let isQuiet = false;
//     if (startTotal < endTotal) {
//       isQuiet = currentTime >= startTotal && currentTime < endTotal;
//     } else {
//       // بازه شبانه (مثلاً 22:00 تا 08:00)
//       isQuiet = currentTime >= startTotal || currentTime < endTotal;
//     }

//     if (isQuiet) {
//       console.log("Quiet hours active, notification suppressed");
//       return;
//     }
//   }

//   // ساخت اعلان
//   const notificationOptions: NotificationOptions = {
//     body: settings.previewText ? options?.body : undefined,
//     icon: options?.icon || "/favicon.ico",
//     tag: options?.tag || "default",
//     silent: !settings.sound,
//     vibrate: settings.vibration ? options?.vibrate || [200, 100, 200] : [],
//   };

//   try {
//     const notification = new Notification(title, notificationOptions);
//     notification.onclick = () => {
//       window.focus();
//       notification.close();
//     };
//     return notification;
//   } catch (error) {
//     console.error("Error sending notification:", error);
//   }
// };

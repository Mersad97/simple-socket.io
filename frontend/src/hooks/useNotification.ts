// src/hooks/useNotification.ts

import { useEffect, useState } from "react";
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  sendNotification,
  type NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "../services/notificationService";

export const useNotification = () => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  // بارگذاری تنظیمات
  useEffect(() => {
    setSettings(getNotificationSettings());
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // درخواست مجوز
  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermission("granted");
    } else {
      setPermission("denied");
    }
    return granted;
  };

  // به‌روزرسانی تنظیمات
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  // ارسال اعلان تست
  const sendTestNotification = () => {
    sendNotification("🔔 پیام تست", {
      body: "این یک اعلان تست از برنامه چت است",
      vibrate: [200, 100, 200],
    });
  };

  return {
    settings,
    permission,
    requestPermission,
    updateSettings,
    sendTestNotification,
    sendNotification,
  };
};

// src/components/chat/Sidebar/NotificationSettings.tsx

import { useState } from "react";
import {
  Box,
  Switch,
  Typography,
  Button,
  Alert,
  FormControlLabel,
  Divider,
  TextField,
  Stack,
  Collapse,
} from "@mui/material";
import {
  NotificationsActive,
  NotificationsOff,
  VolumeUp,
  Vibration,
  TextFields,
} from "@mui/icons-material";
import { useNotification } from "../../../hooks/useNotification";

export const NotificationSettings = () => {
  const { settings, permission, requestPermission, updateSettings, sendTestNotification } =
    useNotification();
  const [showQuietHours, setShowQuietHours] = useState(settings.quietHours.enabled);

  const handleToggleEnabled = () => {
    updateSettings({ enabled: !settings.enabled });
  };

  const handleToggleSound = () => {
    updateSettings({ sound: !settings.sound });
  };

  const handleToggleVibration = () => {
    updateSettings({ vibration: !settings.vibration });
  };

  const handleTogglePreview = () => {
    updateSettings({ previewText: !settings.previewText });
  };

  const handleToggleQuietHours = () => {
    const newState = !settings.quietHours.enabled;
    setShowQuietHours(newState);
    updateSettings({
      quietHours: { ...settings.quietHours, enabled: newState },
    });
  };

  const handleQuietHoursChange = (field: "start" | "end", value: string) => {
    updateSettings({
      quietHours: { ...settings.quietHours, [field]: value },
    });
  };

  // درخواست مجوز اگر قبلاً داده نشده
  const handleRequestPermission = async () => {
    await requestPermission();
  };

  return (
    <Box>
      {/* وضعیت مجوز */}
      {permission === "denied" && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          اعلان‌ها در مرورگر مسدود شده‌اند. لطفاً از تنظیمات مرورگر مجوز را فعال کنید.
        </Alert>
      )}
      {permission === "default" && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRequestPermission}>
              فعال‌سازی
            </Button>
          }
        >
          برای دریافت اعلان‌ها، لطفاً مجوز را فعال کنید.
        </Alert>
      )}

      {/* فعال/غیرفعال کردن کلی */}
      <FormControlLabel
        control={
          <Switch checked={settings.enabled} onChange={handleToggleEnabled} color="primary" />
        }
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: "1" }}>
            {settings.enabled ? (
              <NotificationsActive color="primary" />
            ) : (
              <NotificationsOff color="disabled" />
            )}
            <Typography>{settings.enabled ? "اعلان‌ها فعال" : "اعلان‌ها غیرفعال"}</Typography>
          </Box>
        }
        sx={{ mb: 2 }}
      />

      <Divider sx={{ my: 2 }} />

      {/* تنظیمات دقیق */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.sound}
              onChange={handleToggleSound}
              disabled={!settings.enabled}
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: "1" }}>
              <VolumeUp fontSize="small" />
              <Typography variant="body2">صدای اعلان</Typography>
            </Box>
          }
        />

        <FormControlLabel
          control={
            <Switch
              checked={settings.vibration}
              onChange={handleToggleVibration}
              disabled={!settings.enabled || !("vibrate" in navigator)}
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: "1" }}>
              <Vibration fontSize="small" />
              <Typography variant="body2">
                ویبره (موبایل)
                {!("vibrate" in navigator) && " (پشتیبانی نمی‌شود)"}
              </Typography>
            </Box>
          }
        />

        <FormControlLabel
          control={
            <Switch
              checked={settings.previewText}
              onChange={handleTogglePreview}
              disabled={!settings.enabled}
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: "1" }}>
              <TextFields fontSize="small" />
              <Typography variant="body2">نمایش متن پیام در اعلان</Typography>
            </Box>
          }
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ساعت سکوت */}
      <FormControlLabel
        control={
          <Switch
            checked={settings.quietHours.enabled}
            onChange={handleToggleQuietHours}
            disabled={!settings.enabled}
          />
        }
        label={<Typography variant="body2">ساعت سکوت (عدم دریافت اعلان)</Typography>}
      />

      <Collapse in={showQuietHours}>
        <Stack direction="row" spacing={2} sx={{ mt: 2, ml: 4 }}>
          <TextField
            label="شروع"
            type="time"
            size="small"
            value={settings.quietHours.start}
            onChange={(e) => handleQuietHoursChange("start", e.target.value)}
            disabled={!settings.quietHours.enabled || !settings.enabled}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{}}
          />
          <TextField
            label="پایان"
            type="time"
            size="small"
            value={settings.quietHours.end}
            onChange={(e) => handleQuietHoursChange("end", e.target.value)}
            disabled={!settings.quietHours.enabled || !settings.enabled}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </Collapse>

      <Divider sx={{ my: 2 }} />

      {/* دکمه تست */}
      <Button
        variant="outlined"
        onClick={sendTestNotification}
        disabled={!settings.enabled || permission !== "granted"}
        startIcon={<NotificationsActive />}
        fullWidth
      >
        ارسال اعلان تست
      </Button>
    </Box>
  );
};

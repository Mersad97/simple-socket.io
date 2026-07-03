// src/components/chat/Sidebar/SettingsDialog.tsx

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Switch,
  Button,
} from "@mui/material";
import {
  Close,
  DarkMode,
  LightMode,
  Logout,
  Person,
  Security,
  Notifications,
  Language,
  TextFormat,
} from "@mui/icons-material";
import { useColorScheme } from "@mui/material/styles";
import toast from "react-hot-toast";
import { logout } from "../../../services/auth";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationSettings } from "./NotificationSettings";
import { FontSizeSettings } from "./FontSizeSettings";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDialog = ({ open, onClose }: SettingsDialogProps) => {
  const { mode, setMode } = useColorScheme();
  const queryClient = useQueryClient();
  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   toast.success("با موفقیت خارج شدید");
  //   window.location.reload(); // یا reset کردن state اپلیکیشن
  //   onClose();
  // };

  const handleLogout = async () => {
    try {
      // ۱. درخواست به سرور برای حذف کوکی
      await logout();

      // ۲. فقط کش مربوط به ["me"] را پاک کن
      queryClient.removeQueries({ queryKey: ["me"] });

      // ۳. پیام موفقیت
      toast.success("با موفقیت خارج شدید");

      // ۴. هدایت به صفحه لاگین (بدون رفرش کامل)
      window.location.href = "/login";
    } catch (error) {
      toast.error("خطا در خروج از حساب");
    }
  };

  const handleToggleTheme = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">تنظیمات</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <List>
          {/* تم */}
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {mode === "dark" ? <DarkMode color="primary" /> : <LightMode color="warning" />}
              </ListItemIcon>
              <ListItemText
                primary="تم تاریک/روشن"
                secondary={mode === "dark" ? "فعال" : "غیرفعال"}
              />
              <Switch checked={mode === "dark"} onChange={handleToggleTheme} color="primary" />
            </ListItemButton>
          </ListItem>

          <Divider />

          {/* اعلان‌ها */}
          {/* <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText primary="اعلان‌ها" secondary="فعال" />
              <Switch defaultChecked color="primary" />
            </ListItemButton>
          </ListItem> */}

          {/* اعلان‌ها (کامپوننت جدید) */}
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton>
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText primary="اعلان‌ها" secondary="تنظیمات پیشرفته" />
            </ListItemButton>
          </ListItem>
          <Box sx={{ px: 2, pb: 2 }}>
            <NotificationSettings />
          </Box>

          <Divider />

          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton>
              <ListItemIcon>
                <TextFormat /> {/* یا هر آیکون مناسب */}
              </ListItemIcon>
              <ListItemText primary="سایز فونت" secondary="تنظیم اندازه متن پیام‌ها" />
            </ListItemButton>
          </ListItem>
          <Box sx={{ px: 2, pb: 2 }}>
            <FontSizeSettings />
          </Box>

          <Divider />

          {/* زبان */}
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <Language />
              </ListItemIcon>
              <ListItemText primary="زبان" secondary="فارسی" />
              <Button variant="outlined" size="small" disabled>
                تغییر
              </Button>
            </ListItemButton>
          </ListItem>

          <Divider />

          {/* امنیت */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toast.error("در حال توسعه...")}>
              <ListItemIcon>
                <Security />
              </ListItemIcon>
              <ListItemText primary="امنیت و حریم خصوصی" />
            </ListItemButton>
          </ListItem>

          <Divider />

          {/* پروفایل */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toast.error("در حال توسعه...")}>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="ویرایش پروفایل" />
            </ListItemButton>
          </ListItem>

          <Divider />

          {/* خروج */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon sx={{ color: "error.main" }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="خروج از حساب" />
            </ListItemButton>
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
};

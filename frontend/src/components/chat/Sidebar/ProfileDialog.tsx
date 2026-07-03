// frontend/src/components/chat/sidebar/ProfileDialog.tsx

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Close, Person, Phone, Badge, Email } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
//   import { GetMe } from "../../services/auth";
import toast from "react-hot-toast";
import { GetMe } from "../../../services/auth";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ProfileDialog = ({ open, onClose }: ProfileDialogProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: GetMe,
    staleTime: 60000,
  });

  const user = data?.body;
  //   console.log("ProfileDialog user", user);
  if (isError) {
    toast.error("خطا در بارگذاری اطلاعات کاربر");
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">پروفایل کاربری</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : user ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
            <Avatar src={user.profileImage || undefined} sx={{ width: 100, height: 100, mb: 2 }}>
              {user.name?.[0] || user.username?.[0] || "?"}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {user.name || "بدون نام"}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              @{user.username}
            </Typography>
            <Divider sx={{ width: "100%", my: 2 }} />
            <Paper variant="outlined" sx={{ width: "100%", p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                <Person fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>نام:</strong> {user.name || "ندارد"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>شماره:</strong> {user.phone || "ندارد"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                <Badge fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>نقش:</strong> {user.role || "کاربر"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>وضعیت:</strong> {user.isActive ? "فعال" : "غیرفعال"}
                </Typography>
              </Box>
            </Paper>
          </Box>
        ) : (
          <Typography color="error" align="center">
            اطلاعات کاربر یافت نشد
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

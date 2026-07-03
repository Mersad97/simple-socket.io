// src/components/chat/EmptyState.tsx

import { Box, Typography, Paper } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

const EmptyState = () => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        bgcolor: "background.default",
        height: "100vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <ChatIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          پیامی را انتخاب کنید
        </Typography>
        <Typography variant="body2" color="text.secondary">
          برای شروع مکالمه، یک چت را از لیست سمت چپ انتخاب کنید.
        </Typography>
      </Paper>
    </Box>
  );
};

export default EmptyState;

// // src/App.tsx

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Login from "./components/login";
import Register from "./components/Register";
import { GetMe } from "./services/auth";
import ChatContainer from "./components/chat/ChatContainer";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { ErrorOutlined } from "@mui/icons-material";

type AuthMode = "login" | "register";

export default function App() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: GetMe,
    retry: false,
  });

  const switchToLogin = () => setAuthMode("login");
  const switchToRegister = () => setAuthMode("register");

  // حالت بارگذاری
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          در حال بارگذاری...
        </Typography>
      </Box>
    );
  }

  // حالت خطا
  if (isError) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <ErrorOutlined sx={{ fontSize: 80, color: "error.main" }} />
        <Typography variant="h5" color="error.main">
          خطا در دریافت اطلاعات
        </Typography>
        <Typography variant="body1" color="text.secondary">
          لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => refetch()}>
          تلاش مجدد
        </Button>
      </Box>
    );
  }

  // اگر احراز هویت نشده باشد (data.success === false)
  if (data && data.success === false) {
    return authMode === "login" ? (
      <Login onSwitchToRegister={switchToRegister} />
    ) : (
      <Register onSwitchToLogin={switchToLogin} />
    );
  }

  // اگر احراز هویت شده باشد، صفحه چت
  return <ChatContainer />;
}

// // src/App.tsx

// import { useQuery } from "@tanstack/react-query";
// import Login from "./components/login";
// import { GetMe } from "./services/auth";
// import ChatContainer from "./components/chat/ChatContainer";

// // MUI imports
// import { Box, CircularProgress, Typography, Button } from "@mui/material";
// import { ErrorOutlined } from "@mui/icons-material";

// export default function App() {
//   const { data, isLoading, isError, refetch } = useQuery({
//     queryKey: ["me"],
//     queryFn: GetMe,
//   });

//   // حالت بارگذاری با نمایش اسپینر
//   if (isLoading) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           minHeight: "100vh",
//           flexDirection: "column",
//           gap: 2,
//         }}
//       >
//         <CircularProgress size={60} thickness={4} />
//         <Typography variant="h6" color="text.secondary">
//           در حال بارگذاری...
//         </Typography>
//       </Box>
//     );
//   }

//   // حالت خطا با نمایش آیکون و دکمه‌ی تلاش مجدد
//   if (isError) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           minHeight: "100vh",
//           flexDirection: "column",
//           gap: 2,
//         }}
//       >
//         <ErrorOutlined sx={{ fontSize: 80, color: "error.main" }} />
//         <Typography variant="h5" color="error.main">
//           خطا در دریافت اطلاعات
//         </Typography>
//         <Typography variant="body1" color="text.secondary">
//           لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید.
//         </Typography>
//         <Button variant="contained" color="primary" onClick={() => refetch()}>
//           تلاش مجدد
//         </Button>
//       </Box>
//     );
//   }

//   // در صورت عدم احراز هویت، صفحه‌ی ورود نمایش داده می‌شود
//   if (data && data.success === false) {
//     return <Login />;
//   }

//   // در غیر این صورت، صفحه‌ی چت
//   return <ChatContainer />;
// }

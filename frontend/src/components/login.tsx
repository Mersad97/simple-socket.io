// // src/components/login.tsx

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { login } from "../services/auth";
import toast from "react-hot-toast";
import { Box, Paper, TextField, Button, Typography, InputAdornment, Link } from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Lock from "@mui/icons-material/Lock";

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login = ({ onSwitchToRegister }: LoginProps) => {
  const qc = useQueryClient();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const submitHandler = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim().length < 5 || username.trim().length > 20) {
      toast.error("Username must be between 5 and 20 characters");
      return;
    }
    if (password.trim().length < 6 || password.trim().length > 25) {
      toast.error("Password must be between 6 and 25 characters");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: (variables: { username: string; password: string }) => login(variables),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("ورود موفق");
        qc.invalidateQueries({ queryKey: ["me"] });
      } else {
        toast.error("ورود ناموفق" + `\n` + data.message);
      }
    },
    onError: (error: any) => {
      toast.error("ورود ناموفق" + error?.message);
    },
  });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          ورود
        </Typography>

        <form onSubmit={submitHandler} style={{ width: "100%" }}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            slotProps={{
              htmlInput: {
                minLength: 5,
                maxLength: 20,
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            slotProps={{
              htmlInput: {
                minLength: 6,
                maxLength: 25,
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "در حال ورود..." : "ورود"}
          </Button>

          <Box sx={{ mt: 2, textAlign: "center", display: "flex", flexDirection: "column" }}>
            <Typography variant="body2" color="text.secondary">
              حساب کاربری ندارید؟{" "}
            </Typography>
            <Link
              component="button"
              type="button"
              onClick={onSwitchToRegister}
              sx={{ cursor: "pointer" }}
            >
              ثبت‌نام کنید
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;

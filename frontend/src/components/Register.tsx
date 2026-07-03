// src/components/Register.tsx

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { register } from "../services/auth";
import toast from "react-hot-toast";
import { Box, Paper, TextField, Button, Typography, InputAdornment, Link } from "@mui/material";
import { AccountCircle, Lock, Phone, Person, HowToReg } from "@mui/icons-material";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register = ({ onSwitchToLogin }: RegisterProps) => {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.username.length < 5 || formData.username.length > 20) {
      newErrors.username = "نام کاربری باید بین 5 تا 20 کاراکتر باشد";
    }
    if (formData.phone.length !== 11) {
      newErrors.phone = "شماره موبایل باید 11 رقم باشد";
    }
    if (formData.name.length < 3 || formData.name.length > 20) {
      newErrors.name = "نام باید بین 3 تا 20 کاراکتر باشد";
    }
    if (formData.password.length < 6 || formData.password.length > 25) {
      newErrors.password = "رمز عبور باید بین 6 تا 25 کاراکتر باشد";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "رمز عبور با تکرار آن مطابقت ندارد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerMutation = useMutation({
    mutationKey: ["register"],
    mutationFn: (variables: typeof formData) => {
      const { confirmPassword, ...data } = variables;
      return register(data);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("ثبت‌نام با موفقیت انجام شد. منتظر تایید ادمین باشید.");
        // بعد از ثبت‌نام، به صفحه لاگین برمی‌گردیم
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        toast.error("ثبت‌نام ناموفق: " + data.message);
      }
    },
    onError: (error: any) => {
      toast.error("خطا در ثبت‌نام: " + error?.message);
    },
  });

  const submitHandler = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      registerMutation.mutate(formData);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // پاک کردن خطای مربوط به فیلد
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

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
          maxWidth: 450,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          ثبت‌نام
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          برای ثبت‌نام در سامانه، فرم زیر را تکمیل کنید
        </Typography>

        <form onSubmit={submitHandler} style={{ width: "100%" }}>
          <TextField
            label="نام کاربری"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.username}
            onChange={handleChange("username")}
            required
            error={!!errors.username}
            helperText={errors.username}
            slotProps={{
              htmlInput: { minLength: 5, maxLength: 20 },
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
            label="شماره موبایل"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={handleChange("phone")}
            required
            error={!!errors.phone}
            helperText={errors.phone}
            slotProps={{
              htmlInput: { maxLength: 11 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="نام کامل"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange("name")}
            required
            error={!!errors.name}
            helperText={errors.name}
            slotProps={{
              htmlInput: { minLength: 3, maxLength: 20 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="رمز عبور"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange("password")}
            required
            error={!!errors.password}
            helperText={errors.password}
            slotProps={{
              htmlInput: { minLength: 6, maxLength: 25 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="تکرار رمز عبور"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            required
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            slotProps={{
              htmlInput: { minLength: 6, maxLength: 25 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <HowToReg />
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
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </Button>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              قبلاً ثبت‌نام کرده‌اید؟
              <Link
                component="button"
                type="button"
                onClick={onSwitchToLogin}
                sx={{ cursor: "pointer" }}
              >
                وارد شوید
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;

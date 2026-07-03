// src/components/common/ThemeToggle.tsx
import { useColorScheme } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export const ThemeToggle = () => {
  const { mode, setMode } = useColorScheme();

  // اگر هنوز mode مشخص نشده (مثلاً در حال بارگذاری)، چیزی نمایش نده
  if (!mode) return null;

  return (
    <IconButton onClick={() => setMode(mode === "dark" ? "light" : "dark")} color="inherit">
      {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

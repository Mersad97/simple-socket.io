// src/components/chat/Sidebar/FontSizeSettings.tsx

import { Box, Typography, IconButton, Slider, Button } from "@mui/material";
import { Add, Remove, Refresh } from "@mui/icons-material";
import { useFontSize } from "../../../context/FontSizeContext";
import { useState, useEffect, useRef } from "react";

export const FontSizeSettings = () => {
  const { fontSize, updateFontSize, resetFontSize } = useFontSize();

  // State محلی برای مقدار موقت
  const [localSize, setLocalSize] = useState(fontSize);
  //   const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // هماهنگ‌سازی localSize با fontSize (برای زمانی که از جای دیگر تغییر کند)
  useEffect(() => {
    setLocalSize(fontSize);
  }, [fontSize]);

  // اعمال تغییرات با تاخیر
  useEffect(() => {
    // اگر مقدار با fontSize یکی باشد، نیازی به تایمر نیست
    if (localSize === fontSize) return;

    // پاک کردن تایمر قبلی
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // تنظیم تایمر جدید
    timerRef.current = setTimeout(() => {
      updateFontSize(localSize);
    }, 300); // ۳۰۰ میلی‌ثانیه تاخیر

    // پاک کردن تایمر هنگام unmount یا تغییر localSize
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [localSize, fontSize, updateFontSize]);

  // هندلرهای تغییر
  const handleSliderChange = (_: Event, value: number | number[]) => {
    setLocalSize(value as number);
  };

  const handleIncrease = () => {
    const newSize = Math.min(localSize + 2, 28);
    setLocalSize(newSize);
  };

  const handleDecrease = () => {
    const newSize = Math.max(localSize - 2, 8);
    setLocalSize(newSize);
  };

  const handleReset = () => {
    // بازنشانی فوری بدون تاخیر
    resetFontSize();
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        اندازه فونت پیام‌ها
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton size="small" onClick={handleDecrease} disabled={localSize <= 8}>
          <Remove />
        </IconButton>
        <Slider
          value={localSize}
          onChange={handleSliderChange}
          min={8}
          max={28}
          step={1}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}px`}
          sx={{ flex: 1 }}
        />
        <IconButton size="small" onClick={handleIncrease} disabled={localSize >= 28}>
          <Add />
        </IconButton>
        <Button size="small" startIcon={<Refresh />} onClick={handleReset}>
          بازنشانی
        </Button>
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
        سایز فعلی: {localSize}px
      </Typography>
    </Box>
  );
};

// // src/components/chat/Sidebar/FontSizeSettings.tsx

// import { Box, Typography, IconButton, Slider, Button } from "@mui/material";
// import { Add, Remove, Refresh } from "@mui/icons-material";
// import { useFontSize } from "../../../context/FontSizeContext";
// // import { useFontSize } from "../../../hooks/useFontSize";

// export const FontSizeSettings = () => {
//   const { fontSize, updateFontSize, increaseFontSize, decreaseFontSize, resetFontSize } =
//     useFontSize();

//   return (
//     <Box>
//       <Typography variant="subtitle2" gutterBottom>
//         اندازه فونت پیام‌ها
//       </Typography>
//       {/* <Box display="flex" alignItems="center" gap={2}> */}
//       <Box sx={{ display: "flex", alignItems: "center", gap: "2" }}>
//         <IconButton size="small" onClick={decreaseFontSize} disabled={fontSize <= 12}>
//           <Remove />
//         </IconButton>
//         <Slider
//           value={fontSize}
//           onChange={(_, value) => updateFontSize(value as number)}
//           min={12}
//           max={28}
//           step={1}
//           valueLabelDisplay="auto"
//           valueLabelFormat={(value) => `${value}px`}
//           sx={{ flex: 1 }}
//         />
//         <IconButton size="small" onClick={increaseFontSize} disabled={fontSize >= 28}>
//           <Add />
//         </IconButton>
//         <Button size="small" startIcon={<Refresh />} onClick={resetFontSize}>
//           بازنشانی
//         </Button>
//       </Box>
//       {/* <Typography variant="caption" color="text.secondary" display="block" mt={1}> */}
//       <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
//         سایز فعلی: {fontSize}px
//       </Typography>
//     </Box>
//   );
// };

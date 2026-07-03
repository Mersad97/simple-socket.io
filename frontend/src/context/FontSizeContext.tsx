// src/context/FontSizeContext.tsx

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getFontSizeSettings, saveFontSizeSettings } from "../services/fontSizeService";

interface FontSizeContextType {
  fontSize: number;
  updateFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSize] = useState<number>(16);

  useEffect(() => {
    const settings = getFontSizeSettings();
    setFontSize(settings.size);
  }, []);

  const updateFontSize = (newSize: number) => {
    const clampedSize = Math.min(Math.max(newSize, 8), 28);
    setFontSize(clampedSize);
    saveFontSizeSettings({ size: clampedSize });
  };

  const increaseFontSize = () => updateFontSize(fontSize + 2);
  const decreaseFontSize = () => updateFontSize(fontSize - 2);
  const resetFontSize = () => updateFontSize(16);

  return (
    <FontSizeContext.Provider
      value={{ fontSize, updateFontSize, increaseFontSize, decreaseFontSize, resetFontSize }}
    >
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error("useFontSize must be used within a FontSizeProvider");
  }
  return context;
};

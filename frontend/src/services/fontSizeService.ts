// src/services/fontSizeService.ts

export interface FontSizeSettings {
  size: number; // سایز فونت به پیکسل
}

const DEFAULT_FONT_SIZE = 16; // پیش‌فرض
const SETTINGS_KEY = "font_size_settings";

export const getFontSizeSettings = (): FontSizeSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const settings = JSON.parse(raw);
      return { size: settings.size || DEFAULT_FONT_SIZE };
    }
  } catch (error) {
    console.error("Error loading font size settings:", error);
  }
  return { size: DEFAULT_FONT_SIZE };
};

export const saveFontSizeSettings = (settings: FontSizeSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving font size settings:", error);
  }
};

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { THEME_DEFAULTS } from "./theme";
import type { Theme } from "./theme";

interface ThemeContextType {
  theme: Theme;
  updateTheme: (updates: Partial<Theme>) => void;
  resetTheme: () => void;
  hasCustomTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEME_DEFAULTS,
  updateTheme: () => {},
  resetTheme: () => {},
  hasCustomTheme: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(THEME_DEFAULTS);
  const [hasCustomTheme, setHasCustomTheme] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ps_appearance");
      if (saved) {
        const parsed = JSON.parse(saved);
        setTheme({ ...THEME_DEFAULTS, ...parsed });
        setHasCustomTheme(true);
      }
    } catch {
      // Fall back to defaults silently
    }
  }, []);

  const updateTheme = (updates: Partial<Theme>) => {
    const next = { ...theme, ...updates };
    setTheme(next);
    setHasCustomTheme(true);
    try {
      localStorage.setItem("ps_appearance", JSON.stringify(next));
    } catch {}
  };

  const resetTheme = () => {
    setTheme(THEME_DEFAULTS);
    setHasCustomTheme(false);
    try {
      localStorage.removeItem("ps_appearance");
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, hasCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

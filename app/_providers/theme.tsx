// app/_providers/theme.tsx

import { DarkColors, LightColors, type AppColors } from "@/styles/colors";
import React, { createContext, useContext, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark";

export type AppThemeColors = {
  background: string;
  surface: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  borderSubtle: string;
  premium: string;
};

const lightColors: AppThemeColors = {
  background: "#FFFFFF",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  text: "#111111",
  muted: "rgba(17,17,17,0.55)",
  border: "rgba(17,17,17,0.10)",
  borderSubtle: "rgba(17,17,17,0.08)",
  premium: "#F4C84A",
};

const darkColors: AppThemeColors = {
  background: "#0B0B0C",
  surface: "#111214",
  card: "#17181A",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.62)",
  border: "rgba(255,255,255,0.14)",
  borderSubtle: "rgba(255,255,255,0.10)",
  premium: "#F4C84A",
};

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: AppColors;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = mode === "dark";

    return {
      mode,
      isDark,
      colors: isDark ? DarkColors : LightColors,
      toggleTheme: () => setMode((prev) => (prev === "dark" ? "light" : "dark")),
      setMode,
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useAppTheme must be used inside ThemeProvider");
  }

  return ctx;
}
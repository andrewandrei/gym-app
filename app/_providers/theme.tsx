// app/_providers/theme.tsx

import { StatusBar } from "expo-status-bar";
import React, { createContext, useContext, useMemo, type ReactNode } from "react";

import { useAppSettings } from "./appSettings";

type ThemeColors = {
  background: string;
  surface: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  borderSubtle: string;
  premium: string;
};

type ThemeContextValue = {
  isDark: boolean;
  colors: ThemeColors;
};

const lightColors: ThemeColors = {
  background: "#FFFFFF",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  text: "#111111",
  muted: "#6E6E73",
  border: "#E5E5EA",
  borderSubtle: "#EFEFF2",
  premium: "#F4C84A",
};

const darkColors: ThemeColors = {
  background: "#0F0F10",
  surface: "#151517",
  card: "#1B1B1E",
  text: "#FFFFFF",
  muted: "#9A9AA1",
  border: "#2B2B2F",
  borderSubtle: "#222225",
  premium: "#F4C84A",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useAppSettings();

  const isDark = settings.appearance === "dark";

  const value = useMemo<ThemeContextValue>(() => {
    return {
      isDark,
      colors: isDark ? darkColors : lightColors,
    };
  }, [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }

  return context;
}
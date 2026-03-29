import { StatusBar } from "expo-status-bar";
import React, { createContext, useContext, useMemo, type ReactNode } from "react";

import { DarkColors, LightColors, type AppColors } from "@/styles/colors";
import { useAppSettings } from "./appSettings";

type ThemeContextValue = {
  isDark: boolean;
  colors: AppColors;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useAppSettings();

  const isDark = settings.appearance === "dark";

  const value = useMemo<ThemeContextValue>(() => {
    return {
      isDark,
      colors: isDark ? DarkColors : LightColors,
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
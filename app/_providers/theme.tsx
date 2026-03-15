import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
  mode: ThemeMode;
  isDark: boolean;
  colors: any;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "APP_THEME";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved === "dark" || saved === "light") {
          setMode(saved);
        }
      } catch {}

      setLoaded(true);
    };

    loadTheme();
  }, []);

  const setTheme = async (newMode: ThemeMode) => {
    setMode(newMode);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(mode === "dark" ? "light" : "dark");
  };

  const colors =
    mode === "dark"
      ? {
          background: "#0F0F10",
          surface: "#151517",
          card: "#1B1B1E",
          text: "#FFFFFF",
          muted: "#9A9AA1",
          border: "#2B2B2F",
          borderSubtle: "#222225",
          premium: "#F4C84A",
        }
      : {
          background: "#FFFFFF",
          surface: "#FFFFFF",
          card: "#FFFFFF",
          text: "#111111",
          muted: "#6E6E73",
          border: "#E5E5EA",
          borderSubtle: "#EFEFF2",
          premium: "#F4C84A",
        };

  if (!loaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark: mode === "dark",
        colors,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useAppTheme must be used inside ThemeProvider");
  }

  return ctx;
};
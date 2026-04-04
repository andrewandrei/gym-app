// providers/appSettings.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_APP_SETTINGS,
  loadAppSettings,
  updateAppSettings,
  type AppAppearance,
  type AppSettings,
} from "../lib/appSettingsStorage";
import type { WeightUnit } from "../lib/weightUnits";

export type AppSettingsContextValue = {
  settings: AppSettings;
  isHydrated: boolean;

  setAppearance: (appearance: AppAppearance) => Promise<void>;
  setWeightUnit: (unit: WeightUnit) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;

  refreshSettings: () => Promise<void>;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  const refreshSettings = useCallback(async () => {
    const next = await loadAppSettings();
    setSettings(next);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const next = await loadAppSettings();
        if (!mounted) return;
        setSettings(next);
      } finally {
        if (mounted) {
          setIsHydrated(true);
        }
      }
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const setAppearance = useCallback(async (appearance: AppAppearance) => {
    const next = await updateAppSettings({ appearance });
    setSettings(next);
  }, []);

  const setWeightUnit = useCallback(async (weightUnit: WeightUnit) => {
    const next = await updateAppSettings({ weightUnit });
    setSettings(next);
  }, []);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    const next = await updateAppSettings({ notificationsEnabled: enabled });
    setSettings(next);
  }, []);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      isHydrated,
      setAppearance,
      setWeightUnit,
      setNotificationsEnabled,
      refreshSettings,
    }),
    [
      settings,
      isHydrated,
      setAppearance,
      setWeightUnit,
      setNotificationsEnabled,
      refreshSettings,
    ],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettingsContextValue {
  const context = useContext(AppSettingsContext);

  if (!context) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider");
  }

  return context;
}
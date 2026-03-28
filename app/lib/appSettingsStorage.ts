// app/lib/appSettingsStorage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeWeightUnit, type WeightUnit } from "./weightUnits";

export type AppAppearance = "light" | "dark";

export type AppSettings = {
  appearance: AppAppearance;
  weightUnit: WeightUnit;
  notificationsEnabled: boolean;
};

export const APP_SETTINGS_STORAGE_KEY = "aa_fit_app_settings";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appearance: "light",
  weightUnit: "kg",
  notificationsEnabled: true,
};

function normalizeAppearance(value: unknown): AppAppearance {
  return value === "dark" ? "dark" : "light";
}

function normalizeNotificationsEnabled(value: unknown): boolean {
  return typeof value === "boolean"
    ? value
    : DEFAULT_APP_SETTINGS.notificationsEnabled;
}

export function normalizeAppSettings(value: unknown): AppSettings {
  if (!value || typeof value !== "object") {
    return DEFAULT_APP_SETTINGS;
  }

  const raw = value as Partial<AppSettings>;

  return {
    appearance: normalizeAppearance(raw.appearance),
    weightUnit: normalizeWeightUnit(raw.weightUnit),
    notificationsEnabled: normalizeNotificationsEnabled(raw.notificationsEnabled),
  };
}

export async function loadAppSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_APP_SETTINGS;

    const parsed = JSON.parse(raw);
    return normalizeAppSettings(parsed);
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  const normalized = normalizeAppSettings(settings);
  await AsyncStorage.setItem(
    APP_SETTINGS_STORAGE_KEY,
    JSON.stringify(normalized),
  );
}

export async function updateAppSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  const current = await loadAppSettings();

  const next = normalizeAppSettings({
    ...current,
    ...patch,
  });

  await saveAppSettings(next);
  return next;
}

export async function clearAppSettings(): Promise<void> {
  await AsyncStorage.removeItem(APP_SETTINGS_STORAGE_KEY);
}
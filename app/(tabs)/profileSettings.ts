import AsyncStorage from "@react-native-async-storage/async-storage";

export const PROFILE_SETTINGS_STORAGE_KEY = "aa_fit_profile_settings";

export type AppearanceSetting = "light" | "dark" | "system";
export type UnitSetting = "kg" | "lbs";

export type ProfileSettings = {
  appearance: AppearanceSetting;
  units: UnitSetting;
  notificationsEnabled: boolean;
};

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  appearance: "system",
  units: "kg",
  notificationsEnabled: true,
};

function normalizeAppearance(value: unknown): AppearanceSetting {
  if (value === "light" || value === "dark" || value === "system") return value;
  return DEFAULT_PROFILE_SETTINGS.appearance;
}

function normalizeUnits(value: unknown): UnitSetting {
  if (value === "kg" || value === "lbs") return value;
  return DEFAULT_PROFILE_SETTINGS.units;
}

function normalizeNotifications(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  return DEFAULT_PROFILE_SETTINGS.notificationsEnabled;
}

function normalizeSettings(value: unknown): ProfileSettings {
  if (!value || typeof value !== "object") return DEFAULT_PROFILE_SETTINGS;

  const raw = value as Partial<ProfileSettings>;

  return {
    appearance: normalizeAppearance(raw.appearance),
    units: normalizeUnits(raw.units),
    notificationsEnabled: normalizeNotifications(raw.notificationsEnabled),
  };
}

export async function loadProfileSettings(): Promise<ProfileSettings> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE_SETTINGS;

    const parsed = JSON.parse(raw);
    return normalizeSettings(parsed);
  } catch {
    return DEFAULT_PROFILE_SETTINGS;
  }
}

export async function saveProfileSettings(settings: ProfileSettings): Promise<void> {
  await AsyncStorage.setItem(
    PROFILE_SETTINGS_STORAGE_KEY,
    JSON.stringify(normalizeSettings(settings)),
  );
}

export async function updateProfileSettings(
  patch: Partial<ProfileSettings>,
): Promise<ProfileSettings> {
  const current = await loadProfileSettings();
  const next = normalizeSettings({
    ...current,
    ...patch,
  });

  await saveProfileSettings(next);
  return next;
}

export async function clearProfileSettings(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_SETTINGS_STORAGE_KEY);
}

export function getNextAppearance(current: AppearanceSetting): AppearanceSetting {
  if (current === "system") return "light";
  if (current === "light") return "dark";
  return "system";
}

export function getNextUnits(current: UnitSetting): UnitSetting {
  return current === "kg" ? "lbs" : "kg";
}

export function getAppearanceLabel(value: AppearanceSetting): string {
  if (value === "light") return "Light";
  if (value === "dark") return "Dark";
  return "System";
}

export function getUnitsLabel(value: UnitSetting): string {
  return value.toUpperCase();
}

export function getNotificationsLabel(value: boolean): string {
  return value ? "On" : "Off";
}
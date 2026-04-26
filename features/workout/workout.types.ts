// app/workout/workout.types.ts

export type TrackingMode =
  | "weight_reps"
  | "bodyweight_reps"
  | "time"
  | "reps_only"
  | "calories"
  | "time_speed";

export type TrackingModeConfig = {
  primaryLabel: string;
  secondaryLabel: string;
  thirdLabel: string;
  hideThirdField: boolean;
  primaryUsesWeightField: boolean;
  primaryUsesClockInput: boolean;
  isWeightBased: boolean;
  comparisonEnabled: boolean;
  prEnabled: boolean;
  primaryPlaceholder?: string;
  secondaryPlaceholder?: string;
  thirdPlaceholder?: string;
};

export function getTrackingModeConfig(
  trackingMode: TrackingMode = "weight_reps",
): TrackingModeConfig {
  switch (trackingMode) {
    case "time":
      return {
        primaryLabel: "TIME",
        secondaryLabel: "REST",
        thirdLabel: "",
        hideThirdField: true,
        primaryUsesWeightField: true,
        primaryUsesClockInput: true,
        isWeightBased: false,
        comparisonEnabled: false,
        prEnabled: false,
        primaryPlaceholder: "0:00",
        secondaryPlaceholder: "—",
        thirdPlaceholder: "",
      };

    case "time_speed":
      return {
        primaryLabel: "TIME",
        secondaryLabel: "SPEED",
        thirdLabel: "INCLINE",
        hideThirdField: false,
        primaryUsesWeightField: true,
        primaryUsesClockInput: true,
        isWeightBased: false,
        comparisonEnabled: false,
        prEnabled: false,
        primaryPlaceholder: "0:00",
        secondaryPlaceholder: "0.0",
        thirdPlaceholder: "0",
      };

    case "reps_only":
      return {
        primaryLabel: "REPS",
        secondaryLabel: "REST",
        thirdLabel: "",
        hideThirdField: true,
        primaryUsesWeightField: false,
        primaryUsesClockInput: false,
        isWeightBased: false,
        comparisonEnabled: false,
        prEnabled: false,
        primaryPlaceholder: "—",
        secondaryPlaceholder: "—",
        thirdPlaceholder: "",
      };

    case "calories":
      return {
        primaryLabel: "CAL",
        secondaryLabel: "REST",
        thirdLabel: "",
        hideThirdField: true,
        primaryUsesWeightField: true,
        primaryUsesClockInput: false,
        isWeightBased: false,
        comparisonEnabled: false,
        prEnabled: false,
        primaryPlaceholder: "—",
        secondaryPlaceholder: "—",
        thirdPlaceholder: "",
      };

    case "bodyweight_reps":
      return {
        primaryLabel: "LOAD",
        secondaryLabel: "REPS",
        thirdLabel: "REST",
        hideThirdField: false,
        primaryUsesWeightField: true,
        primaryUsesClockInput: false,
        isWeightBased: false,
        comparisonEnabled: true,
        prEnabled: true,
        primaryPlaceholder: "BW",
        secondaryPlaceholder: "—",
        thirdPlaceholder: "—",
      };

    case "weight_reps":
    default:
      return {
        primaryLabel: "WEIGHT",
        secondaryLabel: "REPS",
        thirdLabel: "REST",
        hideThirdField: false,
        primaryUsesWeightField: true,
        primaryUsesClockInput: false,
        isWeightBased: true,
        comparisonEnabled: true,
        prEnabled: true,
        primaryPlaceholder: "—",
        secondaryPlaceholder: "—",
        thirdPlaceholder: "—",
      };
  }
}

export function isComparableTrackingMode(
  trackingMode: TrackingMode = "weight_reps",
): boolean {
  return getTrackingModeConfig(trackingMode).comparisonEnabled;
}

export function isPrTrackingMode(
  trackingMode: TrackingMode = "weight_reps",
): boolean {
  return getTrackingModeConfig(trackingMode).prEnabled;
}

export function formatSecondsToClock(value?: string | number | null) {
  const sec =
    typeof value === "string"
      ? parseInt(value, 10)
      : typeof value === "number"
        ? value
        : null;

  if (!Number.isFinite(sec) || sec === null || sec <= 0) return "";

  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function parseClockToSeconds(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return "";

  const parts = raw.split(":");

  if (parts.length === 1) {
    const sec = parseInt(parts[0], 10);
    return Number.isFinite(sec) ? String(sec) : "";
  }

  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return "";

  return String(minutes * 60 + seconds);
}

export function normalizeTimeInput(value: string) {
  const digits = value.replace(/[^\d]/g, "").slice(0, 4);
  if (!digits) return "";

  if (digits.length <= 2) {
    return digits;
  }

  const minutes = digits.slice(0, digits.length - 2);
  const seconds = digits.slice(-2);

  return `${parseInt(minutes, 10)}:${seconds}`;
}

export function sanitizeNumericInput(value: string) {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}
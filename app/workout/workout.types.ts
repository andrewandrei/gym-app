// app/workout/workout.types.ts

export type TrackingMode =
  | "weight_reps"
  | "bodyweight_reps"
  | "time"
  | "reps_only"
  | "calories";

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

  if (sec == null || Number.isNaN(sec) || sec <= 0) return "";
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function parseClockToSeconds(value: string) {
  const raw = value.trim();
  if (!raw) return "";

  if (raw.includes(":")) {
    const [m, s] = raw.split(":");
    const minutes = parseInt(m || "0", 10);
    const seconds = parseInt(s || "0", 10);
    if (Number.isNaN(minutes) || Number.isNaN(seconds)) return "";
    return String(minutes * 60 + seconds);
  }

  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return digits;
}

export function normalizeTimeInput(raw: string) {
  const digits = raw.replace(/[^\d]/g, "").slice(0, 4);
  if (!digits) return "";

  if (digits.length <= 2) {
    return `0:${digits.padStart(2, "0")}`;
  }

  const minutes = digits.slice(0, digits.length - 2);
  const seconds = digits.slice(-2);
  return `${parseInt(minutes, 10)}:${seconds}`;
}

export function sanitizeNumericInput(raw: string) {
  return raw.replace(/[^\d.]/g, "");
}
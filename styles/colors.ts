// styles/colors.ts

export type AppColors = {
  surface: string;
  background: string;

  text: string;
  muted: string;
  subtle: string;

  border: string;
  borderSubtle: string;
  borderStrong: string;
  hairline: string;

  fill: string;
  fillAlt: string;

  premium: string;

  danger: string;
  success: string;
  warning: string;

  ink: string;
  inkSoft: string;

  card: string;

  premiumSoft: string;
  premiumBorder: string;
  premiumText: string;

  successSoft: string;
  successBorder: string;
  successText: string;

  warningSoft: string;
  warningBorder: string;
  warningText: string;
};

export const LightColors: AppColors = {
  surface: "#FFFFFF",
  background: "#FFFFFF",

  text: "#111111",
  muted: "#6E6E73",
  subtle: "#8E8E93",

  border: "#E5E5EA",
  borderSubtle: "#EFEFF2",
  borderStrong: "#DCDCE1",
  hairline: "rgba(0,0,0,0.08)",

  fill: "#F2F2F7",
  fillAlt: "#FAFAFA",

  // Deep Honey
  premium: "#C89211",

  danger: "#D92D20",
  success: "#22C55E",
  warning: "#F79009",

  ink: "#000000",
  inkSoft: "#1A1A1A",

  card: "#FFFFFF",

  // Deep Honey semantic system
  premiumSoft: "rgba(200,146,17,0.14)",
  premiumBorder: "rgba(122,82,0,0.18)",
  premiumText: "#7A5200",

  // Emerald semantic system
  successSoft: "rgba(34,197,94,0.12)",
  successBorder: "rgba(22,101,52,0.18)",
  successText: "#166534",

  // Warning semantic system
  warningSoft: "rgba(247,144,9,0.12)",
  warningBorder: "rgba(180,83,9,0.18)",
  warningText: "#B45309",
};

export const DarkColors: AppColors = {
  surface: "#151517",
  background: "#0F0F10",

  text: "#FFFFFF",
  muted: "#9A9AA1",
  subtle: "rgba(255,255,255,0.52)",

  border: "#2B2B2F",
  borderSubtle: "#222225",
  borderStrong: "#343438",
  hairline: "rgba(255,255,255,0.10)",

  fill: "#1A1B1E",
  fillAlt: "#141518",

  // Deep Honey
  premium: "#C89211",

  danger: "#FF6B5E",
  success: "#22C55E",
  warning: "#FFB547",

  ink: "#FFFFFF",
  inkSoft: "rgba(255,255,255,0.88)",

  card: "#1B1B1E",

  // Deep Honey semantic system
  premiumSoft: "rgba(200,146,17,0.18)",
  premiumBorder: "rgba(200,146,17,0.34)",
  premiumText: "#F4C84A",

  // Emerald semantic system
  successSoft: "rgba(34,197,94,0.16)",
  successBorder: "rgba(34,197,94,0.30)",
  successText: "#4ADE80",

  // Warning semantic system
  warningSoft: "rgba(255,181,71,0.16)",
  warningBorder: "rgba(255,181,71,0.30)",
  warningText: "#FFB547",
};

/**
 * Backwards compatibility only.
 * Old screens importing `Colors` will stay light until migrated.
 * New themed screens should use `useAppTheme().colors`.
 */
export const Colors = LightColors;
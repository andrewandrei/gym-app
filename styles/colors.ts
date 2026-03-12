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
};

export const LightColors: AppColors = {
  surface: "#FFFFFF",
  background: "#FFFFFF",

  text: "#0B0B0C",
  muted: "#8E8E93",
  subtle: "#A3A3A8",

  border: "rgba(0,0,0,0.12)",
  borderSubtle: "rgba(0,0,0,0.10)",
  borderStrong: "rgba(0,0,0,0.14)",
  hairline: "rgba(0,0,0,0.08)",

  fill: "#F2F2F2",
  fillAlt: "#FAFAFA",

  premium: "#F4C84A",

  danger: "#D92D20",
  success: "#12B76A",
  warning: "#F79009",

  ink: "#000000",
  inkSoft: "#1A1A1A",
};

export const DarkColors: AppColors = {
  surface: "#111214",
  background: "#000000",

  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.62)",
  subtle: "rgba(255,255,255,0.42)",

  border: "rgba(255,255,255,0.14)",
  borderSubtle: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  hairline: "rgba(255,255,255,0.10)",

  fill: "#1A1B1E",
  fillAlt: "#141518",

  premium: "#F4C84A",

  danger: "#FF6B5E",
  success: "#33D17A",
  warning: "#FFB547",

  ink: "#FFFFFF",
  inkSoft: "rgba(255,255,255,0.88)",
};

/**
 * Backwards compatibility only.
 * Old screens importing `Colors` will stay light until migrated.
 * New themed screens should use `useAppTheme().colors`.
 */
export const Colors = LightColors;
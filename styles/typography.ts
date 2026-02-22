// styles/typography.ts
import { Colors } from "@/styles/colors";
import { Platform } from "react-native";

const font = (w: any) =>
  Platform.select({
    ios: { fontWeight: w },
    android: { fontWeight: w },
    default: { fontWeight: w },
  });

export const Typography = {
  // Tiny labels / kickers
  micro: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
    ...font("800"),
    color: Colors.text,
  },

  // Small supporting text
  caption: {
    fontSize: 12,
    lineHeight: 16,
    ...font("700"),
    color: Colors.muted,
  },

  // Body
  body: {
    fontSize: 15,
    lineHeight: 20,
    ...font("600"),
    color: Colors.text,
  },

  // Titles
  title2: {
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.3,
    ...font("900"),
    color: Colors.text,
  },

  title1: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.4,
    ...font("900"),
    color: Colors.text,
  },

  hero: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
    ...font("900"),
    color: Colors.text,
  },
} as const;
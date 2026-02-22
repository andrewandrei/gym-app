import { Platform, StyleSheet } from "react-native";

type ShadowPreset = {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
};

const ios = (y: number, blur: number, opacity: number): ShadowPreset => ({
  shadowColor: "#000",
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: blur,
});

const android = (elevation: number): ShadowPreset => ({ elevation });

export const Shadow: Record<"soft" | "medium" | "strong", ShadowPreset> = {
  soft: Platform.select({
    ios: ios(8, 20, 0.08),
    android: android(3),
    default: {},
  }) as ShadowPreset,

  medium: Platform.select({
    ios: ios(12, 28, 0.10),
    android: android(5),
    default: {},
  }) as ShadowPreset,

  strong: Platform.select({
    ios: ios(18, 36, 0.12),
    android: android(8),
    default: {},
  }) as ShadowPreset,
};

export const Cards = StyleSheet.create({
  base: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    ...Shadow.soft,
  },

  workout: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    ...Shadow.medium,
  },

  hero: {
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    ...Shadow.strong,
  },

  flat: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
});
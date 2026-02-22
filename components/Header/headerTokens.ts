// components/header/headerTokens.ts
import { Colors } from "@/styles/colors";
import { StyleSheet } from "react-native";

export const HAIR = StyleSheet.hairlineWidth;

export const HeaderTokens = {
  bg: Colors.surface, // MUST be white
  border: Colors.border,
  text: Colors.text,
  muted: "rgba(0,0,0,0.50)",

  // Sizes (premium + consistent)
  icon: 20,
  iconBtn: 40,
  iconRadius: 999,

  // Typography scale (global)
  title: 18,
  titleLine: 22,
  subtitle: 13,
  subtitleLine: 18,

  // Large title (Home / Dashboard)
  largeTitle: 34,
  largeTitleLine: 38,
  largeSubtitle: 15,
  largeSubtitleLine: 20,

  // Spacing
  px: 24, // matches your Home paddingHorizontal
  py: 10,
  gap: 10,
};
// components/header/Header.styles.ts
import { StyleSheet } from "react-native";
import { HAIR, HeaderTokens as T } from "./headerTokens";

export const headerStyles = StyleSheet.create({
  // Container
  wrap: {
    backgroundColor: T.bg,
    borderBottomWidth: HAIR,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },

  // For overlay headers on hero images
  wrapTransparent: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
  },

  // Top row
  row: {
    paddingHorizontal: T.px,
    paddingTop: T.py,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: T.gap,
  },

  // Left area (back button)
  leftSlot: {
    width: T.iconBtn,
    height: T.iconBtn,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  // Right area (actions)
  rightSlot: {
    minWidth: T.iconBtn,
    height: T.iconBtn,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  // Center text block
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  // When we need a left-aligned title (Large Title mode)
  centerLeftAlign: {
    alignItems: "flex-start",
  },

  // Back button
  backBtn: {
    width: T.iconBtn,
    height: T.iconBtn,
    borderRadius: T.iconRadius,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.bg,
  },

  // Transparent back button (over hero)
  backBtnTransparent: {
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(0,0,0,0.22)",
  },

  // Left label (optional "Exit")
  leftLabel: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "800",
    color: T.text,
    letterSpacing: -0.2,
  },
  leftLabelOnDark: {
    color: "#FFFFFF",
  },

  // Standard title/subtitle
  title: {
    fontSize: T.title,
    lineHeight: T.titleLine,
    fontWeight: "900",
    color: T.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 2,
    fontSize: T.subtitle,
    lineHeight: T.subtitleLine,
    fontWeight: "700",
    color: T.muted,
  },

  // Dark text variant (for overlay)
  titleOnDark: { color: "#FFFFFF" },
  subtitleOnDark: { color: "rgba(255,255,255,0.78)" },

  // Large title section (below top row)
  largeBlock: {
    paddingHorizontal: T.px,
    paddingBottom: 12,
  },
  largeTitle: {
    fontSize: T.largeTitle,
    lineHeight: T.largeTitleLine,
    fontWeight: "900",
    color: T.text,
    letterSpacing: -0.4,
  },
  largeSubtitle: {
    marginTop: 6,
    fontSize: T.largeSubtitle,
    lineHeight: T.largeSubtitleLine,
    fontWeight: "700",
    color: T.muted,
  },

  largeTitleOnDark: { color: "#FFFFFF" },
  largeSubtitleOnDark: { color: "rgba(255,255,255,0.78)" },
});
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";
import { StyleSheet } from "react-native";

export function createExploreStyles(
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    borderSubtle: string;
    premium: string;
  },
  isDark: boolean,
) {
  const HAIR = 1;

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },

    cardPressed: {
      opacity: 0.93,
    },

    content: {
      flexGrow: 1,
      paddingTop: 4,
      paddingBottom: Spacing.lg,
    },

    pad: {
      paddingHorizontal: Spacing.md,
    },

    rails: {
      paddingBottom: 0,
    },

    rail: {},

    railHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: Spacing.sm,
    },

    railTitle: {
      flex: 1,
      fontSize: 22,
      lineHeight: 26,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.2,
    },

    railAll: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 0,
      borderRadius: 10,
    },

    railAllText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
      marginRight: 4,
    },

    railListContent: {
      paddingLeft: Spacing.md,
      paddingRight: Spacing.md,
      paddingBottom: Spacing.md,
    },

    bottomSpacer: {
      height: Spacing.xl * 1.2,
    },

    badge: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.92)",
      borderWidth: BorderWidth.default,
      borderColor: "rgba(0,0,0,0.10)",
    },

    badgeGold: {
      backgroundColor: "rgba(244,200,74,0.95)",
      borderColor: "rgba(244,200,74,0.40)",
    },

    badgeText: {
      fontSize: 12,
      fontWeight: "900",
      color: "#111111",
      letterSpacing: -0.1,
    },

    badgeTextGold: {
      color: "#111111",
    },

    programCardWrap: {
      width: 284,
    },

    programTile: {
      height: 390,
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: colors.card,
    },

    programTileImage: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
    },

    programBottomScrim: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 280,
    },

    programTopLeft: {
      position: "absolute",
      top: 12,
      left: 12,
    },

    infoChip: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "rgba(255,255,255,0.22)",
      borderWidth: BorderWidth.default,
      borderColor: "rgba(255,255,255,0.28)",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },

    programBottomRight: {
      position: "absolute",
      right: 12,
      bottom: 14,
    },

    programTextOverlay: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 12,
    },

    programTitleOnImage: {
      color: "#fff",
      fontSize: 28,
      lineHeight: 32,
      fontWeight: "900",
      letterSpacing: -0.45,
    },

    programDurationOnImage: {
      marginTop: 8,
      color: "rgba(255,255,255,0.88)",
      fontSize: 15,
      fontWeight: "700",
    },

    programBelowPrimary: {
      marginTop: Spacing.sm,
      color: colors.text,
      fontSize: 15,
      lineHeight: 18,
      fontWeight: "700",
      letterSpacing: -0.1,
    },

    programBelowSecondary: {
      marginTop: Spacing.xxs,
      color: colors.muted,
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "600",
    },

    levelText: {
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "800",
      color: "rgba(255,255,255,0.92)",
      letterSpacing: -0.1,
    },

    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? "rgba(0,0,0,0.58)" : "rgba(0,0,0,0.40)",
    },

    modalSheet: {
      marginTop: "auto",
      backgroundColor: colors.surface,
      padding: 16,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderTopWidth: HAIR,
      borderTopColor: colors.border,
    },

    modalTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },

    modalTitle: {
      flex: 1,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    modalClose: {
      paddingHorizontal: 12,
      height: 34,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: BorderWidth.default,
      borderColor: colors.border,
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    },

    modalCloseText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
    },

    modalMeta: {
      marginTop: 10,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },

    modalBody: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600",
      color: colors.muted,
    },

    modalActionsRow: {
      marginTop: 14,
    },

    modalPrimary: {
      height: 46,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    modalPrimaryText: {
      color: colors.surface,
      fontWeight: "900",
      fontSize: 14,
      letterSpacing: -0.15,
    },
  });
}
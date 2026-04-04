import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";
import { StyleSheet } from "react-native";

export function createProfileStyles(
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
  const BORDER = colors.borderSubtle ?? colors.border;

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.surface,
    },

    scroll: {
      backgroundColor: colors.background,
    },

    content: {
      flexGrow: 1,
      paddingTop: 4,
      paddingBottom: Spacing.lg,
      paddingHorizontal: Spacing.md,
    },

    planCard: {
      marginTop: 12,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    planLeft: {
      flex: 1,
      paddingRight: 12,
    },

    planLabel: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    planHint: {
      marginTop: 6,
      fontSize: 14,
      fontWeight: "600",
      color: colors.muted,
    },

    upgradePill: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: colors.premium,
      borderWidth: BorderWidth.default,
      borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
    },

    upgradePillText: {
      fontSize: 14,
      fontWeight: "900",
      color: "#111111",
      letterSpacing: -0.1,
    },

    planChip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    planChipText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
    },

    section: {
      marginTop: 22,
    },

    sectionTitle: {
      marginBottom: 10,
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    group: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      overflow: "hidden",
    },

    row: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: BorderWidth.default,
      borderBottomColor: BORDER,
    },

    rowLast: {
      borderBottomWidth: 0,
    },

    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      paddingRight: 10,
    },

    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    rowText: {
      flex: 1,
    },

    rowTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.1,
    },

    rowTitleDestructive: {
      color: colors.muted,
    },

    rowSubtitle: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "600",
      color: colors.muted,
    },

    footer: {
      marginTop: 22,
      alignItems: "center",
    },

    footerText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.muted,
    },

    pressed: {
      opacity: 0.75,
    },

    bottomSpacer: {
      height: 24,
    },
  });
}
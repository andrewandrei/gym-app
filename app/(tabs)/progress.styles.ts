import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";
import { StyleSheet } from "react-native";

export function createProgressStyles(
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
  const BORDER = colors.borderSubtle ?? colors.border ?? "rgba(0,0,0,0.10)";

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

    successStrip: {
      marginTop: 12,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 14,
      backgroundColor: isDark ? "rgba(244,200,74,0.12)" : "rgba(244,200,74,0.14)",
      borderWidth: BorderWidth.default,
      borderColor: isDark ? "rgba(244,200,74,0.26)" : "rgba(244,200,74,0.42)",
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    successIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.premium,
      alignItems: "center",
      justifyContent: "center",
    },

    successTextWrap: {
      flex: 1,
    },

    successTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.1,
    },

    successSubtitle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
    },

    section: {
      marginTop: 22,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 28,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    sectionRight: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.muted,
    },

    link: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 6,
    },

    linkText: {
      fontSize: 15,
      color: colors.muted,
      fontWeight: "800",
    },

    barTrack: {
      height: 10,
      borderRadius: 999,
      backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
      overflow: "hidden",
    },

    barFill: {
      height: 10,
      borderRadius: 999,
      backgroundColor: colors.text,
    },

    weekHintRow: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    weekHint: {
      fontSize: 15,
      color: colors.muted,
      fontWeight: "700",
    },

    weekHintStrong: {
      fontSize: 15,
      color: colors.text,
      fontWeight: "900",
    },

    weekStrip: {
      marginTop: Spacing.md,
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    weekItem: {
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      paddingVertical: 8,
      borderRadius: 14,
    },

    weekItemSelected: {
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    weekDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
      marginBottom: 6,
    },

    weekDotCompleted: {
      backgroundColor: colors.text,
    },

    weekDotToday: {
      backgroundColor: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.18)",
    },

    weekDotSelected: {
      backgroundColor: colors.text,
    },

    weekLabel: {
      fontSize: 14,
      color: isDark ? "rgba(255,255,255,0.48)" : "rgba(0,0,0,0.40)",
      fontWeight: "800",
    },

    weekLabelToday: {
      color: colors.text,
    },

    weekLabelCompleted: {
      color: colors.text,
    },

    weekLabelSelected: {
      color: colors.text,
    },

    dayCard: {
      marginTop: Spacing.lg,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: Spacing.md,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    dayCardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    dayCardKicker: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.muted,
    },

    dayChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },

    dayChipCompleted: {
      backgroundColor: isDark ? "rgba(244,200,74,0.18)" : "rgba(244,200,74,0.16)",
    },

    dayChipRecovery: {
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    },

    dayChipPlanned: {
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    },

    dayChipText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
    },

    dayCardTitle: {
      marginTop: 14,
      fontSize: 26,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    dayCardMeta: {
      marginTop: 6,
      fontSize: 16,
      fontWeight: "700",
      color: colors.muted,
    },

    dayCardNote: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: "700",
      color: colors.muted,
    },

    dayCardCta: {
      marginTop: Spacing.md,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth: BorderWidth.default,
      borderTopColor: BORDER,
    },

    dayCardCtaText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: -0.1,
    },

    grid: {
      marginTop: 18,
      flexDirection: "row",
      gap: 12,
    },

    tile: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: Spacing.md,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    tileLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.muted,
    },

    tileValue: {
      marginTop: 10,
      fontSize: 34,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.4,
    },

    tileHint: {
      marginTop: 6,
      fontSize: 14,
      fontWeight: "700",
      color: colors.muted,
    },

    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    cardHighlight: {
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 20,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    smallLabelHighlight: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: "700",
    },

    bigValueHighlight: {
      marginTop: 6,
      fontSize: 34,
      fontWeight: "900",
      letterSpacing: -0.5,
      color: colors.text,
    },

    smallHintHighlight: {
      marginTop: 6,
      fontSize: 13,
      color: colors.muted,
      fontWeight: "600",
    },

    metricRow: {
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    metricLeft: {
      flex: 1,
      paddingRight: 12,
    },

    metricLabel: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
    },

    metricTrendRow: {
      marginTop: 10,
    },

    metricValue: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
    },

    divider: {
      height: BorderWidth.default,
      backgroundColor: BORDER,
    },

    metricFooter: {
      paddingTop: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    metricFooterText: {
      fontSize: 13,
      color: colors.muted,
      fontWeight: "600",
    },

    metricFooterStrong: {
      fontSize: 13,
      color: colors.text,
      fontWeight: "700",
    },

    trendPillBase: {
      alignSelf: "flex-start",
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      backgroundColor: colors.surface,
    },

    trendPillGood: {},
    trendPillUp: {},
    trendPillNeutral: {},

    trendTextBase: {
      fontSize: 14,
      fontWeight: "800",
    },

    trendTextGood: {
      color: colors.text,
    },

    trendTextUp: {
      color: colors.muted,
    },

    trendTextNeutral: {
      color: colors.muted,
    },

    recentRow: {
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },

    recentLeft: {
      flex: 1,
      paddingRight: 12,
    },

    recentRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    recentTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.text,
    },

    recentMeta: {
      marginTop: 4,
      fontSize: 13,
      color: colors.muted,
      fontWeight: "600",
    },

    recentDate: {
      fontSize: 13,
      fontWeight: "700",
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
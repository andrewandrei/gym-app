// app/(tabs)/progress.styles.ts
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
    premiumText: string;
    premiumSoft: string;
    premiumBorder: string;
    success: string;
    successText: string;
    successSoft: string;
    successBorder: string;
    danger: string;
    warning: string;
  },
  isDark: boolean,
) {
  const BORDER = colors.borderSubtle ?? colors.border ?? "rgba(0,0,0,0.10)";
  const SOFT = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const SOFT_2 = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const SOFT_3 = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const GOLD_SOFT = colors.premiumSoft;
  const GOLD_SOFT_STRONG = colors.premiumBorder;
  const GREEN_SOFT = colors.successSoft;
  const ORANGE_SOFT = isDark ? "rgba(245,158,11,0.20)" : "rgba(245,158,11,0.12)";
  const BLUE_SOFT = isDark ? "rgba(90,200,250,0.18)" : "rgba(90,200,250,0.12)";
  const RED_SOFT = isDark ? "rgba(255,69,58,0.18)" : "rgba(255,69,58,0.10)";

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

    pressed: {
      opacity: 0.78,
    },

    section: {
      marginTop: 22,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBottom: 12,
      gap: 12,
    },

    sectionTitle: {
      fontSize: 28,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.35,
    },

    sectionRight: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.muted,
    },

    emptyTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
      textAlign: "center",
      letterSpacing: -0.2,
    },

    emptyBody: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
      color: colors.muted,
      textAlign: "center",
      fontWeight: "600",
    },

    rangeTabs: {
      marginTop: 12,
      flexDirection: "row",
      gap: 8,
    },

    rangeTab: {
      minWidth: 62,
      height: 38,
      paddingHorizontal: 14,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    rangeTabActive: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },

    rangeTabText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: 0.1,
    },

    rangeTabTextActive: {
      color: colors.surface,
    },

    grid: {
      flexDirection: "row",
      gap: 12,
    },

    tile: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: Spacing.md,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    tileLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.muted,
      letterSpacing: 0.1,
    },

    tileValue: {
      marginTop: 10,
      fontSize: 30,
      lineHeight: 34,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.45,
    },

    tileHint: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
      lineHeight: 18,
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
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    bigValueHighlight: {
      marginTop: 8,
      fontSize: 26,
      lineHeight: 30,
      fontWeight: "900",
      letterSpacing: -0.4,
      color: colors.text,
    },

    smallHintHighlight: {
      marginTop: 8,
      fontSize: 13,
      lineHeight: 18,
      color: colors.muted,
      fontWeight: "700",
    },

    graphCard: {
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 18,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    graphHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 16,
    },

    graphTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    graphSubtitle: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },

    graphSummary: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
      textAlign: "right",
    },

    graphArea: {
      height: 180,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 8,
      paddingTop: 8,
    },

    graphColumn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      minWidth: 0,
    },

    graphTrack: {
      width: "100%",
      height: 140,
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: SOFT,
      borderRadius: 999,
      overflow: "hidden",
      paddingHorizontal: 3,
      paddingBottom: 3,
    },

    graphBar: {
      width: "100%",
      borderRadius: 999,
      minHeight: 6,
    },

    graphLabel: {
      marginTop: 10,
      fontSize: 11,
      fontWeight: "800",
      color: colors.muted,
      textAlign: "center",
      width: "100%",
    },

    graphEmpty: {
      minHeight: 120,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: SOFT,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    graphEmptyText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.muted,
    },

    weekStrip: {
      marginTop: Spacing.sm,
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
      backgroundColor: SOFT,
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
      backgroundColor: colors.success,
    },

    weekDotPartial: {
      backgroundColor: colors.premium,
    },

    weekDotMixed: {
      backgroundColor: isDark ? "#ffffff" : colors.text,
      borderWidth: 2,
      borderColor: colors.premium,
    },

    weekDotToday: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },

    weekDotSelected: {
      backgroundColor: colors.text,
    },

    weekLabel: {
      fontSize: 14,
      color: isDark ? "rgba(255,255,255,0.48)" : "rgba(0,0,0,0.40)",
      fontWeight: "800",
    },

    weekLabelSelected: {
      color: colors.text,
    },

    weekLabelToday: {
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
      gap: 12,
    },

    dayCardKicker: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: -0.1,
    },

    dayChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: BorderWidth.default,
    },

    dayChipCompleted: {
      backgroundColor: GREEN_SOFT,
      borderColor: colors.successBorder,
    },

    dayChipPartial: {
      backgroundColor: ORANGE_SOFT,
      borderColor: ORANGE_SOFT,
    },

    dayChipMixed: {
      backgroundColor: GOLD_SOFT,
      borderColor: GOLD_SOFT_STRONG,
    },

    dayChipPlanned: {
      backgroundColor: SOFT,
      borderColor: BORDER,
    },

    dayChipText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: 0.2,
    },

    dayCardTitle: {
      marginTop: 14,
      fontSize: 24,
      lineHeight: 28,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.25,
    },

    dayCardMeta: {
      marginTop: 6,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
      color: colors.muted,
    },

    dayCardNote: {
      marginTop: 10,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
      color: colors.muted,
    },

    metricRow: {
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },

    metricLeft: {
      flex: 1,
      paddingRight: 12,
    },

    metricLabel: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.1,
    },

    metricValue: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.15,
    },

    divider: {
      height: BorderWidth.default,
      backgroundColor: BORDER,
    },

    metricFooterText: {
      fontSize: 13,
      color: colors.muted,
      fontWeight: "700",
    },

    metricFooterStrong: {
      fontSize: 13,
      color: colors.text,
      fontWeight: "800",
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
      alignItems: "flex-end",
      justifyContent: "center",
      gap: 6,
    },

    recentTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.15,
    },

    recentMeta: {
      marginTop: 4,
      fontSize: 13,
      color: colors.muted,
      fontWeight: "700",
      lineHeight: 18,
    },

    recentDate: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
    },

    sessionStatusBadge: {
      minWidth: 72,
      height: 28,
      paddingHorizontal: 10,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: SOFT_2,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    sessionStatusBadgeText: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },

    exerciseCardTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },

    exerciseTrendPill: {
      minWidth: 78,
      height: 30,
      paddingHorizontal: 10,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: GOLD_SOFT,
      borderWidth: BorderWidth.default,
      borderColor: GOLD_SOFT_STRONG,
    },

    exerciseTrendText: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.premiumText,
      letterSpacing: 0.25,
      textTransform: "uppercase",
    },

    exerciseStatsRow: {
      marginTop: 14,
      flexDirection: "row",
      gap: 10,
    },

    exerciseStat: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: SOFT,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    exerciseStatLabel: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.muted,
      letterSpacing: 0.35,
      textTransform: "uppercase",
    },

    exerciseStatValue: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 19,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.15,
    },

    exerciseFooterRow: {
      paddingTop: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },

    successStrip: {
      marginTop: 12,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 14,
      backgroundColor: GOLD_SOFT,
      borderWidth: BorderWidth.default,
      borderColor: GOLD_SOFT_STRONG,
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

    trendPillGood: {
      backgroundColor: GREEN_SOFT,
      borderColor: colors.successBorder,
    },

    trendPillUp: {
      backgroundColor: ORANGE_SOFT,
      borderColor: ORANGE_SOFT,
    },

    trendPillNeutral: {
      backgroundColor: SOFT,
      borderColor: BORDER,
    },

    trendTextBase: {
      fontSize: 14,
      fontWeight: "800",
    },

    trendTextGood: {
      color: colors.successText,
    },

    trendTextUp: {
      color: colors.text,
    },

    trendTextNeutral: {
      color: colors.muted,
    },

    metricTrendRow: {
      marginTop: 10,
    },

    metricFooter: {
      paddingTop: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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

    bottomSpacer: {
      height: 24,
    },

    barTrack: {
      height: 10,
      borderRadius: 999,
      backgroundColor: SOFT_2,
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

    dayChipRecovery: {
      backgroundColor: BLUE_SOFT,
      borderColor: BLUE_SOFT,
    },

    smallLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    bigValue: {
      marginTop: 6,
      fontSize: 34,
      fontWeight: "900",
      color: colors.text,
    },

    smallHint: {
      marginTop: 6,
      fontSize: 13,
      color: colors.muted,
      fontWeight: "700",
    },

    trendDown: {
      color: colors.text,
    },

    trendUp: {
      color: colors.muted,
    },

    trendFlat: {
      color: colors.muted,
    },

    warningCard: {
      backgroundColor: RED_SOFT,
      borderWidth: BorderWidth.default,
      borderColor: RED_SOFT,
      borderRadius: 18,
      padding: 16,
    },
  });
}
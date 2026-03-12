import { BorderWidth } from "@/styles/hairline";
import { Radius } from "@/styles/radius";
import { Spacing } from "@/styles/spacing";
import { StyleSheet } from "react-native";

export function createProgramDetailStyles(
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
  const CARD_BG = colors.card;
  const SOFT_FILL = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const SOFT_FILL_2 = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      paddingBottom: 0,
    },

    hero: {
      height: 420,
      justifyContent: "space-between",
      backgroundColor: "#000000",
    },

    heroGradient: {
      ...StyleSheet.absoluteFillObject,
    },

    heroTopBar: {
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    heroIconBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.28)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.24)",
    },

    heroInfoBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.22)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.24)",
    },

    heroContent: {
      paddingHorizontal: 18,
      paddingBottom: 22,
    },

    heroTitle: {
      color: "#FFFFFF",
      fontSize: 34,
      lineHeight: 38,
      fontWeight: "900",
      letterSpacing: -0.5,
    },

    heroSubtitle: {
      marginTop: 8,
      color: "rgba(255,255,255,0.90)",
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
    },

    heroMeta: {
      marginTop: 8,
      color: "rgba(255,255,255,0.76)",
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
    },

    heroProgressTrack: {
      marginTop: 16,
      height: 10,
      backgroundColor: "rgba(255,255,255,0.18)",
      borderRadius: 999,
      overflow: "hidden",
    },

    heroProgressFill: {
      height: 10,
      backgroundColor: "#FFFFFF",
      borderRadius: 999,
    },

    heroStatsRow: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },

    heroStatText: {
      color: "rgba(255,255,255,0.92)",
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: -0.05,
    },

    heroStatDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: "rgba(255,255,255,0.42)",
    },

    content: {
      paddingTop: 18,
      paddingHorizontal: Spacing.md,
      paddingBottom: 24,
      backgroundColor: colors.background,
    },

    sectionHeader: {
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 22,
      lineHeight: 26,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    weeksScroll: {
      marginHorizontal: -Spacing.md,
    },

    weeksRail: {
      paddingHorizontal: WEEK_RAIL_SIDE_PADDING,
      paddingBottom: 2,
      gap: WEEK_PILL_GAP,
    },

    weekPill: {
      width: WEEK_PILL_WIDTH,
      height: 42,
      borderRadius: 999,
      backgroundColor: CARD_BG,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      alignItems: "center",
      justifyContent: "center",
    },

    weekPillActive: {
      backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
      borderColor: isDark ? "rgba(255,255,255,0.16)" : colors.border,
    },

    weekPillText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.muted,
      letterSpacing: -0.1,
    },

    weekPillTextActive: {
      color: colors.text,
    },

    activeWeekHeader: {
      marginTop: 20,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    activeWeekTitle: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.25,
    },

    activeWeekSub: {
      marginTop: 4,
      fontSize: 14,
      fontWeight: "700",
      color: colors.muted,
    },

    activeWeekMetaChip: {
      minWidth: 58,
      height: 32,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: SOFT_FILL,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      alignItems: "center",
      justifyContent: "center",
    },

    activeWeekMetaText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
    },

    workoutsInline: {
      borderRadius: 24,
      backgroundColor: CARD_BG,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      overflow: "hidden",
    },

    nextWorkoutWrap: {},

    workoutRow: {
      minHeight: 106,
      paddingVertical: 14,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: CARD_BG,
    },

    workoutRowNext: {
      backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
    },

    nextWorkoutAccent: {
      position: "absolute",
      left: 0,
      top: 14,
      bottom: 14,
      width: 4,
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
      backgroundColor: colors.premium,
    },

    workoutThumb: {
      width: 74,
      height: 74,
      borderRadius: 18,
      backgroundColor: SOFT_FILL,
    },

    workoutContent: {
      flex: 1,
      paddingLeft: 14,
      paddingRight: 10,
    },

    workoutLabel: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },

    workoutTitle: {
      marginTop: 4,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    workoutTitleLocked: {
      color: colors.muted,
    },

    workoutMeta: {
      marginTop: 5,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },

    workoutMetaLocked: {
      color: colors.muted,
      opacity: 0.9,
    },

    workoutRight: {
      alignItems: "flex-end",
      justifyContent: "space-between",
      minHeight: 74,
    },

    statusDone: {
      minWidth: 68,
      height: 30,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: "rgba(244,200,74,0.95)",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
    },

    statusDoneText: {
      fontSize: 12,
      fontWeight: "900",
      color: "#111111",
    },

    statusNext: {
      minWidth: 58,
      height: 30,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    statusNextText: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.surface,
    },

    statusAvailable: {
      minWidth: 82,
      height: 30,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: SOFT_FILL,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      alignItems: "center",
      justifyContent: "center",
    },

    statusAvailableText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.text,
    },

    statusLocked: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: SOFT_FILL,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      alignItems: "center",
      justifyContent: "center",
    },

    inlineDivider: {
      height: BorderWidth.default,
      backgroundColor: BORDER,
      marginLeft: 102,
      marginRight: 14,
    },

    bottomSpacer: {
      height: 18,
    },

    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },

    modalDim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? "rgba(0,0,0,0.58)" : "rgba(0,0,0,0.38)",
    },

    modalBlurWrap: {
      ...StyleSheet.absoluteFillObject,
    },

    modalBlur: {
      flex: 1,
    },

    modalBackdropTouch: {
      ...StyleSheet.absoluteFillObject,
    },

    infoModalOuter: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: Radius.xl ?? 24,
      borderTopRightRadius: Radius.xl ?? 24,
      borderTopWidth: BorderWidth.default,
      borderTopColor: BORDER,
      paddingHorizontal: 16,
      paddingTop: 10,
    },

    infoGrabber: {
      alignSelf: "center",
      width: 42,
      height: 5,
      borderRadius: 999,
      backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
      marginBottom: 14,
    },

    infoModalTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },

    infoModalTitleWrap: {
      flex: 1,
      paddingRight: 12,
    },

    infoModalEyebrow: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },

    infoModalTitle: {
      marginTop: 6,
      fontSize: 24,
      lineHeight: 28,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.25,
    },

    infoCloseBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: SOFT_FILL,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      alignItems: "center",
      justifyContent: "center",
    },

    infoModalBody: {
      marginTop: 14,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: colors.muted,
    },

    infoBulletsCard: {
      marginTop: 16,
      backgroundColor: CARD_BG,
      borderRadius: 18,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      padding: 14,
    },

    infoBulletRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    infoBulletRowSpaced: {
      marginBottom: 12,
    },

    infoBulletDotWrap: {
      width: 22,
      alignItems: "center",
    },

    infoBulletDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.premium,
    },

    infoBulletTextWrap: {
      flex: 1,
      paddingLeft: 4,
    },

    infoBulletText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -0.1,
    },

    infoMetaRow: {
      marginTop: 14,
      paddingHorizontal: 2,
    },

    infoMetaText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },

    infoModalButton: {
      marginTop: 18,
      height: 50,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    infoModalButtonText: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.surface,
      letterSpacing: -0.15,
    },
  });
}

const WEEK_RAIL_SIDE_PADDING = 16;
const WEEK_PILL_GAP = 10;
const WEEK_PILL_WIDTH = 104;
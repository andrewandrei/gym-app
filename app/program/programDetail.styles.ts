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
  const SOFT_FILL = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    heroBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      overflow: "hidden",
      backgroundColor: colors.background,
    },

    heroBackdropImage: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
    },

    heroBackdropGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    heroSpace: {
      position: "relative",
    },
    heroIconSpacer: {
  width: 42,
  height: 42,
},

    scroll: {
      flex: 1,
      backgroundColor: "transparent",
    },

    scrollContent: {
      flexGrow: 1,
    },

    overlayActions: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      paddingHorizontal: Spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 50,
    },

    heroIconBtn: {
      width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.20)",
    },

    heroInfoBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.22)",
    },

    heroOverlayContent: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 22,
      zIndex: 9,
      paddingHorizontal: Spacing.md,
    },

    heroTitle: {
      color: "#FFFFFF",
      fontSize: 32,
      lineHeight: 36,
      fontWeight: "900",
      letterSpacing: -0.5,
    },

    heroSubtitle: {
      marginTop: 10,
      color: "rgba(255,255,255,0.92)",
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "700",
      letterSpacing: -0.08,
    },

    heroMeta: {
      marginTop: 10,
      color: "rgba(255,255,255,0.76)",
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
      letterSpacing: -0.05,
    },

    heroProgressTrack: {
      marginTop: 16,
      height: 8,
      backgroundColor: "rgba(255,255,255,0.20)",
      borderRadius: 999,
      overflow: "hidden",
    },

    heroProgressFill: {
      height: 8,
      backgroundColor: "#FFFFFF",
      borderRadius: 999,
    },

    heroStatsRow: {
      marginTop: 10,
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

    floatingHeader: {
      position: "absolute",
      top: 0,
      left: Spacing.md,
      right: Spacing.md,
      zIndex: 12,
    },

    floatingHeaderBlur: {
      borderRadius: 18,
      overflow: "hidden",
      borderWidth: BorderWidth.default,
      borderColor: isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(255,255,255,0.34)",
      backgroundColor: isDark
        ? "rgba(16,16,16,0.72)"
        : "rgba(255,255,255,0.72)",
    },

    floatingHeaderContent: {
      paddingHorizontal: 14,
      paddingVertical: 10,
    },

    floatingHeaderTitle: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    floatingHeaderMetaRow: {
      marginTop: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    floatingHeaderMetaText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
      letterSpacing: -0.04,
    },

    floatingHeaderDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.muted,
      opacity: 0.45,
    },

    content: {
      backgroundColor: colors.background,
      paddingTop: 24,
      paddingHorizontal: Spacing.md,
      
      marginTop: -10,
    },


    weeksScroll: {
      marginHorizontal: -Spacing.md,
    },

    weeksRail: {
      paddingHorizontal: Spacing.md,
      paddingBottom: 6,
      gap: 10,
      flexDirection: "row",
      alignItems: "center",
    },

    weekPill: {
      minWidth: 98,
      height: 42,
      paddingHorizontal: 16,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      alignItems: "center",
      justifyContent: "center",
    },

    weekPillActive: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },

    weekPillText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.muted,
      letterSpacing: -0.12,
    },

    weekPillTextActive: {
      color: colors.surface,
    },

    activeWeekHeader: {
      marginTop: 22,
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
      backgroundColor: "transparent",
    },

    nextWorkoutWrap: {
      marginBottom: 18,
    },

    workoutRow: {
      minHeight: 106,
      paddingVertical: 14,
      paddingHorizontal: 0,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
    },

     workoutRowNext: {
      minHeight: 118,
      paddingVertical: 16,
      paddingHorizontal: 14,
      borderRadius: 24,
      backgroundColor: isDark ? "rgba(244,200,74,0.14)" : "rgba(244,200,74,0.10)",
      borderWidth: BorderWidth.default,
      borderColor: isDark ? "rgba(244,200,74,0.42)" : "rgba(244,200,74,0.55)",
    },

     nextWorkoutAccent: {
        position: "absolute",
        left: 0,
        top: 16,
        bottom: 16,
        width: 4,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        backgroundColor: colors.premium,
      },

    workoutThumb: {
      width: 82,
      height: 82,
      borderRadius: 20,
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
      letterSpacing: 0.45,
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
      marginTop: 6,
      fontSize: 13,
      lineHeight: 16,
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
      minHeight: 82,
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

    statusLocked: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: SOFT_FILL,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      alignItems: "center",
      justifyContent: "center",
    },

    statusLockedGhost: {
      width: 58,
      height: 30,
      opacity: 0,
    },

    inlineDivider: {
      height: BorderWidth.default,
      backgroundColor: BORDER,
      marginLeft: 96,
      marginRight: 0,
    },

    coachRow: {
      marginTop: 22,
      flexDirection: "row",
      alignItems: "center",
    },

    coachAvatarWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      overflow: "hidden",
      backgroundColor: colors.card,
    },

    coachAvatar: {
      width: "100%",
      height: "100%",
    },

    coachTextWrap: {
      flex: 1,
      paddingLeft: 16,
    },

    coachEyebrow: {
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "500",
      color: colors.muted,
      letterSpacing: -0.08,
    },

    coachName: {
      marginTop: 4,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.2,
    },
descriptionBlock: {
  marginTop: 28,
},

descriptionEyebrow: {
  fontSize: 12,
  fontWeight: "900",
  color: colors.muted,
  letterSpacing: 0.5,
  textTransform: "uppercase",
},

descriptionTitle: {
  marginTop: 6,
  fontSize: 24,
  lineHeight: 28,
  fontWeight: "900",
  color: colors.text,
  letterSpacing: -0.25,
},

descriptionText: {
  marginTop: 14,
  fontSize: 15,
  lineHeight: 22,
  fontWeight: "600",
  color: colors.muted,
},

bulletsBlock: {
  marginTop: 16,
  marginBottom: 56,
  backgroundColor: colors.card,
  borderRadius: 18,
  borderWidth: BorderWidth.default,
  borderColor: BORDER,
  padding: 14,
},

bulletRow: {
  flexDirection: "row",
  alignItems: "center",
},

bulletRowGap: {
  marginBottom: 12,
},

bulletDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: colors.premium,
},

bulletText: {
  flex: 1,
  paddingLeft: 12,
  fontSize: 14,
  fontWeight: "700",
  color: colors.text,
  letterSpacing: -0.1,
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
      backgroundColor: colors.card,
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
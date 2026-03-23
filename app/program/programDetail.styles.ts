// app/program/programDetail.styles.ts
import { BorderWidth } from "@/styles/hairline";
import { Radius } from "@/styles/radius";
import { Spacing } from "@/styles/spacing";
import { FontSize, FontWeight, Typography } from "@/styles/typography";
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
  const BORDER    = colors.borderSubtle ?? colors.border;
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

    // ↓ was 32px — reduced to 24px
    heroTitle: {
      color: "#FFFFFF",
      fontSize: FontSize.title1,
      lineHeight: 28,
      fontWeight: FontWeight.black,
      letterSpacing: -0.35,
    },

    // ↓ was implicit large — now consistent subhead
    heroSubtitle: {
      marginTop: 8,
      color: "rgba(255,255,255,0.88)",
      ...Typography.bodySmall,
      fontWeight: FontWeight.bold,
    },

    heroMeta: {
      marginTop: 8,
      color: "rgba(255,255,255,0.70)",
      ...Typography.caption,
      fontWeight: FontWeight.heavy,
      letterSpacing: 0.1,
    },

    heroProgressTrack: {
      marginTop: 14,
      height: 6,
      backgroundColor: "rgba(255,255,255,0.20)",
      borderRadius: 999,
      overflow: "hidden",
    },

    heroProgressFill: {
      height: 6,
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
      color: "rgba(255,255,255,0.88)",
      ...Typography.caption,
      fontWeight: FontWeight.heavy,
    },

    heroStatDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: "rgba(255,255,255,0.40)",
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

    // ↓ was 16px — now 15px headline
    floatingHeaderTitle: {
      ...Typography.headline,
      color: colors.text,
    },

    floatingHeaderMetaRow: {
      marginTop: 3,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    floatingHeaderMetaText: {
      ...Typography.caption,
      fontWeight: FontWeight.bold,
      color: colors.muted,
    },

    floatingHeaderDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.muted,
      opacity: 0.45,
    },

    content: {
      backgroundColor: colors.background,
      paddingTop: 22,
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
      minWidth: 90,
      height: 38,
      paddingHorizontal: 14,
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

    // ↓ was 14px — now 13px subhead
    weekPillText: {
      ...Typography.subhead,
      color: colors.muted,
    },

    weekPillTextActive: {
      color: colors.surface,
      fontWeight: FontWeight.heavy,
    },

    activeWeekHeader: {
      marginTop: 20,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    // ↓ was 24px — now 20px title2ish
    activeWeekTitle: {
      fontSize: 20,
      fontWeight: FontWeight.black,
      color: colors.text,
      letterSpacing: -0.25,
      lineHeight: 24,
    },

    activeWeekSub: {
      marginTop: 3,
      ...Typography.subhead,
      color: colors.muted,
    },

    activeWeekMetaChip: {
      minWidth: 52,
      height: 30,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: SOFT_FILL,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      alignItems: "center",
      justifyContent: "center",
    },

    activeWeekMetaText: {
      ...Typography.meta,
      color: colors.text,
      fontWeight: FontWeight.heavy,
    },

    workoutsInline: {
      backgroundColor: "transparent",
    },

    nextWorkoutWrap: {
      marginBottom: 16,
    },

    workoutRow: {
      minHeight: 96,
      paddingVertical: 12,
      paddingHorizontal: 0,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
    },

    workoutRowNext: {
      minHeight: 108,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 22,
      backgroundColor: isDark ? "rgba(244,200,74,0.14)" : "rgba(244,200,74,0.10)",
      borderWidth: BorderWidth.default,
      borderColor: isDark ? "rgba(244,200,74,0.42)" : "rgba(244,200,74,0.55)",
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
      width: 76,
      height: 76,
      borderRadius: 18,
      backgroundColor: SOFT_FILL,
    },

    workoutContent: {
      flex: 1,
      paddingLeft: 12,
      paddingRight: 8,
    },

    // ↓ was 12px/900/0.45 — now micro
    workoutLabel: {
      ...Typography.micro,
      color: colors.muted,
      textTransform: "uppercase",
    },

    // ↓ was 18px — now title3 16px
    workoutTitle: {
      marginTop: 3,
      ...Typography.title3,
      color: colors.text,
    },

    workoutTitleLocked: {
      color: colors.muted,
    },

    // ↓ was 13px — now subhead 13px (same, just tokenised)
    workoutMeta: {
      marginTop: 5,
      ...Typography.subhead,
      color: colors.muted,
    },

    workoutMetaLocked: {
      color: colors.muted,
      opacity: 0.85,
    },

    workoutRight: {
      alignItems: "flex-end",
      justifyContent: "space-between",
      minHeight: 76,
    },

    statusNext: {
      minWidth: 52,
      height: 28,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    statusNextText: {
      ...Typography.meta,
      fontWeight: FontWeight.black,
      color: colors.surface,
    },

    statusDone: {
      minWidth: 62,
      height: 28,
      paddingHorizontal: 8,
      borderRadius: 999,
      backgroundColor: "rgba(244,200,74,0.95)",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
    },

    statusDoneText: {
      ...Typography.meta,
      fontWeight: FontWeight.black,
      color: "#111111",
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

    statusLockedGhost: {
      width: 52,
      height: 28,
      opacity: 0,
    },

    inlineDivider: {
      height: BorderWidth.default,
      backgroundColor: BORDER,
      marginLeft: 88,
      marginRight: 0,
    },

    coachRow: {
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
    },

    coachAvatarWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      overflow: "hidden",
      backgroundColor: colors.card,
    },

    coachAvatar: {
      width: "100%",
      height: "100%",
    },

    coachTextWrap: {
      flex: 1,
      paddingLeft: 14,
    },

    coachEyebrow: {
      ...Typography.caption,
      color: colors.muted,
    },

    coachName: {
      marginTop: 3,
      ...Typography.title2,
      color: colors.text,
    },

    descriptionBlock: {
      marginTop: 26,
    },

    descriptionEyebrow: {
      ...Typography.micro,
      color: colors.muted,
      textTransform: "uppercase",
    },

    // ↓ was 24px — now title2 18px
    descriptionTitle: {
      marginTop: 5,
      ...Typography.title2,
      color: colors.text,
    },

    descriptionText: {
      marginTop: 12,
      ...Typography.body,
      color: colors.muted,
    },

    bulletsBlock: {
      marginTop: 14,
      marginBottom: 48,
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
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.premium,
    },

    bulletText: {
      flex: 1,
      paddingLeft: 12,
      ...Typography.bodySmall,
      fontWeight: FontWeight.bold,
      color: colors.text,
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
      width: 40,
      height: 4,
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
      ...Typography.micro,
      color: colors.muted,
      textTransform: "uppercase",
      marginBottom: 4,
    },

    // ↓ was 24px — now title2 18px
    infoModalTitle: {
      ...Typography.title2,
      color: colors.text,
    },

    infoCloseBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: SOFT_FILL,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      alignItems: "center",
      justifyContent: "center",
    },

    infoModalBody: {
      marginTop: 12,
      ...Typography.body,
      color: colors.muted,
    },

    infoBulletsCard: {
      marginTop: 14,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      padding: 14,
    },

    infoBulletRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    infoBulletRowSpaced: {
      marginBottom: 11,
    },

    infoBulletDotWrap: {
      width: 20,
      alignItems: "center",
    },

    infoBulletDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.premium,
    },

    infoBulletTextWrap: {
      flex: 1,
      paddingLeft: 4,
    },

    infoBulletText: {
      ...Typography.bodySmall,
      fontWeight: FontWeight.bold,
      color: colors.text,
    },

    infoMetaRow: {
      marginTop: 12,
      paddingHorizontal: 2,
    },

    infoMetaText: {
      ...Typography.subhead,
      color: colors.muted,
    },

    infoModalButton: {
      marginTop: 16,
      height: 48,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    infoModalButtonText: {
      ...Typography.button,
      color: colors.surface,
    },
  });
}
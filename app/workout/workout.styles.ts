//workout/workout.styles.ts
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";
import { StyleSheet } from "react-native";

export function createWorkoutStyles(
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
  const SOFT = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const SOFT_2 = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const SOFT_3 = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const CTA_BG = isDark ? "rgba(21,21,23,0.92)" : "rgba(255,255,255,0.92)";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    page: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scroll: {
      flex: 1,
      backgroundColor: "transparent",
    },

    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },

    /* ───────────────────────── Workout preview hero ───────────────────────── */

    previewPage: {
      flex: 1,
      backgroundColor: colors.background,
    },

    previewHeroBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      overflow: "hidden",
      backgroundColor: colors.background,
    },

    previewHeroBackdropImage: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
    },

    previewHeroBackdropGradient: {
      ...StyleSheet.absoluteFillObject,
    },

    previewContent: {
      flexGrow: 1,
    },

    previewHeroSpace: {
      position: "relative",
    },

    previewOverlayActions: {
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

    previewHeroBackBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.20)",
    },

    previewHeroSpacer: {
      width: 42,
      height: 42,
    },

    previewHeroContent: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 14,
      zIndex: 9,
      paddingHorizontal: Spacing.md,
    },

    previewHeroTitle: {
      color: "#FFFFFF",
      fontSize: 22,
      lineHeight: 34,
      fontWeight: "900",
      letterSpacing: -0.4,
    },

    previewHeroSubtitle: {
      marginTop: 6,
      color: "rgba(255,255,255,0.92)",
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
      letterSpacing: -0.08,
    },

    previewHeroMeta: {
      marginTop: 6,
      color: "rgba(255,255,255,0.75)",
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "800",
      letterSpacing: 0.2,
    },

    previewBody: {
      backgroundColor: colors.background,
      paddingTop: 22,
      paddingHorizontal: Spacing.md,
      marginTop: 0,
    },

    previewList: {
      marginTop: 2,
    },

    previewGroupWrap: {
      position: "relative",
      paddingLeft: 14,
    },

    previewGroupRail: {
      position: "absolute",
      top: 2,
      bottom: 2,
      left: 0,
      width: 4,
      borderRadius: 999,
      backgroundColor: SOFT_3,
      opacity: 0.9,
    },

    previewBlockHeader: {
      marginBottom: 14,
    },

    previewBlockKicker: {
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 0.7,
      textTransform: "uppercase",
      color: colors.muted,
    },

    previewBlockTitle: {
      marginTop: 4,
      fontSize: 18,
      lineHeight: 26,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    previewBlockMeta: {
      marginTop: 4,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
      color: colors.muted,
    },

    previewRows: {
      backgroundColor: "transparent",
    },

    previewRow: {
      minHeight: 96,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      paddingRight: 2,
      backgroundColor: "transparent",
    },

    previewRowPressed: {
      opacity: 0.92,
    },

    previewRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    previewCardRight: {
      flex: 1,
      minWidth: 0,
    },

    previewBlockTag: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: SOFT,
      alignItems: "center",
      justifyContent: "center",
    },

    previewBlockTagText: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.1,
    },

    previewNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: SOFT,
      alignItems: "center",
      justifyContent: "center",
    },

    previewNumberText: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.1,
    },

    previewImage: {
      width: 68,
      height: 68,
      borderRadius: 18,
      backgroundColor: SOFT_2,
    },

    previewExName: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.15,
    },

    previewExMeta: {
      marginTop: 5,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "700",
      color: colors.muted,
    },

    previewInlineDivider: {
      height: BorderWidth.default,
      backgroundColor: BORDER,
      marginLeft: 106,
    },

    previewBlockSpacer: {
      height: 24,
    },

    previewBottomWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
    },

    previewBottomFade: {
      height: 34,
    },

    previewBottom: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 18,
      backgroundColor: colors.background,
    },

    previewBottomCard: {
      borderRadius: 0,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: "transparent",
    },

    previewBottomHelper: {
      display: "none",
    },

    startBtn: {
      height: 56,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    startBtnText: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.surface,
      letterSpacing: -0.15,
    },

    /* ───────────────────────── Workout player ───────────────────────── */

    exerciseList: {
      paddingTop: 8,
    },

    groupWrap: {
      position: "relative",
      paddingLeft: 14,
      marginBottom: 8,
    },

    groupRail: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: 4,
      borderRadius: 999,
      backgroundColor: SOFT_3,
    },

    blockHeader: {
      marginBottom: 12,
    },

    blockKicker: {
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 0.7,
      textTransform: "uppercase",
      color: colors.muted,
    },

    blockTitleRow: {
      marginTop: 4,
      gap: 4,
    },

    blockTitle: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    blockMeta: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.muted,
    },

    card: {
      borderRadius: 24,
      backgroundColor: colors.card,
      borderWidth: 0,
      borderColor: "transparent",
      overflow: "hidden",
      paddingTop: 14,
      paddingBottom: 12,
    },

    exerciseHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: 14,
      gap: 12,
    },

    thumb: {
      width: 72,
      height: 72,
      borderRadius: 18,
      backgroundColor: SOFT_2,
    },

    exerciseText: {
      flex: 1,
      minWidth: 0,
      paddingTop: 2,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },

    exerciseTitle: {
      flex: 1,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    exerciseSub: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },

    menuBtn: {
      width: 36,
      height: 36,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: SOFT,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    cols: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 12,
  paddingBottom: 8,
  borderBottomWidth: BorderWidth.default,
  borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(17,17,17,0.05)",
  marginTop: 12,
},

colLabel: {
  fontSize: 10,
  fontWeight: "800",
  color: colors.muted,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  opacity: 0.88,
},

    colSetWrap: {
      width: 44,
      alignItems: "center",
      justifyContent: "center",
    },

    colValueWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    colDoneWrap: {
      width: 50,
      alignItems: "center",
      justifyContent: "center",
    },

   

    row: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      minHeight: 76,
    },

    rowBottomBorder: {
      borderBottomWidth: BorderWidth.default,
      borderBottomColor: BORDER,
    },

    rowActiveBar: {
      position: "absolute",
      left: 0,
      top: 10,
      bottom: 10,
      width: 3,
      borderTopRightRadius: 3,
      borderBottomRightRadius: 3,
      backgroundColor: colors.premium,
    },

    setIndex: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.1,
    },

    cell: {
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(17,17,17,0.06)",
    },

    input: {
      width: "100%",
      textAlign: "center",
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
      paddingVertical: 0,
      letterSpacing: -0.15,
    },

    checkBtn: {
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 6,
    },

    cardActions: {
      marginTop: 14,
      paddingHorizontal: 14,
      flexDirection: "row",
      gap: 10,
    },

    ghostBtn: {
      flex: 1,
      height: 48,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      paddingHorizontal: 18,
    },

    ghostText: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.15,
    },

    addSetButton: {
      margin: 14,
      height: 46,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    addSetButtonText: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.1,
    },

    exerciseSeparator: {
      height: 14,
    },

    exerciseGap: {
      height: 14,
    },

    finishSectionWrap: {
      marginTop: 8,
      paddingBottom: 8,
    },

    finishSection: {
      backgroundColor: "transparent",
    },

    finishBtn: {
      height: 60,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },

    finishBtnText: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.surface,
      letterSpacing: -0.2,
    },

    swipeBg: {
      flex: 1,
      alignItems: "flex-end",
      justifyContent: "center",
    },

    deletePill: {
      width: 88,
      height: 42,
      borderRadius: 999,
      backgroundColor: "#D92D20",
      alignItems: "center",
      justifyContent: "center",
    },

    deleteText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "900",
      letterSpacing: -0.1,
    },

    /* ───────────────────────── Accessory ───────────────────────── */

    accessory: {
      backgroundColor: colors.surface,
      borderTopWidth: BorderWidth.default,
      borderTopColor: BORDER,
      paddingHorizontal: 16,
      paddingVertical: 8,
      alignItems: "flex-end",
    },

    accessoryBtn: {
      minWidth: 72,
      height: 36,
      borderRadius: 999,
      paddingHorizontal: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: SOFT,
    },

    accessoryText: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.1,
    },

    /* ───────────────────────── Modals ───────────────────────── */

    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? "rgba(0,0,0,0.58)" : "rgba(0,0,0,0.42)",
    },

    modalSheet: {
      marginTop: "auto",
      backgroundColor: colors.surface,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderTopWidth: BorderWidth.default,
      borderTopColor: BORDER,
      padding: 16,
    },

    modalSheetLarge: {
      marginTop: "auto",
      backgroundColor: colors.surface,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderTopWidth: BorderWidth.default,
      borderTopColor: BORDER,
      padding: 16,
      maxHeight: "82%",
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },

    modalTitle: {
      flex: 1,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    modalBody: {
      marginTop: 10,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: colors.muted,
    },

    modalX: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: SOFT,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    modalActions: {
      marginTop: 18,
      flexDirection: "row",
      gap: 10,
    },

    modalGhost: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: SOFT,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    modalGhostText: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
    },

    modalPrimary: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.text,
    },

    modalPrimaryText: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.surface,
      letterSpacing: -0.1,
    },

    modalDanger: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#D92D20",
    },

    modalDangerText: {
      fontSize: 15,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.1,
    },

    /* ───────────────────────── Menu / swap ───────────────────────── */

    menuList: {
      marginTop: 14,
      gap: 10,
    },

    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    menuItemText: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
    },

    swapList: {
      gap: 10,
      paddingTop: 14,
      paddingBottom: 8,
    },

    swapItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      padding: 12,
    },

    swapThumb: {
      width: 64,
      height: 64,
      borderRadius: 14,
      backgroundColor: SOFT_2,
    },

    swapTextContainer: {
      flex: 1,
    },

    swapName: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.1,
    },

    swapCategory: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },

    /* ───────────────────────── PR / history ───────────────────────── */

    prBanner: {
      marginTop: 14,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    prText: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.text,
      flexShrink: 1,
    },

    prDate: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
    },

    historyCard: {
      marginTop: 14,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      padding: 14,
    },

    historyCardSpaced: {
      marginTop: 12,
    },

    historyCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },

    historyDate: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.1,
    },

    historyTableHead: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 8,
      borderBottomWidth: BorderWidth.default,
      borderBottomColor: BORDER,
      marginBottom: 6,
    },

    historyHead: {
      flex: 1,
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.4,
    },

    historyRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
    },

    historyCellText: {
      flex: 1,
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
    },

    historyDot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      backgroundColor: SOFT,
      alignItems: "center",
      justifyContent: "center",
    },

    historyDotOn: {
      backgroundColor: "rgb(34,197,94)",
      borderColor: "rgb(34,197,94)",
    },

    groupRailSuperset: {
      backgroundColor: colors.premium,
    },

    groupRailGiant: {
      backgroundColor: colors.text,
    },

    groupRailCircuit: {
      backgroundColor: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.55)",
    },
  });
}
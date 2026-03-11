// app/program/programDetail.styles.ts

import { Colors } from "@/styles/colors";
import { BorderWidth } from "@/styles/hairline"; // ← ADD THIS
import { Spacing } from "@/styles/spacing";
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  scroll: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  scrollContent: {
    paddingBottom: 36,
    backgroundColor: Colors.surface,
  },

  hero: {
    height: 420,
    justifyContent: "space-between",
    backgroundColor: "#111111",
  },

  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  heroTopBar: {
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heroIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroInfoBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 22,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  heroSubtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.90)",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    letterSpacing: -0.15,
  },

  heroMeta: {
    marginTop: 8,
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.1,
  },

  heroProgressTrack: {
    marginTop: 18,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.20)",
    overflow: "hidden",
  },

  heroProgressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },

  heroStatsRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },

  heroStatText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.1,
  },

  heroStatDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.44)",
  },

  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: 16,
  },

  sectionHeader: {
    marginTop: 6,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
  },

  weeksScroll: {
    marginHorizontal: -Spacing.md,
  },

  weeksRail: {
    paddingHorizontal: Spacing.md,
    gap: 10,
  },

  weekPill: {
    width: 104,
    height: 40,
    borderRadius: 999,
    backgroundColor: Colors.card,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  weekPillActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },

  weekPillText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.1,
  },

  weekPillTextActive: {
    color: "#FFFFFF",
  },

  activeWeekHeader: {
    marginTop: 20,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  activeWeekTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.3,
  },

  activeWeekSub: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.muted,
  },

  activeWeekMetaChip: {
    minWidth: 52,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#F7F7F4",
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  activeWeekMetaText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },

  workoutsInline: {
    marginTop: 4,
  },

  nextWorkoutWrap: {
    marginHorizontal: -4,
    marginVertical: 4,
  },

  workoutRow: {
    minHeight: 104,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },

  workoutRowNext: {
    position: "relative",
    backgroundColor: "#F7F1E2",
    borderRadius: 18,
    borderWidth: BorderWidth.default,
    borderColor: "rgba(244,200,74,0.42)",
    paddingHorizontal: 12,
    paddingLeft: 16,
    shadowColor: "#C9A63A",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  nextWorkoutAccent: {
    position: "absolute",
    left: 0,
    top: 10,
    bottom: 10,
    width: 4,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: "#F4C84A",
  },

  workoutThumb: {
    width: 74,
    height: 74,
    borderRadius: 18,
    backgroundColor: "#EFEFEF",
  },

  workoutContent: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },

  workoutLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.muted,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  workoutTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
    paddingRight: 4,
  },

  workoutTitleLocked: {
    color: "rgba(17,17,17,0.48)",
  },

  workoutMeta: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.muted,
    letterSpacing: -0.05,
  },

  workoutMetaLocked: {
    color: "rgba(17,17,17,0.34)",
  },

  workoutRight: {
    width: 74,
    marginLeft: 8,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
  },

  statusDone: {
    minWidth: 66,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#F4C84A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  statusDoneText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111111",
  },

  statusNext: {
    minWidth: 58,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  statusNextText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  statusAvailable: {
    minWidth: 78,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  statusAvailableText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4B5563",
  },

  statusLocked: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(17,17,17,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },

  inlineDivider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginLeft: 86,
  },

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,10,0.18)",
  },

  modalBlurWrap: {
    ...StyleSheet.absoluteFillObject,
  },

  modalBlur: {
    flex: 1,
  },

  modalBackdropTouch: {
    flex: 1,
  },

  infoModalOuter: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 8,
  },

  infoGrabber: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(17,17,17,0.12)",
    marginBottom: 16,
  },

  infoModalTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },

  infoModalTitleWrap: {
    flex: 1,
    paddingTop: 4,
  },

  infoModalEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  infoModalTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.4,
  },

  infoCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.045)",
    alignItems: "center",
    justifyContent: "center",
  },

  infoModalBody: {
    marginTop: 18,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.1,
  },

  infoBulletsCard: {
    marginTop: 22,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },

  infoBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoBulletRowSpaced: {
    marginBottom: 16,
  },

  infoBulletDotWrap: {
    width: 24,
    alignItems: "center",
    paddingTop: 7,
  },

  infoBulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F4C84A",
  },

  infoBulletTextWrap: {
    flex: 1,
    paddingRight: 4,
  },

  infoBulletText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.08,
  },

  infoMetaRow: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#F7F7F4",
    borderWidth: 0.5,
    borderColor: Colors.border,
  },

  infoMetaText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.muted,
  },

  infoModalButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 999,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },

  infoModalButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.15,
  },

  bottomSpacer: {
    height: 28,
  },
});
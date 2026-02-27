// app/workout/workout.styles.ts

import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import { Platform, StyleSheet } from "react-native";

export const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  page: { flex: 1, backgroundColor: Colors.surface },

  scroll: { flex: 1, backgroundColor: Colors.surface },
  scrollWeb: {
    // @ts-ignore
    scrollbarWidth: "none",
    // @ts-ignore
    msOverflowStyle: "none",
  },

  scrollContent: {
    paddingTop: 4,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  /* ───────────────────────── PREVIEW ───────────────────────── */
  previewPage: { flex: 1, backgroundColor: Colors.surface },

  previewContent: {
    paddingTop: 4,
    paddingBottom: 18,
    paddingHorizontal: Spacing.md,
  },

  previewList: {
    marginHorizontal: -Spacing.md,
    marginTop: 8,
  },

  previewGroupWrap: { position: "relative" },

  previewGroupRail: {
    position: "absolute",
    left: Spacing.md,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.08)",
    zIndex: 2,
  },

  previewBlockHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
    paddingBottom: 8,
    paddingLeft: Spacing.md + 10,
  },

  previewBlockKicker: {
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(0,0,0,0.38)",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  previewBlockTitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },

  previewBlockMeta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.muted,
  },

  previewBlockSpacer: { height: 10, backgroundColor: "transparent" },

  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    paddingLeft: Spacing.md + 10,
  },

  previewSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md + 10,
  },

  previewCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },

  previewNumber: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  previewNumberText: {
    fontSize: 15,
    fontWeight: "900",
    color: "rgba(0,0,0,0.35)",
    letterSpacing: -0.2,
  },

  previewBlockTag: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  previewBlockTagText: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: 0.4,
  },

  previewImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.04)",
  },

  previewCardRight: { flex: 1 },

  previewExName: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },

  previewExMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: "rgba(0,0,0,0.45)",
  },

  previewBottom: {
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
  },

  startBtn: {
    height: 56,
    borderRadius: 999,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },

  startBtnText: {
    color: Colors.surface,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: -0.2,
  },

  /* ───────────────────────── WORKOUT ───────────────────────── */

  header: {
    marginTop: 10,
    marginBottom: 14,
  },

  setsLine: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "900",
    color: "rgba(0,0,0,0.70)",
    letterSpacing: -0.2,
  },

  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: (Colors as any).premium ?? "#F4C84A",
  },

  exerciseList: {
    marginHorizontal: -Spacing.md,
    marginTop: 8,
  },

  groupWrap: { position: "relative" },

  groupSurface: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.018)",
  },

  groupRail: {
    position: "absolute",
    left: Spacing.md,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.10)",
    zIndex: 2,
  },

  groupRailSuperset: { backgroundColor: "rgba(244,200,74,0.70)" },
  groupRailGiant: { backgroundColor: "rgba(0,0,0,0.55)" },
  groupRailCircuit: { backgroundColor: "rgba(244,200,74,0.45)" },

  blockHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
    paddingBottom: 8,
    paddingLeft: Spacing.md + 10,
  },
  

  blockKicker: {
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(0,0,0,0.38)",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  blockTitleRow: { marginTop: 3 },

  blockTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },

  blockMeta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.muted,
  },
  
  card: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: Spacing.md + 10,
  },

  exerciseGap: {
    height: 10,
    backgroundColor: Colors.background, // "#F7F7F5"
  },

  exerciseSeparator: {
  height: 1,
  backgroundColor: "rgba(0,0,0,0.10)", // slightly stronger than border
  marginLeft: Spacing.md + 10,         // keep alignment
},

  exerciseSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md + 10,
  },

  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
  },

  thumb: { width: 58, height: 58, borderRadius: 14 },

  exerciseText: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 12,
    paddingRight: 8,
    justifyContent: "center",
  },

  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },

  blockTag: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  blockTagText: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: 0.3,
  },

  exerciseTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },

  exerciseSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(0,0,0,0.45)",
  },

  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
  },

  cols: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  colLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(0,0,0,0.32)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 58,
    backgroundColor: Colors.surface,
    position: "relative",
  },

  rowBottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  rowCompleted: { backgroundColor: "rgba(0,0,0,0.03)" },

  rowActive: { backgroundColor: "rgba(244,200,74,0.10)" },

  rowActiveBar: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 999,
    backgroundColor: "rgba(244,200,74,0.70)",
  },

  setIndex: {
    width: 40,
    fontSize: 14,
    fontWeight: "900",
    color: "rgba(0,0,0,0.50)",
    textAlign: "center",
  },

  setIndexActive: { color: "rgba(0,0,0,0.82)" },

  cell: {
    flex: 1,
    height: 46,
    marginHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },

  cellCompleted: {
    borderColor: "rgba(0,0,0,0.10)",
    backgroundColor: "rgba(0,0,0,0.02)",
  },

  cellActive: {
    borderColor: "rgba(244,200,74,0.55)",
    backgroundColor: "rgba(244,200,74,0.06)",
  },

  input: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: Colors.text,
    paddingVertical: 0,
    paddingHorizontal: 8,
    height: "100%",
    ...(Platform.OS === "android" ? { paddingBottom: 2 } : null),
  },

  checkBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    backgroundColor: Colors.surface,
  },

  checkBtnOn: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },

  swipeBg: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 12,
    backgroundColor: Colors.surface,
  },

  deletePill: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteText: { fontWeight: "900", color: Colors.text, letterSpacing: -0.2 },

  cardActions: { flexDirection: "row", gap: 10, marginTop: 12 },

  ghostBtn: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.16)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },

  ghostText: { fontWeight: "900", color: Colors.text, fontSize: 13 },

  finishSection: {
    marginTop: 18,
    paddingBottom: 12,
  },

  finishSectionWrap: {
    position: "relative",
    zIndex: 10,
  },

  finishBtn: {
    height: 56,
    borderRadius: 999,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },

  finishBtnText: {
    color: Colors.surface,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: -0.2,
  },

  /* ───────────────────────── TIMER PILL ───────────────────────── */
  timerPillWrap: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    zIndex: 998,
    elevation: 18,
  },

  timerPill: {
    backgroundColor: Colors.text,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },

  timerPillContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timerPillLeft: { flex: 1 },

  timerPillTime: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.surface,
    letterSpacing: -0.4,
  },

  timerPillProgress: {
    marginTop: 6,
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.24)",
    overflow: "hidden",
    width: "100%",
  },

  timerPillProgressFill: { height: 3, backgroundColor: Colors.surface },

  timerPillActions: { flexDirection: "row", gap: 8, marginLeft: 12 },

  timerPillBtn: {
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  timerPillBtnText: { fontSize: 12, fontWeight: "900", color: Colors.surface },

  timerPillBtnSkip: {
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  timerPillBtnTextSkip: { fontSize: 12, fontWeight: "900", color: Colors.text },

  /* ───────────────────────── INPUT ACCESSORY ───────────────────────── */
  accessory: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    alignItems: "flex-end",
  },

  accessoryBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 999,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },

  accessoryText: { color: Colors.surface, fontWeight: "900" },

  /* ───────────────────────── MODALS ───────────────────────── */
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.40)",
  },

  modalSheet: {
    marginTop: "auto",
    backgroundColor: Colors.surface,
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  modalSheetLarge: {
    marginTop: "auto",
    backgroundColor: Colors.surface,
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "82%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
    flex: 1,
    paddingRight: 10,
  },

  modalX: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  modalBody: {
    marginTop: 10,
    color: "rgba(0,0,0,0.65)",
    fontWeight: "700",
    lineHeight: 18,
  },

  modalActions: { flexDirection: "row", gap: 10, marginTop: 14 },

  modalGhost: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.16)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },

  modalGhostText: { fontWeight: "900", color: Colors.text },

  modalPrimary: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },

  modalPrimaryText: { fontWeight: "900", color: Colors.surface },

  modalDanger: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
  },

  modalDangerText: { fontWeight: "900", color: Colors.surface },

  menuList: { marginTop: 12, gap: 8 },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.04)",
  },

  menuItemText: { fontSize: 15, fontWeight: "800", color: Colors.text },

  swapList: { marginTop: 12, gap: 10 },

  swapItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.04)",
  },

  swapThumb: { width: 58, height: 58, borderRadius: 12 },

  swapTextContainer: { flex: 1 },

  swapName: { fontSize: 15, fontWeight: "900", color: Colors.text },

  swapCategory: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(0,0,0,0.55)",
    marginTop: 3,
  },

  /* HISTORY */
  prBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(244,200,74,0.18)",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    marginBottom: 4,
  },

  prText: { fontSize: 12, fontWeight: "900", color: Colors.text },

  prDate: { fontSize: 11, fontWeight: "700", color: "rgba(0,0,0,0.55)" },

  historyCard: {
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    backgroundColor: Colors.surface,
  },

  historyCardSpaced: { marginTop: 18 },

  historyCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  historyDate: { fontWeight: "900", color: Colors.text },

  useSessionBtn: {
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },

  useSessionText: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.surface,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  historyTableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  historyHead: {
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(0,0,0,0.32)",
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  historyCellText: {
    flex: 1,
    textAlign: "center",
    fontWeight: "900",
    color: "rgba(0,0,0,0.78)",
  },

  historyDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },

  historyDotOn: { backgroundColor: Colors.text, borderColor: Colors.text },
});
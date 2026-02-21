import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },

  listContent: { paddingBottom: 120 },

  /* Top bar */
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 8,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingRight: 10,
  },
  backText: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.2,
  },

  dotsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Header */
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 6,
    paddingBottom: 18,
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: -0.9,
    color: Colors.text,
  },
  status: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(0,0,0,0.38)",
    letterSpacing: -0.1,
  },

  progressBlock: { marginTop: 26 },
  progressLabel: {
    fontSize: 22,
    fontWeight: "800",
    color: "rgba(0,0,0,0.65)",
    letterSpacing: -0.2,
  },
  progressTrack: {
    marginTop: 14,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  progressFill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.text,
  },

  /* Cards */
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: 18,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.10)",
    backgroundColor: Colors.surface,
    padding: 16,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingBottom: 14,
  },

  thumbWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.10)",
    overflow: "hidden",
  },
  thumbImage: { width: "100%", height: "100%" },

  cardHeaderMid: { flex: 1 },

  exerciseTitle: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: Colors.text,
  },
  exerciseTempo: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(0,0,0,0.38)",
    letterSpacing: -0.1,
  },

  cardDotsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Table */
  tableOuter: { alignSelf: "stretch", overflow: "hidden" },

  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 12,
  },

  th: {
    fontSize: 14,
    fontWeight: "800",
    color: "rgba(0,0,0,0.42)",
    letterSpacing: 0.8,
  },

  tableDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.10)",
  },

  row: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  setNum: {
    fontSize: 22,
    fontWeight: "800",
    color: "rgba(0,0,0,0.55)",
    letterSpacing: -0.2,
  },

  cellInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: Colors.surface,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
    color: Colors.text,
    paddingHorizontal: 8,
  },

  cellInputEmpty: {
    borderColor: "rgba(0,0,0,0.10)",
  },

  /* Calmer check */
  check: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.18)",
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkDone: {
    backgroundColor: "rgba(0,0,0,0.78)",
    borderColor: "rgba(0,0,0,0.78)",
  },

  rowDivider: {
    position: "absolute",
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  /* Actions */
  cardActions: { marginTop: 16, flexDirection: "row", gap: 14 },

  actionBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },

  /* Swipe to delete */
  swipeWrap: { position: "relative" },

  deleteUnderlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 96,
    alignItems: "center",
    justifyContent: "center",
  },

  deletePill: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteText: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.1,
  },

  /* Bottom bar */
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.10)",
  },

  restRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  restLeft: { flex: 1, paddingRight: 12 },
  restLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(0,0,0,0.45)",
    letterSpacing: -0.1,
  },
  restTime: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  restSkip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  restSkipText: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.1,
  },

  completeCta: {
    height: 54,
    borderRadius: 999,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  completeCtaText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },

  completeCtaDisabled: { backgroundColor: "rgba(0,0,0,0.18)" },
  completeCtaTextDisabled: { color: "rgba(255,255,255,0.85)" },

  /* History modal */
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  modalSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.10)",
    overflow: "hidden",
  },

  modalHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.1,
  },

  modalClose: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
  },

  modalBody: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 16,
  },

  modalExerciseName: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.3,
  },

  modalMeta: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(0,0,0,0.42)",
  },

  historyTable: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.10)",
    overflow: "hidden",
  },

  historyHead: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.03)",
  },

  historyRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.10)",
  },

  historyCellH: {
    fontSize: 12,
    fontWeight: "900",
    color: "rgba(0,0,0,0.42)",
    letterSpacing: 0.8,
  },

  historyCell: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.1,
  },
});

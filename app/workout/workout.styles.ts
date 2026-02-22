import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import { StyleSheet } from "react-native";

const HAIR = StyleSheet.hairlineWidth;

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  // Top bar
  topBar: {
    paddingTop: 10,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  // Header (title / status / progress)
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 4,
    paddingBottom: 14,
  },
  title: {
    fontSize: 40, // tightened from oversized
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: -0.8,
    color: Colors.text,
  },
  status: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(0,0,0,0.35)",
  },
  setsLine: {
    marginTop: 18,
    fontSize: 34, // tightened
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.7,
    color: "rgba(0,0,0,0.62)",
  },
  progressTrack: {
    marginTop: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  progressFill: {
    height: 12,
    borderRadius: 999,
    backgroundColor: Colors.text,
  },

  // Exercise card
  card: {
    marginTop: 10,
    marginHorizontal: Spacing.lg,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: HAIR,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  cardInner: {
    padding: 16,
  },

  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumb: {
    width: 54, // tightened
    height: 54,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  exerciseText: {
    flex: 1,
    paddingLeft: 14,
    paddingRight: 10,
  },
  exerciseTitle: {
    fontSize: 40, // still bold but not insane
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -0.8,
    color: Colors.text,
  },
  exerciseSub: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "800",
    color: "rgba(0,0,0,0.35)",
    letterSpacing: -0.2,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    marginTop: 14,
    height: HAIR,
    backgroundColor: Colors.border,
  },

  // Table header
  tableHead: {
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  thSet: {
    width: 34,
    fontSize: 18,
    fontWeight: "900",
    color: "rgba(0,0,0,0.38)",
    letterSpacing: 2.2,
  },
  thCell: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    color: "rgba(0,0,0,0.38)",
    letterSpacing: 2.2,
    textAlign: "center",
  },
  thCheck: {
    width: 62, // space for check button
    fontSize: 18,
    fontWeight: "900",
    color: "rgba(0,0,0,0.38)",
    letterSpacing: 2.2,
    textAlign: "center",
  },

  // Rows
  rowsWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  rowDivider: {
    height: HAIR,
    backgroundColor: "rgba(0,0,0,0.06)",
  },

  row: {
    height: 72, // tighter than before
    flexDirection: "row",
    alignItems: "center",
  },

  setIndex: {
    width: 34,
    fontSize: 36,
    fontWeight: "900",
    color: "rgba(0,0,0,0.45)",
    letterSpacing: -0.6,
  },

  // This is the BIG fix:
  // - enforce minWidth so cells never collapse into circles
  // - keep them as rounded rectangles
  cell: {
    flex: 1,
    minWidth: 86,
    height: 52,
    marginHorizontal: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.14)",
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: {
    fontSize: 28, // tightened
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.4,
  },
  cellPlaceholder: {
    fontSize: 28,
    fontWeight: "900",
    color: "rgba(0,0,0,0.25)",
    letterSpacing: -0.4,
  },
  input: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "900",
    color: Colors.text,
  },

  // Check column
  checkCol: {
    width: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBtn: {
    width: 48, // tighter than your oversized version
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  checkBtnOn: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },

  // Swipe background (delete)
  swipeBg: {
    height: 72,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 14,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  deletePill: {
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: HAIR,
    borderColor: Colors.border,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },

  // Bottom buttons inside card
  cardActions: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    gap: 14,
  },
  ghostBtn: {
    flex: 1,
    height: 56, // tighter
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.16)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  ghostText: {
    fontSize: 22, // tighter
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.4,
  },

  // Sticky CTA
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderTopWidth: HAIR,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  cta: {
    height: 72, // tighter than giant
    borderRadius: 999,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 30, // tighter
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  // Spacer so content doesn’t hide behind CTA
  bottomSpacer: {
    height: 110,
  },

  // Modal
  modalSheet: {
    marginHorizontal: Spacing.lg,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: HAIR,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: HAIR,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  modalRowLeft: {
    flex: 1,
  },
  modalRowTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text,
  },
  modalRowMeta: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.muted,
  },
  modalRowRight: {
    fontSize: 15,
    fontWeight: "900",
    color: Colors.text,
  },
});

import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import { StyleSheet } from "react-native";

const HAIR = StyleSheet.hairlineWidth;

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flex: 1, backgroundColor: Colors.surface },
  content: { flexGrow: 1 },

  /* ---------------------------------------------------- */
  /* PAGE HEADER                                          */
  /* ---------------------------------------------------- */

  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  pageTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.6,
  },

  cardPressed: { opacity: 0.93 },

  /* ---------------------------------------------------- */
  /* RAILS                                                */
  /* ---------------------------------------------------- */

  rails: { paddingTop: Spacing.sm },

  rail: { paddingTop: Spacing.xl },

  railHeader: {
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },

  railHeaderText: { flex: 1, paddingRight: 10 },

  railTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.25,
  },

  railSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
    color: Colors.muted,
  },

  railAll: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  railAllText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.muted,
    marginRight: 4,
  },

  railListContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  bottomSpacer: { height: Spacing.xl * 1.2 },

  /* ---------------------------------------------------- */
  /* BADGES                                               */
  /* ---------------------------------------------------- */

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: HAIR,
    borderColor: "rgba(0,0,0,0.10)",
  },

  badgeGold: {
    backgroundColor: "rgba(244,200,74,0.95)",
    borderColor: "rgba(244,200,74,0.40)",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.1,
  },

  badgeTextGold: { color: "#111" },

  /* ---------------------------------------------------- */
  /* PROGRAM CARDS                                        */
  /* ---------------------------------------------------- */

  // Slightly narrower + taller, less rounded than before (premium, less “bubble”)
  programCardWrap: {
    width: 284,
    marginRight: 16, // more breathing between cards
  },

  programTile: {
    height: 390,
    borderRadius: 18, // smaller radius (you said it was too big)
    overflow: "hidden",
    backgroundColor: Colors.card,
  },

  programTileImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  // Bottom-only scrim (key fix: no “mid cut”)
  programBottomScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 280, // only affects lower portion
  },

  programTopLeft: {
    position: "absolute",
    top: 12,
    left: 12,
  },

  // Subtle info chip (less obvious than a bright icon button)
  infoChip: {
  position: "absolute",
  top: 12,
  right: 12,
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: "rgba(255,255,255,0.22)",
  borderWidth: HAIR,
  borderColor: "rgba(255,255,255,0.28)",
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOpacity: 0.10,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
},

  programBottomRight: {
    position: "absolute",
    right: 12,
    bottom: 14,
  },

  programTextOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },

  programTitleOnImage: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.45,
  },

  programDurationOnImage: {
    marginTop: 8,
    color: "rgba(255,255,255,0.88)",
    fontSize: 15,
    fontWeight: "700",
  },

  programBelowPrimary: {
    marginTop: 14,
    color: Colors.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  programBelowSecondary: {
    marginTop: 4,
    color: Colors.muted,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "600",
  },

  /* LEVEL PILL (smaller + higher contrast) */

/* LEVEL CHIP — matches infoChip “liquid glass” */

levelChip: {
  flexDirection: "row",
  alignItems: "center",
  paddingLeft: 10,
  paddingRight: 12,
  height: 30,
  borderRadius: 15,

  // SAME FAMILY as infoChip
  backgroundColor: "rgba(255,255,255,0.22)",
  borderWidth: HAIR,
  borderColor: "rgba(255,255,255,0.28)",

  shadowColor: "#000",
  shadowOpacity: 0.10,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
},

levelIconWrap: {
  width: 20,
  height: 20,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 8,
},

levelIconAccent: {
  // tiny premium cue (optional, looks great on the scrim)
  backgroundColor: "rgba(244,200,74,0.18)", // gold tint, very subtle
  borderWidth: HAIR,
  borderColor: "rgba(244,200,74,0.28)",
},

levelChipText: {
  fontSize: 12,
  lineHeight: 14,
  fontWeight: "800",
  color: "rgba(255,255,255,0.92)",
  letterSpacing: -0.1,
},

levelChipTextSoft: {
  color: "rgba(255,255,255,0.82)",
},

levelLabel: {
  fontSize: 13,                  // closer to 12 weeks visual weight
  lineHeight: 16,
  fontWeight: "800",             // less shouty than 900
  color: "rgba(255,255,255,0.85)", // slightly softer so it doesn't compete with title
  letterSpacing: -0.1,
},

  /* ---------------------------------------------------- */
  /* WORKOUT / RECIPE CARDS                               */
  /* ---------------------------------------------------- */

  workoutCard: {
    width: 284, // a bit less wide
    marginRight: 16,
  },

  recipeCard: {
    width: 240,
    marginRight: 16,
  },

  workoutMedia: {
    height: 230, // taller feel
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: Colors.card,
  },

  recipeMedia: {
    height: 185,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: Colors.card,
  },

  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  editorialBottomScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },

  editorialBadgeWrap: {
    position: "absolute",
    top: 12,
    left: 12,
  },

  titleOverlay: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
  },

  titleOnImage: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  below: { paddingTop: 12 },

  belowBold: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  belowMuted: {
    marginTop: 4,
    color: Colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },

  /* ---------------------------------------------------- */
  /* MODAL                                                */
  /* ---------------------------------------------------- */

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
    borderTopWidth: HAIR,
    borderTopColor: Colors.border,
  },

  modalTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  modalTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },

  modalClose: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: HAIR,
    borderColor: Colors.border,
    backgroundColor: "rgba(0,0,0,0.04)",
  },

  modalCloseText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },

  modalMeta: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.muted,
  },

  modalBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "rgba(0,0,0,0.75)",
  },

  modalActionsRow: {
    marginTop: 14,
  },

  modalPrimary: {
    height: 46,
    borderRadius: 999,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },

  modalPrimaryText: {
    color: Colors.surface,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: -0.15,
  },
});
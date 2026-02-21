import { Colors } from "@/styles/colors";
import { Radius } from "@/styles/radius";
import { Spacing } from "@/styles/spacing";
import { Typography } from "@/styles/typography";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    backgroundColor: Colors.surface,
  },

  /* HERO */
  hero: {
    height: 440,
    justifyContent: "flex-end",
    backgroundColor: "#000",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  heroTopBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heroIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroUpgradePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.premium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.10)",
  },
  heroUpgradeText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  heroProChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  heroProChipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  heroContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 18,
  },
  heroTitle: {
    color: "#FFF",
    ...Typography.title1,
  },
  heroSubtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.88)",
    ...Typography.body,
    fontWeight: "600",
  },
  heroMeta: {
    marginTop: 8,
    color: "rgba(255,255,255,0.76)",
    ...Typography.meta,
    fontWeight: "600",
  },

  heroProgressTrack: {
    marginTop: 14,
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

  /* Stats as a clean line (not pills) */
  heroStatsRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  heroStatText: {
    color: "rgba(255,255,255,0.86)",
    ...Typography.micro,
    fontWeight: "700",
  },
  heroStatDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.55)",
    marginHorizontal: 10,
  },

  /* CONTENT */
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 16,
  },

  /* WEEKS STRIP (underline rail) */
  weeksWrap: {
    marginTop: 2,
    marginBottom: 16,
  },
  weeksRail: {
    paddingRight: Spacing.lg,
    gap: 16,
  },
  weekItem: {
    paddingVertical: 6,
  },
  weekItemText: {
    ...Typography.meta,
    fontWeight: "700",
    color: "rgba(0,0,0,0.55)",
  },
  weekItemTextActive: {
    color: Colors.text,
  },
  weekUnderline: {
    marginTop: 8,
    height: 2,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  weekUnderlineActive: {
    backgroundColor: Colors.text,
  },

  /* Week header */
  weekHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  weekTitle: {
    ...Typography.title2,
    color: Colors.text,
  },
  weekSub: {
    marginTop: 6,
    ...Typography.meta,
    color: Colors.muted,
    fontWeight: "600",
  },
  weekMeta: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  weekMetaText: {
    ...Typography.micro,
    color: Colors.text,
    fontWeight: "700",
  },

  /* WORKOUT GROUP (single surface, inset dividers) */
  workoutGroup: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: "hidden",
  },

  workoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  workoutThumb: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: "rgba(0,0,0,0.06)",
  },

  workoutMid: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 10,
  },
  workoutTitle: {
    ...Typography.headline,
    fontWeight: "800",
    color: Colors.text,
  },
  workoutMeta: {
    marginTop: 6,
    ...Typography.meta,
    color: Colors.muted,
    fontWeight: "600",
  },

  workoutRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  statusPillDone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  statusPillNew: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  statusPillText: {
    ...Typography.micro,
    color: Colors.text,
    fontWeight: "800",
  },

  rowDivider: {
    position: "absolute",
    left: 14 + 72 + 12, // aligns with text inset after thumbnail
    right: 14,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },

  bottomSpacer: {
    height: 28,
  },
});

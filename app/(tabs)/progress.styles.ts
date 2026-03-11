import { StyleSheet } from "react-native";

import { Colors } from "@/styles/colors";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";

const BORDER = Colors.borderSubtle ?? Colors.border ?? "rgba(0,0,0,0.10)";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  scroll: {
    backgroundColor: Colors.surface,
  },

  content: {
    flexGrow: 1,
    paddingTop: 4,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },

  /* Success strip */
  successStrip: {
    marginTop: 10,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: "rgba(244,200,74,0.12)",
    borderWidth: BorderWidth.default,
    borderColor: "rgba(244,200,74,0.34)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  successIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: (Colors as any).premium ?? "#F4C84A",
    alignItems: "center",
    justifyContent: "center",
  },

  successTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  successTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.1,
  },

  successSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(0,0,0,0.56)",
  },

  /* Sections */
  section: {
    marginTop: 22,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.3,
  },

  sectionRight: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.muted,
    letterSpacing: -0.1,
  },

  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },

  linkText: {
    fontSize: 14,
    color: Colors.muted,
    fontWeight: "800",
    letterSpacing: -0.1,
  },

  /* Progress bar */
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.07)",
    overflow: "hidden",
  },

  barFill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.text,
  },

  weekHintRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weekHint: {
    fontSize: 14,
    color: Colors.muted,
    fontWeight: "700",
    letterSpacing: -0.1,
  },

  weekHintStrong: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "900",
    letterSpacing: -0.1,
  },

  /* Week strip */
  weekStrip: {
    marginTop: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: BorderWidth.default,
    borderColor: BORDER,
  },

  weekItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    paddingVertical: 8,
    borderRadius: 14,
  },

  weekItemSelected: {
    backgroundColor: "rgba(0,0,0,0.035)",
    borderWidth: BorderWidth.default,
    borderColor: BORDER,
  },

  weekDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.12)",
    marginBottom: 6,
  },

  weekDotCompleted: {
    backgroundColor: Colors.text,
  },

  weekDotToday: {
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  weekDotSelected: {
    backgroundColor: Colors.text,
  },

  weekLabel: {
    fontSize: 13,
    color: "rgba(0,0,0,0.42)",
    fontWeight: "800",
    letterSpacing: -0.1,
  },

  weekLabelToday: {
    color: Colors.text,
  },

  weekLabelCompleted: {
    color: Colors.text,
  },

  weekLabelSelected: {
    color: Colors.text,
  },

  /* Day card */
  dayCard: {
    marginTop: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: BorderWidth.default,
    borderColor: BORDER,
  },

  dayCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dayCardKicker: {
    fontSize: 15,
    fontWeight: "900",
    color: Colors.muted,
    letterSpacing: -0.1,
  },

  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  dayChipCompleted: {
    backgroundColor: "rgba(244,200,74,0.16)",
  },

  dayChipRecovery: {
    backgroundColor: "rgba(0,0,0,0.055)",
  },

  dayChipPlanned: {
    backgroundColor: "rgba(0,0,0,0.055)",
  },

  dayChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.05,
  },

  dayCardTitle: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.4,
  },

  dayCardMeta: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.muted,
    letterSpacing: -0.1,
  },

  dayCardNote: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.muted,
    letterSpacing: -0.05,
  },

  dayCardCta: {
    marginTop: 14,
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: BorderWidth.default,
    borderTopColor: BORDER,
  },

  dayCardCtaText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.1,
  },

  /* Grid tiles */
  grid: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12,
  },

  tile: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: BorderWidth.default,
    borderColor: BORDER,
  },

  tileLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.muted,
    letterSpacing: -0.05,
  },

  tileValue: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.6,
  },

  tileHint: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.muted,
    letterSpacing: -0.05,
  },

  /* Cards */
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: BorderWidth.default,
    borderColor: BORDER,
  },

  /* Personal best highlight */
  cardHighlight: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: BorderWidth.default,
    borderColor: BORDER,
  },

  smallLabelHighlight: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: -0.05,
  },

  bigValueHighlight: {
    marginTop: 6,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.7,
    color: Colors.text,
  },

  smallHintHighlight: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.muted,
    fontWeight: "700",
    letterSpacing: -0.05,
  },

  /* Small label/value/hint */
  smallLabel: {
    fontSize: 13,
    color: Colors.muted,
    fontWeight: "700",
  },

  bigValue: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.3,
  },

  smallHint: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.muted,
    fontWeight: "600",
  },

  /* Body metrics */
  metricRow: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  metricLeft: {
    flex: 1,
    paddingRight: 12,
  },

  metricLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.1,
  },

  metricTrendRow: {
    marginTop: 10,
  },

  metricValue: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },

  divider: {
    height: BorderWidth.default,
    backgroundColor: BORDER,
  },

  metricFooter: {
    paddingTop: 14,
    paddingBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  metricFooterText: {
    fontSize: 13,
    color: Colors.muted,
    fontWeight: "700",
    letterSpacing: -0.05,
  },

  metricFooterStrong: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "800",
    letterSpacing: -0.05,
  },

  /* Trend pills */
  trendPillBase: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: BorderWidth.default,
    borderColor: BORDER,
    backgroundColor: Colors.surface,
  },

  trendPillGood: {},
  trendPillUp: {},
  trendPillNeutral: {},

  trendTextBase: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.05,
  },

  trendTextGood: {
    color: Colors.text,
  },

  trendTextUp: {
    color: Colors.muted,
  },

  trendTextNeutral: {
    color: Colors.muted,
  },

  /* Recent sessions */
  recentRow: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  recentLeft: {
    flex: 1,
    paddingRight: 12,
  },

  recentRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  recentTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },

  recentMeta: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.muted,
    fontWeight: "700",
    letterSpacing: -0.05,
  },

  recentDate: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.muted,
    letterSpacing: -0.05,
  },

  pressed: {
    opacity: 0.72,
  },

  bottomSpacer: {
    height: 24,
  },
});
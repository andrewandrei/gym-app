// app/(tabs)/progress.styles.ts
import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import { StyleSheet } from "react-native";

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
    fontSize: 28,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  sectionRight: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.muted,
  },

  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  linkText: {
    fontSize: 15,
    color: Colors.muted,
    fontWeight: "800",
  },

  /* Progress bar */
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.08)",
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
    fontSize: 15,
    color: Colors.muted,
    fontWeight: "700",
  },
  weekHintStrong: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "900",
  },

  /* Week strip */
  weekStrip: {
    marginTop: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  weekItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    paddingVertical: 8,
    borderRadius: 14,
  },
  weekItemSelected: {
    backgroundColor: "rgba(0,0,0,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
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
    fontSize: 14,
    color: "rgba(0,0,0,0.40)",
    fontWeight: "800",
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
    marginTop: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  dayCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayCardKicker: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.muted,
  },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },
  dayCardTitle: {
    marginTop: 14,
    fontSize: 26,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  dayCardMeta: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.muted,
  },
  dayCardNote: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.muted,
  },

  // iOS-like action row
  dayCardCta: {
    marginTop: Spacing.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
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
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.muted,
  },
  tileValue: {
    marginTop: 10,
    fontSize: 34,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.4,
  },
  tileHint: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.muted,
  },

  /* Cards */
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },

  /* Personal best highlight */
  cardHighlight: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  smallLabelHighlight: {
    color: Colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  bigValueHighlight: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: Colors.text,
  },
  smallHintHighlight: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.muted,
    fontWeight: "600",
  },

  /* Small label/value/hint (legacy usage; ok to keep) */
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

  /* Body metrics rows (Settings-style) */
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
  },
  metricTrendRow: {
    marginTop: 10,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },

  metricFooter: {
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricFooterText: {
    fontSize: 13,
    color: Colors.muted,
    fontWeight: "600",
  },
  metricFooterStrong: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "700",
  },

  /* Trend pills */
  trendPillBase: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  trendPillGood: {},
  trendPillUp: {},
  trendPillNeutral: {},
  trendTextBase: {
    fontSize: 14,
    fontWeight: "800",
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
  },
  recentLeft: {
    flex: 1,
    paddingRight: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
  },
  recentMeta: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.muted,
    fontWeight: "600",
  },
  recentDate: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.muted,
  },

  pressed: {
    opacity: 0.75,
  },

  bottomSpacer: {
    height: 24,
  },
});

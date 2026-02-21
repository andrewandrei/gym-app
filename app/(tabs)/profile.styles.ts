// app/(tabs)/profile.styles.ts
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
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
    paddingBottom: 56,
  },

  /* Header */
  header: {
    paddingTop: 6,
    paddingBottom: 14,
  },
  kicker: {
    fontSize: 13,
    color: Colors.muted,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 6,
    fontSize: 36,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.muted,
    fontWeight: "600",
    lineHeight: 22,
  },

  /* Plan */
  planCard: {
    marginTop: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface, // keep white
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planLeft: {
    flex: 1,
    paddingRight: 12,
  },
  planLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  planHint: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.muted,
  },

  /* Yellow Upgrade pill (subtle, premium) */
  upgradePill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.premium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.10)",
  },
  upgradePillText: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.1,
  },

  planChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  planChipText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },

  /* Sections */
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },

  group: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: "hidden",
  },

  row: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.1,
  },
  rowTitleDestructive: {
    color: "rgba(0,0,0,0.55)",
  },
  rowSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.muted,
  },

  /* Footer */
  footer: {
    marginTop: 22,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.muted,
  },

  pressed: {
    opacity: 0.75,
  },

  bottomSpacer: {
    height: 24,
  },
});

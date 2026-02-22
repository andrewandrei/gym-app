import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safe: { backgroundColor: Colors.surface },
  scroll: { backgroundColor: Colors.surface },

  content: {
    paddingBottom: Spacing.xl,
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headerLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },

  kicker: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  title: {
    marginTop: 6,
    color: Colors.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 10,
    color: Colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  cardPressed: { opacity: 0.92 },

  activePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
  },

  activePillText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: -0.1,
  },

  rails: {
    paddingTop: Spacing.sm,
  },

  rail: {
    paddingTop: Spacing.lg,
  },

  railHeader: {
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  railHeaderLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },

  railTitle: {
    color: Colors.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  railSubtitle: {
    marginTop: 2,
    color: Colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },

  railAll: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  railAllPressed: { opacity: 0.8 },

  railAllText: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginRight: 4,
  },

  railListContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },

  programCardWrap: {
    width: 300,
    marginRight: Spacing.md,
  },

  programTile: {
    width: "100%",
    height: 340,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: Colors.card,
  },

  programTileImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  programTileFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    backgroundColor: "rgba(0,0,0,0.20)",
  },

  programTileTopRow: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  programTileBottom: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.md,
  },

  programTileTitle: {
    color: Colors.white,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  programTileMeta: {
    marginTop: 6,
    color: "rgba(255,255,255,0.90)",
    fontSize: 14,
    fontWeight: "700",
  },

  programBelow: {
    paddingTop: 10,
    paddingHorizontal: 2,
  },

  programBelowMeta: {
    color: Colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },

  miniCard: {
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },

  miniMedia: {
    height: 135,
    backgroundColor: Colors.card,
    overflow: "hidden",
  },

  miniImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  miniFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: "rgba(0,0,0,0.10)",
  },

  miniActivePillWrap: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
  },

  miniBody: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
  },

  miniTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  miniMeta: {
    marginTop: 4,
    color: Colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },

  bottomSpacer: {
    height: Spacing.xl,
  },
});

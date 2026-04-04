import { Colors } from "@/styles/colors";
import { Radius } from "@/styles/radius";
import { Spacing } from "@/styles/spacing";
import { Typography } from "@/styles/typography";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "flex-end",
  },

  backdropTap: {
    ...StyleSheet.absoluteFillObject,
  },

  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.0)", // keep clean; iOS sheet already implies edge
  },

  grabber: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.12)",
    marginBottom: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  headerTextWrap: {
    paddingTop: 4,
  },

  kicker: {
    ...Typography.micro,
    color: "rgba(0,0,0,0.55)",
    fontWeight: "700",
  },

  headerTitle: {
    ...Typography.headline,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 2,
  },

  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    ...Typography.title2,
    color: Colors.text,
    marginTop: 4,
  },

  subtitle: {
    marginTop: 8,
    ...Typography.body,
    color: Colors.muted,
    fontWeight: "500",
  },

  benefitsGroup: {
    marginTop: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.02)",
  },

  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  tick: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },

  benefitText: {
    flex: 1,
  },

  benefitTitle: {
    ...Typography.headline,
    fontWeight: "800",
    color: Colors.text,
  },

  benefitMeta: {
    marginTop: 4,
    ...Typography.meta,
    color: Colors.muted,
    fontWeight: "600",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 14 + 28 + 12, // align under text after tick
  },

  cta: {
    marginTop: Spacing.lg,
    height: 52,
    borderRadius: 999,
    backgroundColor: Colors.premium,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.10)",
  },

  ctaText: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },

  secondary: {
    marginTop: Spacing.md,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    ...Typography.meta,
    fontWeight: "700",
    color: "rgba(0,0,0,0.55)",
  },

  legal: {
    marginTop: Spacing.lg,
    ...Typography.micro,
    color: "rgba(0,0,0,0.55)",
    fontWeight: "600",
  },
});

import { StyleSheet } from "react-native";
import { Colors } from "./colors";
import { Spacing } from "./spacing";
import { Typography } from "./typography";

export const GlobalStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  // Standard screen gutters (use everywhere for consistent rhythm)
  screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  // Use this on inner content containers (not the root SafeAreaView)
  gutters: {
    paddingHorizontal: Spacing.lg,
  },

  // Common section spacing pattern
  sectionTop: {
    marginTop: Spacing.lg,
  },

  // Editorial header styles (rarely used now; prefer per-screen)
  headerTitle: {
    ...Typography.title1,
    color: Colors.text,
  },

  headerSubtitle: {
    marginTop: Spacing.sm,
    ...Typography.body,
    color: Colors.muted,
  },
});

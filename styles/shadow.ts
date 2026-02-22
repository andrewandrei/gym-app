import { Platform, StyleSheet } from "react-native";
import { Colors } from "./colors";
import { Spacing } from "./spacing";

export const Cards = StyleSheet.create({
  base: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    overflow: "hidden",
    marginRight: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 2,
      },
    }),
  },

  program: {
    width: 300,
  },

  workout: {
    width: 240,
  },

  imageProgram: {
    width: "100%",
    height: 170,
  },

  imageWorkout: {
    width: "100%",
    height: 135,
  },

  body: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
  },
});

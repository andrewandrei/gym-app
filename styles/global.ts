import { StyleSheet } from "react-native";
import { Colors } from "./colors";
import { Typography } from "./type";

export const GlobalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },

  // commonly used paddings
  pad: {
    paddingHorizontal: 24,
  },

  // Editorial header styles (optional, but now safe)
  headerTitle: {
    ...Typography.title1,
    color: Colors.text,
  },
  headerSub: {
    ...Typography.sub,
    color: Colors.muted,
  },
});
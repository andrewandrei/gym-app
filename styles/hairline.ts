import { StyleSheet } from "react-native";
import { Colors } from "./colors";

/**
 * Global border tokens
 * Designed for mobile visibility (not hairline)
 */

export const BorderWidth = {
  subtle: 1,
  default: 1.2,
  strong: 1.6,
} as const;

const BORDER_COLOR =
  Colors.borderSubtle ??
  Colors.border ??
  "rgba(0,0,0,0.10)";

export const Hairline = StyleSheet.create({
  top: {
    borderTopWidth: BorderWidth.default,
    borderTopColor: BORDER_COLOR,
  },

  bottom: {
    borderBottomWidth: BorderWidth.default,
    borderBottomColor: BORDER_COLOR,
  },

  left: {
    borderLeftWidth: BorderWidth.default,
    borderLeftColor: BORDER_COLOR,
  },

  right: {
    borderRightWidth: BorderWidth.default,
    borderRightColor: BORDER_COLOR,
  },

  full: {
    borderWidth: BorderWidth.default,
    borderColor: BORDER_COLOR,
  },
});
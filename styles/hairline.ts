// styles/hairline.ts
import { StyleSheet } from "react-native";
import { Colors } from "./colors";

/**
 * App-wide border rules:
 * - Do NOT use StyleSheet.hairlineWidth (too faint on real devices).
 * - Use 1px consistently for premium, readable separation.
 */
export const Hairline = StyleSheet.create({
  top: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle ?? Colors.border ?? "rgba(0,0,0,0.08)",
  },
  bottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle ?? Colors.border ?? "rgba(0,0,0,0.08)",
  },
  left: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.borderSubtle ?? Colors.border ?? "rgba(0,0,0,0.08)",
  },
  right: {
    borderRightWidth: 1,
    borderRightColor: Colors.borderSubtle ?? Colors.border ?? "rgba(0,0,0,0.08)",
  },
});

/**
 * Use these for components that need a visible border width token.
 * Example: borderWidth: BorderWidth.default
 */
export const BorderWidth = {
  subtle: 1,
  default: 1,
  strong: 1,
} as const;
import { StyleSheet } from "react-native";
import { Colors } from "./colors";

export const Typography = StyleSheet.create({
  // Big editorial titles
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: Colors.text,
  },

  title1: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.2,
    color: Colors.text,
  },

  title2: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    letterSpacing: -0.1,
    color: Colors.text,
  },

  body: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: Colors.text,
  },

  sub: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: Colors.muted,
  },

  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: Colors.muted,
  },
});
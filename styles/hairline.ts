// styles/hairline.ts
import { StyleSheet } from "react-native";
import { Colors } from "./colors";

export const Hairline = StyleSheet.create({
  top: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.hairline },
  bottom: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.hairline },
});
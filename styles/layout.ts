// styles/layout.ts
import { StyleSheet } from "react-native";
import { Colors } from "./colors";
import { Space } from "./spacing";

export const Layout = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingHorizontal: Space[4] }, // 16
  section: { paddingTop: Space[6], paddingBottom: Space[6] }, // 24
});
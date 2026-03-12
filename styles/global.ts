import { StyleSheet } from "react-native";
import { Typography } from "./type";

export function createGlobalStyles(colors: {
  background: string;
  surface: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  borderSubtle: string;
  premium: string;
}) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    pad: {
      paddingHorizontal: 24,
    },

    headerTitle: {
      ...Typography.title1,
      color: colors.text,
    },

    headerSub: {
      ...Typography.sub,
      color: colors.muted,
    },
  });
}
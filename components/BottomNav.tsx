// components/BottomNav.tsx
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/app/_providers/theme";

export default function BottomNav() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.active}>Dashboard</Text>
      <Text style={styles.item}>Explore</Text>
      <Text style={styles.item}>Progress</Text>
      <Text style={styles.item}>Profile</Text>
    </View>
  );
}

function createStyles(
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    borderSubtle: string;
    premium: string;
  },
  isDark: boolean,
) {
  return StyleSheet.create({
    wrap: {
      height: 64,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },

    active: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },

    item: {
      fontSize: 12,
      fontWeight: "400",
      color: colors.muted,
    },
  });
}
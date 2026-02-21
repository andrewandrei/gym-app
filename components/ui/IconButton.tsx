import { PressableScale } from "@/components/ui/PressableScale";
import { Colors } from "@/styles/colors";
import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

type Props = {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  variant?: "light" | "dark";
};

export function IconButton({
  onPress,
  children,
  style,
  accessibilityLabel,
  variant = "light",
}: Props) {
  const isDark = variant === "dark";

  return (
    <PressableScale
      onPress={onPress}
      style={[styles.base, isDark ? styles.dark : styles.light, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
    >
      {children}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  light: {
    backgroundColor: "rgba(0,0,0,0.04)",
    borderColor: Colors.border,
  },
  dark: {
    backgroundColor: "rgba(0,0,0,0.22)",
    borderColor: "rgba(255,255,255,0.18)",
  },
});

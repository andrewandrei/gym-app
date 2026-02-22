// components/ui/Button.tsx
import { Colors } from "@/styles/colors";
import { Tokens } from "@/styles/tokens";
import React from "react";
import { Pressable, PressableProps, StyleSheet, ViewStyle } from "react-native";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "premium" | "danger";

type Props = PressableProps & {
  label: string;
  variant?: Variant;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
};

export function Button({
  label,
  variant = "primary",
  fullWidth = true,
  leftIcon,
  style,
  ...rest
}: Props) {
  const bg =
    variant === "primary"
      ? Colors.text
      : variant === "premium"
        ? Colors.premium
        : variant === "danger"
          ? Colors.danger
          : "transparent";

  const border =
    variant === "secondary" || variant === "ghost"
      ? Colors.borderStrong
      : "transparent";

  const textTone =
    variant === "primary" ? "surface" : variant === "premium" ? "text" : variant === "danger" ? "surface" : "text";

  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        styles.base,
        {
          width: fullWidth ? "100%" : undefined,
          backgroundColor: bg,
          borderColor: border,
          borderWidth: border === "transparent" ? 0 : StyleSheet.hairlineWidth,
          opacity: pressed ? 0.9 : 1,
        },
        style as ViewStyle,
      ]}
    >
      {leftIcon}
      <Text variant="body" style={styles.label} tone={textTone as any}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: Tokens.buttonHeight,
    borderRadius: Tokens.buttonRadius,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
  },
  label: {
    fontWeight: "900",
    letterSpacing: -0.1,
  },
});
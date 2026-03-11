// components/ui/Card.tsx
import { Colors } from "@/styles/colors";
import { BorderWidth } from "@/styles/hairline";
import React from "react";
import { View, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: "default" | "highlight" | "subtle";
};

export function Card({ children, style, variant = "default" }: Props) {
  const background =
    variant === "highlight"
      ? "rgba(244,200,74,0.12)"
      : variant === "subtle"
      ? "rgba(0,0,0,0.02)"
      : Colors.card;

  return (
    <View
      style={[
        {
          backgroundColor: background,
          borderRadius: 20,
          borderWidth: BorderWidth.default,
          borderColor: Colors.borderSubtle,
          padding: 18,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
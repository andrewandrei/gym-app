// components/ui/Card.tsx
import { Colors } from "@/styles/colors";
import { HAIR, Tokens } from "@/styles/tokens";
import React from "react";
import { View, ViewProps } from "react-native";

export function Card({ style, ...rest }: ViewProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: Colors.card,
          borderRadius: Tokens.cardRadius,
          borderWidth: HAIR,
          borderColor: Colors.border,
          overflow: "hidden",
        },
        style,
      ]}
    />
  );
}
// components/ui/Divider.tsx
import { Colors } from "@/styles/colors";
import { HAIR } from "@/styles/tokens";
import React from "react";
import { View, ViewProps } from "react-native";

export function Divider({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[{ height: HAIR, backgroundColor: Colors.border }, style]} />;
}
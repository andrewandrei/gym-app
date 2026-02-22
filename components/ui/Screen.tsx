// components/ui/Screen.tsx
import { Colors } from "@/styles/colors";
import React from "react";
import { View, ViewProps } from "react-native";

export function Screen({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[{ flex: 1, backgroundColor: Colors.surface }, style]} />;
}
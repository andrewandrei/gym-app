import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/type";
import React from "react";
import { Text as RNText, TextProps } from "react-native";

type Variant = keyof typeof Typography;

type Props = TextProps & {
  variant?: Variant;
  color?: string;
};

export function Text({
  variant = "body",
  color = Colors.text,
  style,
  ...rest
}: Props) {
  const base = (Typography as any)[variant] ?? Typography.body;

  return (
    <RNText
      allowFontScaling={false}
      {...rest}
      style={[base, { color }, style]}
    />
  );
}
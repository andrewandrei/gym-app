// components/ui/Input.tsx
import { Colors } from "@/styles/colors";
import { Radius } from "@/styles/radius";
import { Spacing } from "@/styles/spacing";
import React from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Text } from "./Text";

type Props = TextInputProps & {
  label?: string;
  hint?: string;
};

export function Input({ label, hint, style, ...rest }: Props) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text variant="sub">{label}</Text> : null}
      <TextInput
        {...rest}
        allowFontScaling={false}
        placeholderTextColor={Colors.muted2}
        style={[styles.input, style]}
      />
      {hint ? <Text variant="meta" tone="muted">{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
    backgroundColor: "#fff",
  },
});
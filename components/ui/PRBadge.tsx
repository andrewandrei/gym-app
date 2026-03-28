import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

type Props = {
  color: string;
  backgroundColor: string;
  borderColor: string;
  label?: string;
};

export function PRBadge({
  color,
  backgroundColor,
  borderColor,
  label = "PR",
}: Props) {
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <Svg width={10} height={10} viewBox="0 0 18 18">
        <Path
          d="M9 2L10.8 7H16L11.6 10.1L13.4 15L9 11.9L4.6 15L6.4 10.1L2 7H7.2L9 2Z"
          fill={color}
        />
      </Svg>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
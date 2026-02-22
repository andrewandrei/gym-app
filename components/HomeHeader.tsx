import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;          // "Welcome back"
  subtitle?: string;      // "0 of 3 workouts completed this week"
  rightSlot?: React.ReactNode; // icon/button
};

export function HomeHeader({ title, subtitle, rightSlot }: Props) {
  return (
    <View style={S.wrap}>
      <View style={S.row}>
        <View style={S.left}>
          <Text style={S.title}>{title}</Text>
          {!!subtitle && <Text style={S.subtitle}>{subtitle}</Text>}
        </View>

        <View style={S.right}>{rightSlot}</View>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    paddingRight: 12,
  },
  right: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "rgba(0,0,0,0.45)",
  },
});
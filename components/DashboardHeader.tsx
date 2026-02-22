import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function DashboardHeader({ title, subtitle, right }: Props) {
  return (
    <View style={S.wrap}>
      <View style={S.row}>
        <View style={S.left}>
          <Text allowFontScaling={false} style={S.title}>
            {title}
          </Text>

          {!!subtitle && (
            <Text allowFontScaling={false} style={S.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={S.right}>{right}</View>
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
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  left: {
    flex: 1,
    paddingRight: 12,
  },

  right: {
    width: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  title: {
    fontSize: 24,          // 👈 NOT gigantic
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
    color: Colors.muted,
  },
});
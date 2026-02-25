// components/ui/ScreenHeader.tsx
import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  kicker?: string;
  variant?: "page" | "hero";
  spacing?: "default" | "tight"; // still supported
  debugTopLine?: boolean;
  horizontal?: number;

  after?: "none" | "default";
};

export function ScreenHeader({
  title,
  subtitle,
  right,
  kicker,
  variant = "page",
  spacing = "default",
  debugTopLine = false,
  horizontal,
  after = "default",
}: Props) {
  const isHero = variant === "hero";
  const px = horizontal ?? 0;

  const padTop = Spacing.xs;                 // 8
  const padBottom = isHero ? Spacing.sm : Spacing.xs; // hero 12, page 8

   const afterGap = after === "none" ? 0 : isHero ? Spacing.lg : Spacing.xs; // ✅ page = 8
  // optional tighter mode if you want it for specific screens later
  const tightMult = spacing === "tight" ? 0.75 : 1;

  return (
    <View style={[S.wrap, debugTopLine && S.debugTop]}>
      <View style={[S.inner, { paddingHorizontal: px, paddingTop: padTop, paddingBottom: padBottom }]}>
        <View style={S.row}>
          <View style={S.left}>
            {kicker ? <Text allowFontScaling={false} style={S.kicker}>{kicker}</Text> : null}
            <Text
              allowFontScaling={false}
              style={[S.title, isHero ? S.titleHero : S.titlePage]}
              numberOfLines={2}
            >
              {title}
            </Text>

            {subtitle ? (
              <Text
                allowFontScaling={false}
                style={[S.subtitle, { marginTop: Spacing.xxs * tightMult }]} // 4
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>

          {right ? <View style={S.right}>{right}</View> : null}
        </View>
      </View>

      {/* locked header-to-content gap */}
      {afterGap > 0 ? <View style={{ height: afterGap }} /> : null}
    </View>
  );
}

const S = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
  },
  debugTop: {
    borderTopWidth: 2,
    borderTopColor: "red",
  },
  inner: {},
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  right: {
    alignSelf: "flex-end",
  },
  kicker: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.muted,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  title: {
    color: Colors.text,
    fontWeight: "800",
  },
  titleHero: {
    fontSize: 46,
    lineHeight: 50,
    letterSpacing: -0.6,
  },
  titlePage: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Colors.muted,
    fontWeight: "500",
  },
});
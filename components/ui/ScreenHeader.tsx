// components/ui/ScreenHeader.tsx
import { ChevronLeft } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/app/_providers/theme";
import { Spacing } from "@/styles/spacing";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  kicker?: string;

  variant?: "page" | "hero";
  spacing?: "default" | "tight";
  debugTopLine?: boolean;
  horizontal?: number;

  after?: "none" | "default";

  onBack?: () => void;
  compact?: boolean;
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
  onBack,
  compact = false,
}: Props) {
  const { colors, isDark } = useAppTheme();
  const S = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const isHero = variant === "hero";
  const px = horizontal ?? 0;

  const padTop = Spacing.xs;
  const padBottom = isHero ? Spacing.sm : Spacing.xs;
  const afterGap = after === "none" ? 0 : isHero ? Spacing.lg : Spacing.xs;

  const tightMult = spacing === "tight" ? 0.75 : 1;

  const titleStyle = isHero
    ? S.titleHero
    : compact
      ? S.titleCompact
      : S.titlePage;

  return (
    <View style={[S.wrap, debugTopLine && S.debugTop]}>
      <View
        style={[
          S.inner,
          { paddingHorizontal: px, paddingTop: padTop, paddingBottom: padBottom },
        ]}
      >
        <View style={S.row}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              hitSlop={12}
              style={({ pressed }) => [S.backBtn, pressed && { opacity: 0.6 }]}
            >
              <ChevronLeft size={22} color={colors.text} />
            </Pressable>
          ) : null}

          <View style={S.left}>
            {kicker ? (
              <Text allowFontScaling={false} style={S.kicker}>
                {kicker}
              </Text>
            ) : null}

            <Text
              allowFontScaling={false}
              style={[S.title, titleStyle]}
              numberOfLines={2}
            >
              {title}
            </Text>

            {subtitle ? (
              <Text
                allowFontScaling={false}
                style={[S.subtitle, { marginTop: Spacing.xxs * tightMult }]}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>

          {right ? <View style={S.right}>{right}</View> : null}
        </View>
      </View>

      {afterGap > 0 ? <View style={{ height: afterGap }} /> : null}
    </View>
  );
}

export default ScreenHeader;

function createStyles(
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    borderSubtle: string;
    premium: string;
  },
  isDark: boolean,
) {
  return StyleSheet.create({
    wrap: {
      backgroundColor: "transparent",
    },

    debugTop: {
      borderTopWidth: 2,
      borderTopColor: "red",
    },

    inner: {},

    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },

    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.03)",
    },

    left: {
      flex: 1,
      minWidth: 0,
    },

    right: {
      alignSelf: "flex-start",
    },

    kicker: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.muted,
      marginBottom: 6,
      letterSpacing: 0.2,
    },

    title: {
      color: colors.text,
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

    titleCompact: {
      fontSize: 28,
      lineHeight: 32,
      letterSpacing: -0.3,
    },

    subtitle: {
      fontSize: 14,
      lineHeight: 18,
      color: colors.muted,
      fontWeight: "500",
    },
  });
}
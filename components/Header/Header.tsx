// components/header/Header.tsx
import { Colors } from "@/styles/colors";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View, ViewStyle } from "react-native";
import { headerStyles as S } from "./Header.styles";
import { HeaderTokens as T } from "./headerTokens";

type Props = {
  title?: string;
  subtitle?: string;

  /** Back action */
  onBack?: () => void;

  /** Optional label next to back icon e.g. "Exit" */
  leftLabel?: string;

  /** Right-side actions (Moon, More, etc.) */
  right?: React.ReactNode;

  /**
   * Large title mode (Home / Dashboard)
   * - top row still exists (right actions)
   * - title/subtitle render in a large block below
   */
  variant?: "standard" | "large";

  /**
   * Overlay mode for hero images: transparent background, white text
   */
  tone?: "light" | "dark";

  /**
   * If you need no bottom border (e.g. inside cards / modals)
   */
  divider?: boolean;

  /**
   * Optional container style overrides
   */
  style?: ViewStyle;
};

export function Header({
  title,
  subtitle,
  onBack,
  leftLabel,
  right,
  variant = "standard",
  tone = "light",
  divider = true,
  style,
}: Props) {
  const isDark = tone === "dark";

  const wrapStyle = [
    divider ? S.wrap : { backgroundColor: Colors.surface },
    isDark ? S.wrapTransparent : null,
    style,
  ];

  return (
    <View style={wrapStyle}>
      {/* Top row */}
      <View style={S.row}>
        <View style={S.leftSlot}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={10}
              style={({ pressed }) => [
                S.backBtn,
                isDark ? S.backBtnTransparent : null,
                pressed ? { opacity: 0.85 } : null,
              ]}
            >
              <ChevronLeft size={T.icon} color={isDark ? "#FFF" : Colors.text} />
            </Pressable>
          ) : (
            <View style={{ width: T.iconBtn, height: T.iconBtn }} />
          )}
        </View>

        {/* Center block */}
        <View style={[S.center, variant === "large" ? S.centerLeftAlign : null]}>
          {variant === "standard" && !!title && (
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[S.title, isDark ? S.titleOnDark : null]}
            >
              {title}
            </Text>
          )}

          {variant === "standard" && !!subtitle && (
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[S.subtitle, isDark ? S.subtitleOnDark : null]}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right slot */}
        <View style={S.rightSlot}>
          {right ?? <View style={{ width: T.iconBtn, height: T.iconBtn }} />}
        </View>
      </View>

      {/* Optional left label row (when you want Exit next to back) */}
      {!!leftLabel && !!onBack && variant === "standard" && (
        <View style={{ paddingHorizontal: T.px, paddingBottom: 6 }}>
          <Text style={[S.leftLabel, isDark ? S.leftLabelOnDark : null]}>
            {leftLabel}
          </Text>
        </View>
      )}

      {/* Large title block */}
      {variant === "large" && (
        <View style={S.largeBlock}>
          {!!title && (
            <Text
              allowFontScaling={false}
              numberOfLines={2}
              style={[S.largeTitle, isDark ? S.largeTitleOnDark : null]}
            >
              {title}
            </Text>
          )}
          {!!subtitle && (
            <Text
              allowFontScaling={false}
              numberOfLines={2}
              style={[S.largeSubtitle, isDark ? S.largeSubtitleOnDark : null]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
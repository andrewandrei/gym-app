import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
};

export default function SubpageHeader({ title, subtitle, onBack }: Props) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const SOFT = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
  const compactTitle = title.trim().length > 24;
  const compactLevel = title.trim().length > 30 ? "small" : "default";

  return (
    <View style={[styles.headerRow, { paddingTop: Math.max(insets.top, 12) }]}>
      <Pressable onPress={onBack} style={[styles.backBtn, {
        borderColor: colors.borderSubtle,
        backgroundColor: SOFT,
      }]} hitSlop={12}>
        <ChevronLeft size={22} color={colors.text} />
      </Pressable>

      <View style={styles.headerTextWrap}>
        <ScreenHeader
          title={title}
          subtitle={subtitle}
          compact={compactTitle}
          compactLevel={compactLevel}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: 8,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: BorderWidth.default,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
});

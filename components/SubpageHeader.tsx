import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

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
  const SOFT = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";

  return (
    <View style={styles.headerRow}>
      <Pressable onPress={onBack} style={[styles.backBtn, {
        borderColor: colors.borderSubtle,
        backgroundColor: SOFT,
      }]} hitSlop={12}>
        <ChevronLeft size={22} color={colors.text} />
      </Pressable>

      <View style={styles.headerTextWrap}>
        <ScreenHeader title={title} subtitle={subtitle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
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
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Optional right action (icon button, etc.) */
  right?: React.ReactNode;
  /** If you really want text beside the arrow (default: none, premium) */
  leftLabel?: string;
  /** Optional: hide divider for hero screens */
  showDivider?: boolean;
};

export function AppHeader({
  title,
  subtitle,
  onBack,
  right,
  leftLabel,
  showDivider = true,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: Math.max(10, insets.top ? insets.top + 6 : 10) },
        showDivider && styles.divider,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          {!!onBack && (
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [
                styles.backBtn,
                pressed && styles.pressed,
              ]}
              hitSlop={10}
            >
              <ChevronLeft size={20} color={Colors.text} />
            </Pressable>
          )}

          {!!leftLabel && (
            <Text style={styles.leftLabel} numberOfLines={1}>
              {leftLabel}
            </Text>
          )}
        </View>

        <View style={styles.center} pointerEvents="none">
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          {!!subtitle && (
            <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.right}>{right ?? <View style={{ width: 40 }} />}</View>
      </View>
    </View>
  );
}

const HAIR = StyleSheet.hairlineWidth;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 10,
  },
  divider: {
    borderBottomWidth: HAIR,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  left: {
    width: 90,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: HAIR,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pressed: {
    opacity: Platform.OS === "ios" ? 0.6 : 0.75,
  },
  leftLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(0,0,0,0.45)",
    letterSpacing: -0.1,
  },
  right: {
    width: 90,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
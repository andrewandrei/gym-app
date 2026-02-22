import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string; // optional, e.g. "Exit"
  rightSlot?: React.ReactNode;
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel,
  rightSlot,
}: ScreenHeaderProps) {
  return (
    <View style={S.wrap}>
      <View style={S.topRow}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [S.backBtn, pressed && { opacity: 0.85 }]}
          hitSlop={10}
        >
          <ChevronLeft size={20} color={Colors.text} />
          {!!backLabel && <Text style={S.backLabel}>{backLabel}</Text>}
        </Pressable>

        <View style={S.rightSlot}>{rightSlot}</View>
      </View>

      <Text style={S.title} numberOfLines={2} ellipsizeMode="tail">
        {title}
      </Text>

      {!!subtitle && <Text style={S.subtitle}>{subtitle}</Text>}
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  backBtn: {
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  rightSlot: {
    minWidth: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "rgba(0,0,0,0.45)",
  },
});
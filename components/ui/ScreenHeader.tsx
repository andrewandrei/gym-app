// components/ui/ScreenHeader.tsx
import { Colors } from "@/styles/colors";
import { Tokens } from "@/styles/tokens";
import * as Haptics from "expo-haptics";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  backLabel?: string; // optional: show label next to chevron
  compact?: boolean;  // tighter header for dense screens
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  backLabel,
  compact,
}: Props) {
  const titleVariant = compact ? "h2" : "h1";

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={async () => {
              await Haptics.selectionAsync();
              onBack();
            }}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            hitSlop={10}
          >
            <ChevronLeft size={22} color={Colors.text} />
            {backLabel ? (
              <Text variant="sub" style={{ marginLeft: 2 }}>
                {backLabel}
              </Text>
            ) : null}
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}

        <View style={styles.rightSlot}>{right}</View>
      </View>

      <View style={styles.titleBlock}>
        <Text variant={titleVariant} style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {subtitle ? (
          <Text variant="meta" tone="muted" style={styles.sub}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Tokens.pageX,
    paddingTop: Tokens.headerTopPad,
    paddingBottom: Tokens.headerBottomPad,
    backgroundColor: Colors.surface,
  },
  wrapCompact: {
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    height: 40,
    minWidth: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
  },
  rightSlot: {
    minWidth: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  titleBlock: {
    marginTop: 10,
  },
  title: {
    color: Colors.text,
  },
  sub: {
    marginTop: 6,
  },
});
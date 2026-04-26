import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";

type Props = {
  title: string;
  metaBold: string;
  metaMuted?: string;
  imageUrl: string;
  active?: boolean;
  badgeLabel?: string;
  width?: number;
  mediaHeight?: number;
  metaTopSpacing?: number;
  onPress: () => void;
  topRightAccessory?: React.ReactNode;
};

export function EditorialCard({
  title,
  metaBold,
  metaMuted,
  imageUrl,
  active = false,
  badgeLabel,
  width = 332,
  mediaHeight = 214,
  metaTopSpacing = 2,
  onPress,
  topRightAccessory,
}: Props) {
  const { colors } = useAppTheme();
  const resolvedBadge = badgeLabel ?? (active ? "Active" : undefined);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width },
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={[
          styles.media,
          {
            height: mediaHeight,
            backgroundColor: colors.card,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)"]}
          locations={[0.45, 1]}
          style={styles.bottomScrim}
        />

        {resolvedBadge ? (
          <View style={styles.badgeWrap}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{resolvedBadge}</Text>
            </View>
          </View>
        ) : null}

        {topRightAccessory ? (
          <View style={styles.topRightAccessoryWrap}>{topRightAccessory}</View>
        ) : null}

        <View style={styles.titleOverlay}>
          <Text style={styles.titleOnImage} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </View>

      <View style={[styles.below, { paddingTop: metaTopSpacing }]}>
        <Text style={[styles.belowBold, { color: colors.text }]} numberOfLines={1}>
          {metaBold}
        </Text>

        {!!metaMuted && (
          <Text style={[styles.belowMuted, { color: colors.muted }]} numberOfLines={1}>
            {metaMuted}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {},

  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },

  media: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: BorderWidth.default,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  bottomScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
  },

  badgeWrap: {
    position: "absolute",
    top: 12,
    left: 12,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: BorderWidth.default,
    borderColor: "rgba(0,0,0,0.10)",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111111",
    letterSpacing: -0.1,
  },

  topRightAccessoryWrap: {
    position: "absolute",
    top: 12,
    right: 12,
  },

  titleOverlay: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
  },

  titleOnImage: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  below: {
    paddingHorizontal: 2,
  },

  belowBold: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },

  belowMuted: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "600",
  },
});
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/styles/colors";
import { BorderWidth } from "@/styles/hairline";

type EditorialCardTheme = {
  card: string;
  text: string;
  muted: string;
  borderSubtle?: string;
};

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
  theme?: EditorialCardTheme;
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
  metaTopSpacing = 10,
  onPress,
  topRightAccessory,
  theme,
}: Props) {
  const resolvedBadge = badgeLabel ?? (active ? "Active" : undefined);

  const cardColor = theme?.card ?? Colors.card;
  const textColor = theme?.text ?? Colors.text;
  const mutedColor = theme?.muted ?? Colors.muted;
  const borderColor = theme?.borderSubtle ?? "rgba(0,0,0,0.08)";

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
            backgroundColor: cardColor,
            borderColor,
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
        <Text style={[styles.belowBold, { color: textColor }]} numberOfLines={1}>
          {metaBold}
        </Text>

        {!!metaMuted && (
          <Text style={[styles.belowMuted, { color: mutedColor }]} numberOfLines={1}>
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
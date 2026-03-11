// components/ui/EditorialCard.tsx

import React from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Colors } from "@/styles/colors";
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
  onPress: () => void;
};

export function EditorialCard({
  title,
  metaBold,
  metaMuted,
  imageUrl,
  active = false,
  badgeLabel,
  width = 284,
  mediaHeight = 180,
  onPress,
}: Props) {
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
      <View style={[styles.media, { height: mediaHeight }]}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

        <View style={styles.bottomScrim} pointerEvents="none" />

        {resolvedBadge ? (
          <View style={styles.badgeWrap}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{resolvedBadge}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.titleOverlay}>
          <Text style={styles.titleOnImage} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </View>

      <View style={styles.below}>
        <Text style={styles.belowBold} numberOfLines={1}>
          {metaBold}
        </Text>

        {!!metaMuted && (
          <Text style={styles.belowMuted} numberOfLines={1}>
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
    opacity: 0.93,
  },

  media: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: Colors.card,
  },

  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  bottomScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.22)",
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
    color: Colors.text,
    letterSpacing: -0.1,
  },

  titleOverlay: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
  },

  titleOnImage: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  below: {
    paddingTop: 12,
  },

  belowBold: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  belowMuted: {
    marginTop: 4,
    color: Colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
});
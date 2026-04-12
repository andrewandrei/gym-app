// components/ui/EditorialCard.tsx

import React from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/styles/colors";
import { BorderWidth } from "@/styles/hairline";
import { LinearGradient } from "expo-linear-gradient";

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
  width = 332,
  mediaHeight = 214,
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
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },

  media: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: Colors.card,

    ...(Platform.OS === "web"
      ? {
          boxShadow: "0px 6px 16px rgba(0,0,0,0.12)",
        }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        }),
  },

  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  bottomScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.32)",
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
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  below: {
    paddingTop: 10,
  },

  belowBold: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },

  belowMuted: {
    marginTop: 4,
    color: Colors.muted,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "600",
  },
});
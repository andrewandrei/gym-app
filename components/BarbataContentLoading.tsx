import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/providers/theme";

type Props = {
  title?: string;
  subtitle?: string;
  variant?: "feed" | "detail" | "compact";
};

export default function BarbataContentLoading({
  title = "Loading",
  subtitle = "Getting things ready.",
  variant = "detail",
}: Props) {
  const { colors, isDark } = useAppTheme();
  const pulse = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0.72,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    );

    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [pulse]);

  const styles = useMemo(() => createStyles(), []);
  const skeletonStyle = useMemo(
    () => ({
      backgroundColor: isDark ? "rgba(255,255,255,0.055)" : "rgba(17,17,17,0.05)",
      borderColor: colors.borderSubtle,
    }),
    [colors.borderSubtle, isDark],
  );

  if (variant === "compact") {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.wordmark, { color: colors.premium }]}>BARBATA</Text>
        <Text style={[styles.compactTitle, { color: colors.text }]}>{title}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.brandRow}>
        <Text style={[styles.wordmark, { color: colors.premium }]}>BARBATA</Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>

      <Animated.View style={[styles.skeletonWrap, { opacity: pulse }]}>
        {variant === "feed" ? (
          <FeedSkeleton skeletonStyle={skeletonStyle} />
        ) : (
          <DetailSkeleton skeletonStyle={skeletonStyle} />
        )}
      </Animated.View>
    </View>
  );
}

function FeedSkeleton({
  skeletonStyle,
}: {
  skeletonStyle: { backgroundColor: string; borderColor: string };
}) {
  const styles = useMemo(() => createStyles(), []);

  return (
    <View style={styles.feedSkeleton}>
      {[0, 1, 2].map((rail) => (
        <View key={rail} style={styles.feedRail}>
          <View
            style={[
              rail === 0 ? styles.feedHeaderWide : styles.feedHeader,
              skeletonStyle,
            ]}
          />
          <View style={styles.feedCardsRow}>
            <View style={[styles.feedCard, skeletonStyle]} />
            <View style={[styles.feedCard, skeletonStyle]} />
          </View>
        </View>
      ))}
    </View>
  );
}

function DetailSkeleton({
  skeletonStyle,
}: {
  skeletonStyle: { backgroundColor: string; borderColor: string };
}) {
  const styles = useMemo(() => createStyles(), []);

  return (
    <View style={styles.detailSkeleton}>
      <View style={[styles.detailHero, skeletonStyle]} />
      <View style={[styles.detailTitleLine, skeletonStyle]} />
      <View style={[styles.detailMetaLine, skeletonStyle]} />
      <View style={styles.detailStatsRow}>
        <View style={[styles.detailStat, skeletonStyle]} />
        <View style={[styles.detailStat, skeletonStyle]} />
        <View style={[styles.detailStat, skeletonStyle]} />
      </View>
      <View style={styles.detailList}>
        {[0, 1, 2].map((row) => (
          <View key={row} style={styles.detailRow}>
            <View style={[styles.detailThumb, skeletonStyle]} />
            <View style={styles.detailRowText}>
              <View style={[styles.detailRowTitle, skeletonStyle]} />
              <View style={[styles.detailRowMeta, skeletonStyle]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 72,
      paddingBottom: 32,
    },
    compactContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 18,
    },
    wordmark: {
      fontSize: 13,
      lineHeight: 13,
      fontWeight: "900",
      letterSpacing: 3,
    },
    title: {
      marginTop: 22,
      fontSize: 28,
      lineHeight: 31,
      fontWeight: "900",
      textAlign: "left",
    },
    compactTitle: {
      marginTop: 18,
      fontSize: 22,
      lineHeight: 25,
      fontWeight: "900",
      textAlign: "center",
    },
    subtitle: {
      marginTop: 6,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600",
    },
    skeletonWrap: {
      marginTop: 28,
      flex: 1,
    },
    feedSkeleton: {
      gap: 24,
    },
    feedRail: {
      gap: 12,
    },
    feedHeader: {
      width: 126,
      height: 16,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    feedHeaderWide: {
      width: 178,
      height: 16,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    feedCardsRow: {
      flexDirection: "row",
      gap: 14,
    },
    feedCard: {
      flex: 1,
      height: 178,
      borderRadius: 22,
      borderWidth: StyleSheet.hairlineWidth,
    },
    detailSkeleton: {
      gap: 14,
    },
    detailHero: {
      height: 236,
      borderRadius: 28,
      borderWidth: StyleSheet.hairlineWidth,
    },
    detailTitleLine: {
      width: "76%",
      height: 20,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    detailMetaLine: {
      width: "46%",
      height: 14,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    detailStatsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 4,
    },
    detailStat: {
      flex: 1,
      height: 64,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
    },
    detailList: {
      gap: 14,
      marginTop: 10,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    detailThumb: {
      width: 66,
      height: 66,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
    },
    detailRowText: {
      flex: 1,
      gap: 8,
    },
    detailRowTitle: {
      width: "72%",
      height: 15,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    detailRowMeta: {
      width: "42%",
      height: 12,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
  });
}

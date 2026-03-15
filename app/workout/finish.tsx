// app/workout/finish.tsx

import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import {
  Check,
  ChevronRight,
  Flame,
  Share2,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "@/app/_providers/theme";
import {
  type FinishFeedbackTone,
  type FinishSummary,
  getFinishFeedback,
} from "./finishFeedback";
import { clearWorkoutDraft } from "./workoutDraft";

function shortDuration(seconds: number) {
  const mins = Math.max(0, Math.round(seconds / 60));
  return `${mins} min`;
}

function formatVolume(value: number) {
  if (!value || value <= 0) return "—";
  if (value >= 1000) return `${Math.round(value).toLocaleString()}`;
  return `${Math.round(value)}`;
}

function toneColors(
  tone: FinishFeedbackTone,
  colors: { text: string; premium: string },
) {
  if (tone === "pr") {
    return {
      halo: "rgba(244,200,74,0.16)",
      chip: colors.premium,
      icon: colors.text,
    };
  }

  if (tone === "excellent") {
    return {
      halo: "rgba(34,197,94,0.10)",
      chip: "rgb(34,197,94)",
      icon: "#FFFFFF",
    };
  }

  if (tone === "solid" || tone === "volume") {
    return {
      halo: "rgba(244,200,74,0.12)",
      chip: colors.text,
      icon: "#FFFFFF",
    };
  }

  return {
    halo: "rgba(127,127,127,0.08)",
    chip: colors.text,
    icon: "#FFFFFF",
  };
}

function ToneIcon({ tone, color }: { tone: FinishFeedbackTone; color: string }) {
  if (tone === "pr") return <Trophy size={32} color={color} strokeWidth={2.4} />;
  if (tone === "excellent") return <Flame size={32} color={color} strokeWidth={2.4} />;
  if (tone === "volume") return <TrendingUp size={32} color={color} strokeWidth={2.4} />;
  return <Check size={32} color={color} strokeWidth={3} />;
}

export default function FinishScreen() {
  const params = useLocalSearchParams<{ summary?: string }>();
  const { colors, isDark } = useAppTheme();

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const summary = useMemo<FinishSummary | null>(() => {
    if (!params.summary) return null;
    try {
      return JSON.parse(String(params.summary)) as FinishSummary;
    } catch {
      return null;
    }
  }, [params.summary]);

  const feedback = useMemo(
    () => (summary ? getFinishFeedback(summary) : null),
    [summary],
  );

  const tone = toneColors(feedback?.tone ?? "default", colors);

  const heroScale = useRef(new Animated.Value(0.96)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    Animated.parallel([
      Animated.spring(heroScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 5,
      }),
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(cardsOpacity, {
        toValue: 1,
        duration: 320,
        delay: 110,
        useNativeDriver: true,
      }),
      Animated.timing(cardsY, {
        toValue: 0,
        duration: 320,
        delay: 110,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onViewProgress = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await clearWorkoutDraft();
    } catch {}

    router.replace("/progress");
  };

  const onBackHome = async () => {
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }

    try {
      await clearWorkoutDraft();
    } catch {}

    router.replace("/");
  };

  const onShare = async () => {
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
  };

  if (!summary || !feedback) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.fallbackWrap}>
          <Text style={styles.fallbackTitle}>Workout complete</Text>
          <Text style={styles.fallbackSub}>Missing summary payload.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.heroWrap,
            {
              opacity: heroOpacity,
              transform: [{ scale: heroScale }],
            },
          ]}
        >
          <View style={[styles.heroHalo, { backgroundColor: tone.halo }]}>
            <View style={[styles.heroChip, { backgroundColor: tone.chip }]}>
              <ToneIcon tone={feedback.tone} color={tone.icon} />
            </View>
          </View>

          <View style={styles.heroKickerRow}>
            <Sparkles size={16} color={colors.premium} />
            <Text style={styles.heroKicker}>{feedback.kicker}</Text>
          </View>

          <Text style={styles.heroTitle}>{feedback.title}</Text>
          <Text style={styles.heroBody}>{feedback.body}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.cardsWrap,
            {
              opacity: cardsOpacity,
              transform: [{ translateY: cardsY }],
            },
          ]}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryWorkoutTitle}>
              {summary.workoutTitle}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statTile}>
                <Text style={styles.statTileLabel}>Sets</Text>
                <Text style={styles.statTileValue}>
                  {summary.totals.completedSets}
                </Text>
              </View>

              <View style={styles.statTile}>
                <Text style={styles.statTileLabel}>Duration</Text>
                <Text style={styles.statTileValue}>
                  {shortDuration(summary.durationSec)}
                </Text>
              </View>

              <View style={styles.statTile}>
                <Text style={styles.statTileLabel}>Completion</Text>
                <Text style={styles.statTileValue}>
                  {Math.round(summary.insights.completionRate * 100)}%
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={onShare}
            style={({ pressed }) => [
              styles.shareButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Share2 size={16} color={colors.text} />
            <Text style={styles.shareButtonText}>Share workout</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={onViewProgress}
          style={({ pressed }) => [
            styles.primaryCta,
            pressed && { opacity: 0.92 },
          ]}
        >
          <Text style={styles.primaryCtaText}>View Progress</Text>
          <ChevronRight size={18} color={colors.surface} />
        </Pressable>

        <Pressable
          onPress={onBackHome}
          style={({ pressed }) => [
            styles.secondaryCta,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.secondaryCtaText}>Back Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: any, isDark: boolean) {
  const BORDER = colors.borderSubtle ?? colors.border;

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    scroll: { flex: 1 },

    content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 160 },

    heroWrap: { alignItems: "center", marginTop: 6 },

    heroHalo: {
      width: 118,
      height: 118,
      borderRadius: 59,
      alignItems: "center",
      justifyContent: "center",
    },

    heroChip: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
    },

    heroKickerRow: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    heroKicker: {
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 1.8,
      textTransform: "uppercase",
      color: colors.muted,
    },

    heroTitle: {
      marginTop: 10,
      fontSize: 29,
      lineHeight: 34,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.8,
      textAlign: "center",
    },

    heroBody: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 21,
      fontWeight: "700",
      color: colors.muted,
      textAlign: "center",
      paddingHorizontal: 12,
    },

    cardsWrap: { marginTop: 22 },

    summaryCard: {
      borderRadius: 22,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 16,
    },

    summaryWorkoutTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
    },

    statsRow: {
      marginTop: 16,
      flexDirection: "row",
      gap: 10,
    },

    statTile: {
      flex: 1,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: BORDER,
    },

    statTileLabel: {
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: colors.muted,
    },

    statTileValue: {
      marginTop: 8,
      fontSize: 20,
      fontWeight: "900",
      color: colors.text,
    },

    shareButton: {
      marginTop: 18,
      height: 48,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },

    shareButtonText: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
    },

    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 18,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: BORDER,
    },

    primaryCta: {
      height: 58,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },

    primaryCtaText: {
      color: colors.surface,
      fontWeight: "900",
      fontSize: 16,
    },

    secondaryCta: {
      marginTop: 10,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },

    secondaryCtaText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.muted,
    },

    fallbackWrap: {
      paddingHorizontal: 18,
      paddingTop: 14,
    },

    fallbackTitle: {
      fontSize: 24,
      fontWeight: "900",
      color: colors.text,
    },

    fallbackSub: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },
  });
}
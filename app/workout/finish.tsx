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
  colors: {
    text: string;
    premium: string;
  },
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

  if (tone === "partial" || tone === "log-load" || tone === "recovery") {
    return {
      halo: "rgba(127,127,127,0.08)",
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

function compareBadge(
  result?: "better" | "same" | "mixed" | "no_data",
  textColor?: string,
): {
  label: string;
  bg: string;
  text: string;
} | null {
  if (result === "better") {
    return {
      label: "Improved",
      bg: "rgba(34,197,94,0.10)",
      text: "rgb(23,120,65)",
    };
  }

  if (result === "same") {
    return {
      label: "Matched",
      bg: "rgba(244,200,74,0.18)",
      text: textColor ?? "#111111",
    };
  }

  if (result === "mixed") {
    return {
      label: "Mixed",
      bg: "rgba(127,127,127,0.10)",
      text: "rgba(127,127,127,0.92)",
    };
  }

  return null;
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
  }, [cardsOpacity, cardsY, heroOpacity, heroScale]);

  const onFallbackBack = async () => {
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }

    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

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

          <Pressable
            onPress={onFallbackBack}
            style={({ pressed }) => [styles.fallbackButton, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.fallbackButtonText}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const completedExercises = summary.exercises.filter((ex) => ex.sets.length > 0);
  const streakDays = 8;
  const programProgressDelta = "+1 session";
  const topWins = summary.wins.slice(0, 3);

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
            <Text style={styles.summaryWorkoutTitle} numberOfLines={2}>
              {summary.workoutTitle}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statTile}>
                <Text style={styles.statTileLabel}>Sets</Text>
                <Text style={styles.statTileValue}>{summary.totals.completedSets}</Text>
              </View>

              <View style={styles.statTile}>
                <Text style={styles.statTileLabel}>Duration</Text>
                <Text style={styles.statTileValue}>{shortDuration(summary.durationSec)}</Text>
              </View>

              <View style={styles.statTile}>
                <Text style={styles.statTileLabel}>Completion</Text>
                <Text style={styles.statTileValue}>
                  {Math.round(summary.insights.completionRate * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.statsRowBottom}>
              <View style={styles.statTile}>
                <Text style={styles.statTileLabel}>Volume</Text>
                <Text style={styles.statTileValue}>{formatVolume(summary.totals.totalVolume)}</Text>
              </View>

              <View style={styles.statTile}>
                <Text style={styles.statTileLabel}>Improved</Text>
                <Text style={styles.statTileValue}>
                  {summary.insights.improvedExerciseCount}
                </Text>
              </View>

              <View style={styles.statTile}>
                <Text style={styles.statTileLabel}>PRs</Text>
                <Text style={styles.statTileValue}>{summary.insights.prCount}</Text>
              </View>
            </View>
          </View>

          <View style={styles.secondaryCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapPremium}>
                <Flame size={18} color={colors.text} />
              </View>

              <View style={styles.infoTextCol}>
                <Text style={styles.infoTitle}>{streakDays} day streak</Text>
                <Text style={styles.infoSub}>
                  Momentum is building. Keep it alive tomorrow.
                </Text>
              </View>
            </View>

            <View style={styles.softDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapNeutral}>
                <Trophy size={18} color={colors.text} />
              </View>

              <View style={styles.infoTextCol}>
                <Text style={styles.infoTitle}>Progress updated</Text>
                <Text style={styles.infoSub}>
                  {programProgressDelta} added to your training history.
                </Text>
              </View>
            </View>

            {summary.prs.length > 0 && (
              <>
                <View style={styles.softDivider} />

                <View style={styles.prBlock}>
                  <Text style={styles.blockTitle}>
                    New PR{summary.prs.length === 1 ? "" : "s"}
                  </Text>

                  {summary.prs.map((item) => (
                    <View key={item.exerciseId} style={styles.prRow}>
                      <Text style={styles.prExercise} numberOfLines={1}>
                        {item.exerciseName}
                      </Text>

                      <Text style={styles.prValue}>
                        {item.weight} × {item.reps}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {topWins.length > 0 && (
            <View style={styles.secondaryCard}>
              <Text style={styles.blockTitle}>Session wins</Text>

              <View style={styles.winList}>
                {topWins.map((win, idx) => (
                  <View
                    key={`${win.exerciseId}-${win.type}-${idx}`}
                    style={styles.winRow}
                  >
                    <View style={styles.winIconWrap}>
                      <TrendingUp size={14} color={colors.text} />
                    </View>

                    <View style={styles.winTextCol}>
                      <Text style={styles.winTitle} numberOfLines={1}>
                        {win.exerciseName}
                      </Text>
                      <Text style={styles.winSub} numberOfLines={1}>
                        {win.label}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.completedBlock}>
            <Text style={styles.blockTitle}>Completed exercises</Text>

            <View style={styles.completedList}>
              {completedExercises.length ? (
                completedExercises.map((ex) => {
                  const badge = compareBadge(ex.comparedToLast?.result, colors.text);

                  return (
                    <View key={ex.id} style={styles.exerciseCard}>
                      <View style={styles.exerciseHeader}>
                        <View style={styles.exerciseHeaderLeft}>
                          <Text style={styles.exerciseName} numberOfLines={2}>
                            {ex.name}
                          </Text>

                          <View style={styles.exerciseBadgesRow}>
                            <View style={styles.badgeNeutral}>
                              <Text style={styles.badgeNeutralText}>
                                {ex.completedSets} set{ex.completedSets === 1 ? "" : "s"}
                              </Text>
                            </View>

                            {ex.sessionVolume > 0 && (
                              <View style={styles.badgePremiumSoft}>
                                <Text style={styles.badgePremiumSoftText}>
                                  Vol {formatVolume(ex.sessionVolume)}
                                </Text>
                              </View>
                            )}

                            {badge && (
                              <View
                                style={[
                                  styles.dynamicBadge,
                                  { backgroundColor: badge.bg },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.dynamicBadgeText,
                                    { color: badge.text },
                                  ]}
                                >
                                  {badge.label}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>

                      <View style={styles.setList}>
                        {ex.sets.map((s) => {
                          const weight = s.weight?.trim() ? s.weight : "0";
                          const reps = s.reps?.trim() ? s.reps : "0";

                          return (
                            <View
                              key={`${ex.id}-${s.set}`}
                              style={styles.setRow}
                            >
                              <Text style={styles.setLabel}>Set {s.set}</Text>

                              <View style={styles.setRight}>
                                <View style={styles.setDoneDot}>
                                  <Check size={12} color="#fff" strokeWidth={3} />
                                </View>

                                <Text style={styles.setValue}>
                                  {weight}{" "}
                                  {ex.unitLabel === "REPS"
                                    ? "reps"
                                    : ex.unitLabel.toLowerCase()}{" "}
                                  {ex.unitLabel === "REPS" ? "" : "× "}
                                  {reps}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>No completed sets yet.</Text>
              )}
            </View>
          </View>

          <Pressable
            onPress={onShare}
            style={({ pressed }) => [styles.shareButton, pressed && { opacity: 0.8 }]}
          >
            <Share2 size={16} color={colors.text} />
            <Text style={styles.shareButtonText}>Share workout</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={onViewProgress}
          style={({ pressed }) => [styles.primaryCta, pressed && { opacity: 0.92 }]}
        >
          <Text style={styles.primaryCtaText}>View Progress</Text>
          <ChevronRight size={18} color={colors.surface} />
        </Pressable>

        <Pressable
          onPress={onBackHome}
          style={({ pressed }) => [styles.secondaryCta, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.secondaryCtaText}>Back Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function createStyles(
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    borderSubtle: string;
    premium: string;
  },
  isDark: boolean,
) {
  const BORDER = colors.borderSubtle ?? colors.border;
  const SOFT = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.025)";
  const SOFT_2 = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 180,
    },

    heroWrap: {
      alignItems: "center",
      marginTop: 6,
    },

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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 18,
      elevation: 8,
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

    cardsWrap: {
      marginTop: 22,
    },

    summaryCard: {
      borderRadius: 22,
      backgroundColor: SOFT,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 16,
    },

    summaryWorkoutTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.3,
    },

    statsRow: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "stretch",
      gap: 10,
    },

    statsRowBottom: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "stretch",
      gap: 10,
    },

    statTile: {
      flex: 1,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
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
      letterSpacing: -0.4,
    },

    secondaryCard: {
      marginTop: 14,
      borderRadius: 22,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 16,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    infoIconWrapPremium: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(244,200,74,0.16)",
      alignItems: "center",
      justifyContent: "center",
    },

    infoIconWrapNeutral: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: SOFT_2,
      alignItems: "center",
      justifyContent: "center",
    },

    infoTextCol: {
      flex: 1,
    },

    infoTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    infoSub: {
      marginTop: 2,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },

    softDivider: {
      marginTop: 14,
      marginBottom: 14,
      height: 1,
      backgroundColor: BORDER,
    },

    prBlock: {
      gap: 10,
    },

    blockTitle: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.1,
      marginBottom: 10,
    },

    prRow: {
      borderRadius: 14,
      backgroundColor: "rgba(244,200,74,0.12)",
      paddingVertical: 12,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },

    prExercise: {
      flex: 1,
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
    },

    prValue: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.text,
    },

    winList: {
      gap: 10,
    },

    winRow: {
      borderRadius: 14,
      backgroundColor: SOFT,
      paddingVertical: 12,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    winIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "rgba(244,200,74,0.16)",
      alignItems: "center",
      justifyContent: "center",
    },

    winTextCol: {
      flex: 1,
    },

    winTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.1,
    },

    winSub: {
      marginTop: 2,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },

    completedBlock: {
      marginTop: 20,
    },

    completedList: {
      gap: 12,
    },

    exerciseCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: colors.surface,
      padding: 14,
    },

    exerciseHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },

    exerciseHeaderLeft: {
      flex: 1,
    },

    exerciseName: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },

    exerciseBadgesRow: {
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },

    badgeNeutral: {
      minWidth: 62,
      height: 28,
      borderRadius: 999,
      backgroundColor: SOFT_2,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },

    badgeNeutralText: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.2,
    },

    badgePremiumSoft: {
      minWidth: 72,
      height: 28,
      borderRadius: 999,
      backgroundColor: "rgba(244,200,74,0.12)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },

    badgePremiumSoftText: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: 0.2,
    },

    dynamicBadge: {
      minWidth: 74,
      height: 28,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },

    dynamicBadgeText: {
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.2,
    },

    setList: {
      marginTop: 12,
      gap: 10,
    },

    setRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    setLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.muted,
    },

    setRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    setDoneDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "rgb(34,197,94)",
      alignItems: "center",
      justifyContent: "center",
    },

    setValue: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.1,
    },

    emptyText: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
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
      letterSpacing: -0.1,
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
      letterSpacing: -0.2,
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
      letterSpacing: -0.5,
    },

    fallbackSub: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },

    fallbackButton: {
      marginTop: 16,
      height: 56,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    fallbackButtonText: {
      color: colors.surface,
      fontWeight: "900",
      fontSize: 16,
      letterSpacing: -0.2,
    },
  });
}
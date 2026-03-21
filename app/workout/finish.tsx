
//workout/finish.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/app/_providers/theme";
import { getFinishFeedback, type FinishSummary } from "./finishFeedback";

const FINISH_SUMMARY_STORAGE_KEY = "aa_fit_finish_summary";

type LegacyComparedToLast = {
  previousWeight?: number;
  previousReps?: number;
  previousVolume?: number;
  result: "better" | "same" | "mixed" | "no_data";
};

type SetComparison = {
  previous?: {
    weight?: number;
    reps?: number;
    volume?: number;
  };
  deltaVsPrevious?: {
    weight?: number;
    reps?: number;
    volume?: number;
  };
  best?: {
    weight?: number;
    reps?: number;
    volume?: number;
  };
  deltaVsBest?: {
    weight?: number;
    reps?: number;
    volume?: number;
  };
  state: "no_data" | "same" | "better" | "mixed" | "pr";
  isWeightPR: boolean;
  isRepPR: boolean;
  isVolumePR: boolean;
};

type RichFinishSummary = FinishSummary & {
  status?: "partial" | "completed";
  sessionId?: string;
  workoutId?: string;
  programId?: string;
  insights: FinishSummary["insights"] & {
    belowExerciseCount?: number;
    improvedSetCount?: number;
    matchedSetCount?: number;
    belowSetCount?: number;
    previousSessionFound?: boolean;
  };
  prs: Array<
    FinishSummary["prs"][number] & {
      set?: number;
      type?: "weight" | "reps" | "volume";
      previousBestValue?: number;
      currentValue?: number;
      delta?: number;
    }
  >;
  exercises: Array<
    FinishSummary["exercises"][number] & {
      comparedToBest?: {
        bestWeight?: number;
        bestReps?: number;
        bestVolume?: number;
        result: "better" | "same" | "mixed" | "no_data";
      };
      insights?: {
        improvedSets: number;
        matchedSets: number;
        belowSets: number;
        prCount: number;
      };
      sets: Array<
        FinishSummary["exercises"][number]["sets"][number] & {
          comparison?: SetComparison;
        }
      >;
    }
  >;
};

function formatNumber(value?: number | null) {
  if (value == null || Number.isNaN(value)) return null;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

function formatSigned(value?: number | null, suffix = "") {
  if (value == null || Number.isNaN(value) || value === 0) return null;
  const abs = Number.isInteger(value) ? String(Math.abs(value)) : Math.abs(value).toFixed(1);
  return `${value > 0 ? "+" : "-"}${abs}${suffix}`;
}

function getLegacySetDelta(
  set: { weight: string; reps: string; done: boolean },
  comparedToLast?: LegacyComparedToLast,
) {
  if (!comparedToLast || comparedToLast.result === "no_data") return null;

  const weightNow = Number(set.weight);
  const repsNow = Number(set.reps);

  const weightPrev = comparedToLast.previousWeight ?? 0;
  const repsPrev = comparedToLast.previousReps ?? 0;

  if (!weightNow && !repsNow) return null;

  const weightDiff = weightNow - weightPrev;
  const repsDiff = repsNow - repsPrev;

  if (weightDiff > 0) return `+${weightDiff} kg`;
  if (repsDiff > 0) return `+${repsDiff} reps`;
  if (weightDiff === 0 && repsDiff === 0) return "same";

  return null;
}

function getRichSetDelta(
  comparison?: SetComparison,
): {
  label: string | null;
  positive: boolean;
  pr: boolean;
} {
  if (!comparison) {
    return { label: null, positive: false, pr: false };
  }

  if (comparison.isWeightPR && comparison.deltaVsBest?.weight) {
    return {
      label: `PR +${formatNumber(comparison.deltaVsBest.weight)} kg`,
      positive: true,
      pr: true,
    };
  }

  if (comparison.isRepPR && comparison.deltaVsBest?.reps) {
    return {
      label: `PR +${formatNumber(comparison.deltaVsBest.reps)} reps`,
      positive: true,
      pr: true,
    };
  }

  if (comparison.isVolumePR && comparison.deltaVsBest?.volume) {
    return {
      label: `PR +${formatNumber(comparison.deltaVsBest.volume)} vol`,
      positive: true,
      pr: true,
    };
  }

  const weightText = formatSigned(comparison.deltaVsPrevious?.weight, " kg");
  const repsText = formatSigned(comparison.deltaVsPrevious?.reps, " reps");
  const volumeText = formatSigned(comparison.deltaVsPrevious?.volume, " vol");

  if (weightText) return { label: weightText, positive: weightText.startsWith("+"), pr: false };
  if (repsText) return { label: repsText, positive: repsText.startsWith("+"), pr: false };
  if (volumeText) return { label: volumeText, positive: volumeText.startsWith("+"), pr: false };

  if (comparison.state === "same") {
    return { label: "—", positive: false, pr: false };
  }

  return { label: null, positive: false, pr: false };
}

function getExerciseFooterText(ex: RichFinishSummary["exercises"][number], isNewPrExercise: boolean) {
  if (isNewPrExercise) return "New all-time best in this session";

  if (ex.insights) {
    if (ex.insights.improvedSets > 0 && ex.insights.belowSets === 0) {
      return "Improved vs last session";
    }
    if (ex.insights.matchedSets > 0 && ex.insights.improvedSets === 0 && ex.insights.belowSets === 0) {
      return "Matched last session";
    }
    if (ex.insights.belowSets > 0 || (ex.insights.improvedSets > 0 && ex.insights.belowSets > 0)) {
      return "Mixed compared with last session";
    }
  }

  if (ex.comparedToLast && ex.comparedToLast.result !== "no_data") {
    return ex.comparedToLast.result === "better"
      ? "Improved vs last session"
      : ex.comparedToLast.result === "same"
        ? "Matched last session"
        : "Mixed compared with last session";
  }

  return null;
}

function getExerciseStatus(completedSets: number, totalSets: number) {
  const isCompleted = completedSets === totalSets;
  const isPartial = completedSets > 0 && completedSets < totalSets;

  if (isCompleted) return "Completed";
  if (isPartial) return "Partial";
  return "Skipped";
}

export default function FinishScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionStatus?: string | string[];
  }>();
  const { colors, isDark } = useAppTheme();

  const sessionStatusParam = Array.isArray(params.sessionStatus)
    ? params.sessionStatus[0]
    : params.sessionStatus;

  const [summary, setSummary] = useState<RichFinishSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      try {
        const raw = await AsyncStorage.getItem(FINISH_SUMMARY_STORAGE_KEY);

        if (!mounted) return;

        if (!raw) {
          setSummary(null);
          setLoading(false);
          return;
        }

        try {
          const parsed = JSON.parse(raw) as RichFinishSummary;
          setSummary(parsed);
        } catch {
          setSummary(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSummary();

    return () => {
      mounted = false;
    };
  }, []);

  const feedback = useMemo(() => {
    if (!summary) return null;
    return getFinishFeedback(summary);
  }, [summary]);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Loading summary…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!summary || !feedback) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No workout summary found</Text>
          <Text style={styles.emptyBody}>
            This session summary could not be loaded.
          </Text>

          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const durationMin = Math.max(1, Math.round(summary.durationSec / 60));
  const isPartialSession =
    sessionStatusParam === "partial" || summary.status === "partial";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.eyebrow}>
            {isPartialSession ? "Partial session" : "Workout complete"}
          </Text>

          <Text style={styles.title}>{summary.workoutTitle}</Text>

          <Text style={styles.subtitle}>
            {durationMin} min • {summary.totals.completedSets}/{summary.totals.totalSets} sets
            {" • "}
            {summary.totals.completedExercises}/{summary.totals.totalExercises} exercises
          </Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Duration</Text>
            <Text style={styles.metricValue}>{durationMin} min</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Sets logged</Text>
            <Text style={styles.metricValue}>
              {summary.totals.completedSets}/{summary.totals.totalSets}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Exercises</Text>
            <Text style={styles.metricValue}>
              {summary.totals.completedExercises}/{summary.totals.totalExercises}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Completion</Text>
            <Text style={styles.metricValue}>
              {Math.round(summary.insights.completionRate * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.topCards}>
          {summary.prs.length > 0 && (
            <View style={styles.prCard}>
              <Text style={styles.cardEyebrow}>
                {summary.prs.length > 1 ? "New PRs" : "New PR"}
              </Text>

              {summary.prs.map((pr, index) => (
                <View key={`${pr.exerciseId}-${pr.type ?? "legacy"}-${pr.set ?? index}`} style={styles.prRow}>
                  <Text style={styles.prExercise}>{pr.exerciseName}</Text>
                  <Text style={styles.prValue}>
                    {pr.weight} × {pr.reps}
                    {typeof pr.set === "number" ? ` • Set ${pr.set}` : ""}
                    {pr.type ? ` • ${pr.type.toUpperCase()}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.feedbackCard}>
            <Text style={styles.cardEyebrow}>{feedback.kicker}</Text>
            <Text style={styles.feedbackTitle}>{feedback.title}</Text>
            <Text style={styles.feedbackBody}>{feedback.body}</Text>
          </View>
        </View>

        <View style={styles.exerciseList}>
          {summary.exercises.map((ex) => {
            const totalSets = ex.totalSetsPlanned;
            const completedSets = ex.completedSets;
            const statusLabel = getExerciseStatus(completedSets, totalSets);
            const isNewPrExercise = summary.prs.some((pr) => pr.exerciseId === ex.id);

            return (
              <View key={ex.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseHeaderLeft}>
                    <View style={styles.exerciseTitleRow}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>

                      {isNewPrExercise ? (
                        <View style={styles.prMiniBadge}>
                          <Text style={styles.prMiniBadgeText}>PR</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.exerciseMeta}>
                      {completedSets}/{totalSets} sets logged
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.exerciseBadge,
                      statusLabel === "Completed"
                        ? styles.exerciseBadgeCompleted
                        : statusLabel === "Partial"
                          ? styles.exerciseBadgePartial
                          : styles.exerciseBadgeSkipped,
                    ]}
                  >
                    {statusLabel}
                  </Text>
                </View>

                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.colSet]}>SET</Text>
                  <Text style={[styles.tableHeaderText, styles.colValue]}>WEIGHT</Text>
                  <Text style={[styles.tableHeaderText, styles.colValue]}>REPS</Text>
                  <Text style={[styles.tableHeaderText, styles.colDelta]}>VS LAST</Text>
                </View>

                {ex.sets.map((set) => {
                  const richDelta = getRichSetDelta(set.comparison);
                  const legacyDelta = getLegacySetDelta(set, ex.comparedToLast);

                  const label =
                    richDelta.label ??
                    (!set.done || !legacyDelta ? null : legacyDelta === "same" ? "—" : legacyDelta);

                  const isPositive =
                    richDelta.label != null
                      ? richDelta.positive
                      : !!label && label.startsWith("+");

                  const isPr = richDelta.pr;

                  return (
                    <View key={set.set} style={styles.setRow}>
                      <Text style={[styles.setCell, styles.colSet]}>S{set.set}</Text>

                      <Text style={[styles.setCell, styles.colValue]}>
                        {set.weight || "—"}
                      </Text>

                      <Text style={[styles.setCell, styles.colValue]}>
                        {set.reps || "—"}
                      </Text>

                      <Text
                        style={[
                          styles.deltaText,
                          styles.colDelta,
                          isPositive && styles.deltaPositive,
                          isPr && styles.deltaPr,
                        ]}
                        numberOfLines={1}
                      >
                        {!set.done || !label ? "" : label}
                      </Text>
                    </View>
                  );
                })}

                <View style={styles.exerciseFooter}>
                  {getExerciseFooterText(ex, isNewPrExercise) ? (
                    <Text
                      style={
                        isNewPrExercise
                          ? styles.exerciseFooterPrText
                          : styles.exerciseFooterText
                      }
                    >
                      {getExerciseFooterText(ex, isNewPrExercise)}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        <Pressable
          onPress={() => router.replace("/(tabs)/progress")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>View Progress</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          style={styles.secondaryLink}
        >
          <Text style={styles.secondaryLinkText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
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
  const soft = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const goldSoft = isDark ? "rgba(244,200,74,0.14)" : "rgba(244,200,74,0.16)";
  const goldSoftStrong = isDark ? "rgba(244,200,74,0.18)" : "rgba(244,200,74,0.22)";
  const greenSoft = isDark ? "rgba(34,197,94,0.16)" : "rgba(34,197,94,0.12)";
  const amberSoft = isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.12)";
  const graySoft = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
  const divider = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 40,
    },

    headerBlock: {
      marginTop: 4,
    },

    eyebrow: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },

    title: {
      marginTop: 8,
      fontSize: 28,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.5,
    },

    subtitle: {
      marginTop: 6,
      fontSize: 14,
      color: colors.muted,
      fontWeight: "600",
    },

    metricsGrid: {
      marginTop: 20,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    metricCard: {
      width: "47.5%",
      padding: 14,
      borderRadius: 18,
      backgroundColor: soft,
    },

    metricLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },

    metricValue: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
    },

    topCards: {
      marginTop: 20,
      gap: 12,
    },

    prCard: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: goldSoftStrong,
    },

    feedbackCard: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.card,
    },

    cardEyebrow: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },

    prRow: {
      marginTop: 8,
    },

    prExercise: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
    },

    prValue: {
      marginTop: 2,
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },

    feedbackTitle: {
      marginTop: 6,
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
      lineHeight: 24,
    },

    feedbackBody: {
      marginTop: 6,
      fontSize: 14,
      fontWeight: "600",
      color: colors.muted,
      lineHeight: 20,
    },

    exerciseList: {
      marginTop: 24,
      gap: 18,
    },

    exerciseCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
    },

    exerciseHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },

    exerciseHeaderLeft: {
      flex: 1,
    },

    exerciseTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },

    exerciseName: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.text,
    },

    exerciseMeta: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },

    prMiniBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: goldSoft,
    },

    prMiniBadgeText: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },

    exerciseBadge: {
      fontSize: 12,
      fontWeight: "800",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      overflow: "hidden",
    },

    exerciseBadgeCompleted: {
      color: "#22c55e",
      backgroundColor: greenSoft,
    },

    exerciseBadgePartial: {
      color: "#f59e0b",
      backgroundColor: amberSoft,
    },

    exerciseBadgeSkipped: {
      color: colors.muted,
      backgroundColor: graySoft,
    },

    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 14,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },

    tableHeaderText: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.5,
    },

    setRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },

    setCell: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.text,
    },

    colSet: {
      width: 44,
    },

    colValue: {
      flex: 1,
      textAlign: "left",
    },

    colDelta: {
      width: 96,
      textAlign: "right",
    },

    deltaText: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.muted,
    },

    deltaPositive: {
      color: "#22c55e",
    },

    deltaPr: {
      color: colors.premium,
    },

    exerciseFooter: {
      marginTop: 10,
      minHeight: 16,
    },

    exerciseFooterText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
    },

    exerciseFooterPrText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.text,
    },

    primaryButton: {
      marginTop: 24,
      height: 54,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    primaryButtonText: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.surface,
    },

    secondaryLink: {
      marginTop: 14,
      alignItems: "center",
    },

    secondaryLinkText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.muted,
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },

    emptyTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
      textAlign: "center",
    },

    emptyBody: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
      color: colors.muted,
      textAlign: "center",
      marginBottom: 20,
    },
  });
}
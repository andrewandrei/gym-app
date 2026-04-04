// app/workout/finish.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";
import { getFinishFeedback, type FinishSummary } from "../../features/workout/finishFeedback";
import { formatSecondsToClock, type TrackingMode } from "../../features/workout/workout.types";

const FINISH_SUMMARY_STORAGE_KEY = "aa_fit_finish_summary";

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
  exercises: Array<
    FinishSummary["exercises"][number] & {
      trackingMode?: TrackingMode;
      sets: Array<
        FinishSummary["exercises"][number]["sets"][number] & {
          comparison?: SetComparison;
        }
      >;
    }
  >;
};

function PRBadge({
  color,
  backgroundColor,
  borderColor,
}: {
  color: string;
  backgroundColor: string;
  borderColor: string;
}) {
  return (
    <View
      style={[
        stylesShared.prBadgeWrap,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <Svg width={10} height={10} viewBox="0 0 18 18">
        <Path
          d="M9 2L10.8 7H16L11.6 10.1L13.4 15L9 11.9L4.6 15L6.4 10.1L2 7H7.2L9 2Z"
          fill={color}
        />
      </Svg>
      <Text style={[stylesShared.prBadgeText, { color }]}>PR</Text>
    </View>
  );
}

const stylesShared = StyleSheet.create({
  prBadgeWrap: {
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  prBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});

function formatNumber(value?: number | null) {
  if (value == null || Number.isNaN(value)) return null;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

function formatSigned(value?: number | null, suffix = "") {
  if (value == null || Number.isNaN(value) || value === 0) return null;
  const abs = Number.isInteger(value)
    ? String(Math.abs(value))
    : Math.abs(value).toFixed(1);
  return `${value > 0 ? "+" : "-"}${abs}${suffix}`;
}

function getTrackingMode(ex: RichFinishSummary["exercises"][number]): TrackingMode {
  return ex.trackingMode ?? "weight_reps";
}

function getHeadersForMode(mode: TrackingMode) {
  if (mode === "time") return ["SET", "TIME", "REST", "STATUS"] as const;
  if (mode === "reps_only") return ["SET", "REPS", "REST", "STATUS"] as const;
  if (mode === "calories") return ["SET", "CAL", "REST", "STATUS"] as const;
  if (mode === "bodyweight_reps") return ["SET", "LOAD", "REPS", "VS LAST"] as const;
  return ["SET", "WEIGHT", "REPS", "VS LAST"] as const;
}

function getPrimaryValue(
  mode: TrackingMode,
  set: RichFinishSummary["exercises"][number]["sets"][number],
) {
  if (mode === "time") return formatSecondsToClock(set.weight) || "—";
  if (mode === "reps_only") return set.reps || "—";
  if (mode === "calories") return set.weight ? `${set.weight} cal` : "—";
  if (mode === "bodyweight_reps") return set.weight || "BW";
  return set.weight || "—";
}

function getSecondValue(
  mode: TrackingMode,
  set: RichFinishSummary["exercises"][number]["sets"][number],
) {
  if (mode === "time") return set.rest || "—";
  if (mode === "reps_only") return set.rest || "—";
  if (mode === "calories") return set.rest || "—";
  return set.reps || "—";
}

function getRichSetDelta(
  comparison?: SetComparison,
): {
  label: string | null;
  positive: boolean;
  pr: boolean;
} {
  if (!comparison) return { label: null, positive: false, pr: false };

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

  if (weightText) {
    return { label: weightText, positive: weightText.startsWith("+"), pr: false };
  }
  if (repsText) {
    return { label: repsText, positive: repsText.startsWith("+"), pr: false };
  }
  if (volumeText) {
    return { label: volumeText, positive: volumeText.startsWith("+"), pr: false };
  }
  if (comparison.state === "same") {
    return { label: "—", positive: false, pr: false };
  }

  return { label: null, positive: false, pr: false };
}

function getFourthValue(
  mode: TrackingMode,
  set: RichFinishSummary["exercises"][number]["sets"][number],
) {
  if (mode === "time" || mode === "reps_only" || mode === "calories") {
    return set.done ? "✓" : "";
  }

  return getRichSetDelta(set.comparison).label ?? "";
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
  const params = useLocalSearchParams<{ sessionStatus?: string | string[] }>();
  const { colors } = useAppTheme();

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

  const styles = useMemo(() => createStyles(colors), [colors]);

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
            {durationMin} min • {summary.totals.completedSets}/{summary.totals.totalSets} sets •{" "}
            {summary.totals.completedExercises}/{summary.totals.totalExercises} exercises
          </Text>
        </View>

        {summary.prs.length > 0 ? (
          <View style={styles.prCard}>
            <View style={styles.prCardHeader}>
              <Text style={styles.cardEyebrow}>
                {summary.prs.length > 1 ? "New PRs" : "New PR"}
              </Text>

              <PRBadge
                color={colors.premiumText}
                backgroundColor={colors.premiumSoft}
                borderColor={colors.premiumBorder}
              />
            </View>

            {summary.prs.map((pr, index) => (
              <View
                key={`${pr.exerciseId}-${pr.type ?? "legacy"}-${pr.set ?? index}`}
                style={styles.prRow}
              >
                <Text style={styles.prExercise}>{pr.exerciseName}</Text>
                <Text style={styles.prValue}>
                  {pr.weight} × {pr.reps}
                  {typeof pr.set === "number" ? ` • Set ${pr.set}` : ""}
                  {pr.type ? ` • ${pr.type.toUpperCase()}` : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.feedbackCard}>
          <Text style={styles.cardEyebrow}>{feedback.kicker}</Text>
          <Text style={styles.feedbackTitle}>{feedback.title}</Text>
          <Text style={styles.feedbackBody}>{feedback.body}</Text>
        </View>

        <View style={styles.exerciseList}>
          {summary.exercises.map((ex) => {
            const totalSets = ex.totalSetsPlanned;
            const completedSets = ex.completedSets;
            const statusLabel = getExerciseStatus(completedSets, totalSets);
            const isNewPrExercise = summary.prs.some((pr) => pr.exerciseId === ex.id);
            const mode = getTrackingMode(ex);
            const headers = getHeadersForMode(mode);
            const isStatusMode =
              mode === "time" || mode === "reps_only" || mode === "calories";

            return (
              <View key={ex.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseHeaderLeft}>
                    <View style={styles.exerciseTitleRow}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      {isNewPrExercise ? (
                        <PRBadge
                          color={colors.premiumText}
                          backgroundColor={colors.premiumSoft}
                          borderColor={colors.premiumBorder}
                        />
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
                  <Text style={[styles.tableHeaderText, styles.colSet]}>{headers[0]}</Text>
                  <Text style={[styles.tableHeaderText, styles.colValue]}>{headers[1]}</Text>
                  <Text style={[styles.tableHeaderText, styles.colValue]}>{headers[2]}</Text>
                  <Text style={[styles.tableHeaderText, styles.colDelta]}>{headers[3]}</Text>
                </View>

                {ex.sets.map((set) => {
                  const richDelta = getRichSetDelta(set.comparison);
                  const isPositive = richDelta.label != null ? richDelta.positive : false;
                  const isPr = richDelta.pr;

                  return (
                    <View key={set.set} style={styles.setRow}>
                      <Text style={[styles.setCell, styles.colSet]}>S{set.set}</Text>

                      <Text style={[styles.setCell, styles.colValue]}>
                        {getPrimaryValue(mode, set)}
                      </Text>

                      <Text style={[styles.setCell, styles.colValue]}>
                        {getSecondValue(mode, set)}
                      </Text>

                      <Text
                        style={[
                          styles.deltaText,
                          styles.colDelta,
                          !isStatusMode && isPositive && styles.deltaPositive,
                          !isStatusMode && isPr && styles.deltaPr,
                          isStatusMode && set.done && styles.deltaPositive,
                        ]}
                      >
                        {getFourthValue(mode, set)}
                      </Text>
                    </View>
                  );
                })}
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

        <Pressable onPress={() => router.replace("/(tabs)")} style={styles.secondaryLink}>
          <Text style={styles.secondaryLinkText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: {
  surface: string;
  background: string;
  text: string;
  muted: string;
  subtle: string;
  border: string;
  borderSubtle: string;
  borderStrong: string;
  hairline: string;
  fill: string;
  fillAlt: string;
  premium: string;
  danger: string;
  success: string;
  warning: string;
  ink: string;
  inkSoft: string;
  card: string;
  premiumSoft: string;
  premiumBorder: string;
  premiumText: string;
  successSoft: string;
  successBorder: string;
  successText: string;
}) {
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
    prCard: {
      marginTop: 20,
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.premiumSoft,
      borderWidth: BorderWidth.default,
      borderColor: colors.premiumBorder,
    },
    prCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 4,
    },
    feedbackCard: {
      marginTop: 12,
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
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
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
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
    exerciseBadge: {
      fontSize: 12,
      fontWeight: "800",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: BorderWidth.default,
    },
    exerciseBadgeCompleted: {
      color: colors.successText,
      backgroundColor: colors.successSoft,
      borderColor: colors.successBorder,
    },
    exerciseBadgePartial: {
      color: colors.warningText,
      backgroundColor: colors.warningSoft,
      borderColor: colors.warningBorder,
    },
    exerciseBadgeSkipped: {
      color: colors.muted,
      backgroundColor: colors.fillAlt,
      borderColor: colors.borderSubtle,
    },
    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 14,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.hairline,
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
      borderBottomColor: colors.hairline,
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
      color: colors.successText,
    },
    deltaPr: {
      color: colors.premiumText,
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
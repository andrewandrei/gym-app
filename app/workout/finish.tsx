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
  Text,
  View,
} from "react-native";

import { Colors } from "@/styles/colors";
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

function toneColors(tone: FinishFeedbackTone) {
  if (tone === "pr") {
    return {
      halo: "rgba(244,200,74,0.16)",
      chip: (Colors as any).premium ?? "#F4C84A",
      icon: Colors.text,
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
      chip: Colors.text,
      icon: "#FFFFFF",
    };
  }

  if (tone === "partial" || tone === "log-load" || tone === "recovery") {
    return {
      halo: "rgba(0,0,0,0.05)",
      chip: Colors.text,
      icon: "#FFFFFF",
    };
  }

  return {
    halo: "rgba(0,0,0,0.05)",
    chip: Colors.text,
    icon: "#FFFFFF",
  };
}

function ToneIcon({ tone, color }: { tone: FinishFeedbackTone; color: string }) {
  if (tone === "pr") return <Trophy size={30} color={color} strokeWidth={2.4} />;
  if (tone === "excellent") return <Flame size={30} color={color} strokeWidth={2.4} />;
  if (tone === "volume") return <TrendingUp size={30} color={color} strokeWidth={2.4} />;
  return <Check size={30} color={color} strokeWidth={3} />;
}

function compareBadge(
  result?: "better" | "same" | "mixed" | "no_data",
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
      text: Colors.text,
    };
  }

  if (result === "mixed") {
    return {
      label: "Mixed",
      bg: "rgba(0,0,0,0.05)",
      text: "rgba(0,0,0,0.68)",
    };
  }

  return null;
}

function getExerciseTopSet(exercise: FinishSummary["exercises"][number]) {
  const usableSets = exercise.sets.filter((s) => s.done);

  if (!usableSets.length) return null;

  let best = usableSets[0];
  let bestWeight = Number(best.weight || 0);
  let bestReps = Number(best.reps || 0);

  usableSets.forEach((set) => {
    const weight = Number(set.weight || 0);
    const reps = Number(set.reps || 0);

    if (weight > bestWeight || (weight === bestWeight && reps > bestReps)) {
      best = set;
      bestWeight = weight;
      bestReps = reps;
    }
  });

  return {
    weight: bestWeight,
    reps: bestReps,
  };
}

function formatTopSetLine(
  exercise: FinishSummary["exercises"][number] & { unitLabel?: string },
  topSet: { weight: number; reps: number } | null,
) {
  if (!topSet) return "No load data";

  if (exercise.unitLabel === "REPS") {
    return `${topSet.reps} reps`;
  }

  const unit = exercise.unitLabel ? exercise.unitLabel.toLowerCase() : "lb";
  return `${topSet.weight} ${unit} × ${topSet.reps}`;
}

function getPreviousComparisonLine(
  exercise: FinishSummary["exercises"][number] & {
    comparedToLast?: {
      result?: "better" | "same" | "mixed" | "no_data";
      previousBestWeight?: number;
      previousBestReps?: number;
      previousVolume?: number;
      volumeDeltaPct?: number;
    };
    unitLabel?: string;
  },
) {
  const comparison = exercise.comparedToLast;
  if (!comparison) return null;

  const unit = exercise.unitLabel ? exercise.unitLabel.toLowerCase() : "lb";

  if (
    typeof comparison.previousBestWeight === "number" &&
    typeof comparison.previousBestReps === "number"
  ) {
    if (exercise.unitLabel === "REPS") {
      return `${comparison.previousBestReps} reps`;
    }

    return `${comparison.previousBestWeight} ${unit} × ${comparison.previousBestReps}`;
  }

  if (typeof comparison.previousVolume === "number" && comparison.previousVolume > 0) {
    return `Vol ${formatVolume(comparison.previousVolume)}`;
  }

  return null;
}

function getDeltaPresentation(
  exercise: FinishSummary["exercises"][number] & {
    comparedToLast?: {
      volumeDeltaPct?: number;
      result?: "better" | "same" | "mixed" | "no_data";
    };
  },
) {
  const badge = compareBadge(exercise.comparedToLast?.result);
  const volumeDeltaPct = exercise.comparedToLast?.volumeDeltaPct;

  if (typeof volumeDeltaPct === "number" && Number.isFinite(volumeDeltaPct)) {
    const rounded = Math.round(volumeDeltaPct);

    if (rounded > 0) {
      return {
        label: `+${rounded}% vol`,
        bg: "rgba(34,197,94,0.10)",
        text: "rgb(23,120,65)",
      };
    }

    if (rounded < 0) {
      return {
        label: `${rounded}% vol`,
        bg: "rgba(0,0,0,0.05)",
        text: "rgba(0,0,0,0.68)",
      };
    }

    return {
      label: "Vol even",
      bg: "rgba(0,0,0,0.05)",
      text: "rgba(0,0,0,0.68)",
    };
  }

  if (badge) {
    return {
      label: badge.label,
      bg: badge.bg,
      text: badge.text,
    };
  }

  return null;
}

function StatCell({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 88,
        borderRadius: 18,
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 12,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
        justifyContent: "flex-start",
      }}
    >
      <Text
        style={{
          minHeight: 18,
          fontSize: 9,
          lineHeight: 11,
          fontWeight: "900",
          letterSpacing: 1.0,
          textTransform: "uppercase",
          color: "rgba(0,0,0,0.38)",
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.9}
      >
        {label}
      </Text>

      <Text
        style={{
          marginTop: 9,
          fontSize: 17,
          lineHeight: 20,
          fontWeight: "900",
          color: Colors.text,
          letterSpacing: -0.35,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
      >
        {value}
      </Text>
    </View>
  );
}

export default function FinishScreen() {
  const params = useLocalSearchParams<{ summary?: string }>();

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

  const tone = toneColors(feedback?.tone ?? "default");

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

    router.replace({
      pathname: "/progress",
      params: {
        updated: "1",
        title: summary?.workoutTitle ?? "Workout",
      },
    });
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
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "900",
              color: Colors.text,
              letterSpacing: -0.5,
            }}
          >
            Workout complete
          </Text>

          <Text
            style={{
              marginTop: 6,
              fontSize: 13,
              fontWeight: "700",
              color: Colors.muted,
            }}
          >
            Missing summary payload.
          </Text>

          <Pressable
            onPress={onFallbackBack}
            style={({ pressed }) => [
              {
                marginTop: 16,
                height: 56,
                borderRadius: 999,
                backgroundColor: Colors.text,
                alignItems: "center",
                justifyContent: "center",
              },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text
              style={{
                color: Colors.surface,
                fontWeight: "900",
                fontSize: 16,
                letterSpacing: -0.2,
              }}
            >
              Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const completedExercises = summary.exercises.filter((ex) => ex.sets.length > 0);
  const streakDays = 8; // demo
  const programProgressDelta = "+1 session"; // demo
  const topWins = summary.wins.slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.surface }}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 180,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: heroOpacity,
            transform: [{ scale: heroScale }],
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <View
            style={{
              width: 108,
              height: 108,
              borderRadius: 54,
              backgroundColor: tone.halo,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 74,
                height: 74,
                borderRadius: 37,
                backgroundColor: tone.chip,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 7,
              }}
            >
              <ToneIcon tone={feedback.tone} color={tone.icon} />
            </View>
          </View>

          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Sparkles size={15} color={(Colors as any).premium ?? "#F4C84A"} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "900",
                letterSpacing: 1.45,
                textTransform: "uppercase",
                color: "rgba(0,0,0,0.42)",
              }}
            >
              {feedback.kicker}
            </Text>
          </View>

          <Text
            style={{
              marginTop: 10,
              fontSize: 28,
              lineHeight: 33,
              fontWeight: "900",
              color: Colors.text,
              letterSpacing: -0.75,
              textAlign: "center",
            }}
          >
            {feedback.title}
          </Text>

          <Text
            style={{
              marginTop: 8,
              fontSize: 15,
              lineHeight: 21,
              fontWeight: "700",
              color: Colors.muted,
              textAlign: "center",
              paddingHorizontal: 12,
            }}
          >
            {feedback.body}
          </Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: cardsOpacity,
            transform: [{ translateY: cardsY }],
            marginTop: 22,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 18,
                lineHeight: 23,
                fontWeight: "900",
                color: Colors.text,
                letterSpacing: -0.35,
              }}
              numberOfLines={2}
            >
              {summary.workoutTitle}
            </Text>

            <View
              style={{
                marginTop: 10,
                borderRadius: 22,
                backgroundColor: "rgba(0,0,0,0.022)",
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.08)",
                padding: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "stretch",
                  gap: 10,
                }}
              >
                <StatCell label="Sets" value={summary.totals.completedSets} />
                <StatCell label="Duration" value={shortDuration(summary.durationSec)} />
                <StatCell
                  label="Complete"
                  value={`${Math.round(summary.insights.completionRate * 100)}%`}
                />
              </View>

              <View
                style={{
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "stretch",
                  gap: 10,
                }}
              >
                <StatCell label="Volume" value={formatVolume(summary.totals.totalVolume)} />
                <StatCell label="Improved" value={summary.insights.improvedExerciseCount} />
                <StatCell label="PRs" value={summary.insights.prCount} />
              </View>
            </View>
          </View>

          <View
            style={{
              marginTop: 14,
              borderRadius: 22,
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.08)",
              padding: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(244,200,74,0.16)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Flame size={17} color={Colors.text} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "900",
                    color: Colors.text,
                    letterSpacing: -0.2,
                  }}
                >
                  {streakDays} day streak
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 13,
                    lineHeight: 18,
                    fontWeight: "700",
                    color: Colors.muted,
                  }}
                >
                  Momentum is building. Keep it alive tomorrow.
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 14,
                height: 1,
                backgroundColor: "rgba(0,0,0,0.06)",
              }}
            />

            <View
              style={{
                marginTop: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(0,0,0,0.04)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trophy size={17} color={Colors.text} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "900",
                    color: Colors.text,
                    letterSpacing: -0.2,
                  }}
                >
                  Progress updated
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 13,
                    lineHeight: 18,
                    fontWeight: "700",
                    color: Colors.muted,
                  }}
                >
                  {programProgressDelta} added to your training history.
                </Text>
              </View>
            </View>

            {summary.prs.length > 0 && (
              <>
                <View
                  style={{
                    marginTop: 14,
                    height: 1,
                    backgroundColor: "rgba(0,0,0,0.06)",
                  }}
                />

                <View style={{ marginTop: 14, gap: 10 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "rgba(0,0,0,0.54)",
                      letterSpacing: 0.25,
                      textTransform: "uppercase",
                    }}
                  >
                    New PR{summary.prs.length === 1 ? "" : "s"}
                  </Text>

                  {summary.prs.map((item) => (
                    <View
                      key={item.exerciseId}
                      style={{
                        borderRadius: 14,
                        backgroundColor: "rgba(244,200,74,0.12)",
                        paddingVertical: 11,
                        paddingHorizontal: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 14,
                          fontWeight: "900",
                          color: Colors.text,
                          letterSpacing: -0.1,
                        }}
                        numberOfLines={1}
                      >
                        {item.exerciseName}
                      </Text>

                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "900",
                          color: Colors.text,
                          letterSpacing: -0.08,
                        }}
                      >
                        {item.weight} × {item.reps}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {topWins.length > 0 && (
            <View
              style={{
                marginTop: 16,
                borderRadius: 18,
                backgroundColor: "rgba(0,0,0,0.018)",
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.05)",
                padding: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: "rgba(0,0,0,0.46)",
                  letterSpacing: 0.2,
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Session wins
              </Text>

              <View style={{ gap: 8 }}>
                {topWins.map((win, idx) => (
                  <View
                    key={`${win.exerciseId}-${win.type}-${idx}`}
                    style={{
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.72)",
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "rgba(244,200,74,0.12)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TrendingUp size={12} color={Colors.text} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "800",
                          color: Colors.text,
                          letterSpacing: -0.08,
                        }}
                        numberOfLines={1}
                      >
                        {win.exerciseName}
                      </Text>
                      <Text
                        style={{
                          marginTop: 1,
                          fontSize: 12,
                          lineHeight: 16,
                          fontWeight: "700",
                          color: "rgba(0,0,0,0.52)",
                        }}
                        numberOfLines={1}
                      >
                        {win.label}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ marginTop: 26 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "900",
                color: Colors.text,
                letterSpacing: -0.18,
                marginBottom: 12,
              }}
            >
              Completed exercises
            </Text>

            <View style={{ gap: 14 }}>
              {completedExercises.length ? (
                completedExercises.map((ex) => {
                  const badge = compareBadge(ex.comparedToLast?.result);
                  const topSet = getExerciseTopSet(ex);
                  const previousLine = getPreviousComparisonLine(ex);
                  const todayLine = formatTopSetLine(ex, topSet);
                  const delta = getDeltaPresentation(ex);
                  const isExercisePr = summary.prs.some((pr) => pr.exerciseId === ex.id);

                  return (
                    <View
                      key={ex.id}
                      style={{
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.08)",
                        backgroundColor: Colors.surface,
                        padding: 16,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 16,
                              lineHeight: 21,
                              fontWeight: "900",
                              color: Colors.text,
                              letterSpacing: -0.2,
                            }}
                            numberOfLines={2}
                          >
                            {ex.name}
                          </Text>

                          <View
                            style={{
                              marginTop: 10,
                              flexDirection: "row",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            <View
                              style={{
                                height: 28,
                                borderRadius: 999,
                                backgroundColor: "rgba(0,0,0,0.045)",
                                paddingHorizontal: 10,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: "900",
                                  color: "rgba(0,0,0,0.56)",
                                  letterSpacing: 0.12,
                                }}
                              >
                                {ex.completedSets} set{ex.completedSets === 1 ? "" : "s"}
                              </Text>
                            </View>

                            {ex.sessionVolume > 0 && (
                              <View
                                style={{
                                  height: 28,
                                  borderRadius: 999,
                                  backgroundColor: "rgba(244,200,74,0.12)",
                                  paddingHorizontal: 10,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 11,
                                    fontWeight: "900",
                                    color: Colors.text,
                                    letterSpacing: 0.12,
                                  }}
                                >
                                  Vol {formatVolume(ex.sessionVolume)}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {badge && (
                          <View
                            style={{
                              minWidth: 82,
                              height: 30,
                              borderRadius: 999,
                              backgroundColor: badge.bg,
                              paddingHorizontal: 12,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: "900",
                                color: badge.text,
                                letterSpacing: 0.12,
                              }}
                            >
                              {badge.label}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View
                        style={{
                          marginTop: 14,
                          borderRadius: 16,
                          backgroundColor: "rgba(0,0,0,0.03)",
                          paddingVertical: 12,
                          paddingHorizontal: 12,
                          gap: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: "800",
                                color: "rgba(0,0,0,0.45)",
                                letterSpacing: 0.1,
                                textTransform: "uppercase",
                              }}
                            >
                              Previous
                            </Text>
                            <Text
                              style={{
                                marginTop: 3,
                                fontSize: 13,
                                fontWeight: "800",
                                color: "rgba(0,0,0,0.72)",
                                letterSpacing: -0.08,
                              }}
                              numberOfLines={1}
                            >
                              {previousLine ?? "No previous data"}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={{
                            height: 1,
                            backgroundColor: "rgba(0,0,0,0.05)",
                          }}
                        />

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: "800",
                                color: "rgba(0,0,0,0.45)",
                                letterSpacing: 0.1,
                                textTransform: "uppercase",
                              }}
                            >
                              Today
                            </Text>
                            <Text
                              style={{
                                marginTop: 3,
                                fontSize: 14,
                                fontWeight: "900",
                                color: Colors.text,
                                letterSpacing: -0.1,
                              }}
                              numberOfLines={1}
                            >
                              {todayLine}
                            </Text>
                          </View>

                          {delta ? (
                            <View
                              style={{
                                minWidth: 76,
                                height: 28,
                                borderRadius: 999,
                                backgroundColor: delta.bg,
                                paddingHorizontal: 10,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: "900",
                                  color: delta.text,
                                  letterSpacing: 0.08,
                                }}
                              >
                                {delta.label}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>

                      {isExercisePr ? (
                        <View
                          style={{
                            marginTop: 12,
                            borderRadius: 14,
                            backgroundColor: "rgba(244,200,74,0.12)",
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                              flex: 1,
                            }}
                          >
                            <Trophy size={14} color={Colors.text} />
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: "900",
                                color: Colors.text,
                                letterSpacing: -0.08,
                              }}
                            >
                              New PR
                            </Text>
                          </View>

                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "900",
                              color: Colors.text,
                              letterSpacing: -0.08,
                            }}
                            numberOfLines={1}
                          >
                            {todayLine}
                          </Text>
                        </View>
                      ) : null}

                      <View
                        style={{
                          marginTop: 14,
                          borderRadius: 16,
                          overflow: "hidden",
                          borderWidth: 1,
                          borderColor: "rgba(0,0,0,0.06)",
                          backgroundColor: "rgba(0,0,0,0.015)",
                        }}
                      >
                        {ex.sets.map((s, idx) => {
                          const weight = s.weight?.trim() ? s.weight : "0";
                          const reps = s.reps?.trim() ? s.reps : "0";
                          const isRepOnly = ex.unitLabel === "REPS";
                          const unit = ex.unitLabel ? ex.unitLabel.toLowerCase() : "lb";

                          return (
                            <View key={`${ex.id}-${s.set}`}>
                              <View
                                style={{
                                  minHeight: 46,
                                  paddingHorizontal: 12,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 12,
                                }}
                              >
                                <Text
                                  style={{
                                    width: 46,
                                    fontSize: 12,
                                    fontWeight: "800",
                                    color: "rgba(0,0,0,0.48)",
                                  }}
                                >
                                  Set {s.set}
                                </Text>

                                <Text
                                  style={{
                                    flex: 1,
                                    textAlign: "right",
                                    fontSize: 13,
                                    fontWeight: "900",
                                    color: Colors.text,
                                    letterSpacing: -0.08,
                                  }}
                                  numberOfLines={1}
                                >
                                  {isRepOnly ? `${reps} reps` : `${weight} ${unit} × ${reps}`}
                                </Text>

                                <View
                                  style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 9,
                                    backgroundColor: "rgb(34,197,94)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Check size={12} color="#fff" strokeWidth={3} />
                                </View>
                              </View>

                              {idx !== ex.sets.length - 1 ? (
                                <View
                                  style={{
                                    height: 1,
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                    marginLeft: 12,
                                    marginRight: 12,
                                  }}
                                />
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    fontWeight: "700",
                    color: Colors.muted,
                  }}
                >
                  No completed sets yet.
                </Text>
              )}
            </View>
          </View>

          <Pressable
            onPress={onShare}
            style={({ pressed }) => [
              {
                marginTop: 20,
                height: 46,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.09)",
                backgroundColor: Colors.surface,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Share2 size={15} color={Colors.text} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "900",
                color: Colors.text,
                letterSpacing: -0.1,
              }}
            >
              Share workout
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 18,
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.08)",
        }}
      >
        <Pressable
          onPress={onViewProgress}
          style={({ pressed }) => [
            {
              height: 58,
              borderRadius: 999,
              backgroundColor: Colors.text,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
            },
            pressed && { opacity: 0.92 },
          ]}
        >
          <Text
            style={{
              color: Colors.surface,
              fontWeight: "900",
              fontSize: 16,
              letterSpacing: -0.2,
            }}
          >
            View Progress
          </Text>
          <ChevronRight size={18} color={Colors.surface} />
        </Pressable>

        <Pressable
          onPress={onBackHome}
          style={({ pressed }) => [
            {
              marginTop: 10,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "800",
              color: "rgba(0,0,0,0.55)",
            }}
          >
            Back Home
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
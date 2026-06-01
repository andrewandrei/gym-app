import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Check, ChevronLeft, Info, Lock } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import BarbataContentLoading from "@/components/BarbataContentLoading";
import { PressableScale } from "@/components/ui/PressableScale";
import {
  getProgramBySlug,
  type SupabaseProgram,
  type SupabaseProgramWorkout,
} from "@/features/programs/programs.supabase";
import {
  getProgramSessionSkips,
  skipProgramSession,
  type ProgramSessionSkip,
} from "@/features/programs/programSessionState";
import { useEntitlements } from "@/providers/entitlements";
import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";
import {
  getWorkoutHistory,
  type WorkoutHistoryEntry,
} from "../../../features/workout/workoutHistory";

type WorkoutStatus =
  | "partial"
  | "due"
  | "missed"
  | "done"
  | "skipped"
  | "upcoming"
  | "available"
  | "locked";

type ProgramWeek = {
  id: string;
  label: string;
};

type Workout = {
  kind: "workout";
  id: string;
  routeWorkoutId: string;
  label: string;
  title: string;
  meta: string;
  duration: string;
  image: string;
  status: WorkoutStatus;
  access: SupabaseProgramWorkout["access"];
  orderIndex: number;
  weekNumber: number;
  dayNumber: number;
};

type RestDay = {
  kind: "rest";
  id: string;
  label: string;
  title: string;
  meta: string;
  weekNumber: number;
  dayNumber: number;
};

type ProgramScheduleDay = Workout | RestDay;

function buildProgramWeeks(program: SupabaseProgram | null): ProgramWeek[] {
  if (!program) return [];

  const weekCount =
    program.durationWeeks ??
    Math.max(1, ...program.workouts.map((workout) => workout.weekNumber));

  return Array.from({ length: weekCount }).map((_, index) => ({
    id: `${program.slug}-week-${index + 1}`,
    label: `Week ${index + 1}`,
  }));
}

function buildRouteWorkoutId(
  programSlug: string,
  workout: SupabaseProgramWorkout,
) {
  return `${programSlug}-week-${workout.weekNumber}-workout-${workout.dayNumber}`;
}

function getWorkoutStatus({
  programSlug,
  workout,
  history,
  skips,
  isPro,
  freeWorkoutCount,
  programMeterEnabled,
}: {
  programSlug: string;
  workout: SupabaseProgramWorkout;
  history: WorkoutHistoryEntry[];
  skips: ProgramSessionSkip[];
  isPro: boolean;
  freeWorkoutCount: number;
  programMeterEnabled: boolean;
}): WorkoutStatus {
  const routeWorkoutId = buildRouteWorkoutId(programSlug, workout);
  const historyStatus = getWorkoutHistoryStatus(programSlug, workout, history);

  if (historyStatus === "done") return "done";
  if (historyStatus === "partial") return "partial";

  if (
    skips.some(
      (item) => item.programId === programSlug && item.workoutId === routeWorkoutId,
    )
  ) {
    return "skipped";
  }

  if (isPro) return "available";

  if (workout.access === "free") return "available";

  if (workout.access === "program_metered") {
    if (!programMeterEnabled) return "available";
    return workout.orderIndex <= freeWorkoutCount ? "available" : "locked";
  }

  return "locked";
}

function getIsoWeekday(date = new Date()) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function getWorkoutHistoryStatus(
  programSlug: string,
  workout: SupabaseProgramWorkout,
  history: WorkoutHistoryEntry[],
): "partial" | "done" | null {
  const routeWorkoutId = buildRouteWorkoutId(programSlug, workout);
  const entries = history.filter(
    (entry) =>
      entry.workoutId === routeWorkoutId ||
      (entry.programId === programSlug && entry.workoutTitle === workout.title),
  );

  if (entries.some((entry) => entry.status === "completed")) return "done";
  if (entries.some((entry) => entry.status === "partial")) return "partial";
  return null;
}

function buildWorkoutMeta(workout: SupabaseProgramWorkout) {
  return workout.subtitle || "Program workout";
}

function buildWorkoutDuration(workout: SupabaseProgramWorkout) {
  if (!workout.estimatedDurationMin) return "";
  return `${workout.estimatedDurationMin} min`;
}

function buildProgramBullets(program: SupabaseProgram): string[] {
  const bullets = [
    program.description,
    program.goal ? `Goal: ${program.goal}` : "",
    program.equipment ? `Equipment: ${program.equipment}` : "",
    program.level ? `Level: ${program.level}` : "",
  ].filter(Boolean);

  if (bullets.length) return bullets;

  return [
    "Structured weekly progression.",
    "Designed for consistent training and measurable progress.",
    "Workout access is controlled from Supabase.",
  ];
}

export default function ProgramDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height: screenHeight } = useWindowDimensions();
  const { colors, isDark } = useAppTheme();
  const { isPro } = useEntitlements();

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [program, setProgram] = useState<SupabaseProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [programSkips, setProgramSkips] = useState<ProgramSessionSkip[]>([]);

  const weeksScrollRef = useRef<ScrollView | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const freeWorkoutCount = program?.freeWorkoutCount ?? 4;
  const programMeterEnabled = program?.programMeterEnabled ?? true;

  useEffect(() => {
    let mounted = true;

    async function loadProgram() {
      const slug = id || "strength-foundations";
      const nextProgram = await getProgramBySlug(slug);

      if (!mounted) return;

      setProgram(nextProgram);
      setLoading(false);
    }

    loadProgram();

    return () => {
      mounted = false;
    };
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadSessionState() {
        const [nextHistory, nextSkips] = await Promise.all([
          getWorkoutHistory(),
          getProgramSessionSkips(),
        ]);

        if (!active) return;

        setHistory(nextHistory);
        setProgramSkips(nextSkips);
      }

      void loadSessionState();

      return () => {
        active = false;
      };
    }, []),
  );

  const weeks = useMemo(() => buildProgramWeeks(program), [program]);

  const bullets = useMemo(
    () => (program ? buildProgramBullets(program) : []),
    [program],
  );

  const heroHeight = Math.max(300, Math.round(screenHeight * 0.34));

  const overscroll = scrollY.interpolate({
    inputRange: [-220, 0],
    outputRange: [220, 0],
    extrapolate: "clamp",
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, heroHeight],
    outputRange: [0, -heroHeight * 0.08],
    extrapolate: "clamp",
  });

  const heroMediaHeight = Animated.add(overscroll, heroHeight);

  const backButtonOpacity = scrollY.interpolate({
    inputRange: [0, heroHeight * 0.45, heroHeight * 0.65],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });

  const backButtonTranslateY = scrollY.interpolate({
    inputRange: [0, heroHeight * 0.65],
    outputRange: [0, -12],
    extrapolate: "clamp",
  });

  const floatingHeaderOpacity = scrollY.interpolate({
    inputRange: [heroHeight * 0.5, heroHeight * 0.72],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const floatingHeaderTranslateY = scrollY.interpolate({
    inputRange: [heroHeight * 0.5, heroHeight * 0.72],
    outputRange: [-8, 0],
    extrapolate: "clamp",
  });

  const isDarkSoft = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
  const isDarkSoftStronger = isDark
    ? "rgba(255,255,255,0.12)"
    : "rgba(0,0,0,0.08)";

  const completedCount = useMemo(() => {
    if (!program) return 0;

    return program.workouts.filter(
      (workout) => getWorkoutHistoryStatus(program.slug, workout, history) === "done",
    ).length;
  }, [history, program]);

  const scheduleByWeek: ProgramScheduleDay[][] = useMemo(() => {
    if (!program) return [];

    const today = getIsoWeekday();
    const sortedWorkouts = [...program.workouts].sort(
      (a, b) =>
        a.weekNumber - b.weekNumber ||
        a.dayNumber - b.dayNumber ||
        a.orderIndex - b.orderIndex,
    );
    const baseStatuses = new Map<string, WorkoutStatus>();

    sortedWorkouts.forEach((workout) => {
      baseStatuses.set(
        workout.id,
        getWorkoutStatus({
          programSlug: program.slug,
          workout,
          history,
          skips: programSkips,
          isPro,
          freeWorkoutCount,
          programMeterEnabled,
        }),
      );
    });

    const activeScheduleWeek =
      sortedWorkouts.find((workout) => {
        const status = baseStatuses.get(workout.id);
        return status !== "done" && status !== "skipped";
      })?.weekNumber ?? sortedWorkouts[0]?.weekNumber ?? 1;

    return weeks.map((_, weekIdx) => {
      const weekNumber = weekIdx + 1;
      const workoutsForWeek = program.workouts
        .filter((workout) => workout.weekNumber === weekNumber)
        .sort((a, b) => a.dayNumber - b.dayNumber || a.orderIndex - b.orderIndex);
      const workoutDayLabels = new Map<number, number>();

      Array.from(new Set(workoutsForWeek.map((workout) => workout.dayNumber)))
        .sort((a, b) => a - b)
        .forEach((dayNumber, index) => {
          workoutDayLabels.set(dayNumber, index + 1);
        });

      return Array.from({ length: 7 }).flatMap((_, index) => {
        const dayNumber = index + 1;
        const workoutsForDay = workoutsForWeek.filter(
          (workout) => workout.dayNumber === dayNumber,
        );

        if (!workoutsForDay.length) {
          return [
            {
              kind: "rest" as const,
              id: `${program.slug}-week-${weekNumber}-rest-${dayNumber}`,
              label: "",
              title: "Rest day",
              meta: "Recover and come back stronger.",
              weekNumber,
              dayNumber,
            },
          ];
        }

        return workoutsForDay.map((workout) => {
          const baseStatus = baseStatuses.get(workout.id) ?? "available";
          let status = baseStatus;

          if (baseStatus === "available") {
            if (workout.weekNumber < activeScheduleWeek) status = "missed";
            else if (workout.weekNumber > activeScheduleWeek) status = "upcoming";
            else if (workout.dayNumber < today) status = "missed";
            else if (workout.dayNumber === today) status = "due";
            else status = "upcoming";
          }

          return {
            kind: "workout" as const,
            id: workout.id,
            routeWorkoutId: buildRouteWorkoutId(program.slug, workout),
            label: `Day ${workoutDayLabels.get(workout.dayNumber) ?? workout.dayNumber}`,
            title: workout.title,
            meta: buildWorkoutMeta(workout),
            duration: buildWorkoutDuration(workout),
            image: workout.imageUrl || program.cardImageUrl || program.heroImageUrl,
            status,
            access: workout.access,
            orderIndex: workout.orderIndex,
            weekNumber: workout.weekNumber,
            dayNumber: workout.dayNumber,
          };
        });
      });
    });
  }, [
    freeWorkoutCount,
    history,
    isPro,
    program,
    programSkips,
    programMeterEnabled,
    weeks,
  ]);

  const nextWorkout = useMemo(() => {
    const priority: WorkoutStatus[] = [
      "partial",
      "missed",
      "due",
      "available",
      "upcoming",
    ];

    for (const status of priority) {
      for (let weekIdx = 0; weekIdx < scheduleByWeek.length; weekIdx += 1) {
        const workoutIdx = scheduleByWeek[weekIdx].findIndex(
          (item) => item.kind === "workout" && item.status === status,
        );

        if (workoutIdx !== -1) {
          const workout = scheduleByWeek[weekIdx][workoutIdx];

          if (workout.kind !== "workout") continue;

          return {
            weekIdx,
            workoutIdx,
            workout,
          };
        }
      }
    }

    return null;
  }, [scheduleByWeek]);

  useEffect(() => {
    if (nextWorkout) setActiveWeekIndex(nextWorkout.weekIdx);
  }, [nextWorkout]);

  useEffect(() => {
    const x = activeWeekIndex * 136;

    const timer = setTimeout(() => {
      weeksScrollRef.current?.scrollTo({
        x: Math.max(0, x - 18),
        animated: true,
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [activeWeekIndex]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const openInfoModal = () => {
    if (!program) return;

    router.push({
      pathname: "/program-info",
      params: { id: program.slug },
    });
  };

  const onPressWorkout = (workout: Workout) => {
    if (!program) return;

    if (workout.status === "locked") {
      router.push("/paywall");
      return;
    }

    router.push({
      pathname: "/workout",
      params: {
        workoutId: workout.routeWorkoutId,
        supabaseWorkoutId: workout.id,
        supabaseWorkoutOwnerType: "program_workout",
        programId: program.slug,
        supabaseProgramId: program.id,
        source: "program",
      },
    });
  };

  const onSkipWorkout = async (workout: Workout) => {
    if (!program) return;

    const nextSkips = await skipProgramSession({
      programId: program.slug,
      workoutId: workout.routeWorkoutId,
    });

    setProgramSkips(nextSkips);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <BarbataContentLoading
          title="Loading program"
          subtitle="Building your weekly plan."
          variant="detail"
        />
      </SafeAreaView>
    );
  }

  if (!program) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Program not found</Text>

          <PressableScale onPress={handleBack} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Go back</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  const totalWorkouts = program.workouts.length;

  const progressPct = Math.round(
    (completedCount / Math.max(1, totalWorkouts)) * 100,
  );

  const activeWeekSchedule = scheduleByWeek[activeWeekIndex] ?? [];
  const weekWorkoutCount = activeWeekSchedule.filter(
    (item) => item.kind === "workout",
  ).length;
  const weekRestCount = activeWeekSchedule.filter(
    (item) => item.kind === "rest",
  ).length;

  const programMetaParts = [
    program.level,
    program.durationWeeks ? `${program.durationWeeks} weeks` : "",
    program.equipment,
  ].filter(Boolean);

  const programMeta = programMetaParts.join(" · ");

  const freeMessage =
    freeWorkoutCount > 0
      ? `${freeWorkoutCount} workouts included`
      : "Join to continue";

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <View style={styles.screen}>
        <View style={styles.heroContainer} pointerEvents="none">
          <Animated.View
            style={[
              styles.heroMediaWrap,
              {
                height: heroMediaHeight,
                transform: [{ translateY: imageTranslateY }],
              },
            ]}
          >
            <Animated.Image
              source={{ uri: program.heroImageUrl }}
              style={[
                styles.heroImage,
                {
                  height: heroMediaHeight,
                },
              ]}
              resizeMode="cover"
            />

            <Animated.View style={{ height: heroMediaHeight }}>
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.06)",
                  "rgba(0,0,0,0.16)",
                  "rgba(0,0,0,0.34)",
                  "rgba(0,0,0,0.66)",
                ]}
                locations={[0, 0.34, 0.68, 1]}
                style={styles.heroGradient}
              />
            </Animated.View>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.topActions,
            {
              top: Math.max(insets.top, 12),
              opacity: backButtonOpacity,
              transform: [{ translateY: backButtonTranslateY }],
            },
          ]}
        >
          <PressableScale
            onPress={handleBack}
            style={styles.heroIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ChevronLeft size={22} color="#FFFFFF" />
          </PressableScale>

          <PressableScale
            onPress={openInfoModal}
            style={styles.heroIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Program information"
          >
            <Info size={18} color="#FFFFFF" />
          </PressableScale>
        </Animated.View>

        <Animated.ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 24) + 28,
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          bounces
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
        >
          <View style={[styles.heroSpacer, { height: heroHeight }]} />

          <View style={styles.contentShell}>
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>{program.title}</Text>

              <Text style={styles.heroMeta}>
                with Andrei Andrei · {programMeta}
              </Text>

              <View style={styles.heroProgressTrack}>
                <View
                  style={[
                    styles.heroProgressFill,
                    {
                      width: `${progressPct}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.heroStatsRow}>
                <Text style={styles.heroStatText}>
                  {completedCount}/{totalWorkouts} workouts
                </Text>

                <View style={styles.heroStatDot} />

                <Text style={styles.heroStatText}>
                  Week {activeWeekIndex + 1} of {weeks.length}
                </Text>

                <View style={styles.heroStatDot} />

                <Text style={styles.heroStatText}>{freeMessage}</Text>
              </View>
            </View>

            <ScrollView
              ref={weeksScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weeksRail}
              style={styles.weeksScroll}
            >
              {weeks.map((week, index) => {
                const active = index === activeWeekIndex;

                return (
                  <PressableScale
                    key={week.id}
                    onPress={() => setActiveWeekIndex(index)}
                    style={[
                      styles.weekPill,
                      {
                        backgroundColor: active ? colors.text : colors.card,
                        borderColor: active ? colors.text : colors.borderSubtle,
                      },
                    ]}
                    scaleTo={0.985}
                    opacityTo={0.92}
                  >
                    <Text
                      style={[
                        styles.weekPillText,
                        { color: active ? colors.surface : colors.muted },
                      ]}
                    >
                      {week.label}
                    </Text>
                  </PressableScale>
                );
              })}
            </ScrollView>

            <View style={styles.activeWeekHeader}>
              <View>
                <Text style={styles.activeWeekEyebrow}>Current block</Text>
                <Text style={styles.activeWeekTitle}>
                  {weeks[activeWeekIndex]?.label}
                </Text>
                <Text style={styles.activeWeekSub}>
                  {weekWorkoutCount} workouts · {weekRestCount} rest days
                </Text>
              </View>

              <View style={styles.activeWeekMetaChip}>
                <Text style={styles.activeWeekMetaText}>
                  {activeWeekIndex + 1}/{weeks.length}
                </Text>
              </View>
            </View>

            <View style={styles.workoutsCard}>
              {activeWeekSchedule.map((item, index) => {
                const isLast = index === activeWeekSchedule.length - 1;

                if (item.kind === "rest") {
                  return (
                    <View key={item.id}>
                      <View style={styles.restRow}>
                        <View style={styles.rowInset} />

                        <View style={styles.workoutContent}>
                          <Text style={styles.restTitle}>{item.title}</Text>
                        </View>
                      </View>

                      {!isLast ? (
                        <View
                          style={[
                            styles.inlineDivider,
                            { backgroundColor: colors.borderSubtle },
                          ]}
                        />
                      ) : null}
                    </View>
                  );
                }

                const workout = item;
                const isAction =
                  workout.status === "partial" ||
                  workout.status === "missed" ||
                  workout.status === "due";
                const isDone = workout.status === "done";
                const isLocked = workout.status === "locked";
                const isSkipped = workout.status === "skipped";
                const canSkip =
                  workout.status === "missed" || workout.status === "due";

                return (
                  <View key={workout.id}>
                    <PressableScale
                      onPress={() => onPressWorkout(workout)}
                      style={[
                        styles.workoutRow,
                        {
                          backgroundColor: isAction ? isDarkSoft : "transparent",
                        },
                      ]}
                      scaleTo={0.99}
                      opacityTo={0.95}
                    >
                      {isAction ? (
                        <View style={styles.nextWorkoutAccent} />
                      ) : (
                        <View style={styles.rowInset} />
                      )}

                      <Image
                        source={{ uri: workout.image }}
                        style={styles.workoutThumb}
                      />

                      <View style={styles.workoutContent}>
                        <Text style={styles.workoutLabel}>{workout.label}</Text>

                        <Text
                          style={[
                            styles.workoutTitle,
                            (isLocked || isSkipped) && { color: colors.muted },
                          ]}
                          numberOfLines={2}
                        >
                          {workout.title}
                        </Text>

                        <Text
                          style={[
                            styles.workoutMeta,
                            (isLocked || isSkipped) && { color: colors.subtle },
                          ]}
                          numberOfLines={1}
                        >
                          {workout.duration
                            ? `${workout.meta} · ${workout.duration}`
                            : workout.meta}
                        </Text>
                      </View>

                      <View style={styles.workoutRight}>
                        {workout.status === "partial" ? (
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: colors.premiumSoft,
                                borderColor: colors.premiumBorder,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                { color: colors.premiumText },
                              ]}
                            >
                              Partial
                            </Text>
                          </View>
                        ) : workout.status === "missed" ? (
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: colors.premiumSoft,
                                borderColor: colors.premiumBorder,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                { color: colors.premiumText },
                              ]}
                            >
                              Missed
                            </Text>
                          </View>
                        ) : workout.status === "due" ? (
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: colors.premiumSoft,
                                borderColor: colors.premiumBorder,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                { color: colors.premiumText },
                              ]}
                            >
                              Today
                            </Text>
                          </View>
                        ) : isDone ? (
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: colors.successSoft,
                                borderColor: colors.successBorder,
                                flexDirection: "row",
                                gap: 5,
                              },
                            ]}
                          >
                            <Check size={13} color={colors.successText} />

                            <Text
                              style={[
                                styles.statusPillText,
                                { color: colors.successText },
                              ]}
                            >
                              Done
                            </Text>
                          </View>
                        ) : isSkipped ? (
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: isDarkSoft,
                                borderColor: colors.borderSubtle,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                { color: colors.muted },
                              ]}
                            >
                              Skipped
                            </Text>
                          </View>
                        ) : workout.status === "upcoming" ? (
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: "transparent",
                                borderColor: colors.borderSubtle,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                { color: colors.muted },
                              ]}
                            >
                              Upcoming
                            </Text>
                          </View>
                        ) : isLocked ? (
                          <View
                            style={[
                              styles.lockPill,
                              {
                                backgroundColor: isDarkSoft,
                                borderColor: colors.borderSubtle,
                              },
                            ]}
                          >
                            <Lock
                              size={14}
                              color={
                                isDark
                                  ? "rgba(255,255,255,0.48)"
                                  : "rgba(17,17,17,0.42)"
                              }
                            />
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.availableDot,
                              {
                                backgroundColor: isDarkSoftStronger,
                                borderColor: colors.borderSubtle,
                              },
                            ]}
                          />
                        )}
                      </View>
                    </PressableScale>

                    {canSkip ? (
                      <PressableScale
                        onPress={() => onSkipWorkout(workout)}
                        style={styles.skipRowAction}
                        scaleTo={0.99}
                        opacityTo={0.9}
                      >
                        <Text style={styles.skipRowActionText}>
                          Skip this session
                        </Text>
                      </PressableScale>
                    ) : null}

                    {!isLast ? (
                      <View
                        style={[
                          styles.inlineDivider,
                          { backgroundColor: colors.borderSubtle },
                        ]}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>

            <View style={styles.bulletsCard}>
              <Text style={styles.bulletsEyebrow}>Program overview</Text>

              {bullets.map((item, index) => (
                <View
                  key={`${item}-${index}`}
                  style={[
                    styles.bulletRow,
                    index !== bullets.length - 1 && [
                      styles.bulletRowGap,
                      { borderBottomColor: colors.borderSubtle },
                    ],
                  ]}
                >
                  <View
                    style={[
                      styles.bulletDot,
                      { backgroundColor: colors.premium },
                    ]}
                  />

                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.ScrollView>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.floatingHeader,
            {
              opacity: floatingHeaderOpacity,
              transform: [{ translateY: floatingHeaderTranslateY }],
            },
          ]}
        >
          <View
            style={[
              styles.floatingHeaderTopFill,
              { height: insets.top, backgroundColor: colors.background },
            ]}
          />

          <View style={styles.floatingHeaderBar}>
            <View style={styles.floatingHeaderContent}>
              <Text style={styles.floatingHeaderTitle} numberOfLines={1}>
                {program.title}
              </Text>

              <View style={styles.floatingHeaderMetaRow}>
                <Text style={styles.floatingHeaderMetaText}>
                  {completedCount}/{totalWorkouts} workouts
                </Text>

                <View style={styles.floatingHeaderDot} />

                <Text style={styles.floatingHeaderMetaText}>
                  Week {activeWeekIndex + 1} of {weeks.length}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
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
    subtle: string;
    border: string;
    borderSubtle: string;
    premium: string;
    premiumSoft: string;
    premiumBorder: string;
    premiumText: string;
    successSoft: string;
    successBorder: string;
    successText: string;
    fillAlt: string;
  },
  isDark: boolean,
) {
  const soft = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const softStrong = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    heroContainer: {
      ...StyleSheet.absoluteFillObject,
      bottom: undefined,
      backgroundColor: isDark ? "#161719" : "#E6E6E9",
    },

    heroMediaWrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      overflow: "hidden",
    },

    heroImage: {
      width: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    },

    heroGradient: {
      ...StyleSheet.absoluteFillObject,
    },

    topActions: {
      position: "absolute",
      left: 16,
      right: 16,
      zIndex: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    heroIconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.28)",
      borderWidth: BorderWidth.default,
      borderColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },

    scroll: {
      flex: 1,
    },

    heroSpacer: {
      position: "relative",
    },

    contentShell: {
      marginTop: -22,
      backgroundColor: colors.background,
      paddingTop: 18,
      paddingHorizontal: Spacing.md,
      minHeight: 500,
    },

    heroCard: {
      backgroundColor: colors.background,
      paddingBottom: 10,
    },

    heroTitle: {
      fontSize: 30,
      lineHeight: 34,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.45,
    },

    heroMeta: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.08,
    },

    heroProgressTrack: {
      marginTop: 16,
      height: 4,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: softStrong,
    },

    heroProgressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.premium,
    },

    heroStatsRow: {
      marginTop: 12,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8,
    },

    heroStatText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.muted,
      letterSpacing: -0.05,
    },

    heroStatDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderSubtle,
    },

    weeksScroll: {
      marginTop: 18,
      flexGrow: 0,
    },

    weeksRail: {
      paddingBottom: 8,
      gap: 8,
      flexDirection: "row",
      alignItems: "center",
    },

    weekPill: {
      minHeight: 40,
      paddingHorizontal: 16,
      borderRadius: 999,
      borderWidth: BorderWidth.default,
      alignItems: "center",
      justifyContent: "center",
    },

    weekPillText: {
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: -0.05,
    },

    activeWeekHeader: {
      marginTop: 16,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16,
    },

    activeWeekEyebrow: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.55,
      textTransform: "uppercase",
      marginBottom: 6,
    },

    activeWeekTitle: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.3,
    },

    activeWeekSub: {
      marginTop: 5,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },

    activeWeekMetaChip: {
      minWidth: 54,
      height: 34,
      borderRadius: 999,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: soft,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
    },

    activeWeekMetaText: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.05,
    },

    workoutsCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
      overflow: "hidden",
    },

    workoutRow: {
      minHeight: 92,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingRight: 14,
    },

    restRow: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingRight: 14,
      backgroundColor: "transparent",
    },

    rowInset: {
      width: 4,
      height: "100%",
      marginRight: 10,
    },

    nextWorkoutAccent: {
      width: 4,
      alignSelf: "stretch",
      borderRadius: 999,
      backgroundColor: colors.premium,
      marginRight: 10,
    },

    workoutThumb: {
      width: 62,
      height: 62,
      borderRadius: 16,
      backgroundColor: soft,
    },

    workoutContent: {
      flex: 1,
      marginLeft: 12,
      paddingRight: 10,
    },

    workoutLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.55,
      textTransform: "uppercase",
      marginBottom: 4,
    },

    workoutTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.18,
    },

    workoutMeta: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
      letterSpacing: -0.05,
    },

    restTitle: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "800",
      color: colors.muted,
      letterSpacing: -0.12,
    },

    workoutRight: {
      alignItems: "flex-end",
      justifyContent: "center",
    },

    skipRowAction: {
      marginLeft: 26,
      marginRight: 14,
      marginBottom: 12,
      minHeight: 36,
      borderRadius: 999,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
      backgroundColor: soft,
      alignItems: "center",
      justifyContent: "center",
    },

    skipRowActionText: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.08,
    },

    statusPill: {
      minHeight: 32,
      paddingHorizontal: 11,
      borderRadius: 999,
      borderWidth: BorderWidth.default,
      alignItems: "center",
      justifyContent: "center",
    },

    statusPillText: {
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.15,
    },

    lockPill: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: BorderWidth.default,
      alignItems: "center",
      justifyContent: "center",
    },

    availableDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: BorderWidth.default,
    },

    inlineDivider: {
      height: BorderWidth.default,
      marginLeft: 26,
      marginRight: 14,
    },

    bulletsCard: {
      marginTop: 18,
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
      padding: 18,
    },

    bulletsEyebrow: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.55,
      textTransform: "uppercase",
      marginBottom: 12,
    },

    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      paddingVertical: 10,
    },

    bulletRowGap: {
      borderBottomWidth: BorderWidth.default,
    },

    bulletDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      marginTop: 7,
      flexShrink: 0,
    },

    bulletText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: colors.text,
      letterSpacing: -0.06,
    },

    floatingHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 30,
    },

    floatingHeaderTopFill: {},

    floatingHeaderBar: {
      backgroundColor: colors.background,
      borderBottomWidth: BorderWidth.default,
      borderBottomColor: colors.borderSubtle,
    },

    floatingHeaderContent: {
      paddingHorizontal: Spacing.md,
      paddingTop: 12,
      paddingBottom: 12,
    },

    floatingHeaderTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.18,
    },

    floatingHeaderMetaRow: {
      marginTop: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    floatingHeaderMetaText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
    },

    floatingHeaderDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderSubtle,
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      backgroundColor: colors.background,
    },

    emptyTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 16,
    },

    emptyButton: {
      height: 48,
      paddingHorizontal: 22,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyButtonText: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.surface,
    },
  });
}

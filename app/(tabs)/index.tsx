// app/(tabs)/index.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronRight, Clock, Moon, Sun } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EditorialCard } from "@/components/ui/EditorialCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";

import { useAppSettings } from "../_providers/appSettings";

import { useAppTheme } from "../_providers/theme";
import { getProgram } from "../program/program.data";
import {
  getProgramWorkoutTemplate,
  getWorkoutCountForWeek,
  parseProgramWorkoutId,
} from "../program/programWorkouts";
import {
  clearWorkoutDraft,
  loadWorkoutDraft,
  type WorkoutDraft,
} from "../workout/workoutDraft";
import {
  getWorkoutHistory,
  type WorkoutHistoryEntry,
} from "../workout/workoutHistory";

type CtaState = "start" | "resume";

type PrepCard = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge?: string;
};

type WorkoutCard = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge?: string;
};

type RecipeCard = {
  id: string;
  title: string;
  metaBold: string;
  metaMuted: string;
  imageUrl: string;
};

const HERO_PROGRAM_ID = "strength-foundations";
const HERO_WORKOUT_ID = "strength-foundations-week-2-workout-1";
const WEEKLY_TOTAL = 3;
<<<<<<< HEAD

const FINISH_SUMMARY_STORAGE_KEY = "aa_fit_finish_summary";
=======
const PROGRAM_TOTAL = 21;
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcStreak(history: WorkoutHistoryEntry[]): number {
  if (!history.length) return 0;

  const trainedDays = new Set(
    history.map((e) => {
      const d = new Date(e.completedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let checkDay = today.getTime();

<<<<<<< HEAD
=======
  // If didn't train today, start checking from yesterday
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
  if (!trainedDays.has(checkDay)) {
    checkDay -= 86_400_000;
  }

  let streak = 0;
  while (trainedDays.has(checkDay)) {
    streak++;
    checkDay -= 86_400_000;
  }

  return streak;
}

function calcWeeklyDone(history: WorkoutHistoryEntry[]): number {
  const now = new Date();
<<<<<<< HEAD
  const dayOfWeek = now.getDay();
=======
  const dayOfWeek = now.getDay(); // 0=Sun
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  return history.filter((e) => new Date(e.completedAt) >= monday).length;
}

function calcProgramCompleted(
  history: WorkoutHistoryEntry[],
  programId: string,
): number {
  return history.filter(
    (e) =>
      e.programId === programId || e.workoutId.startsWith(programId),
  ).length;
}

<<<<<<< HEAD
function calcProgramTotal(programId: string): number {
  const program = getProgram(programId);
  if (!program) return 0;
  return program.weeks.reduce(
    (sum, _, idx) => sum + getWorkoutCountForWeek(idx),
    0,
  );
}

=======
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
function getSessionDateLabel(completedAt: string): string {
  const d = new Date(completedAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sessionDay = new Date(d);
  sessionDay.setHours(0, 0, 0, 0);

  if (sessionDay.getTime() === today.getTime()) return "Today";
  if (sessionDay.getTime() === yesterday.getTime()) return "Yesterday";

  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatMinutes(sec: number): string {
  const min = Math.round(sec / 60);
  return `${min} min`;
}

// ─── Recent session card ─────────────────────────────────────────────────────

function RecentSessionCard({
  entry,
  onPress,
  colors,
}: {
  entry: WorkoutHistoryEntry;
  onPress: () => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  const completionPct =
    entry.totals.totalSets > 0
      ? Math.round((entry.totals.completedSets / entry.totals.totalSets) * 100)
      : 100;

<<<<<<< HEAD
  const isDark =
  colors.background === "#0B0B0C" ||
  colors.background === "#111214" ||
  colors.background === "#0F0F10";

    // 🔥 Light mode → force premium dark cards
    const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#151517";
    const borderCol = isDark ? "rgba(255,255,255,0.10)" : "#2B2B2F";
    const trackCol = isDark
      ? "rgba(255,255,255,0.12)"
      : "rgba(255,255,255,0.08)";
=======
  const isDark = colors.background === "#0B0B0C" || colors.background === "#111214";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const borderCol = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const trackCol = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[sessionCardStyles.card, { backgroundColor: cardBg, borderColor: borderCol }]}
    >
      <View style={sessionCardStyles.topRow}>
        <View style={sessionCardStyles.titleBlock}>
<<<<<<< HEAD
          <Text style={[sessionCardStyles.title, { color: isDark ? colors.text : "#FFFFFF" }]} numberOfLines={1}>
=======
          <Text style={[sessionCardStyles.title, { color: colors.text }]} numberOfLines={1}>
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
            {entry.workoutTitle}
          </Text>
          <View style={sessionCardStyles.metaRow}>
            <Clock size={11} color={colors.muted} strokeWidth={2.5} />
            <Text style={[sessionCardStyles.metaText, { color: colors.muted }]}>
              {formatMinutes(entry.durationSec)}
            </Text>
            <Text style={[sessionCardStyles.metaDot, { color: colors.muted }]}>·</Text>
<<<<<<< HEAD
            <Text style={[sessionCardStyles.metaText, { color: isDark ? colors.muted : "#9A9AA1" }]}>
=======
            <Text style={[sessionCardStyles.metaText, { color: colors.muted }]}>
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
              {entry.totals.completedSets}/{entry.totals.totalSets} sets
            </Text>
          </View>
        </View>
<<<<<<< HEAD
        <Text style={[sessionCardStyles.dateLabel, { color: isDark ? colors.muted : "#9A9AA1" }]}>
=======
        <Text style={[sessionCardStyles.dateLabel, { color: colors.muted }]}>
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
          {getSessionDateLabel(entry.completedAt)}
        </Text>
      </View>

      <View style={[sessionCardStyles.barTrack, { backgroundColor: trackCol }]}>
        <View
          style={[
            sessionCardStyles.barFill,
<<<<<<< HEAD
            { width: `${completionPct}%` as any, backgroundColor: isDark ? colors.premium : colors.premium },
=======
            { width: `${completionPct}%` as any, backgroundColor: colors.text },
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const sessionCardStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: BorderWidth.default,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: -0.05,
  },
  metaDot: {
    fontSize: 12,
    fontWeight: "700",
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: -0.05,
    flexShrink: 0,
  },
  barTrack: {
    height: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    height: 3,
    borderRadius: 999,
  },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { settings, setAppearance } = useAppSettings();

  const [workoutDraft, setWorkoutDraft] = useState<WorkoutDraft | null>(null);
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);

<<<<<<< HEAD
  // Derive program total dynamically from program config
  const programTotal = useMemo(() => calcProgramTotal(HERO_PROGRAM_ID), []);

  // Derived stats from real history
  const weeklyDone = useMemo(() => calcWeeklyDone(history), [history]);
  const streakDays = useMemo(() => calcStreak(history), [history]);
  const programCompleted = useMemo(
    () => calcProgramCompleted(history, HERO_PROGRAM_ID),
    [history],
  );

  // Only show the last 2 recent sessions
  const recentSessions = useMemo(() => history.slice(0, 2), [history]);

=======
  // Derived stats from real history
  const weeklyDone = useMemo(() => calcWeeklyDone(history), [history]);
  const streakDays = useMemo(() => calcStreak(history), [history]);
  const programCompleted = useMemo(
    () => calcProgramCompleted(history, HERO_PROGRAM_ID),
    [history],
  );

  const recentSessions = useMemo(() => history.slice(0, 5), [history]);

>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
  const activeProgram = useMemo(() => getProgram(HERO_PROGRAM_ID), []);

  const heroWorkoutParsed = useMemo(
    () => parseProgramWorkoutId(HERO_WORKOUT_ID),
    [],
  );

  const heroWorkoutTemplate = useMemo(() => {
    if (!heroWorkoutParsed) return null;
    return getProgramWorkoutTemplate(heroWorkoutParsed.workoutIndex);
  }, [heroWorkoutParsed]);

  const prepCards = useMemo<PrepCard[]>(
    () => [
      {
        id: "warmup-sequence",
        title: "Upper Body Warm-up Sequence",
        subtitle: "Mobility · Activation · 8 min",
        imageUrl: "https://i.ytimg.com/vi/M8M0AgQ8nD8/maxresdefault.jpg",
        badge: "Warm-up",
      },
      {
        id: "cooldown-sequence",
        title: "Cooldown & Recovery Flow",
        subtitle: "Breathing · Stretching · 6 min",
        imageUrl: "https://i.ytimg.com/vi/2ZgCRBLg2Zs/maxresdefault.jpg",
        badge: "Cool-down",
      },
    ],
    [],
  );

<<<<<<< HEAD
  const workoutCards = useMemo<WorkoutCard[]>(
    () => [
      {
        id: "w-001",
        title: "Arms & Shoulders Minimum Equipment",
        subtitle: "HIIT · 30 min",
        imageUrl:
          "https://i.ytimg.com/vi/w0zPgPkx8yI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCB-fSirLZ7-OC0R2z5r58bt-aUvQ",
        badge: "Arms",
      },
      {
        id: "w-002",
        title: "Legs Strength Session",
        subtitle: "Strength · 42 min",
        imageUrl: "https://i.ytimg.com/vi/6O8SRDEK5F4/maxresdefault.jpg",
        badge: "Legs",
      },
      {
        id: "w-003",
        title: "Upper Body Hypertrophy",
        subtitle: "Hypertrophy · 45 min",
        imageUrl: "https://i.ytimg.com/vi/2ZgCRBLg2Zs/maxresdefault.jpg",
        badge: "Upper",
      },
    ],
    [],
  );

  const recipeCards = useMemo<RecipeCard[]>(
    () => [
      {
        id: "r-004",
        title: "Low Carb Lemon Pepper Chicken with Tzatziki",
        metaBold: "Main course · ~35 min",
        metaMuted: "High Protein · Low Carb",
        imageUrl:
          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: "r-002",
        title: "Greek Yogurt + Berries",
        metaBold: "Breakfast · ~10 min",
        metaMuted: "High Protein · Quick",
        imageUrl:
          "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: "r-006",
        title: "Salmon + Greens",
        metaBold: "Dinner · ~18 min",
        metaMuted: "Omega-3 · Low Carb",
        imageUrl:
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    [],
  );

=======
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
  useFocusEffect(
    useCallback(() => {
      const run = async () => {
        try {
          const [draft, hist] = await Promise.all([
            loadWorkoutDraft(),
            getWorkoutHistory(),
          ]);
          setWorkoutDraft(draft);
          setHistory(hist);
        } catch {
          setWorkoutDraft(null);
          setHistory([]);
        }
      };
      run();
    }, []),
  );

  const draftProgress = useMemo(() => {
    if (!workoutDraft) return null;
    const totalSets = workoutDraft.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSets = workoutDraft.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.done).length,
      0,
    );
    return { totalSets, completedSets };
  }, [workoutDraft]);

  const ctaState: CtaState = workoutDraft ? "resume" : "start";

  const programTitle = activeProgram.title;
  const programMeta = activeProgram.meta;
  const heroImage = activeProgram.hero;

<<<<<<< HEAD
  const heroWorkoutNumber = heroWorkoutParsed
    ? ((heroWorkoutParsed.weekNumber - 1) * 3) + heroWorkoutParsed.workoutNumber
    : 4;

  const defaultWorkoutLabel = `Workout ${heroWorkoutNumber}`;
=======
  const defaultWorkoutLabel = heroWorkoutParsed
    ? `Workout ${((heroWorkoutParsed.weekNumber - 1) * 3) + heroWorkoutParsed.workoutNumber}`
    : "Workout 4";
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739

  const defaultWorkoutName = heroWorkoutTemplate?.title ?? "Hypertrophy Focus";

  const workoutLabel =
    ctaState === "resume" ? "Unfinished workout" : defaultWorkoutLabel;

  const workoutName =
    ctaState === "resume" && workoutDraft?.workoutTitle
      ? workoutDraft.workoutTitle
      : defaultWorkoutName;

  const weeklyProgress = WEEKLY_TOTAL > 0 ? weeklyDone / WEEKLY_TOTAL : 0;
<<<<<<< HEAD
=======
  const programProgress = PROGRAM_TOTAL > 0 ? programCompleted / PROGRAM_TOTAL : 0;
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739

  const greetingTitle =
    ctaState === "resume" ? "Continue where you left off." : "Ready to train.";

  const greetingSub =
    ctaState === "resume" && draftProgress
      ? `${draftProgress.completedSets} of ${draftProgress.totalSets} sets completed`
<<<<<<< HEAD
      : undefined;
=======
      : `${weeklyDone} of ${WEEKLY_TOTAL} workouts completed this week`;
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739

  const weeklyLeft = Math.max(0, WEEKLY_TOTAL - weeklyDone);

  const startWorkout = () => {
    if (ctaState === "resume" && workoutDraft) {
      router.push({
        pathname: "/workout",
        params: {
          resumeDraft: "1",
          workoutId: workoutDraft.workoutId,
          source: "home",
        },
      });
      return;
    }
    router.push({
      pathname: "/workout",
      params: {
        workoutId: HERO_WORKOUT_ID,
        programId: HERO_PROGRAM_ID,
        source: "home",
      },
    });
  };

  const discardWorkout = async () => {
    await clearWorkoutDraft();
    setWorkoutDraft(null);
  };

  const openPlanOverview = () => {
    router.push({ pathname: "/program/[id]", params: { id: HERO_PROGRAM_ID } });
  };

  const openAllPrep = () => {
    router.push("/workouts");
  };

  const openAllHistory = () => {
    router.push("/workout-history");
  };

  const openPrepCard = (id: string) => {
    router.push({ pathname: "/workout", params: { workoutId: id, source: "home" } });
  };

<<<<<<< HEAD
  const openWorkoutCard = (id: string) => {
    router.push({
      pathname: "/workout",
      params: { workoutId: id, source: "home" },
    });
=======
  const openSession = (entry: WorkoutHistoryEntry) => {
    // Navigate to the finish/summary screen for that session if we have a summary stored,
    // otherwise just go to workout history
    router.push("/workout-history");
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
  };

  const openRecipe = (id: string) => {
    router.push({ pathname: "/recipes/[id]", params: { id } });
  };

  const openSession = async (entry: WorkoutHistoryEntry) => {
    try {
      const summary = {
        sessionId: entry.sessionId,
        workoutId: entry.workoutId,
        workoutTitle: entry.workoutTitle,
        programId: entry.programId,
        status: entry.status,
        durationSec: entry.durationSec,
        totals: entry.totals,
        insights: {
          completionRate:
            entry.totals.totalSets > 0
              ? entry.totals.completedSets / entry.totals.totalSets
              : 1,
          prCount: 0,
          missingLoadCount: 0,
          strengthSetCount: entry.totals.completedSets,
          avgTrackedLoad: 0,
          improvedExerciseCount: 0,
          matchedExerciseCount: 0,
          previousSessionFound: false,
        },
        prs: [],
        wins: [],
        exercises:
          entry.exercises?.map((ex) => ({
            id: ex.id,
            name: ex.name,
            completedSets: ex.completedSets,
            totalSetsPlanned: ex.totalSetsPlanned,
            unitLabel: ex.unitLabel,
            sessionVolume: ex.sessionVolume,
            comparedToLast: ex.comparedToLast,
            sets: ex.sets,
          })) ?? [],
      };

      await AsyncStorage.setItem(FINISH_SUMMARY_STORAGE_KEY, JSON.stringify(summary));
      router.push("/workout/finish");
    } catch {
      router.push("/workout-history");
    }
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ─────────────────────────────────────────── */}
        <ScreenHeader
          variant="hero"
          title={greetingTitle}
          subtitle={greetingSub}
          right={
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.85}
              onPress={async () => {
                await setAppearance(settings.appearance === "dark" ? "light" : "dark");
              }}
            >
              {isDark ? (
                <Sun size={18} color={colors.text} />
              ) : (
                <Moon size={18} color={colors.text} />
              )}
            </TouchableOpacity>
          }
        />

<<<<<<< HEAD
        {/* ── Weekly progress bar ──────────────────────────────── */}
=======
        {/* Weekly progress bar */}
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
        <View style={styles.weekMetaRow}>
          <Text style={styles.weekMetaLeft}>This week</Text>
          <Text style={styles.weekMetaRight}>
            {weeklyLeft === 0 ? "Complete" : `${weeklyLeft} left`}
          </Text>
        </View>

        <View style={styles.weekProgressBg}>
          <View
            style={[
              styles.weekProgressFill,
              { width: `${Math.max(0, Math.min(1, weeklyProgress)) * 100}%` },
            ]}
          />
        </View>

<<<<<<< HEAD
        {/* ── Today header ─────────────────────────────────────── */}
=======
        {/* Today's workout hero */}
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
        <View style={styles.todayRow}>
          <Text style={styles.todayTitle}>Today</Text>
          <TouchableOpacity
            style={styles.planLink}
            activeOpacity={0.8}
            onPress={openPlanOverview}
          >
            <Text style={styles.planLinkText}>Plan overview</Text>
            <ChevronRight size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.todaySub}>Your current plan</Text>

        {/* ── Hero card ────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <ImageBackground
            source={{ uri: heroImage }}
            style={styles.heroImage}
            imageStyle={styles.heroImageRadius}
          >
            <View style={styles.heroOverlay} />

            <View style={styles.heroTop}>
              <View style={styles.leftChips}>
                <View style={styles.chipLight}>
                  <Text style={styles.chipLightText}>
                    {programCompleted}/{PROGRAM_TOTAL} complete
                  </Text>
                </View>
              </View>

              {streakDays > 0 && (
                <View style={styles.chipOutline}>
                  <Text style={styles.chipOutlineText}>{streakDays}-day streak</Text>
                </View>
              )}
            </View>

            <View style={styles.heroBottom}>
              <Text style={styles.heroEyebrow}>{workoutLabel}</Text>
              <Text style={styles.heroTitle}>{workoutName}</Text>
              <Text style={styles.heroMeta}>
                {programTitle} · {programMeta}
              </Text>

<<<<<<< HEAD
              {/* Metrics row — only when resuming a draft */}
              {draftProgress && (
                <View style={styles.metricsRow}>
=======
              <View style={styles.metricsRow}>
                {draftProgress ? (
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
                  <View style={styles.metricPill}>
                    <Text style={styles.metricPillText}>
                      {draftProgress.completedSets}/{draftProgress.totalSets} sets logged
                    </Text>
                  </View>
<<<<<<< HEAD
                </View>
              )}
=======
                ) : (
                  <View style={styles.metricPill}>
                    <Text style={styles.metricPillText}>Today's main session</Text>
                  </View>
                )}
              </View>
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739

              <TouchableOpacity
                style={styles.heroCta}
                onPress={startWorkout}
                activeOpacity={0.9}
              >
                <Text style={styles.heroCtaIcon}>▶</Text>
                <Text style={styles.heroCtaText}>
                  {ctaState === "resume"
                    ? "Resume workout"
                    : `Start ${defaultWorkoutLabel}`}
                </Text>
              </TouchableOpacity>

              {ctaState === "resume" && (
                <TouchableOpacity
                  onPress={discardWorkout}
                  style={styles.discardButton}
                  activeOpacity={0.75}
                >
                  <Text style={styles.discardText}>Discard workout</Text>
                </TouchableOpacity>
              )}
            </View>
          </ImageBackground>
        </View>

<<<<<<< HEAD
        {/* ── Recent sessions (last 2) ─────────────────────────── */}
        {recentSessions.length > 0 && (
          <>
            <View style={[styles.sectionHeaderRow, styles.recentSectionHeader]}>
              <Text style={styles.sectionTitle}>Recent sessions</Text>
              <TouchableOpacity
                style={styles.sectionLink}
                activeOpacity={0.8}
                onPress={openAllHistory}
              >
                <Text style={styles.sectionLinkText}>See all</Text>
                <ChevronRight size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.recentList}>
              {recentSessions.map((entry, index) => (
                <View
                  key={entry.sessionId}
                  style={
                    index !== recentSessions.length - 1
                      ? styles.recentCardGap
                      : undefined
                  }
                >
                  <RecentSessionCard
                    entry={entry}
                    onPress={() => openSession(entry)}
                    colors={colors}
                  />
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Prep for today ───────────────────────────────────── */}
=======
        {/* Prep for today */}
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Prep for today</Text>
          <TouchableOpacity
            style={styles.sectionLink}
            activeOpacity={0.8}
            onPress={openAllPrep}
          >
            <Text style={styles.sectionLinkText}>See all</Text>
            <ChevronRight size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prepRail}
        >
          {prepCards.map((card, index) => (
            <View
              key={card.id}
              style={
                index !== prepCards.length - 1 ? styles.prepCardGap : undefined
              }
            >
              <EditorialCard
                title={card.title}
                metaBold={card.subtitle}
                imageUrl={card.imageUrl}
                badgeLabel={card.badge}
                onPress={() => openPrepCard(card.id)}
              />
            </View>
          ))}
        </ScrollView>

<<<<<<< HEAD
        {/* ── Try individual workouts ──────────────────────────── */}
        <View style={[styles.sectionHeaderRow, styles.workoutsSectionHeader]}>
          <Text style={styles.sectionTitle}>Try individual workouts</Text>
          <TouchableOpacity
            style={styles.sectionLink}
            activeOpacity={0.8}
            onPress={() => router.push("/workouts")}
          >
            <Text style={styles.sectionLinkText}>See all</Text>
            <ChevronRight size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prepRail}
        >
          {workoutCards.map((card, index) => (
            <View
              key={card.id}
              style={
                index !== workoutCards.length - 1
                  ? styles.prepCardGap
                  : undefined
              }
            >
              <EditorialCard
                title={card.title}
                metaBold={card.subtitle}
                imageUrl={card.imageUrl}
                badgeLabel={card.badge}
                onPress={() => openWorkoutCard(card.id)}
              />
            </View>
          ))}
        </ScrollView>

        {/* ── Featured recipes ─────────────────────────────────── */}
        <View style={[styles.sectionHeaderRow, styles.recipesSectionHeader]}>
          <Text style={styles.sectionTitle}>Featured recipes</Text>
          <TouchableOpacity
            style={styles.sectionLink}
            activeOpacity={0.8}
            onPress={() => router.push("/recipes")}
          >
            <Text style={styles.sectionLinkText}>See all</Text>
            <ChevronRight size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prepRail}
        >
          {recipeCards.map((card, index) => (
            <View
              key={card.id}
              style={
                index !== recipeCards.length - 1
                  ? styles.prepCardGap
                  : undefined
              }
            >
              <EditorialCard
                title={card.title}
                metaBold={card.metaBold}
                metaMuted={card.metaMuted}
                imageUrl={card.imageUrl}
                width={210}
                mediaHeight={210}
                onPress={() => openRecipe(card.id)}
              />
            </View>
          ))}
        </ScrollView>
=======
        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <>
            <View style={[styles.sectionHeaderRow, styles.recentSectionHeader]}>
              <Text style={styles.sectionTitle}>Recent sessions</Text>
              <TouchableOpacity
                style={styles.sectionLink}
                activeOpacity={0.8}
                onPress={openAllHistory}
              >
                <Text style={styles.sectionLinkText}>See all</Text>
                <ChevronRight size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.recentList}>
              {recentSessions.map((entry, index) => (
                <View
                  key={entry.sessionId}
                  style={index !== recentSessions.length - 1 ? styles.recentCardGap : undefined}
                >
                  <RecentSessionCard
                    entry={entry}
                    onPress={() => openSession(entry)}
                    colors={colors}
                  />
                </View>
              ))}
            </View>
          </>
        )}
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

function createStyles(colors: {
  background: string;
  surface: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  borderSubtle: string;
  premium: string;
}) {
  const BORDER = colors.borderSubtle ?? colors.border ?? "rgba(0,0,0,0.10)";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      paddingTop: 4,
      paddingBottom: Spacing.lg,
      paddingHorizontal: Spacing.md,
    },

    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      alignItems: "center",
      justifyContent: "center",
    },

    // ── Weekly progress ──────────────────────────────────────

    weekMetaRow: {
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    weekMetaLeft: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
      letterSpacing: -0.05,
    },

    weekMetaRight: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.05,
    },

    weekProgressBg: {
      marginTop: 10,
      height: 3,
      backgroundColor: isDarkLike(colors.background)
        ? "rgba(255,255,255,0.12)"
        : "rgba(0,0,0,0.08)",
      borderRadius: 999,
      overflow: "hidden",
    },

    weekProgressFill: {
      height: 3,
      backgroundColor: colors.text,
      borderRadius: 999,
    },

    // ── Today header ─────────────────────────────────────────

    todayRow: {
      marginTop: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },

    todayTitle: {
      fontSize: 26,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.25,
    },

    planLink: {
      paddingVertical: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    planLinkText: {
      fontSize: 14,
      color: colors.muted,
      fontWeight: "800",
      letterSpacing: -0.1,
    },

    todaySub: {
      fontSize: 15,
      color: colors.muted,
      marginTop: 8,
      marginBottom: 14,
      fontWeight: "700",
      letterSpacing: -0.1,
    },

    // ── Hero card ────────────────────────────────────────────

    heroCard: {
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: colors.card,
      borderWidth: BorderWidth.default,
      borderColor: isDarkLike(colors.background)
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.06)",
    },

    heroImage: {
      width: "100%",
      height: 470,
      justifyContent: "space-between",
    },

    heroImageRadius: {
      borderRadius: 28,
    },

    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.30)",
    },

    heroTop: {
      marginTop: 16,
      paddingHorizontal: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },

    leftChips: {
      gap: 10,
    },

    chipLight: {
      backgroundColor: "rgba(255,255,255,0.84)",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
    },

    chipLightText: {
      color: "#111",
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: -0.05,
    },

    chipOutline: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: BorderWidth.default,
      borderColor: "rgba(255,255,255,0.32)",
      backgroundColor: "rgba(0,0,0,0.22)",
    },

    chipOutlineText: {
      color: "#FFF",
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: -0.05,
    },

    heroBottom: {
      paddingHorizontal: 18,
      paddingBottom: 18,
    },

    heroEyebrow: {
      color: "rgba(255,255,255,0.76)",
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 1,
      textTransform: "uppercase",
    },

    heroTitle: {
      marginTop: 8,
      color: "#FFF",
      fontSize: 28,
      lineHeight: 31,
      fontWeight: "900",
      letterSpacing: -0.35,
    },

    heroMeta: {
      marginTop: 6,
      color: "rgba(255,255,255,0.88)",
      fontSize: 15,
      fontWeight: "700",
      letterSpacing: -0.1,
    },

    metricsRow: {
      marginTop: 14,
      minHeight: 0,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    metricPill: {
      backgroundColor: "rgba(0,0,0,0.42)",
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: BorderWidth.default,
      borderColor: "rgba(255,255,255,0.18)",
    },

    metricPillText: {
      color: "rgba(255,255,255,0.94)",
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: -0.05,
    },

    heroCta: {
      marginTop: 12,
      backgroundColor: "#FFF",
      borderRadius: 999,
      paddingVertical: 16,
      paddingHorizontal: 18,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 10,
    },

    heroCtaIcon: {
      fontSize: 16,
      color: "#000",
      fontWeight: "900",
    },

    heroCtaText: {
      fontSize: 16,
      fontWeight: "900",
      color: "#000",
      letterSpacing: -0.15,
    },

    discardButton: {
      alignSelf: "center",
      marginTop: 10,
    },

    discardText: {
      fontSize: 13,
      fontWeight: "700",
      color: "rgba(255,255,255,0.62)",
    },

    // ── Section headers ──────────────────────────────────────

    sectionHeaderRow: {
      marginTop: 36,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    recentSectionHeader: {
<<<<<<< HEAD
      marginTop: 28,
    },

    workoutsSectionHeader: {
      marginTop: 32,
    },

    recipesSectionHeader: {
=======
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
      marginTop: 32,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.2,
    },

    sectionLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    sectionLinkText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.muted,
      letterSpacing: -0.1,
    },

    // ── Rails ────────────────────────────────────────────────

    prepRail: {
      paddingBottom: 8,
      paddingRight: Spacing.md,
    },

    prepCardGap: {
      marginRight: Spacing.md,
    },

<<<<<<< HEAD
    // ── Recent sessions ──────────────────────────────────────

=======
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
    recentList: {
      gap: 10,
    },

    recentCardGap: {
      marginBottom: 10,
    },

<<<<<<< HEAD
    // ── Bottom spacer ────────────────────────────────────────

=======
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739
    bottomSpacer: {
      height: 32,
    },
  });
}

function isDarkLike(background: string) {
<<<<<<< HEAD
  return (
    background === "#0B0B0C" ||
    background === "#111214" ||
    background === "#0F0F10"
  );
}
=======
  return background === "#0B0B0C" || background === "#111214";
}
>>>>>>> 2d69f957cdeb86c292827f00f709ed1b28910739

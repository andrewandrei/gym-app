import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronRight, Clock, Lock, Moon, Sun } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BarbataContentLoading from "@/components/BarbataContentLoading";
import { EditorialCard } from "@/components/ui/EditorialCard";
import {
  getProgramBySlug,
  getPublishedPrograms,
  type SupabaseProgram,
  type SupabaseProgramWorkout,
} from "@/features/programs/programs.supabase";
import {
  dismissProgramSessionDraft,
  getProgramSessionDismissals,
  getProgramSessionSkips,
  type ProgramSessionDismissal,
  type ProgramSessionSkip,
} from "@/features/programs/programSessionState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  getFeaturedRecipes,
  type RecipeItem,
} from "@/features/recipes/recipes.supabase";
import {
  getLatestIndividualWorkouts,
  type IndividualWorkout,
} from "@/features/workouts/individualWorkouts.supabase";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";

import {
  clearWorkoutDraft,
  isDraftResumable,
  loadWorkoutDraft,
  type WorkoutDraft,
} from "../../features/workout/workoutDraft";
import {
  getWorkoutHistory,
  type WorkoutHistoryEntry,
} from "../../features/workout/workoutHistory";
import { useAppSettings } from "../../providers/appSettings";
import { useEntitlements } from "../../providers/entitlements";
import { useAppTheme } from "../../providers/theme";

type CtaState = "start" | "resume";
type ProgramWorkoutStatus =
  | "not_started"
  | "partial"
  | "completed"
  | "skipped"
  | "dismissed";

type HomeProgramPlan = {
  workout: SupabaseProgramWorkout | null;
  status: ProgramWorkoutStatus;
  weekNumber: number;
  weekWorkouts: SupabaseProgramWorkout[];
  loggedThisWeek: number;
  completedThisWeek: number;
  weeklyTarget: number;
  workoutNumber: number | null;
  label: string;
  ctaLabel: string;
  helper?: string;
  canSkip: boolean;
};

const HERO_PROGRAM_ID = "strength-foundations";
const WEEKLY_TOTAL = 3;
const FINISH_SUMMARY_STORAGE_KEY = "aa_fit_finish_summary";
const START_QUOTES = [
  "Show up for yourself today.",
  "Small steps. Big results.",
  "Train with intention.",
  "Build it one session at a time.",
  "Momentum starts now.",
  "Strong habits win.",
  "Your future self will thank you.",
  "Consistency changes everything.",
  "Earn the feeling.",
  "Start strong. Finish stronger.",
];
const RESUME_QUOTES = [
  "Pick up the pace again.",
  "You’re already in motion.",
  "Finish what you started.",
  "Your progress is waiting.",
  "Keep the streak alive.",
  "One more push forward.",
  "You’re closer than you think.",
  "Get back into your rhythm.",
];

function pickFreshQuote(quotes: string[], previous?: string | null) {
  if (quotes.length === 0) return "";
  if (quotes.length === 1) return quotes[0];

  let next = quotes[Math.floor(Math.random() * quotes.length)];

  while (next === previous) {
    next = quotes[Math.floor(Math.random() * quotes.length)];
  }

  return next;
}

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
  const dayOfWeek = now.getDay();
  const monday = new Date(now);

  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  return history.filter(
    (e) => e.status === "completed" && new Date(e.completedAt) >= monday,
  ).length;
}

function calcProgramCompleted(
  history: WorkoutHistoryEntry[],
  programId: string,
): number {
  return history.filter(
    (e) =>
      e.status === "completed" &&
      (e.programId === programId || e.workoutId.startsWith(programId)),
  ).length;
}

function buildProgramMeta(program: SupabaseProgram) {
  return [
    program.level || null,
    program.durationWeeks ? `${program.durationWeeks} weeks` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function buildRouteWorkoutId(
  programSlug: string,
  workout: SupabaseProgramWorkout,
) {
  return `${programSlug}-week-${workout.weekNumber}-workout-${workout.dayNumber}`;
}

function getIsoWeekday(date = new Date()) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function getWeekdayLabel(dayNumber: number) {
  return (
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][
      dayNumber - 1
    ] ?? `Day ${dayNumber}`
  );
}

function getWorkoutHistoryStatus(
  programSlug: string,
  workout: SupabaseProgramWorkout,
  history: WorkoutHistoryEntry[],
): ProgramWorkoutStatus | null {
  const routeWorkoutId = buildRouteWorkoutId(programSlug, workout);
  const entries = history.filter(
    (entry) =>
      entry.workoutId === routeWorkoutId ||
      (entry.programId === programSlug && entry.workoutTitle === workout.title),
  );

  if (entries.some((entry) => entry.status === "completed")) return "completed";
  if (entries.some((entry) => entry.status === "partial")) return "partial";
  return null;
}

function buildHomeProgramPlan(
  program: SupabaseProgram | null,
  history: WorkoutHistoryEntry[],
  skips: ProgramSessionSkip[],
  dismissals: ProgramSessionDismissal[],
): HomeProgramPlan {
  const fallback: HomeProgramPlan = {
    workout: null,
    status: "not_started",
    weekNumber: 1,
    weekWorkouts: [],
    loggedThisWeek: 0,
    completedThisWeek: 0,
    weeklyTarget: WEEKLY_TOTAL,
    workoutNumber: null,
    label: "Program workout",
    ctaLabel: "Start workout",
    canSkip: false,
  };

  if (!program || program.workouts.length === 0) return fallback;

  const sortedWorkouts = [...program.workouts].sort(
    (a, b) => a.weekNumber - b.weekNumber || a.dayNumber - b.dayNumber || a.orderIndex - b.orderIndex,
  );

  const skipIds = new Set(
    skips
      .filter((item) => item.programId === program.slug)
      .map((item) => item.workoutId),
  );

  const dismissalIds = new Set(
    dismissals
      .filter((item) => item.programId === program.slug)
      .map((item) => item.workoutId),
  );

  const withState = sortedWorkouts.map((workout) => {
    const routeWorkoutId = buildRouteWorkoutId(program.slug, workout);
    const historyStatus = getWorkoutHistoryStatus(program.slug, workout, history);
    const isSkipped = skipIds.has(routeWorkoutId);
    const isDismissed = dismissalIds.has(routeWorkoutId);
    const status: ProgramWorkoutStatus =
      historyStatus === "completed"
        ? "completed"
        : isSkipped
          ? "skipped"
          : isDismissed
            ? "dismissed"
            : historyStatus ?? "not_started";

    return {
      workout,
      routeWorkoutId,
      status,
    };
  });

  const firstOpen =
    withState.find(
      (item) =>
        item.status !== "completed" &&
        item.status !== "skipped" &&
        item.status !== "dismissed",
    ) ??
    withState[withState.length - 1];
  const weekNumber = firstOpen?.workout.weekNumber ?? sortedWorkouts[0].weekNumber;
  const weekItems = withState.filter((item) => item.workout.weekNumber === weekNumber);
  const weekWorkouts = weekItems.map((item) => item.workout);
  const weeklyTarget = weekWorkouts.length || program.workoutsPerWeek || WEEKLY_TOTAL;
  const loggedThisWeek = weekItems.filter(
    (item) => item.status === "partial" || item.status === "completed",
  ).length;
  const completedThisWeek = weekItems.filter(
    (item) => item.status === "completed",
  ).length;

  const today = getIsoWeekday();
  const partial = weekItems.find((item) => item.status === "partial");
  const overdue = weekItems.find(
    (item) => item.status === "not_started" && item.workout.dayNumber < today,
  );
  const todayWorkout = weekItems.find(
    (item) => item.status === "not_started" && item.workout.dayNumber === today,
  );
  const upcoming = weekItems.find(
    (item) => item.status === "not_started" && item.workout.dayNumber > today,
  );
  const next =
    partial ??
    overdue ??
    todayWorkout ??
    upcoming ??
    weekItems.find((item) => item.status === "not_started") ??
    firstOpen;

  if (!next) return fallback;

  const workout = next.workout;
  const weekday = getWeekdayLabel(workout.dayNumber);
  const workoutNumber =
    sortedWorkouts.findIndex((item) => item.id === workout.id) + 1 || null;

  if (next.status === "partial") {
    return {
      workout,
      status: next.status,
      weekNumber,
      weekWorkouts,
      loggedThisWeek,
      completedThisWeek,
      weeklyTarget,
      workoutNumber,
      label: "Partial session",
      ctaLabel: "Continue session",
      helper: "You already started this one.",
      canSkip: false,
    };
  }

  if (next.status === "not_started" && workout.dayNumber < today) {
    return {
      workout,
      status: next.status,
      weekNumber,
      weekWorkouts,
      loggedThisWeek,
      completedThisWeek,
      weeklyTarget,
      workoutNumber,
      label: `Missed ${weekday}`,
      ctaLabel: "Do it today",
      helper: "No pressure. Do it today and keep the plan moving.",
      canSkip: false,
    };
  }

  if (next.status === "not_started" && workout.dayNumber === today) {
    return {
      workout,
      status: next.status,
      weekNumber,
      weekWorkouts,
      loggedThisWeek,
      completedThisWeek,
      weeklyTarget,
      workoutNumber,
      label: "Due today",
      ctaLabel: "Start today",
      helper: `${weekday} session from your plan.`,
      canSkip: false,
    };
  }

  return {
    workout,
    status: next.status,
    weekNumber,
    weekWorkouts,
    loggedThisWeek,
    completedThisWeek,
    weeklyTarget,
    workoutNumber,
    label: `Next on ${weekday}`,
    ctaLabel: "Start workout",
    helper: `Week ${workout.weekNumber} · Day ${workout.dayNumber}`,
    canSkip: false,
  };
}

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

  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatMinutes(sec: number): string {
  const min = Math.round(sec / 60);
  return `${min} min`;
}

function LockedChip({ isDark }: { isDark: boolean }) {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.28)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      <Lock
        size={14}
        color={isDark ? "rgba(255,255,255,0.46)" : "rgba(17,17,17,0.40)"}
      />
    </View>
  );
}

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

  const isDark =
    colors.background === "#0B0B0C" ||
    colors.background === "#111214" ||
    colors.background === "#0F0F10";

  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#151517";
  const borderCol = isDark ? "rgba(255,255,255,0.10)" : "#2B2B2F";
  const trackCol = isDark
    ? "rgba(255,255,255,0.12)"
    : "rgba(255,255,255,0.08)";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[
        sessionCardStyles.card,
        { backgroundColor: cardBg, borderColor: borderCol },
      ]}
    >
      <View style={sessionCardStyles.topRow}>
        <View style={sessionCardStyles.titleBlock}>
          <Text
            style={[
              sessionCardStyles.title,
              { color: isDark ? colors.text : "#FFFFFF" },
            ]}
            numberOfLines={1}
          >
            {entry.workoutTitle}
          </Text>

          <View style={sessionCardStyles.metaRow}>
            <Clock size={11} color={colors.muted} strokeWidth={2.5} />
            <Text style={[sessionCardStyles.metaText, { color: colors.muted }]}>
              {formatMinutes(entry.durationSec)}
            </Text>

            <Text style={[sessionCardStyles.metaDot, { color: colors.muted }]}>
              ·
            </Text>

            <Text
              style={[
                sessionCardStyles.metaText,
                { color: isDark ? colors.muted : "#9A9AA1" },
              ]}
            >
              {entry.totals.completedSets}/{entry.totals.totalSets} sets
            </Text>
          </View>
        </View>

        <Text
          style={[
            sessionCardStyles.dateLabel,
            { color: isDark ? colors.muted : "#9A9AA1" },
          ]}
        >
          {getSessionDateLabel(entry.completedAt)}
        </Text>
      </View>

      <View style={[sessionCardStyles.barTrack, { backgroundColor: trackCol }]}>
        <View
          style={[
            sessionCardStyles.barFill,
            {
              width: `${completionPct}%` as const,
              backgroundColor: colors.premium,
            },
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

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { settings, setAppearance } = useAppSettings();
  const { isPro } = useEntitlements();

  const [workoutCards, setWorkoutCards] = useState<IndividualWorkout[]>([]);
  const [recipeCards, setRecipeCards] = useState<RecipeItem[]>([]);
  const [activeProgram, setActiveProgram] = useState<SupabaseProgram | null>(null);
  const [workoutDraft, setWorkoutDraft] = useState<WorkoutDraft | null>(null);
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [programSkips, setProgramSkips] = useState<ProgramSessionSkip[]>([]);
  const [programDismissals, setProgramDismissals] = useState<
    ProgramSessionDismissal[]
  >([]);
  const [motivationalQuote, setMotivationalQuote] = useState(START_QUOTES[0]);
  const [programLoaded, setProgramLoaded] = useState(false);
  const [workoutsLoaded, setWorkoutsLoaded] = useState(false);
  const [recipesLoaded, setRecipesLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadActiveProgram() {
      try {
        const summaries = await getPublishedPrograms();
        const selectedSummary =
          summaries.find((program) => program.isActive) ?? summaries[0] ?? null;

        if (!selectedSummary) {
          if (mounted) {
            setActiveProgram(null);
          }
          return;
        }

        const fullProgram = await getProgramBySlug(selectedSummary.slug);

        if (mounted) {
          setActiveProgram(fullProgram);
        }
      } catch {
        if (mounted) {
          setActiveProgram(null);
        }
      } finally {
        if (mounted) {
          setProgramLoaded(true);
        }
      }
    }

    async function loadLatestWorkouts() {
      try {
        const latest = await getLatestIndividualWorkouts(4);

        if (mounted) {
          setWorkoutCards(latest);
        }
      } catch {
        if (mounted) {
          setWorkoutCards([]);
        }
      } finally {
        if (mounted) {
          setWorkoutsLoaded(true);
        }
      }
    }

    loadActiveProgram();
    loadLatestWorkouts();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadFeaturedRecipes() {
      try {
        const featured = await getFeaturedRecipes(4);

        if (mounted) {
          setRecipeCards(featured);
        }
      } catch {
        if (mounted) {
          setRecipeCards([]);
        }
      } finally {
        if (mounted) {
          setRecipesLoaded(true);
        }
      }
    }

    loadFeaturedRecipes();

    return () => {
      mounted = false;
    };
  }, []);

 

 

  const activeProgramSlug = activeProgram?.slug ?? HERO_PROGRAM_ID;

  const programTotal = useMemo(
    () => activeProgram?.workouts.length ?? 0,
    [activeProgram],
  );

  const weeklyDone = useMemo(() => calcWeeklyDone(history), [history]);
  const streakDays = useMemo(() => calcStreak(history), [history]);

  const programCompleted = useMemo(
    () => calcProgramCompleted(history, activeProgramSlug),
    [activeProgramSlug, history],
  );

  const programPlan = useMemo(
    () =>
      buildHomeProgramPlan(
        activeProgram,
        history,
        programSkips,
        programDismissals,
      ),
    [activeProgram, history, programDismissals, programSkips],
  );

  const recentSessions = useMemo(() => history.slice(0, 2), [history]);

  const draftProgress = useMemo(() => {
    if (!workoutDraft) return null;

    const totalSets = workoutDraft.exercises.reduce(
      (sum, ex) => sum + ex.sets.length,
      0,
    );

    const completedSets = workoutDraft.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.done).length,
      0,
    );

    return { totalSets, completedSets };
  }, [workoutDraft]);

  const ctaState: CtaState = workoutDraft ? "resume" : "start";
  const greetingQuotePool = ctaState === "resume" ? RESUME_QUOTES : START_QUOTES;

  const currentProgramWorkout = programPlan.workout;
  useEffect(() => {
    setMotivationalQuote((current) =>
      pickFreshQuote(greetingQuotePool, current),
    );
  }, [greetingQuotePool]);

  useFocusEffect(
    useCallback(() => {
      setMotivationalQuote((current) =>
        pickFreshQuote(greetingQuotePool, current),
      );

      const run = async () => {
        try {
          const [draft, hist, skips, dismissals] = await Promise.all([
            loadWorkoutDraft(),
            getWorkoutHistory(),
            getProgramSessionSkips(),
            getProgramSessionDismissals(),
          ]);

          setWorkoutDraft(isDraftResumable(draft) ? draft : null);
          setHistory(hist);
          setProgramSkips(skips);
          setProgramDismissals(dismissals);
        } catch {
          setWorkoutDraft(null);
          setHistory([]);
          setProgramSkips([]);
          setProgramDismissals([]);
        }
      };

      run();
    }, [greetingQuotePool]),
  );

  const programTitle = activeProgram?.title ?? "Current program";
  const programMeta = activeProgram ? buildProgramMeta(activeProgram) : "Program";
  const heroImage =
    activeProgram?.heroImageUrl || activeProgram?.cardImageUrl || "";
  const hasHeroImage = heroImage.trim().length > 0;

  const defaultWorkoutLabel = currentProgramWorkout
    ? programPlan.label
    : "Program workout";
  const defaultWorkoutName =
    currentProgramWorkout?.title ?? "Start your next session";

  const workoutLabel =
    ctaState === "resume" ? "Unfinished workout" : defaultWorkoutLabel;

  const workoutName =
    ctaState === "resume" && workoutDraft?.workoutTitle
      ? workoutDraft.workoutTitle
      : defaultWorkoutName;
  const startWorkoutLabel = programPlan.workoutNumber
    ? `Start workout ${programPlan.workoutNumber}`
    : "Start workout";

  const weeklyTarget = programPlan.weeklyTarget;
  const weeklyComplete = activeProgram ? programPlan.completedThisWeek : weeklyDone;
  const weeklyProgress = weeklyTarget > 0 ? weeklyComplete / weeklyTarget : 0;

  const greetingSub =
    ctaState === "resume" && draftProgress
      ? `${draftProgress.completedSets} of ${draftProgress.totalSets} sets completed`
      : undefined;

  const weeklyLeft = Math.max(0, weeklyTarget - weeklyComplete);
  const weeklyStatusText =
    weeklyLeft === 0
      ? "Complete"
      : activeProgram && programPlan.loggedThisWeek > programPlan.completedThisWeek
        ? `${programPlan.loggedThisWeek} started`
        : `${weeklyLeft} left`;

const startWorkout = () => {
  if (ctaState === "resume" && workoutDraft) {
    router.push({
      pathname: "/workout",
      params: {
        resumeDraft: "1",
        workoutId: workoutDraft.workoutId,
        programId: workoutDraft.programId,
        supabaseWorkoutId: workoutDraft.supabaseWorkoutId,
        supabaseWorkoutOwnerType: workoutDraft.supabaseWorkoutOwnerType,
        source: "home",
      },
    });
    return;
  }

  if (activeProgram && currentProgramWorkout) {
    router.push({
      pathname: "/workout",
      params: {
        workoutId: buildRouteWorkoutId(activeProgram.slug, currentProgramWorkout),
        supabaseWorkoutId: currentProgramWorkout.id,
        supabaseWorkoutOwnerType: "program_workout",
        programId: activeProgram.slug,
        source: "home",
      },
    });
    return;
  }

  const featuredWorkout = workoutCards[0];

  if (featuredWorkout) {
    router.push({
      pathname: "/workout",
      params: {
        workoutId: featuredWorkout.slug ?? featuredWorkout.id,
        supabaseWorkoutId: featuredWorkout.id,
        supabaseWorkoutOwnerType: "individual_workout",
        source: "home",
      },
    });
    return;
  }

  router.push("/workouts");
};

  const discardWorkout = async () => {
    if (workoutDraft?.programId && workoutDraft.workoutId) {
      const nextDismissals = await dismissProgramSessionDraft({
        programId: workoutDraft.programId,
        workoutId: workoutDraft.workoutId,
      });

      setProgramDismissals(nextDismissals);
    }

    await clearWorkoutDraft();
    setWorkoutDraft(null);
  };

  const openPlanOverview = () => {
    if (!activeProgram) return;

    router.push({
      pathname: "/program/[id]",
      params: { id: activeProgram.slug },
    });
  };

  const openAllHistory = () => {
    router.push("/workout-history");
  };

 const openWorkoutCard = (workout: IndividualWorkout) => {
  router.push({
    pathname: "/workout",
    params: {
      workoutId: workout.slug ?? workout.id,
      supabaseWorkoutId: workout.id,
      supabaseWorkoutOwnerType: "individual_workout",
      source: "home",
    },
  });
};

  const openRecipe = (slug: string) => {
    router.push({
      pathname: "/recipes/[id]",
      params: { id: slug },
    });
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
          entry.exercises?.map((ex: any) => ({
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

      await AsyncStorage.setItem(
        FINISH_SUMMARY_STORAGE_KEY,
        JSON.stringify(summary),
      );

      router.push("/workout/finish");
    } catch {
      router.push("/workout-history");
    }
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!programLoaded || !workoutsLoaded || !recipesLoaded) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BarbataContentLoading
          title="Loading home"
          subtitle="Preparing your next session."
          variant="feed"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          variant="hero"
          title={motivationalQuote}
          subtitle={greetingSub}
          right={
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.85}
              onPress={async () => {
                await setAppearance(
                  settings.appearance === "dark" ? "light" : "dark",
                );
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

        <View style={styles.weekMetaRow}>
          <Text style={styles.weekMetaLeft}>This week</Text>
          <Text style={styles.weekMetaRight}>{weeklyStatusText}</Text>
        </View>

        <View style={styles.weekProgressBg}>
          <View
            style={[
              styles.weekProgressFill,
              { width: `${Math.max(0, Math.min(1, weeklyProgress)) * 100}%` },
            ]}
          />
        </View>

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

        <View style={styles.heroCard}>
          {hasHeroImage ? (
            <ImageBackground
              source={{ uri: heroImage }}
              style={styles.heroImage}
              imageStyle={styles.heroImageRadius}
            >
              <LinearGradient
                pointerEvents="none"
                colors={[
                  "rgba(0,0,0,0.28)",
                  "rgba(0,0,0,0.08)",
                  "rgba(0,0,0,0.28)",
                  "rgba(0,0,0,0.78)",
                ]}
                locations={[0, 0.38, 0.68, 1]}
                style={styles.heroOverlay}
              />

              <View style={styles.heroTop}>
                <View style={styles.leftChips}>
                  <View style={styles.chipLight}>
                    <Text style={styles.chipLightText}>
                      {programCompleted}/{programTotal} complete
                    </Text>
                  </View>
                </View>

                {streakDays > 0 && (
                  <View style={styles.chipOutline}>
                    <Text style={styles.chipOutlineText}>
                      {streakDays}-day streak
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.heroBottom}>
                <Text style={styles.heroEyebrow}>{workoutLabel}</Text>
                <Text style={styles.heroTitle}>{workoutName}</Text>
                <Text style={styles.heroMeta}>
                  {programTitle} · {programMeta}
                </Text>

                {draftProgress && (
                  <View style={styles.metricsRow}>
                    <View style={styles.metricPill}>
                      <Text style={styles.metricPillText}>
                        {draftProgress.completedSets}/{draftProgress.totalSets}{" "}
                        sets logged
                      </Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.heroCta}
                  onPress={startWorkout}
                  activeOpacity={0.9}
                >
                  <Text style={styles.heroCtaIcon}>▶</Text>
                  <Text style={styles.heroCtaText}>
                    {ctaState === "resume" ? "Resume workout" : startWorkoutLabel}
                  </Text>
                </TouchableOpacity>

                {ctaState === "resume" && (
                  <TouchableOpacity
                    onPress={discardWorkout}
                    style={styles.discardButton}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.discardText}>Dismiss workout</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ImageBackground>
          ) : (
            <View
              style={[
                styles.heroImage,
                styles.heroImageRadius,
                { backgroundColor: colors.card },
              ]}
            >
              <LinearGradient
                pointerEvents="none"
                colors={[
                  "rgba(0,0,0,0.28)",
                  "rgba(0,0,0,0.08)",
                  "rgba(0,0,0,0.28)",
                  "rgba(0,0,0,0.78)",
                ]}
                locations={[0, 0.38, 0.68, 1]}
                style={styles.heroOverlay}
              />

              <View style={styles.heroTop}>
                <View style={styles.leftChips}>
                  <View style={styles.chipLight}>
                    <Text style={styles.chipLightText}>
                      {programCompleted}/{programTotal} complete
                    </Text>
                  </View>
                </View>

                {streakDays > 0 && (
                  <View style={styles.chipOutline}>
                    <Text style={styles.chipOutlineText}>
                      {streakDays}-day streak
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.heroBottom}>
                <Text style={styles.heroEyebrow}>{workoutLabel}</Text>
                <Text style={styles.heroTitle}>{workoutName}</Text>
                <Text style={styles.heroMeta}>
                  {programTitle} · {programMeta}
                </Text>

                {draftProgress && (
                  <View style={styles.metricsRow}>
                    <View style={styles.metricPill}>
                      <Text style={styles.metricPillText}>
                        {draftProgress.completedSets}/{draftProgress.totalSets}{" "}
                        sets logged
                      </Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.heroCta}
                  onPress={startWorkout}
                  activeOpacity={0.9}
                >
                  <Text style={styles.heroCtaIcon}>▶</Text>
                  <Text style={styles.heroCtaText}>
                    {ctaState === "resume" ? "Resume workout" : startWorkoutLabel}
                  </Text>
                </TouchableOpacity>

                {ctaState === "resume" && (
                  <TouchableOpacity
                    onPress={discardWorkout}
                    style={styles.discardButton}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.discardText}>Dismiss workout</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

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
          {workoutCards.map((card: IndividualWorkout, index) => {
            const isLocked = card.access === "premium" && !isPro;

            return (
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
                  metaBold={`${card.type} ~${card.durationMin} min`}
                  metaMuted={card.meta}
                  imageUrl={card.imageUrl}
                  active={!!card.isActive}
                  theme={colors}
                  topRightAccessory={
                    isLocked ? <LockedChip isDark={isDark} /> : undefined
                  }
                  onPress={() => {
                    if (isLocked) {
                      router.push("/paywall");
                      return;
                    }

                    openWorkoutCard(card);
                  }}
                />
              </View>
            );
          })}
        </ScrollView>

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
          {recipeCards.map((card: RecipeItem, index) => {
            const isLocked = card.access === "premium" && !isPro;

            return (
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
                  metaBold={`${card.category || "Recipe"} ~${
                    card.prepTimeMin ?? 0
                  } min`}
                  metaMuted={
                    card.calories
                      ? `${card.calories} kcal · ${
                          card.proteinG ?? 0
                        }g protein`
                      : card.tags.slice(0, 2).join(" · ")
                  }
                  imageUrl={card.imageUrl}
                  width={210}
                  mediaHeight={210}
                  theme={colors}
                  topRightAccessory={
                    isLocked ? <LockedChip isDark={isDark} /> : undefined
                  }
                  onPress={() => {
                    if (isLocked) {
                      router.push("/paywall");
                      return;
                    }

                    openRecipe(card.slug);
                  }}
                />
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

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

    sectionHeaderRow: {
      marginTop: 36,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    recentSectionHeader: {
      marginTop: 28,
    },

    workoutsSectionHeader: {
      marginTop: 32,
    },

    recipesSectionHeader: {
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

    prepRail: {
      paddingBottom: 8,
      paddingRight: Spacing.md,
    },

    prepCardGap: {
      marginRight: Spacing.md,
    },

    recentList: {
      gap: 10,
    },

    recentCardGap: {
      marginBottom: 10,
    },

    bottomSpacer: {
      height: 32,
    },
  });
}

function isDarkLike(background: string) {
  return (
    background === "#0B0B0C" ||
    background === "#111214" ||
    background === "#0F0F10"
  );
}

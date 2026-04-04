// app/lib/progress/progressEngine.ts

import type { WorkoutHistoryEntry } from "../../workout/workoutHistory";
import type {
  ExerciseProgressCard,
  ProgressBodyMetricsBlock,
  ProgressChart,
  ProgressChartPoint,
  ProgressCharts,
  ProgressEmptyState,
  ProgressHighlightExercise,
  ProgressHighlightPR,
  ProgressHighlightSession,
  ProgressHighlights,
  ProgressOverview,
  ProgressRange,
  ProgressScreenData,
  ProgressSelectedDaySummary,
  ProgressSessionRow,
  ProgressWeekCalendar,
  ProgressWeekDay,
} from "./types";

type HistoryExercise = WorkoutHistoryEntry["exercises"][number];
type HistorySet = HistoryExercise["sets"][number];

type PRRecord = {
  exerciseId: string;
  exerciseName: string;
  type: "weight" | "reps" | "volume";
  valueLabel: string;
  achievedAt: string;
  sessionId: string;
};

type ExerciseAggregate = {
  exerciseId: string;
  exerciseName: string;
  unitLabel: string;
  sessions: Array<{
    sessionId: string;
    completedAt: string;
    status: "partial" | "completed";
    exercise: HistoryExercise;
  }>;
};

function toNumber(value?: string | number | null): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = parseFloat(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getSetVolume(weight?: string | number | null, reps?: string | number | null): number {
  const w = toNumber(weight);
  const r = toNumber(reps);

  if (w == null || r == null || w <= 0 || r <= 0) return 0;
  return w * r;
}

function normalizeExerciseName(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
}

function endOfWeek(date: Date) {
  return endOfDay(addDays(startOfWeek(date), 6));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function isoDayKey(dateLike: string | Date) {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatShortDate(dateLike: string | Date) {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatRecentDateLabel(dateLike: string | Date, now: Date) {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const todayKey = isoDayKey(now);
  const yesterdayKey = isoDayKey(addDays(now, -1));
  const key = isoDayKey(d);

  if (key === todayKey) return "Today";
  if (key === yesterdayKey) return "Yesterday";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDurationShort(seconds: number) {
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${mins} min`;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getTrendFromPoints(points: ProgressChartPoint[]): "up" | "down" | "flat" {
  const filtered = points.filter((p) => Number.isFinite(p.value));
  if (filtered.length < 2) return "flat";

  const first = filtered[0]?.value ?? 0;
  const last = filtered[filtered.length - 1]?.value ?? 0;

  if (last > first) return "up";
  if (last < first) return "down";
  return "flat";
}

function sortHistoryDesc(history: WorkoutHistoryEntry[]) {
  return [...history].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

function getRangeStart(range: ProgressRange, now: Date) {
  const end = endOfDay(now);

  if (range === "7D") {
    return startOfDay(addDays(now, -6));
  }

  if (range === "30D") {
    return startOfDay(addDays(now, -29));
  }

  return new Date(0);
}

function getRangeSubtitle(range: ProgressRange) {
  if (range === "7D") return "Last 7 days";
  if (range === "30D") return "Last 30 days";
  return "All time";
}

function buildDailyBuckets(now: Date, days: number) {
  const buckets: Array<{ key: string; label: string; start: Date; end: Date; date: string }> =
    [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const current = addDays(startOfDay(now), -i);
    buckets.push({
      key: isoDayKey(current),
      label: current.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      start: startOfDay(current),
      end: endOfDay(current),
      date: startOfDay(current).toISOString(),
    });
  }

  return buckets;
}

function buildWeeklyBuckets(now: Date, daysBack: number) {
  const start = startOfDay(addDays(now, -(daysBack - 1)));
  const end = endOfDay(now);

  const buckets: Array<{ key: string; label: string; start: Date; end: Date; date: string }> =
    [];
  let cursor = startOfWeek(start);

  while (cursor <= end) {
    const weekStart = startOfWeek(cursor);
    const weekEnd = endOfWeek(cursor);
    buckets.push({
      key: isoDayKey(weekStart),
      label: `${weekStart.toLocaleDateString("en-US", { month: "short" })} ${weekStart.getDate()}`,
      start: weekStart,
      end: weekEnd,
      date: weekStart.toISOString(),
    });

    cursor = addDays(weekStart, 7);
  }

  return buckets.filter((bucket) => bucket.end >= start && bucket.start <= end);
}

function buildMonthlyBuckets(history: WorkoutHistoryEntry[], now: Date) {
  const sorted = sortHistoryDesc(history);
  const oldest = sorted[sorted.length - 1];
  const start = oldest ? startOfMonth(new Date(oldest.completedAt)) : startOfMonth(now);
  const end = endOfMonth(now);

  const buckets: Array<{ key: string; label: string; start: Date; end: Date; date: string }> =
    [];
  let cursor = new Date(start);

  while (cursor <= end) {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);

    buckets.push({
      key: `${monthStart.getFullYear()}-${`${monthStart.getMonth() + 1}`.padStart(2, "0")}`,
      label: monthStart.toLocaleDateString("en-US", { month: "short" }),
      start: monthStart,
      end: monthEnd,
      date: monthStart.toISOString(),
    });

    cursor = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  }

  return buckets;
}

function getBucketsForRange(
  history: WorkoutHistoryEntry[],
  range: ProgressRange,
  now: Date,
): Array<{ key: string; label: string; start: Date; end: Date; date: string }> {
  if (range === "7D") return buildDailyBuckets(now, 7);
  if (range === "30D") return buildWeeklyBuckets(now, 30);

  if (history.length <= 12) {
    return buildWeeklyBuckets(now, 84);
  }

  return buildMonthlyBuckets(history, now);
}

function filterSessionsForBucket(
  history: WorkoutHistoryEntry[],
  bucket: { start: Date; end: Date },
) {
  return history.filter((entry) => {
    const completedAt = new Date(entry.completedAt).getTime();
    return completedAt >= bucket.start.getTime() && completedAt <= bucket.end.getTime();
  });
}

function buildExerciseMap(history: WorkoutHistoryEntry[]): Map<string, ExerciseAggregate> {
  const map = new Map<string, ExerciseAggregate>();

  history.forEach((entry) => {
    entry.exercises.forEach((exercise) => {
      const key = exercise.id || normalizeExerciseName(exercise.name);
      const existing = map.get(key);

      if (existing) {
        existing.sessions.push({
          sessionId: entry.sessionId,
          completedAt: entry.completedAt,
          status: entry.status,
          exercise,
        });
      } else {
        map.set(key, {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          unitLabel: exercise.unitLabel,
          sessions: [
            {
              sessionId: entry.sessionId,
              completedAt: entry.completedAt,
              status: entry.status,
              exercise,
            },
          ],
        });
      }
    });
  });

  map.forEach((value) => {
    value.sessions.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
  });

  return map;
}

function compareExerciseSessions(
  latest: HistoryExercise | null,
  previous: HistoryExercise | null,
): {
  result: "better" | "same" | "mixed" | "no_data";
  improvedSets: number;
  matchedSets: number;
  belowSets: number;
  prCount: number;
  recentDelta?: {
    weight?: number;
    reps?: number;
    volume?: number;
  };
} {
  if (!latest || !previous) {
    return {
      result: "no_data",
      improvedSets: 0,
      matchedSets: 0,
      belowSets: 0,
      prCount: 0,
    };
  }

  const latestDoneSets = latest.sets.filter((set) => set.done);
  const previousDoneSets = previous.sets.filter((set) => set.done);

  let improvedSets = 0;
  let matchedSets = 0;
  let belowSets = 0;

  latestDoneSets.forEach((set, idx) => {
    const prev = previousDoneSets.find((item) => item.set === set.set) ?? previousDoneSets[idx];
    if (!prev) return;

    const currentWeight = toNumber(set.weight) ?? 0;
    const currentReps = toNumber(set.reps) ?? 0;
    const currentVolume = getSetVolume(set.weight, set.reps);

    const previousWeight = toNumber(prev.weight) ?? 0;
    const previousReps = toNumber(prev.reps) ?? 0;
    const previousVolume = getSetVolume(prev.weight, prev.reps);

    if (
      currentWeight === previousWeight &&
      currentReps === previousReps &&
      Math.round(currentVolume) === Math.round(previousVolume)
    ) {
      matchedSets += 1;
      return;
    }

    if (
      currentWeight > previousWeight ||
      currentReps > previousReps ||
      currentVolume > previousVolume
    ) {
      improvedSets += 1;
      return;
    }

    belowSets += 1;
  });

  let result: "better" | "same" | "mixed" | "no_data" = "no_data";

  if (improvedSets > 0 && belowSets === 0) result = "better";
  else if (matchedSets > 0 && improvedSets === 0 && belowSets === 0) result = "same";
  else if (improvedSets > 0 || belowSets > 0 || matchedSets > 0) result = "mixed";

  const latestBestWeight = latestDoneSets.reduce((max, set) => {
    const value = toNumber(set.weight) ?? 0;
    return Math.max(max, value);
  }, 0);

  const previousBestWeight = previousDoneSets.reduce((max, set) => {
    const value = toNumber(set.weight) ?? 0;
    return Math.max(max, value);
  }, 0);

  const latestBestReps = latestDoneSets.reduce((max, set) => {
    const value = toNumber(set.reps) ?? 0;
    return Math.max(max, value);
  }, 0);

  const previousBestReps = previousDoneSets.reduce((max, set) => {
    const value = toNumber(set.reps) ?? 0;
    return Math.max(max, value);
  }, 0);

  const latestVolume = latestDoneSets.reduce((sum, set) => {
    return sum + getSetVolume(set.weight, set.reps);
  }, 0);

  const previousVolume = previousDoneSets.reduce((sum, set) => {
    return sum + getSetVolume(prev.weight, prev.reps);
  }, 0);

  return {
    result,
    improvedSets,
    matchedSets,
    belowSets,
    prCount: 0,
    recentDelta: {
      weight: latestBestWeight - previousBestWeight || undefined,
      reps: latestBestReps - previousBestReps || undefined,
      volume: latestVolume - previousVolume || undefined,
    },
  };
}

function detectPRs(history: WorkoutHistoryEntry[]): PRRecord[] {
  const sortedAsc = [...history].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
  );

  const bestByExercise = new Map<
    string,
    {
      weight: number;
      reps: number;
      volume: number;
    }
  >();

  const prs: PRRecord[] = [];

  sortedAsc.forEach((entry) => {
    entry.exercises.forEach((exercise) => {
      const key = exercise.id || normalizeExerciseName(exercise.name);
      const previousBest = bestByExercise.get(key) ?? {
        weight: 0,
        reps: 0,
        volume: 0,
      };

      let bestWeightInSession = 0;
      let bestRepsInSession = 0;
      let bestVolumeInSession = 0;

      exercise.sets
        .filter((set) => set.done)
        .forEach((set) => {
          const weight = toNumber(set.weight) ?? 0;
          const reps = toNumber(set.reps) ?? 0;
          const volume = getSetVolume(set.weight, set.reps);

          bestWeightInSession = Math.max(bestWeightInSession, weight);
          bestRepsInSession = Math.max(bestRepsInSession, reps);
          bestVolumeInSession = Math.max(bestVolumeInSession, volume);
        });

      if (bestWeightInSession > previousBest.weight) {
        prs.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          type: "weight",
          valueLabel: `${bestWeightInSession} ${exercise.unitLabel.toLowerCase()}`,
          achievedAt: entry.completedAt,
          sessionId: entry.sessionId,
        });
      }

      if (bestRepsInSession > previousBest.reps) {
        prs.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          type: "reps",
          valueLabel: `${bestRepsInSession} reps`,
          achievedAt: entry.completedAt,
          sessionId: entry.sessionId,
        });
      }

      if (bestVolumeInSession > previousBest.volume) {
        prs.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          type: "volume",
          valueLabel: `${Math.round(bestVolumeInSession)} volume`,
          achievedAt: entry.completedAt,
          sessionId: entry.sessionId,
        });
      }

      bestByExercise.set(key, {
        weight: Math.max(previousBest.weight, bestWeightInSession),
        reps: Math.max(previousBest.reps, bestRepsInSession),
        volume: Math.max(previousBest.volume, bestVolumeInSession),
      });
    });
  });

  return prs.sort(
    (a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime(),
  );
}

export function filterHistoryByRange(params: {
  history: WorkoutHistoryEntry[];
  range: ProgressRange;
  now?: Date;
}): WorkoutHistoryEntry[] {
  const now = params.now ?? new Date();
  const start = getRangeStart(params.range, now);
  const end = endOfDay(now);

  return sortHistoryDesc(params.history).filter((entry) => {
    const completedAt = new Date(entry.completedAt).getTime();
    return completedAt >= start.getTime() && completedAt <= end.getTime();
  });
}

export function buildProgressOverview(params: {
  history: WorkoutHistoryEntry[];
  now?: Date;
}): ProgressOverview {
  const now = params.now ?? new Date();
  const history = params.history;

  const totalSessions = history.length;
  const completedSessions = history.filter((entry) => entry.status === "completed").length;
  const partialSessions = history.filter((entry) => entry.status === "partial").length;

  const completedSets = history.reduce((sum, entry) => sum + entry.totals.completedSets, 0);
  const totalPlannedSets = history.reduce((sum, entry) => sum + entry.totals.totalSets, 0);
  const totalVolume = history.reduce((sum, entry) => sum + entry.totals.totalVolume, 0);
  const totalDurationSec = history.reduce((sum, entry) => sum + entry.durationSec, 0);

  const completionRate =
    totalPlannedSets > 0 ? clamp01(completedSets / totalPlannedSets) : 0;

  const averageSessionDurationSec =
    totalSessions > 0 ? Math.round(totalDurationSec / totalSessions) : 0;

  const activeDays = new Set(history.map((entry) => isoDayKey(entry.completedAt))).size;

  const dayKeys = new Set(history.map((entry) => isoDayKey(entry.completedAt)));
  let currentStreakDays = 0;
  let cursor = startOfDay(now);

  while (dayKeys.has(isoDayKey(cursor))) {
    currentStreakDays += 1;
    cursor = addDays(cursor, -1);
  }

  return {
    totalSessions,
    completedSessions,
    partialSessions,
    completedSets,
    totalPlannedSets,
    totalVolume,
    totalDurationSec,
    completionRate,
    averageSessionDurationSec,
    activeDays,
    currentStreakDays,
  };
}

export function buildWorkoutCountChart(params: {
  history: WorkoutHistoryEntry[];
  range: ProgressRange;
  now?: Date;
}): ProgressChart {
  const now = params.now ?? new Date();
  const buckets = getBucketsForRange(params.history, params.range, now);

  const points: ProgressChartPoint[] = buckets.map((bucket) => {
    const sessions = filterSessionsForBucket(params.history, bucket);

    return {
      key: bucket.key,
      label: bucket.label,
      value: sessions.length,
      date: bucket.date,
    };
  });

  return {
    id: "workouts",
    title: "Workouts",
    subtitle: getRangeSubtitle(params.range),
    points,
    trend: getTrendFromPoints(points),
    summaryLabel: `${points.reduce((sum, point) => sum + point.value, 0)} sessions`,
    empty: points.every((point) => point.value === 0),
  };
}

export function buildVolumeChart(params: {
  history: WorkoutHistoryEntry[];
  range: ProgressRange;
  now?: Date;
}): ProgressChart {
  const now = params.now ?? new Date();
  const buckets = getBucketsForRange(params.history, params.range, now);

  const points: ProgressChartPoint[] = buckets.map((bucket) => {
    const sessions = filterSessionsForBucket(params.history, bucket);
    const value = sessions.reduce((sum, session) => sum + session.totals.totalVolume, 0);

    return {
      key: bucket.key,
      label: bucket.label,
      value,
      date: bucket.date,
    };
  });

  const total = points.reduce((sum, point) => sum + point.value, 0);

  return {
    id: "volume",
    title: "Volume",
    subtitle: getRangeSubtitle(params.range),
    points,
    trend: getTrendFromPoints(points),
    summaryLabel: `${Math.round(total)} total volume`,
    empty: points.every((point) => point.value === 0),
  };
}

export function buildCompletionChart(params: {
  history: WorkoutHistoryEntry[];
  range: ProgressRange;
  now?: Date;
}): ProgressChart {
  const now = params.now ?? new Date();
  const buckets = getBucketsForRange(params.history, params.range, now);

  const points: ProgressChartPoint[] = buckets.map((bucket) => {
    const sessions = filterSessionsForBucket(params.history, bucket);
    const totalCompletedSets = sessions.reduce(
      (sum, session) => sum + session.totals.completedSets,
      0,
    );
    const totalPlannedSets = sessions.reduce(
      (sum, session) => sum + session.totals.totalSets,
      0,
    );

    const rate =
      totalPlannedSets > 0 ? (totalCompletedSets / totalPlannedSets) * 100 : 0;

    return {
      key: bucket.key,
      label: bucket.label,
      value: Math.round(rate),
      date: bucket.date,
    };
  });

  const nonEmpty = points.filter((point) => point.value > 0);
  const average =
    nonEmpty.length > 0
      ? Math.round(nonEmpty.reduce((sum, point) => sum + point.value, 0) / nonEmpty.length)
      : 0;

  return {
    id: "completion",
    title: "Completion",
    subtitle: getRangeSubtitle(params.range),
    points,
    trend: getTrendFromPoints(points),
    summaryLabel: `${average}% average`,
    empty: points.every((point) => point.value === 0),
  };
}

export function buildProgressWeekCalendar(params: {
  history: WorkoutHistoryEntry[];
  now?: Date;
  selectedDayKey?: string;
}): ProgressWeekCalendar {
  const now = params.now ?? new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const weekEntries = params.history.filter((entry) => {
    const completedAt = new Date(entry.completedAt).getTime();
    return completedAt >= weekStart.getTime() && completedAt <= weekEnd.getTime();
  });

  const days: ProgressWeekDay[] = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const key = isoDayKey(date);
    const sessions = weekEntries.filter((entry) => isoDayKey(entry.completedAt) === key);

    let status: ProgressWeekDay["status"] = "none";
    const hasCompleted = sessions.some((entry) => entry.status === "completed");
    const hasPartial = sessions.some((entry) => entry.status === "partial");

    if (hasCompleted && hasPartial) status = "mixed";
    else if (hasCompleted) status = "completed";
    else if (hasPartial) status = "partial";

    return {
      key,
      label: date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      dateLabel: formatShortDate(date),
      isToday: key === isoDayKey(now),
      sessionCount: sessions.length,
      status,
    };
  });

  const selectedDayKey = params.selectedDayKey ?? isoDayKey(now);
  const selectedSessions = sortHistoryDesc(
    weekEntries.filter((entry) => isoDayKey(entry.completedAt) === selectedDayKey),
  );

  let selectedDaySummary: ProgressSelectedDaySummary | null = null;

  if (selectedSessions.length > 0) {
    const latest = selectedSessions[0];
    const hasCompleted = selectedSessions.some((entry) => entry.status === "completed");
    const hasPartial = selectedSessions.some((entry) => entry.status === "partial");

    let primaryStatus: ProgressSelectedDaySummary["primaryStatus"] = "none";
    if (hasCompleted && hasPartial) primaryStatus = "mixed";
    else if (hasCompleted) primaryStatus = "completed";
    else if (hasPartial) primaryStatus = "partial";

    const completionPct =
      latest.totals.totalSets > 0
        ? Math.round((latest.totals.completedSets / latest.totals.totalSets) * 100)
        : 0;

    selectedDaySummary = {
      key: selectedDayKey,
      dateLabel: formatShortDate(selectedDayKey),
      sessionCount: selectedSessions.length,
      primaryStatus,
      title: latest.workoutTitle,
      subtitle: `${formatDurationShort(latest.durationSec)} • ${latest.totals.completedSets}/${latest.totals.totalSets} sets • ${completionPct}%`,
      note:
        latest.status === "partial"
          ? "Partial session saved"
          : selectedSessions.length > 1
            ? `${selectedSessions.length} sessions logged`
            : undefined,
      latestSessionId: latest.sessionId,
      latestWorkoutId: latest.workoutId,
    };
  } else {
    selectedDaySummary = {
      key: selectedDayKey,
      dateLabel: formatShortDate(selectedDayKey),
      sessionCount: 0,
      primaryStatus: "none",
      title: "No session",
      subtitle: "Nothing logged for this day",
    };
  }

  return {
    weekLabel: `${formatShortDate(weekStart)} – ${formatShortDate(weekEnd)}`,
    days,
    selectedDayKey,
    selectedDaySummary,
  };
}

export function buildProgressHighlights(params: {
  history: WorkoutHistoryEntry[];
  range: ProgressRange;
}): ProgressHighlights {
  const allHistory = sortHistoryDesc(params.history);
  const prs = detectPRs(allHistory);

  const latestPR: ProgressHighlightPR | null = prs[0] ?? null;

  const strongest = [...params.history].sort((a, b) => {
    if (b.totals.totalVolume !== a.totals.totalVolume) {
      return b.totals.totalVolume - a.totals.totalVolume;
    }
    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
  })[0];

  const strongestSession: ProgressHighlightSession | null = strongest
    ? {
        sessionId: strongest.sessionId,
        workoutId: strongest.workoutId,
        workoutTitle: strongest.workoutTitle,
        totalVolume: strongest.totals.totalVolume,
        completedAt: strongest.completedAt,
        status: strongest.status,
      }
    : null;

  const exercises = buildExerciseProgressCards({
    history: allHistory,
    range: params.range,
  });

  const mostImproved = exercises
    .filter((exercise) => exercise.trend.result === "better" || exercise.trend.result === "mixed")
    .sort((a, b) => {
      if (b.trend.improvedSets !== a.trend.improvedSets) {
        return b.trend.improvedSets - a.trend.improvedSets;
      }
      if (b.trend.prCount !== a.trend.prCount) {
        return b.trend.prCount - a.trend.prCount;
      }
      return new Date(b.lastTrainedAt).getTime() - new Date(a.lastTrainedAt).getTime();
    })[0];

  const mostImprovedExercise: ProgressHighlightExercise | null = mostImproved
    ? {
        exerciseId: mostImproved.exerciseId,
        exerciseName: mostImproved.exerciseName,
        result:
          mostImproved.trend.result === "no_data" ? "mixed" : mostImproved.trend.result,
        improvedSets: mostImproved.trend.improvedSets,
        prCount: mostImproved.trend.prCount,
        lastTrainedAt: mostImproved.lastTrainedAt,
      }
    : null;

  return {
    latestPR,
    strongestSession,
    mostImprovedExercise,
  };
}

export function buildExerciseProgressCards(params: {
  history: WorkoutHistoryEntry[];
  range: ProgressRange;
}): ExerciseProgressCard[] {
  const allHistoryDesc = sortHistoryDesc(params.history);
  const exerciseMap = buildExerciseMap(allHistoryDesc);

  const cards: ExerciseProgressCard[] = [];

  exerciseMap.forEach((aggregate) => {
    const sortedSessions = aggregate.sessions;
    const latest = sortedSessions[0] ?? null;
    const previous = sortedSessions[1] ?? null;

    let bestWeight = 0;
    let bestReps = 0;
    let bestVolume = 0;

    aggregate.sessions.forEach((session) => {
      session.exercise.sets
        .filter((set) => set.done)
        .forEach((set) => {
          const weight = toNumber(set.weight) ?? 0;
          const reps = toNumber(set.reps) ?? 0;
          const volume = getSetVolume(set.weight, set.reps);

          bestWeight = Math.max(bestWeight, weight);
          bestReps = Math.max(bestReps, reps);
          bestVolume = Math.max(bestVolume, volume);
        });
    });

    const comparison = compareExerciseSessions(
      latest?.exercise ?? null,
      previous?.exercise ?? null,
    );

    cards.push({
      exerciseId: aggregate.exerciseId,
      exerciseName: aggregate.exerciseName,
      unitLabel: aggregate.unitLabel,
      sessionsLogged: aggregate.sessions.length,
      lastTrainedAt: latest?.completedAt ?? "",
      bestWeight: bestWeight || undefined,
      bestReps: bestReps || undefined,
      bestVolume: bestVolume || undefined,
      latestSession: latest
        ? {
            sessionId: latest.sessionId,
            completedAt: latest.completedAt,
            status: latest.status,
            completedSets: latest.exercise.completedSets,
            totalSetsPlanned: latest.exercise.totalSetsPlanned,
            sessionVolume: latest.exercise.sessionVolume,
          }
        : null,
      trend: comparison,
      recentDelta: comparison.recentDelta,
    });
  });

  return cards.sort(
    (a, b) => new Date(b.lastTrainedAt).getTime() - new Date(a.lastTrainedAt).getTime(),
  );
}

export function buildRecentSessionRows(params: {
  history: WorkoutHistoryEntry[];
  range: ProgressRange;
  limit?: number;
}): ProgressSessionRow[] {
  const now = new Date();
  const history = sortHistoryDesc(params.history);
  const limit = params.limit ?? 5;

  return history.slice(0, limit).map((entry) => ({
    sessionId: entry.sessionId,
    workoutId: entry.workoutId,
    workoutTitle: entry.workoutTitle,
    completedAt: entry.completedAt,
    dateLabel: formatRecentDateLabel(entry.completedAt, now),
    durationSec: entry.durationSec,
    completedSets: entry.totals.completedSets,
    totalSets: entry.totals.totalSets,
    completionRate:
      entry.totals.totalSets > 0
        ? clamp01(entry.totals.completedSets / entry.totals.totalSets)
        : 0,
    totalVolume: entry.totals.totalVolume,
    status: entry.status,
  }));
}

export function buildBodyMetricsBlock(): ProgressBodyMetricsBlock {
  return {
    weight: {
      label: "Weight",
      valueLabel: "—",
      trend: "no_data",
      trendLabel: "No data yet",
      updatedAtLabel: "Not tracked",
      isPlaceholder: true,
    },
    waist: {
      label: "Waist",
      valueLabel: "—",
      trend: "no_data",
      trendLabel: "No data yet",
      updatedAtLabel: "Not tracked",
      isPlaceholder: true,
    },
    hasRealData: false,
  };
}

export function buildProgressEmptyState(params: {
  history: WorkoutHistoryEntry[];
  filteredHistory: WorkoutHistoryEntry[];
  charts: ProgressCharts;
  highlights: ProgressHighlights;
  exercises: ExerciseProgressCard[];
}): ProgressEmptyState {
  const hasAnyHistory = params.history.length > 0;

  const nonEmptyCharts = [
    params.charts.workouts,
    params.charts.volume,
    params.charts.completion,
  ].filter((chart) => !chart.empty);

  const hasEnoughDataForCharts = nonEmptyCharts.length > 0;

  const hasEnoughDataForComparisons = params.exercises.some(
    (exercise) => exercise.trend.result !== "no_data",
  );

  const hasAnyVolumeData = params.filteredHistory.some(
    (entry) => entry.totals.totalVolume > 0,
  );

  const hasAnyPRData = !!params.highlights.latestPR;

  return {
    hasAnyHistory,
    hasEnoughDataForCharts,
    hasEnoughDataForComparisons,
    hasAnyVolumeData,
    hasAnyPRData,
  };
}

export function buildProgressScreenData(params: {
  history: WorkoutHistoryEntry[];
  range: ProgressRange;
  now?: Date;
  selectedDayKey?: string;
}): ProgressScreenData {
  const now = params.now ?? new Date();
  const allHistory = sortHistoryDesc(params.history);
  const filteredHistory = filterHistoryByRange({
    history: allHistory,
    range: params.range,
    now,
  });

  const overview = buildProgressOverview({
    history: filteredHistory,
    now,
  });

  const charts: ProgressCharts = {
    workouts: buildWorkoutCountChart({
      history: filteredHistory,
      range: params.range,
      now,
    }),
    volume: buildVolumeChart({
      history: filteredHistory,
      range: params.range,
      now,
    }),
    completion: buildCompletionChart({
      history: filteredHistory,
      range: params.range,
      now,
    }),
  };

  const calendar = buildProgressWeekCalendar({
    history: allHistory,
    now,
    selectedDayKey: params.selectedDayKey,
  });

  const highlights = buildProgressHighlights({
    history: filteredHistory,
    range: params.range,
  });

  const exercises = buildExerciseProgressCards({
    history: filteredHistory,
    range: params.range,
  });

  const recentSessions = buildRecentSessionRows({
    history: filteredHistory,
    range: params.range,
    limit: 5,
  });

  const bodyMetrics = buildBodyMetricsBlock();

  const emptyState = buildProgressEmptyState({
    history: allHistory,
    filteredHistory,
    charts,
    highlights,
    exercises,
  });

  return {
    range: params.range,
    overview,
    charts,
    calendar,
    highlights,
    exercises,
    recentSessions,
    bodyMetrics,
    emptyState,
  };
}
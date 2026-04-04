import AsyncStorage from "@react-native-async-storage/async-storage";

export const ACTIVE_WORKOUT_DRAFT_KEY = "aa_fit_active_workout_draft";
export const FINISH_SUMMARY_STORAGE_KEY = "aa_fit_finish_summary";
export const WORKOUT_HISTORY_STORAGE_KEY = "aa_fit_workout_history";

export type LegacyHistorySet = {
  set: number;
  weight: string;
  reps: string;
  rest: string;
  done: boolean;
};

export type LegacyExerciseHistorySession = {
  id: string;
  dateLabel: string;
  sets: LegacyHistorySet[];
};

export type LegacyHistoryByExerciseId = Record<string, LegacyExerciseHistorySession[]>;

export type WorkoutInputSet = {
  id?: string;
  weight?: string;
  reps?: string;
  rest?: string;
  done?: boolean;
  note?: string;
  isWarmup?: boolean;
};

export type WorkoutInputExercise = {
  id: string;
  name: string;
  unitLabel?: string;
  sets: WorkoutInputSet[];
};

export type WorkoutHistorySet = {
  id: string;
  setIndex: number;
  weight: string;
  reps: string;
  rest: string;
  done: boolean;
  note?: string;
  isWarmup?: boolean;
};

export type WorkoutHistoryExercise = {
  exerciseId: string;
  name: string;
  unitLabel: string;
  orderIndex: number;
  totalSetsPlanned: number;
  completedSets: number;
  sets: WorkoutHistorySet[];
};

export type WorkoutTotals = {
  completedSets: number;
  totalSets: number;
  completedExercises: number;
  totalExercises: number;
  totalVolume: number;
  trackedStrengthVolume: number;
};

export type WorkoutHistoryEntry = {
  sessionId: string;
  workoutId: string;
  workoutTitle: string;
  programId?: string | null;
  programTitle?: string | null;
  startedAt: string;
  endedAt: string;
  dateKey: string;
  status: "partial" | "completed";
  totals: WorkoutTotals;
  exercises: WorkoutHistoryExercise[];
};

export type SetMetricSnapshot = {
  weight?: number | null;
  reps?: number | null;
  volume?: number | null;
};

export type SetComparisonState = "no-data" | "matched" | "improved" | "below" | "pr";

export type SetComparison = {
  setIndex: number;
  current: SetMetricSnapshot;
  previous: SetMetricSnapshot | null;
  best: SetMetricSnapshot | null;
  deltaVsPrevious: {
    weight?: number | null;
    reps?: number | null;
    volume?: number | null;
  };
  deltaVsBest: {
    weight?: number | null;
    reps?: number | null;
    volume?: number | null;
  };
  state: SetComparisonState;
  flags: {
    hasPreviousData: boolean;
    hasBestData: boolean;
    improvedVsPrevious: boolean;
    matchedPrevious: boolean;
    belowPrevious: boolean;
    newWeightPR: boolean;
    newRepPR: boolean;
    newVolumePR: boolean;
  };
};

export type FinishPR = {
  exerciseId: string;
  exerciseName: string;
  setIndex: number;
  type: "weight" | "reps" | "volume";
  label: string;
  weight: string;
  reps: string;
  current: number;
  previousBest: number;
  delta: number;
};

export type FinishWin = {
  exerciseId: string;
  exerciseName: string;
  type: "heavier" | "more_reps" | "matched" | "volume_up";
  label: string;
};

export type FinishExerciseSet = {
  id: string;
  set: number;
  weight: string;
  reps: string;
  rest: string;
  done: boolean;
  comparison: SetComparison;
};

export type FinishExerciseSummary = {
  id: string;
  name: string;
  completedSets: number;
  totalSetsPlanned: number;
  unitLabel: string;
  sessionVolume: number;
  comparedToLast?: {
    previousWeight?: number;
    previousReps?: number;
    previousVolume?: number;
    result: "better" | "same" | "mixed" | "no_data";
  };
  comparedToBest?: {
    bestSessionVolume?: number;
    totalVolumeDelta?: number | null;
  };
  insights: {
    improvedSets: number;
    matchedSets: number;
    belowSets: number;
    prCount: number;
  };
  sets: FinishExerciseSet[];
};

export type FinishSummary = {
  sessionId: string;
  workoutId: string;
  workoutTitle: string;
  programId?: string | null;
  programTitle?: string | null;
  status: "partial" | "completed";
  finishedAt: string;
  durationSec: number;
  totals: WorkoutTotals;
  insights: {
    completionRate: number;
    prCount: number;
    missingLoadCount: number;
    strengthSetCount: number;
    avgTrackedLoad: number;
    improvedExerciseCount: number;
    matchedExerciseCount: number;
    belowExerciseCount: number;
  };
  prs: FinishPR[];
  wins: FinishWin[];
  exercises: FinishExerciseSummary[];
};

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function toNumber(value?: string | number | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function calcVolume(weight?: string | number | null, reps?: string | number | null) {
  const w = toNumber(weight);
  const r = toNumber(reps);

  if (w == null || r == null) return null;
  if (w <= 0 || r <= 0) return null;

  return w * r;
}

function isMeaningfulSet(set: {
  weight?: string;
  reps?: string;
  rest?: string;
  done?: boolean;
  note?: string;
}) {
  return !!set.done || !!set.note?.trim() || !!set.weight?.trim() || !!set.reps?.trim() || !!set.rest?.trim();
}

function isMeaningfulPerformance(set: {
  weight?: string;
  reps?: string;
  done?: boolean;
  isWarmup?: boolean;
}) {
  if (!set.done) return false;
  if (set.isWarmup) return false;

  const hasWeight = (toNumber(set.weight) ?? 0) > 0;
  const hasReps = (toNumber(set.reps) ?? 0) > 0;

  return hasWeight || hasReps;
}

function buildDateKey(isoString: string) {
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getWorkoutHistory(): Promise<WorkoutHistoryEntry[]> {
  const raw = await AsyncStorage.getItem(WORKOUT_HISTORY_STORAGE_KEY);
  const parsed = readJson<WorkoutHistoryEntry[]>(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

export async function saveWorkoutHistory(history: WorkoutHistoryEntry[]) {
  await AsyncStorage.setItem(WORKOUT_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export async function persistFinishSummary(summary: FinishSummary) {
  await AsyncStorage.setItem(FINISH_SUMMARY_STORAGE_KEY, JSON.stringify(summary));
}

export async function readFinishSummary(): Promise<FinishSummary | null> {
  const raw = await AsyncStorage.getItem(FINISH_SUMMARY_STORAGE_KEY);
  return readJson<FinishSummary | null>(raw, null);
}

function normalizeExerciseInput(
  exercise: WorkoutInputExercise,
  orderIndex: number,
): WorkoutHistoryExercise {
  const sets: WorkoutHistorySet[] = exercise.sets.map((set, setIndex) => ({
    id: set.id || createId(`set_${exercise.id}_${setIndex}`),
    setIndex,
    weight: set.weight ?? "",
    reps: set.reps ?? "",
    rest: set.rest ?? "",
    done: !!set.done,
    note: set.note ?? "",
    isWarmup: !!set.isWarmup,
  }));

  return {
    exerciseId: exercise.id,
    name: exercise.name,
    unitLabel: exercise.unitLabel ?? "KG",
    orderIndex,
    totalSetsPlanned: sets.length,
    completedSets: sets.filter((set) => !!set.done).length,
    sets,
  };
}

function buildTotals(exercises: WorkoutHistoryExercise[]): WorkoutTotals {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.totalSetsPlanned, 0);
  const completedSets = exercises.reduce((sum, ex) => sum + ex.completedSets, 0);
  const completedExercises = exercises.filter((ex) => ex.completedSets > 0).length;

  let totalVolume = 0;
  let trackedStrengthVolume = 0;

  exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      if (!set.done) return;

      const volume = calcVolume(set.weight, set.reps);
      if (volume) {
        totalVolume += volume;
      }

      if (ex.unitLabel === "KG" || ex.unitLabel === "LBS") {
        if (volume) trackedStrengthVolume += volume;
      }
    });
  });

  return {
    completedSets,
    totalSets,
    completedExercises,
    totalExercises: exercises.length,
    totalVolume,
    trackedStrengthVolume,
  };
}

function findPreviousWorkoutSession(
  history: WorkoutHistoryEntry[],
  workoutId: string,
  currentSessionId: string,
) {
  return history
    .filter((entry) => entry.workoutId === workoutId && entry.sessionId !== currentSessionId)
    .sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime())[0];
}

function findMatchingExerciseInHistoryEntry(
  entry: WorkoutHistoryEntry | undefined,
  exerciseId: string,
  exerciseName: string,
) {
  if (!entry) return null;

  const byId = entry.exercises.find((ex) => ex.exerciseId === exerciseId);
  if (byId) return byId;

  const normalized = normalizeName(exerciseName);
  return entry.exercises.find((ex) => normalizeName(ex.name) === normalized) ?? null;
}

function getLegacyPreviousSession(
  legacyHistoryByExerciseId: LegacyHistoryByExerciseId | undefined,
  exerciseId: string,
) {
  const sessions = legacyHistoryByExerciseId?.[exerciseId] ?? [];
  return sessions[0] ?? null;
}

function getSnapshotFromHistorySet(
  set: { weight?: string | number | null; reps?: string | number | null } | null | undefined,
): SetMetricSnapshot | null {
  if (!set) return null;

  const weight = toNumber(set.weight);
  const reps = toNumber(set.reps);
  const volume = calcVolume(set.weight, set.reps);

  const hasAny = weight != null || reps != null || volume != null;
  if (!hasAny) return null;

  return {
    weight,
    reps,
    volume,
  };
}

function getBestHistoricalSetSnapshot(
  history: WorkoutHistoryEntry[],
  legacyHistoryByExerciseId: LegacyHistoryByExerciseId | undefined,
  exerciseId: string,
  exerciseName: string,
  setIndex: number,
) {
  const candidates: SetMetricSnapshot[] = [];

  history.forEach((entry) => {
    const ex = findMatchingExerciseInHistoryEntry(entry, exerciseId, exerciseName);
    if (!ex) return;

    const set = ex.sets[setIndex];
    const snapshot = getSnapshotFromHistorySet(set);

    if (snapshot) candidates.push(snapshot);
  });

  const legacySessions = legacyHistoryByExerciseId?.[exerciseId] ?? [];
  legacySessions.forEach((session) => {
    const set = session.sets[setIndex];
    const snapshot = getSnapshotFromHistorySet(set);
    if (snapshot) candidates.push(snapshot);
  });

  if (!candidates.length) return null;

  return candidates.reduce<SetMetricSnapshot | null>((best, current) => {
    if (!best) return current;

    const bestVolume = best.volume ?? -1;
    const currentVolume = current.volume ?? -1;

    if (currentVolume > bestVolume) return current;
    if (currentVolume < bestVolume) return best;

    const bestWeight = best.weight ?? -1;
    const currentWeight = current.weight ?? -1;
    if (currentWeight > bestWeight) return current;
    if (currentWeight < bestWeight) return best;

    const bestReps = best.reps ?? -1;
    const currentReps = current.reps ?? -1;

    return currentReps > bestReps ? current : best;
  }, null);
}

function compareCurrentVsPrevious(
  current: SetMetricSnapshot,
  previous: SetMetricSnapshot | null,
) {
  if (!previous) {
    return {
      improved: false,
      matched: false,
      below: false,
    };
  }

  const currentVolume = current.volume;
  const prevVolume = previous.volume;

  if (currentVolume != null && prevVolume != null) {
    if (currentVolume > prevVolume) {
      return { improved: true, matched: false, below: false };
    }

    if (currentVolume < prevVolume) {
      return { improved: false, matched: false, below: true };
    }

    const currentWeight = current.weight ?? 0;
    const prevWeight = previous.weight ?? 0;
    const currentReps = current.reps ?? 0;
    const prevReps = previous.reps ?? 0;

    if (currentWeight === prevWeight && currentReps === prevReps) {
      return { improved: false, matched: true, below: false };
    }

    if (currentWeight > prevWeight) {
      return { improved: true, matched: false, below: false };
    }

    if (currentWeight < prevWeight) {
      return { improved: false, matched: false, below: true };
    }

    if (currentReps > prevReps) {
      return { improved: true, matched: false, below: false };
    }

    if (currentReps < prevReps) {
      return { improved: false, matched: false, below: true };
    }

    return { improved: false, matched: true, below: false };
  }

  const currentWeight = current.weight ?? null;
  const prevWeight = previous.weight ?? null;
  const currentReps = current.reps ?? null;
  const prevReps = previous.reps ?? null;

  if (currentWeight != null && prevWeight != null) {
    if (currentWeight > prevWeight) return { improved: true, matched: false, below: false };
    if (currentWeight < prevWeight) return { improved: false, matched: false, below: true };
  }

  if (currentReps != null && prevReps != null) {
    if (currentReps > prevReps) return { improved: true, matched: false, below: false };
    if (currentReps < prevReps) return { improved: false, matched: false, below: true };
  }

  if (currentWeight === prevWeight && currentReps === prevReps) {
    return { improved: false, matched: true, below: false };
  }

  return { improved: false, matched: false, below: false };
}

function buildSetComparison(params: {
  setIndex: number;
  currentSet: WorkoutHistorySet;
  previousSet?: { weight?: string; reps?: string } | null;
  bestSet?: SetMetricSnapshot | null;
}) {
  const current = getSnapshotFromHistorySet(params.currentSet) ?? {};
  const previous = getSnapshotFromHistorySet(params.previousSet ?? null);
  const best = params.bestSet ?? null;

  const deltaVsPrevious = {
    weight:
      current.weight != null && previous?.weight != null
        ? current.weight - previous.weight
        : null,
    reps:
      current.reps != null && previous?.reps != null
        ? current.reps - previous.reps
        : null,
    volume:
      current.volume != null && previous?.volume != null
        ? current.volume - previous.volume
        : null,
  };

  const deltaVsBest = {
    weight:
      current.weight != null && best?.weight != null
        ? current.weight - best.weight
        : null,
    reps:
      current.reps != null && best?.reps != null
        ? current.reps - best.reps
        : null,
    volume:
      current.volume != null && best?.volume != null
        ? current.volume - best.volume
        : null,
  };

  const base = compareCurrentVsPrevious(current, previous);

  const eligibleForPR = isMeaningfulPerformance(params.currentSet);
  const newWeightPR =
    eligibleForPR &&
    best?.weight != null &&
    current.weight != null &&
    current.weight > best.weight;

  const newRepPR =
    eligibleForPR &&
    best?.reps != null &&
    current.reps != null &&
    current.reps > best.reps;

  const newVolumePR =
    eligibleForPR &&
    best?.volume != null &&
    current.volume != null &&
    current.volume > best.volume;

  const state: SetComparisonState =
    newWeightPR || newRepPR || newVolumePR
      ? "pr"
      : !previous
        ? "no-data"
        : base.improved
          ? "improved"
          : base.matched
            ? "matched"
            : base.below
              ? "below"
              : "no-data";

  return {
    setIndex: params.setIndex,
    current,
    previous,
    best,
    deltaVsPrevious,
    deltaVsBest,
    state,
    flags: {
      hasPreviousData: !!previous,
      hasBestData: !!best,
      improvedVsPrevious: base.improved,
      matchedPrevious: base.matched,
      belowPrevious: base.below,
      newWeightPR,
      newRepPR,
      newVolumePR,
    },
  } satisfies SetComparison;
}

function getExerciseBestSummary(
  history: WorkoutHistoryEntry[],
  legacyHistoryByExerciseId: LegacyHistoryByExerciseId | undefined,
  exerciseId: string,
  exerciseName: string,
) {
  let bestSessionVolume: number | null = null;

  history.forEach((entry) => {
    const ex = findMatchingExerciseInHistoryEntry(entry, exerciseId, exerciseName);
    if (!ex) return;

    const volume = ex.sets.reduce((sum, set) => {
      const v = calcVolume(set.weight, set.reps);
      return v ? sum + v : sum;
    }, 0);

    if (bestSessionVolume == null || volume > bestSessionVolume) {
      bestSessionVolume = volume;
    }
  });

  const legacySessions = legacyHistoryByExerciseId?.[exerciseId] ?? [];
  legacySessions.forEach((session) => {
    const volume = session.sets.reduce((sum, set) => {
      const v = calcVolume(set.weight, set.reps);
      return v ? sum + v : sum;
    }, 0);

    if (bestSessionVolume == null || volume > bestSessionVolume) {
      bestSessionVolume = volume;
    }
  });

  return bestSessionVolume;
}

export async function finalizeWorkoutSession(params: {
  sessionId: string;
  workoutId: string;
  workoutTitle: string;
  programId?: string | null;
  programTitle?: string | null;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  status: "partial" | "completed";
  exercises: WorkoutInputExercise[];
  legacyHistoryByExerciseId?: LegacyHistoryByExerciseId;
}) {
  const normalizedExercises = params.exercises.map((exercise, index) =>
    normalizeExerciseInput(exercise, index),
  );

  const totals = buildTotals(normalizedExercises);

  const historyEntry: WorkoutHistoryEntry = {
    sessionId: params.sessionId,
    workoutId: params.workoutId,
    workoutTitle: params.workoutTitle,
    programId: params.programId ?? null,
    programTitle: params.programTitle ?? null,
    startedAt: params.startedAt,
    endedAt: params.endedAt,
    dateKey: buildDateKey(params.endedAt),
    status: params.status,
    totals,
    exercises: normalizedExercises,
  };

  const existingHistory = await getWorkoutHistory();
  const previousWorkout = findPreviousWorkoutSession(
    existingHistory,
    params.workoutId,
    params.sessionId,
  );

  const prs: FinishPR[] = [];
  const wins: FinishWin[] = [];

  let strengthSetCount = 0;
  let missingLoadCount = 0;
  let totalTrackedLoad = 0;
  let trackedLoadCount = 0;

  const exerciseSummaries: FinishExerciseSummary[] = normalizedExercises.map((exercise) => {
    const previousExercise =
      findMatchingExerciseInHistoryEntry(previousWorkout, exercise.exerciseId, exercise.name) ??
      null;

    const legacyPreviousSession = getLegacyPreviousSession(
      params.legacyHistoryByExerciseId,
      exercise.exerciseId,
    );

    const previousSetsSource =
      previousExercise?.sets ??
      legacyPreviousSession?.sets.map((set, index) => ({
        id: `legacy_${exercise.exerciseId}_${index}`,
        setIndex: index,
        weight: set.weight ?? "",
        reps: set.reps ?? "",
        rest: set.rest ?? "",
        done: !!set.done,
      })) ??
      [];

    const previousWeight = previousSetsSource.reduce((max, set) => {
      const w = toNumber(set.weight) ?? 0;
      return Math.max(max, w);
    }, 0);

    const previousReps = previousSetsSource.reduce((max, set) => {
      const r = toNumber(set.reps) ?? 0;
      return Math.max(max, r);
    }, 0);

    const previousVolume = previousSetsSource.reduce((sum, set) => {
      const volume = calcVolume(set.weight, set.reps);
      return volume ? sum + volume : sum;
    }, 0);

    let improvedSets = 0;
    let matchedSets = 0;
    let belowSets = 0;
    let prCount = 0;

    const finishSets: FinishExerciseSet[] = exercise.sets.map((set, setIndex) => {
      const comparison = buildSetComparison({
        setIndex,
        currentSet: set,
        previousSet: previousSetsSource[setIndex] ?? null,
        bestSet: getBestHistoricalSetSnapshot(
          existingHistory,
          params.legacyHistoryByExerciseId,
          exercise.exerciseId,
          exercise.name,
          setIndex,
        ),
      });

      if (comparison.flags.improvedVsPrevious) improvedSets += 1;
      if (comparison.flags.matchedPrevious) matchedSets += 1;
      if (comparison.flags.belowPrevious) belowSets += 1;

      if (exercise.unitLabel === "KG" || exercise.unitLabel === "LBS") {
        if (set.done) {
          strengthSetCount += 1;

          const weight = toNumber(set.weight);
          if (!weight || weight <= 0) {
            missingLoadCount += 1;
          } else {
            totalTrackedLoad += weight;
            trackedLoadCount += 1;
          }
        }
      }

      const weightValue = toNumber(set.weight);
      const repsValue = toNumber(set.reps);
      const volumeValue = calcVolume(set.weight, set.reps);

      if (comparison.flags.newWeightPR && weightValue != null) {
        prCount += 1;
        prs.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          setIndex,
          type: "weight",
          label: `+${comparison.deltaVsBest.weight} ${exercise.unitLabel.toLowerCase()} vs best`,
          weight: set.weight,
          reps: set.reps,
          current: weightValue,
          previousBest: comparison.best?.weight ?? 0,
          delta: comparison.deltaVsBest.weight ?? 0,
        });
      }

      if (comparison.flags.newRepPR && repsValue != null) {
        prCount += 1;
        prs.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          setIndex,
          type: "reps",
          label: `+${comparison.deltaVsBest.reps} reps vs best`,
          weight: set.weight,
          reps: set.reps,
          current: repsValue,
          previousBest: comparison.best?.reps ?? 0,
          delta: comparison.deltaVsBest.reps ?? 0,
        });
      }

      if (comparison.flags.newVolumePR && volumeValue != null) {
        prCount += 1;
        prs.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          setIndex,
          type: "volume",
          label: `+${comparison.deltaVsBest.volume} volume vs best`,
          weight: set.weight,
          reps: set.reps,
          current: volumeValue,
          previousBest: comparison.best?.volume ?? 0,
          delta: comparison.deltaVsBest.volume ?? 0,
        });
      }

      return {
        id: set.id,
        set: setIndex + 1,
        weight: set.weight,
        reps: set.reps,
        rest: set.rest,
        done: set.done,
        comparison,
      };
    });

    const sessionVolume = exercise.sets.reduce((sum, set) => {
      const volume = set.done ? calcVolume(set.weight, set.reps) : null;
      return volume ? sum + volume : sum;
    }, 0);

    const currentBestWeight = exercise.sets.reduce((max, set) => {
      const w = toNumber(set.weight) ?? 0;
      return set.done ? Math.max(max, w) : max;
    }, 0);

    const currentBestReps = exercise.sets.reduce((max, set) => {
      const r = toNumber(set.reps) ?? 0;
      return set.done ? Math.max(max, r) : max;
    }, 0);

    if (previousSetsSource.length && exercise.completedSets > 0) {
      if (currentBestWeight > previousWeight) {
        wins.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          type: "heavier",
          label: "Heavier than last session",
        });
      } else if (currentBestReps > previousReps) {
        wins.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          type: "more_reps",
          label: "More reps than last session",
        });
      } else if (sessionVolume > previousVolume && sessionVolume > 0) {
        wins.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          type: "volume_up",
          label: "Higher session volume",
        });
      } else if (
        currentBestWeight === previousWeight &&
        currentBestReps === previousReps &&
        currentBestWeight > 0
      ) {
        wins.push({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          type: "matched",
          label: "Matched last session",
        });
      }
    }

    let comparedToLast: FinishExerciseSummary["comparedToLast"] = {
      result: "no_data",
    };

    if (previousSetsSource.length) {
      let result: "better" | "same" | "mixed" | "no_data" = "mixed";

      if (improvedSets > 0 && belowSets === 0) {
        result = "better";
      } else if (improvedSets === 0 && belowSets === 0 && matchedSets > 0) {
        result = "same";
      } else if (improvedSets === 0 && belowSets === 0 && sessionVolume === previousVolume) {
        result = "same";
      }

      comparedToLast = {
        previousWeight: previousWeight || undefined,
        previousReps: previousReps || undefined,
        previousVolume: previousVolume || undefined,
        result,
      };
    }

    const bestSessionVolume = getExerciseBestSummary(
      existingHistory,
      params.legacyHistoryByExerciseId,
      exercise.exerciseId,
      exercise.name,
    );

    return {
      id: exercise.exerciseId,
      name: exercise.name,
      completedSets: exercise.completedSets,
      totalSetsPlanned: exercise.totalSetsPlanned,
      unitLabel: exercise.unitLabel,
      sessionVolume,
      comparedToLast,
      comparedToBest: {
        bestSessionVolume: bestSessionVolume ?? undefined,
        totalVolumeDelta:
          bestSessionVolume != null ? sessionVolume - bestSessionVolume : null,
      },
      insights: {
        improvedSets,
        matchedSets,
        belowSets,
        prCount,
      },
      sets: finishSets,
    };
  });

  const improvedExerciseCount = exerciseSummaries.filter(
    (ex) => ex.comparedToLast?.result === "better",
  ).length;

  const matchedExerciseCount = exerciseSummaries.filter(
    (ex) => ex.comparedToLast?.result === "same",
  ).length;

  const belowExerciseCount = exerciseSummaries.filter(
    (ex) =>
      ex.insights.belowSets > 0 &&
      ex.insights.improvedSets === 0 &&
      ex.comparedToLast?.result !== "no_data",
  ).length;

  const summary: FinishSummary = {
    sessionId: params.sessionId,
    workoutId: params.workoutId,
    workoutTitle: params.workoutTitle,
    programId: params.programId ?? null,
    programTitle: params.programTitle ?? null,
    status: params.status,
    finishedAt: params.endedAt,
    durationSec: params.durationSec,
    totals,
    insights: {
      completionRate: totals.totalSets > 0 ? totals.completedSets / totals.totalSets : 0,
      prCount: prs.length,
      missingLoadCount,
      strengthSetCount,
      avgTrackedLoad: trackedLoadCount > 0 ? totalTrackedLoad / trackedLoadCount : 0,
      improvedExerciseCount,
      matchedExerciseCount,
      belowExerciseCount,
    },
    prs,
    wins,
    exercises: exerciseSummaries,
  };

  const nextHistory = [historyEntry, ...existingHistory].sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
  );

  await saveWorkoutHistory(nextHistory);
  await persistFinishSummary(summary);
  await AsyncStorage.removeItem(ACTIVE_WORKOUT_DRAFT_KEY);

  return {
    historyEntry,
    summary,
  };
}
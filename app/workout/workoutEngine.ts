//app/workout/workoutEngine.ts
import type {
    HistoryWorkoutExercise,
    HistoryWorkoutSet,
    WorkoutHistoryEntry,
} from "./workoutHistory";

export type EngineSetInput = {
  id?: string;
  weight?: string;
  reps?: string;
  rest?: string;
  done?: boolean;
  note?: string;
};

export type EngineExerciseInput = {
  id: string;
  name: string;
  unitLabel: string;
  sets: EngineSetInput[];
};

export type SetComparison = {
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

export type FinishSummary = {
  sessionId: string;
  workoutId: string;
  workoutTitle: string;
  programId?: string;
  status: "partial" | "completed";
  durationSec: number;
  totals: {
    completedSets: number;
    totalSets: number;
    completedExercises: number;
    totalExercises: number;
    totalVolume: number;
    trackedStrengthVolume: number;
  };
  insights: {
    completionRate: number;
    prCount: number;
    missingLoadCount: number;
    strengthSetCount: number;
    avgTrackedLoad: number;
    improvedExerciseCount: number;
    matchedExerciseCount: number;
    belowExerciseCount: number;
    improvedSetCount: number;
    matchedSetCount: number;
    belowSetCount: number;
    previousSessionFound: boolean;
  };
  prs: Array<{
    exerciseId: string;
    exerciseName: string;
    set: number;
    type: "weight" | "reps" | "volume";
    previousBestValue: number;
    currentValue: number;
    delta: number;
    weight: string;
    reps: string;
  }>;
  wins: Array<{
    exerciseId: string;
    exerciseName: string;
    type: "heavier" | "more_reps" | "matched" | "volume_up";
    label: string;
  }>;
  exercises: Array<{
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
      bestWeight?: number;
      bestReps?: number;
      bestVolume?: number;
      result: "better" | "same" | "mixed" | "no_data";
    };
    insights: {
      improvedSets: number;
      matchedSets: number;
      belowSets: number;
      prCount: number;
    };
    sets: Array<{
      set: number;
      weight: string;
      reps: string;
      rest: string;
      done: boolean;
      note?: string;
      comparison?: SetComparison;
    }>;
  }>;
};

export type BuildFinishSummaryParams = {
  sessionId: string;
  workoutId: string;
  workoutTitle: string;
  programId?: string;
  status: "partial" | "completed";
  durationSec: number;
  exercises: EngineExerciseInput[];
  history: WorkoutHistoryEntry[];
};

export type BuildFinishSummaryResult = {
  summary: FinishSummary;
  historyEntry: WorkoutHistoryEntry;
};

export function toNumber(value?: string | number | null): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const n = parseFloat(value.trim());
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

export function getSetVolume(
  weight?: string | number | null,
  reps?: string | number | null,
): number {
  const w = toNumber(weight);
  const r = toNumber(reps);

  if (w == null || r == null || w <= 0 || r <= 0) return 0;
  return w * r;
}

export function normalizeExerciseName(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

export function makeSessionId(workoutId: string): string {
  return `${workoutId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function buildHistoryExerciseFromInput(
  exercise: EngineExerciseInput,
): HistoryWorkoutExercise {
  const sets: HistoryWorkoutSet[] = exercise.sets.map((set, idx) => ({
    set: idx + 1,
    weight: set.weight ?? "",
    reps: set.reps ?? "",
    rest: set.rest ?? "",
    done: !!set.done,
    note: set.note ?? "",
  }));

  const doneSets = sets.filter((set) => set.done);
  const sessionVolume = doneSets.reduce(
    (sum, set) => sum + getSetVolume(set.weight, set.reps),
    0,
  );

  return {
    id: exercise.id,
    name: exercise.name,
    unitLabel: exercise.unitLabel,
    completedSets: doneSets.length,
    totalSetsPlanned: sets.length,
    sessionVolume,
    sets,
  };
}

export function findMatchingExerciseFromEntry(
  entry: WorkoutHistoryEntry | null,
  exerciseId: string,
  exerciseName: string,
): HistoryWorkoutExercise | null {
  if (!entry) return null;

  return (
    entry.exercises.find((ex) => ex.id === exerciseId) ??
    entry.exercises.find(
      (ex) => normalizeExerciseName(ex.name) === normalizeExerciseName(exerciseName),
    ) ??
    null
  );
}

export function findSetByNumber(
  exercise: HistoryWorkoutExercise | null,
  setNumber: number,
): HistoryWorkoutSet | null {
  if (!exercise) return null;
  return exercise.sets.find((set) => set.set === setNumber && set.done) ?? null;
}

export function findBestSetAtIndexAcrossHistory(
  history: WorkoutHistoryEntry[],
  exerciseId: string,
  exerciseName: string,
  setNumber: number,
): HistoryWorkoutSet | null {
  let best: HistoryWorkoutSet | null = null;
  let bestVolume = -1;
  let bestWeight = -1;
  let bestReps = -1;

  for (const entry of history) {
    const exercise = findMatchingExerciseFromEntry(entry, exerciseId, exerciseName);
    const set = findSetByNumber(exercise, setNumber);
    if (!set) continue;

    const weight = toNumber(set.weight) ?? 0;
    const reps = toNumber(set.reps) ?? 0;
    const volume = getSetVolume(set.weight, set.reps);

    const isBetter =
      volume > bestVolume ||
      (volume === bestVolume && weight > bestWeight) ||
      (volume === bestVolume && weight === bestWeight && reps > bestReps);

    if (isBetter) {
      best = set;
      bestVolume = volume;
      bestWeight = weight;
      bestReps = reps;
    }
  }

  return best;
}

export function buildFinishSummary({
  sessionId,
  workoutId,
  workoutTitle,
  programId,
  status,
  durationSec,
  exercises,
  history,
}: BuildFinishSummaryParams): BuildFinishSummaryResult {
  const currentHistoryExercises = exercises.map(buildHistoryExerciseFromInput);

  const completedExercisesOnly = currentHistoryExercises
    .map((ex) => {
      const completedSetsOnly = ex.sets
        .filter((set) => set.done)
        .map((set) => ({
          set: set.set,
          weight: set.weight ?? "",
          reps: set.reps ?? "",
          rest: set.rest ?? "",
          done: !!set.done,
          note: set.note ?? "",
        }));

      if (completedSetsOnly.length === 0) return null;

      return {
        id: ex.id,
        name: ex.name,
        completedSets: completedSetsOnly.length,
        totalSetsPlanned: ex.totalSetsPlanned,
        unitLabel: ex.unitLabel,
        sessionVolume: ex.sessionVolume,
        sets: completedSetsOnly,
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    name: string;
    completedSets: number;
    totalSetsPlanned: number;
    unitLabel: string;
    sessionVolume: number;
    sets: Array<{
      set: number;
      weight: string;
      reps: string;
      rest: string;
      done: boolean;
      note?: string;
    }>;
  }>;

  const totalSets = currentHistoryExercises.reduce(
    (sum, ex) => sum + ex.totalSetsPlanned,
    0,
  );
  const totalCompletedSets = completedExercisesOnly.reduce(
    (sum, ex) => sum + ex.completedSets,
    0,
  );
  const totalExercisesCount = currentHistoryExercises.length;
  const completedExercisesCount = completedExercisesOnly.length;
  const completionRate = totalSets > 0 ? totalCompletedSets / totalSets : 0;

  let strengthSetCount = 0;
  let missingLoadCount = 0;
  let trackedStrengthVolume = 0;
  let totalTrackedLoad = 0;
  let trackedLoadCount = 0;

  currentHistoryExercises.forEach((exercise) => {
    const isStrengthExercise =
      exercise.unitLabel === "LBS" || exercise.unitLabel === "KG";

    exercise.sets.forEach((set) => {
      if (!set.done) return;

      if (isStrengthExercise) {
        strengthSetCount += 1;

        const rawWeight = (set.weight ?? "").trim();
        const weightVal = parseFloat(rawWeight);

        if (!rawWeight || Number.isNaN(weightVal) || weightVal <= 0) {
          missingLoadCount += 1;
        } else {
          totalTrackedLoad += weightVal;
          trackedLoadCount += 1;
        }

        const repsVal = parseFloat(set.reps ?? "");
        if (
          !Number.isNaN(weightVal) &&
          !Number.isNaN(repsVal) &&
          weightVal > 0 &&
          repsVal > 0
        ) {
          trackedStrengthVolume += weightVal * repsVal;
        }
      }
    });
  });

  const totalVolume = completedExercisesOnly.reduce(
    (sum, ex) => sum + ex.sessionVolume,
    0,
  );
  const avgTrackedLoad = trackedLoadCount > 0 ? totalTrackedLoad / trackedLoadCount : 0;

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  const previousWorkout = sortedHistory[0] ?? null;
  const previousSessionFound = !!previousWorkout;

  const prs: FinishSummary["prs"] = [];
  const wins: FinishSummary["wins"] = [];

  let improvedExerciseCount = 0;
  let matchedExerciseCount = 0;
  let belowExerciseCount = 0;
  let improvedSetCount = 0;
  let matchedSetCount = 0;
  let belowSetCount = 0;

  const finishedExercises: FinishSummary["exercises"] = completedExercisesOnly.map((exercise) => {
    const previousExercise = findMatchingExerciseFromEntry(
      previousWorkout,
      exercise.id,
      exercise.name,
    );

    const bestExerciseHistory = sortedHistory
      .map((entry) => findMatchingExerciseFromEntry(entry, exercise.id, exercise.name))
      .filter(Boolean) as HistoryWorkoutExercise[];

    let exerciseImprovedSets = 0;
    let exerciseMatchedSets = 0;
    let exerciseBelowSets = 0;
    let exercisePrCount = 0;

    const sets = exercise.sets.map((set) => {
      const currentWeight = toNumber(set.weight);
      const currentReps = toNumber(set.reps);
      const currentVolume = getSetVolume(set.weight, set.reps);

      const previousSet = findSetByNumber(previousExercise, set.set);
      const previousWeight = toNumber(previousSet?.weight);
      const previousReps = toNumber(previousSet?.reps);
      const previousVolume = previousSet
        ? getSetVolume(previousSet.weight, previousSet.reps)
        : null;

      const bestSet = findBestSetAtIndexAcrossHistory(
        sortedHistory,
        exercise.id,
        exercise.name,
        set.set,
      );

      const bestWeight = toNumber(bestSet?.weight);
      const bestReps = toNumber(bestSet?.reps);
      const bestVolume = bestSet ? getSetVolume(bestSet.weight, bestSet.reps) : null;

      let state: SetComparison["state"] = "no_data";
      let isWeightPR = false;
      let isRepPR = false;
      let isVolumePR = false;

      if (bestWeight != null && currentWeight != null && currentWeight > bestWeight) {
        isWeightPR = true;
      }
      if (bestReps != null && currentReps != null && currentReps > bestReps) {
        isRepPR = true;
      }
      if (bestVolume != null && currentVolume > bestVolume) {
        isVolumePR = true;
      }

      if (isWeightPR || isRepPR || isVolumePR) {
        state = "pr";
      } else if (
        previousWeight == null &&
        previousReps == null &&
        (previousVolume == null || previousVolume === 0)
      ) {
        state = "no_data";
      } else {
        const weightDelta =
          currentWeight != null && previousWeight != null
            ? currentWeight - previousWeight
            : 0;

        const repsDelta =
          currentReps != null && previousReps != null ? currentReps - previousReps : 0;

        const volumeDelta =
          previousVolume != null ? currentVolume - previousVolume : 0;

        if (volumeDelta > 0 || weightDelta > 0 || repsDelta > 0) {
          state = "better";
        } else if (
          (currentWeight ?? 0) === (previousWeight ?? 0) &&
          (currentReps ?? 0) === (previousReps ?? 0) &&
          Math.round(currentVolume) === Math.round(previousVolume ?? 0)
        ) {
          state = "same";
        } else {
          state = "mixed";
        }
      }

      if (state === "pr" || state === "better") {
        exerciseImprovedSets += 1;
        improvedSetCount += 1;
      } else if (state === "same") {
        exerciseMatchedSets += 1;
        matchedSetCount += 1;
      } else if (state === "mixed") {
        exerciseBelowSets += 1;
        belowSetCount += 1;
      }

      const newPrEntries: FinishSummary["prs"] = [];

      if (isWeightPR && currentWeight != null && bestWeight != null) {
        newPrEntries.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          set: set.set,
          type: "weight",
          previousBestValue: bestWeight,
          currentValue: currentWeight,
          delta: currentWeight - bestWeight,
          weight: set.weight,
          reps: set.reps,
        });
      }

      if (isRepPR && currentReps != null && bestReps != null) {
        newPrEntries.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          set: set.set,
          type: "reps",
          previousBestValue: bestReps,
          currentValue: currentReps,
          delta: currentReps - bestReps,
          weight: set.weight,
          reps: set.reps,
        });
      }

      if (isVolumePR && bestVolume != null) {
        newPrEntries.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          set: set.set,
          type: "volume",
          previousBestValue: bestVolume,
          currentValue: currentVolume,
          delta: currentVolume - bestVolume,
          weight: set.weight,
          reps: set.reps,
        });
      }

      if (newPrEntries.length > 0) {
        prs.push(...newPrEntries);
        exercisePrCount += newPrEntries.length;
      }

      return {
        ...set,
        comparison: {
          previous:
            previousWeight != null || previousReps != null || previousVolume != null
              ? {
                  weight: previousWeight ?? undefined,
                  reps: previousReps ?? undefined,
                  volume: previousVolume ?? undefined,
                }
              : undefined,
          deltaVsPrevious:
            previousWeight != null || previousReps != null || previousVolume != null
              ? {
                  weight:
                    currentWeight != null && previousWeight != null
                      ? currentWeight - previousWeight
                      : undefined,
                  reps:
                    currentReps != null && previousReps != null
                      ? currentReps - previousReps
                      : undefined,
                  volume:
                    previousVolume != null ? currentVolume - previousVolume : undefined,
                }
              : undefined,
          best:
            bestWeight != null || bestReps != null || bestVolume != null
              ? {
                  weight: bestWeight ?? undefined,
                  reps: bestReps ?? undefined,
                  volume: bestVolume ?? undefined,
                }
              : undefined,
          deltaVsBest:
            bestWeight != null || bestReps != null || bestVolume != null
              ? {
                  weight:
                    currentWeight != null && bestWeight != null
                      ? currentWeight - bestWeight
                      : undefined,
                  reps:
                    currentReps != null && bestReps != null
                      ? currentReps - bestReps
                      : undefined,
                  volume: bestVolume != null ? currentVolume - bestVolume : undefined,
                }
              : undefined,
          state,
          isWeightPR,
          isRepPR,
          isVolumePR,
        } satisfies SetComparison,
      };
    });

    const previousBestWeight = previousExercise
      ? previousExercise.sets.reduce((max, set) => {
          const w = toNumber(set.weight);
          return w == null ? max : Math.max(max, w);
        }, 0)
      : 0;

    const previousBestReps = previousExercise
      ? previousExercise.sets.reduce((max, set) => {
          const r = toNumber(set.reps);
          return r == null ? max : Math.max(max, r);
        }, 0)
      : 0;

    const previousSessionVolume = previousExercise
      ? previousExercise.sets.reduce((sum, set) => {
          if (!set.done) return sum;
          return sum + getSetVolume(set.weight, set.reps);
        }, 0)
      : 0;

    const currentBestWeight = exercise.sets.reduce((max, set) => {
      const w = toNumber(set.weight);
      return w == null ? max : Math.max(max, w);
    }, 0);

    const currentBestReps = exercise.sets.reduce((max, set) => {
      const r = toNumber(set.reps);
      return r == null ? max : Math.max(max, r);
    }, 0);

    let comparedToLast: FinishSummary["exercises"][number]["comparedToLast"] = {
      result: "no_data",
    };

    if (previousExercise) {
      const improvedWeight = currentBestWeight > previousBestWeight;
      const improvedReps = currentBestReps > previousBestReps;
      const improvedVolume = exercise.sessionVolume > previousSessionVolume;

      let result: "better" | "same" | "mixed" | "no_data" = "same";

      if (improvedWeight || improvedReps || improvedVolume) result = "better";
      else if (
        currentBestWeight === previousBestWeight &&
        currentBestReps === previousBestReps &&
        Math.round(exercise.sessionVolume) === Math.round(previousSessionVolume)
      ) {
        result = "same";
      } else {
        result = "mixed";
      }

      comparedToLast = {
        previousWeight: previousBestWeight || undefined,
        previousReps: previousBestReps || undefined,
        previousVolume: previousSessionVolume || undefined,
        result,
      };
    }

    let bestWeightAllTime = 0;
    let bestRepsAllTime = 0;
    let bestVolumeAllTime = 0;

    bestExerciseHistory.forEach((historyExercise) => {
      historyExercise.sets.forEach((set) => {
        const w = toNumber(set.weight);
        const r = toNumber(set.reps);
        const v = getSetVolume(set.weight, set.reps);

        if (w != null) bestWeightAllTime = Math.max(bestWeightAllTime, w);
        if (r != null) bestRepsAllTime = Math.max(bestRepsAllTime, r);
        bestVolumeAllTime = Math.max(bestVolumeAllTime, v);
      });
    });

    let comparedToBest: FinishSummary["exercises"][number]["comparedToBest"] = {
      result: "no_data",
    };

    if (bestExerciseHistory.length > 0) {
      const improvedWeight = currentBestWeight > bestWeightAllTime;
      const improvedReps = currentBestReps > bestRepsAllTime;
      const improvedVolume = exercise.sessionVolume > bestVolumeAllTime;

      let result: "better" | "same" | "mixed" | "no_data" = "same";

      if (improvedWeight || improvedReps || improvedVolume) result = "better";
      else if (
        currentBestWeight === bestWeightAllTime &&
        currentBestReps === bestRepsAllTime &&
        Math.round(exercise.sessionVolume) === Math.round(bestVolumeAllTime)
      ) {
        result = "same";
      } else {
        result = "mixed";
      }

      comparedToBest = {
        bestWeight: bestWeightAllTime || undefined,
        bestReps: bestRepsAllTime || undefined,
        bestVolume: bestVolumeAllTime || undefined,
        result,
      };
    }

    if (previousExercise && exercise.sets.length > 0) {
      if (currentBestWeight > previousBestWeight) {
        wins.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          type: "heavier",
          label: "Heavier than last session",
        });
      } else if (currentBestReps > previousBestReps) {
        wins.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          type: "more_reps",
          label: "More reps than last session",
        });
      } else if (
        currentBestWeight === previousBestWeight &&
        currentBestReps === previousBestReps &&
        currentBestWeight > 0
      ) {
        wins.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          type: "matched",
          label: "Matched last session",
        });
      } else if (exercise.sessionVolume > previousSessionVolume && exercise.sessionVolume > 0) {
        wins.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          type: "volume_up",
          label: "Higher session volume",
        });
      }
    }

    if (comparedToLast.result === "better") improvedExerciseCount += 1;
    else if (comparedToLast.result === "same") matchedExerciseCount += 1;
    else if (comparedToLast.result === "mixed") belowExerciseCount += 1;

    return {
      ...exercise,
      comparedToLast,
      comparedToBest,
      insights: {
        improvedSets: exerciseImprovedSets,
        matchedSets: exerciseMatchedSets,
        belowSets: exerciseBelowSets,
        prCount: exercisePrCount,
      },
      sets,
    };
  });

  const historyEntry: WorkoutHistoryEntry = {
    sessionId,
    workoutId,
    workoutTitle,
    programId,
    completedAt: new Date().toISOString(),
    startedAt: new Date(Date.now() - durationSec * 1000).toISOString(),
    durationSec,
    status,
    totals: {
      completedSets: totalCompletedSets,
      totalSets,
      completedExercises: completedExercisesCount,
      totalExercises: totalExercisesCount,
      totalVolume,
      trackedStrengthVolume,
    },
    exercises: currentHistoryExercises,
  };

  const summary: FinishSummary = {
    sessionId,
    workoutId,
    workoutTitle,
    programId,
    status,
    durationSec,
    totals: {
      completedSets: totalCompletedSets,
      totalSets,
      completedExercises: completedExercisesCount,
      totalExercises: totalExercisesCount,
      totalVolume,
      trackedStrengthVolume,
    },
    insights: {
      completionRate,
      prCount: prs.length,
      missingLoadCount,
      strengthSetCount,
      avgTrackedLoad,
      improvedExerciseCount,
      matchedExerciseCount,
      belowExerciseCount,
      improvedSetCount,
      matchedSetCount,
      belowSetCount,
      previousSessionFound,
    },
    prs,
    wins,
    exercises: finishedExercises,
  };

  return { summary, historyEntry };
}
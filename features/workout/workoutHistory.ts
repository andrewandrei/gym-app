import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TrackingMode } from "./workout.types";

export const WORKOUT_HISTORY_STORAGE_KEY = "aa_fit_workout_history";

export type HistoryWorkoutSet = {
  set: number;
  weight: string;
  reps: string;
  rest: string;
  done: boolean;
  note?: string;
};

export type HistoryWorkoutExercise = {
  id: string;
  name: string;
  unitLabel: string;
  trackingMode?: TrackingMode;
  completedSets: number;
  totalSetsPlanned: number;
  sessionVolume: number;
  sets: HistoryWorkoutSet[];
};

export type WorkoutHistoryEntry = {
  sessionId: string;
  workoutId: string;
  workoutTitle: string;
  programId?: string;
  completedAt: string;
  startedAt: string;
  durationSec: number;
  status: "partial" | "completed";
  totals: {
    completedSets: number;
    totalSets: number;
    completedExercises: number;
    totalExercises: number;
    totalVolume: number;
    trackedStrengthVolume: number;
  };
  exercises: HistoryWorkoutExercise[];
};

export type ExerciseHistorySession = {
  id: string;
  dateLabel: string;
  completedAt: string;
  trackingMode?: TrackingMode;
  sets: Array<{
    set: number;
    weight: string;
    reps: string;
    rest: string;
    done: boolean;
    note?: string;
  }>;
};

function normalizeExerciseName(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function sanitizeTrackingMode(value: unknown): TrackingMode | undefined {
  return value === "weight_reps" ||
    value === "bodyweight_reps" ||
    value === "time" ||
    value === "reps_only" ||
    value === "calories" ||
    value === "time_speed"
    ? value
    : undefined;
}

function sanitizeSet(raw: any): HistoryWorkoutSet {
  return {
    set: typeof raw?.set === "number" ? raw.set : 0,
    weight: typeof raw?.weight === "string" ? raw.weight : "",
    reps: typeof raw?.reps === "string" ? raw.reps : "",
    rest: typeof raw?.rest === "string" ? raw.rest : "",
    done: !!raw?.done,
    note: typeof raw?.note === "string" ? raw.note : undefined,
  };
}

function sanitizeExercise(raw: any): HistoryWorkoutExercise {
  const sets = safeArray<any>(raw?.sets).map(sanitizeSet);

  return {
    id: typeof raw?.id === "string" ? raw.id : "",
    name: typeof raw?.name === "string" ? raw.name : "",
    unitLabel: typeof raw?.unitLabel === "string" ? raw.unitLabel : "LBS",
    trackingMode: sanitizeTrackingMode(raw?.trackingMode),
    completedSets:
      typeof raw?.completedSets === "number"
        ? raw.completedSets
        : sets.filter((s) => s.done).length,
    totalSetsPlanned:
      typeof raw?.totalSetsPlanned === "number" ? raw.totalSetsPlanned : sets.length,
    sessionVolume:
      typeof raw?.sessionVolume === "number" ? raw.sessionVolume : 0,
    sets,
  };
}

function sanitizeEntry(raw: any): WorkoutHistoryEntry {
  const exercises = safeArray<any>(raw?.exercises).map(sanitizeExercise);

  return {
    sessionId: typeof raw?.sessionId === "string" ? raw.sessionId : "",
    workoutId: typeof raw?.workoutId === "string" ? raw.workoutId : "",
    workoutTitle: typeof raw?.workoutTitle === "string" ? raw.workoutTitle : "",
    programId: typeof raw?.programId === "string" ? raw.programId : undefined,
    completedAt: typeof raw?.completedAt === "string" ? raw.completedAt : new Date().toISOString(),
    startedAt: typeof raw?.startedAt === "string" ? raw.startedAt : new Date().toISOString(),
    durationSec: typeof raw?.durationSec === "number" ? raw.durationSec : 0,
    status: raw?.status === "partial" ? "partial" : "completed",
    totals: {
      completedSets:
        typeof raw?.totals?.completedSets === "number" ? raw.totals.completedSets : 0,
      totalSets: typeof raw?.totals?.totalSets === "number" ? raw.totals.totalSets : 0,
      completedExercises:
        typeof raw?.totals?.completedExercises === "number"
          ? raw.totals.completedExercises
          : 0,
      totalExercises:
        typeof raw?.totals?.totalExercises === "number" ? raw.totals.totalExercises : 0,
      totalVolume: typeof raw?.totals?.totalVolume === "number" ? raw.totals.totalVolume : 0,
      trackedStrengthVolume:
        typeof raw?.totals?.trackedStrengthVolume === "number"
          ? raw.totals.trackedStrengthVolume
          : 0,
    },
    exercises,
  };
}

export async function getWorkoutHistory(): Promise<WorkoutHistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const history = safeArray<any>(parsed).map(sanitizeEntry);

    return history.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
  } catch {
    return [];
  }
}

export async function saveWorkoutHistory(history: WorkoutHistoryEntry[]): Promise<void> {
  const normalized = history
    .map(sanitizeEntry)
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );

  await AsyncStorage.setItem(
    WORKOUT_HISTORY_STORAGE_KEY,
    JSON.stringify(normalized),
  );
}

export async function appendWorkoutHistoryEntry(
  entry: WorkoutHistoryEntry,
): Promise<WorkoutHistoryEntry[]> {
  const history = await getWorkoutHistory();
  const next = [sanitizeEntry(entry), ...history].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  await saveWorkoutHistory(next);
  return next;
}

export async function clearWorkoutHistory(): Promise<void> {
  await AsyncStorage.removeItem(WORKOUT_HISTORY_STORAGE_KEY);
}

export async function getWorkoutHistoryByWorkoutId(
  workoutId: string,
): Promise<WorkoutHistoryEntry[]> {
  const history = await getWorkoutHistory();
  return history.filter((entry) => entry.workoutId === workoutId);
}

export async function getLatestWorkoutHistoryEntry(
  workoutId: string,
): Promise<WorkoutHistoryEntry | null> {
  const sameWorkout = await getWorkoutHistoryByWorkoutId(workoutId);
  return sameWorkout[0] ?? null;
}

export async function getPreviousWorkoutHistoryEntry(
  workoutId: string,
  beforeCompletedAt?: string,
): Promise<WorkoutHistoryEntry | null> {
  const sameWorkout = await getWorkoutHistoryByWorkoutId(workoutId);

  if (!beforeCompletedAt) {
    return sameWorkout[0] ?? null;
  }

  const beforeTime = new Date(beforeCompletedAt).getTime();

  const filtered = sameWorkout.filter(
    (entry) => new Date(entry.completedAt).getTime() < beforeTime,
  );

  return filtered[0] ?? null;
}

export function findExerciseInHistoryEntry(
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

export function findSetInExerciseHistory(
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
  let bestVolume = 0;
  let bestWeight = 0;
  let bestReps = 0;

  for (const entry of history) {
    const exercise = findExerciseInHistoryEntry(entry, exerciseId, exerciseName);
    const set = findSetInExerciseHistory(exercise, setNumber);

    if (!set) continue;

    const weight = Number.parseFloat(set.weight);
    const reps = Number.parseFloat(set.reps);
    const safeWeight = Number.isFinite(weight) ? weight : 0;
    const safeReps = Number.isFinite(reps) ? reps : 0;
    const volume = safeWeight > 0 && safeReps > 0 ? safeWeight * safeReps : 0;

    const isBetter =
      volume > bestVolume ||
      (volume === bestVolume && safeWeight > bestWeight) ||
      (volume === bestVolume && safeWeight === bestWeight && safeReps > bestReps);

    if (isBetter) {
      best = set;
      bestVolume = volume;
      bestWeight = safeWeight;
      bestReps = safeReps;
    }
  }

  return best;
}

export function buildExerciseHistorySessions(
  history: WorkoutHistoryEntry[],
  exerciseId: string,
  exerciseName?: string,
): ExerciseHistorySession[] {
  const normalizedExerciseName = exerciseName ? normalizeExerciseName(exerciseName) : null;

  return history
    .map((entry) => {
      const exercise =
        entry.exercises.find((ex) => ex.id === exerciseId) ??
        (normalizedExerciseName
          ? entry.exercises.find(
              (ex) => normalizeExerciseName(ex.name) === normalizedExerciseName,
            )
          : null);

      if (!exercise) return null;

      return {
        id: `${entry.sessionId}_${exercise.id}`,
        dateLabel: new Date(entry.completedAt).toLocaleDateString(),
        completedAt: entry.completedAt,
        trackingMode: exercise.trackingMode,
        sets: exercise.sets.map((set) => ({
          set: set.set,
          weight: set.weight,
          reps: set.reps,
          rest: set.rest,
          done: set.done,
          note: set.note,
        })),
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b!.completedAt).getTime() - new Date(a!.completedAt).getTime(),
    ) as ExerciseHistorySession[];
}

export function formatHistorySetValue(
  trackingMode: TrackingMode,
  set: {
    weight?: string;
    reps?: string;
    rest?: string;
    done?: boolean;
  },
) {
  if (trackingMode === "time") {
    return {
      primary: set.weight ? `${set.weight}s` : "—",
      secondary: set.rest || "—",
      tertiary: "",
    };
  }

  if (trackingMode === "time_speed") {
    return {
      primary: set.weight ? `${set.weight}s` : "—",
      secondary: set.reps || "—",
      tertiary: set.rest || "—",
    };
  }

  if (trackingMode === "reps_only") {
    return {
      primary: set.reps || "—",
      secondary: set.rest || "—",
      tertiary: "",
    };
  }

  if (trackingMode === "calories") {
    return {
      primary: set.weight ? `${set.weight} cal` : "—",
      secondary: set.rest || "—",
      tertiary: "",
    };
  }

  if (trackingMode === "bodyweight_reps") {
    return {
      primary: set.weight || "BW",
      secondary: set.reps || "—",
      tertiary: set.rest || "—",
    };
  }

  return {
    primary: set.weight || "—",
    secondary: set.reps || "—",
    tertiary: set.rest || "—",
  };
}
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_WORKOUT_DRAFT_KEY = "aa_fit_active_workout_draft";

export type WorkoutDraftSet = {
  id: string;
  weight?: string;
  reps?: string;
  rest?: string;
  done?: boolean;
  note?: string;
};

export type WorkoutDraftExercise = {
  id: string;
  name: string;
  unitLabel: "LBS" | "KG" | "REPS";
  sets: WorkoutDraftSet[];
};

export type WorkoutDraft = {
  id: string;
  workoutId: string;
  workoutTitle: string;
  startedAt: number;
  updatedAt: number;
  elapsedSeconds: number;
  activeSetKey?: string | null;
  exercises: WorkoutDraftExercise[];
};

export function hasMeaningfulProgress(exercises: WorkoutDraftExercise[]): boolean {
  return exercises.some((ex) =>
    ex.sets.some(
      (s) =>
        !!s.done ||
        !!s.note?.trim() ||
        !!s.weight?.trim() ||
        !!s.reps?.trim() ||
        !!s.rest?.trim(),
    ),
  );
}

export async function saveWorkoutDraft(draft: WorkoutDraft): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_WORKOUT_DRAFT_KEY, JSON.stringify(draft));
}

export async function loadWorkoutDraft(): Promise<WorkoutDraft | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_WORKOUT_DRAFT_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as WorkoutDraft;
  } catch {
    return null;
  }
}

export async function clearWorkoutDraft(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_WORKOUT_DRAFT_KEY);
}
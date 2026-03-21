import AsyncStorage from "@react-native-async-storage/async-storage";

export const ACTIVE_WORKOUT_DRAFT_KEY = "aa_fit_active_workout_draft";

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

export type WorkoutDraftStatus = "active" | "completed" | "discarded";
export type WorkoutDraftSource = "in_progress" | "interrupted" | "manual";

export type WorkoutDraft = {
  id: string;
  sessionId: string;
  workoutId: string;
  workoutTitle: string;
  programId?: string;
  startedAt: number;
  updatedAt: number;
  elapsedSeconds: number;
  activeSetKey?: string | null;
  status: WorkoutDraftStatus;
  source: WorkoutDraftSource;
  exercises: WorkoutDraftExercise[];
  ui?: {
    lastOpenedAt?: number;
  };
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

function sanitizeDraftSet(raw: any): WorkoutDraftSet {
  return {
    id: typeof raw?.id === "string" ? raw.id : "",
    weight: typeof raw?.weight === "string" ? raw.weight : "",
    reps: typeof raw?.reps === "string" ? raw.reps : "",
    rest: typeof raw?.rest === "string" ? raw.rest : "",
    done: !!raw?.done,
    note: typeof raw?.note === "string" ? raw.note : "",
  };
}

function sanitizeDraftExercise(raw: any): WorkoutDraftExercise {
  const unitLabel =
    raw?.unitLabel === "KG" || raw?.unitLabel === "REPS" ? raw.unitLabel : "LBS";

  return {
    id: typeof raw?.id === "string" ? raw.id : "",
    name: typeof raw?.name === "string" ? raw.name : "",
    unitLabel,
    sets: Array.isArray(raw?.sets) ? raw.sets.map(sanitizeDraftSet) : [],
  };
}

function sanitizeDraft(raw: any): WorkoutDraft | null {
  if (!raw || typeof raw !== "object") return null;

  const workoutId =
    typeof raw.workoutId === "string" && raw.workoutId.trim().length > 0
      ? raw.workoutId
      : null;

  const workoutTitle =
    typeof raw.workoutTitle === "string" && raw.workoutTitle.trim().length > 0
      ? raw.workoutTitle
      : null;

  if (!workoutId || !workoutTitle) return null;

  const status: WorkoutDraftStatus =
    raw?.status === "completed" || raw?.status === "discarded" ? raw.status : "active";

  const source: WorkoutDraftSource =
    raw?.source === "interrupted" || raw?.source === "manual"
      ? raw.source
      : "in_progress";

  return {
    id:
      typeof raw?.id === "string" && raw.id.trim().length > 0
        ? raw.id
        : `${workoutId}-draft`,
    sessionId:
      typeof raw?.sessionId === "string" && raw.sessionId.trim().length > 0
        ? raw.sessionId
        : `${workoutId}-${Date.now()}`,
    workoutId,
    workoutTitle,
    programId: typeof raw?.programId === "string" ? raw.programId : undefined,
    startedAt:
      typeof raw?.startedAt === "number" && Number.isFinite(raw.startedAt)
        ? raw.startedAt
        : Date.now(),
    updatedAt:
      typeof raw?.updatedAt === "number" && Number.isFinite(raw.updatedAt)
        ? raw.updatedAt
        : Date.now(),
    elapsedSeconds:
      typeof raw?.elapsedSeconds === "number" && Number.isFinite(raw.elapsedSeconds)
        ? raw.elapsedSeconds
        : 0,
    activeSetKey:
      typeof raw?.activeSetKey === "string" || raw?.activeSetKey === null
        ? raw.activeSetKey
        : null,
    status,
    source,
    exercises: Array.isArray(raw?.exercises)
      ? raw.exercises.map(sanitizeDraftExercise)
      : [],
    ui: {
      lastOpenedAt:
        typeof raw?.ui?.lastOpenedAt === "number" && Number.isFinite(raw.ui.lastOpenedAt)
          ? raw.ui.lastOpenedAt
          : undefined,
    },
  };
}

export function createWorkoutDraft(params: {
  workoutId: string;
  workoutTitle: string;
  programId?: string;
  exercises: WorkoutDraftExercise[];
  activeSetKey?: string | null;
  elapsedSeconds?: number;
}): WorkoutDraft {
  const now = Date.now();

  return {
    id: `${params.workoutId}-draft`,
    sessionId: `${params.workoutId}-${now}`,
    workoutId: params.workoutId,
    workoutTitle: params.workoutTitle,
    programId: params.programId,
    startedAt: now,
    updatedAt: now,
    elapsedSeconds: params.elapsedSeconds ?? 0,
    activeSetKey: params.activeSetKey ?? null,
    status: "active",
    source: "in_progress",
    exercises: params.exercises,
    ui: {
      lastOpenedAt: now,
    },
  };
}

export async function saveWorkoutDraft(draft: WorkoutDraft): Promise<void> {
  const normalized: WorkoutDraft = {
    ...draft,
    updatedAt: Date.now(),
    status: draft.status ?? "active",
    source: draft.source ?? "in_progress",
    ui: {
      ...(draft.ui ?? {}),
      lastOpenedAt: draft.ui?.lastOpenedAt,
    },
  };

  await AsyncStorage.setItem(ACTIVE_WORKOUT_DRAFT_KEY, JSON.stringify(normalized));
}

export async function loadWorkoutDraft(): Promise<WorkoutDraft | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_WORKOUT_DRAFT_KEY);
  if (!raw) return null;

  try {
    return sanitizeDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function clearWorkoutDraft(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_WORKOUT_DRAFT_KEY);
}

export async function markDraftInterrupted(): Promise<WorkoutDraft | null> {
  const draft = await loadWorkoutDraft();
  if (!draft) return null;
  if (draft.status !== "active") return draft;

  const next: WorkoutDraft = {
    ...draft,
    updatedAt: Date.now(),
    source: "interrupted",
  };

  await saveWorkoutDraft(next);
  return next;
}

export async function markDraftResumed(): Promise<WorkoutDraft | null> {
  const draft = await loadWorkoutDraft();
  if (!draft) return null;
  if (draft.status !== "active") return draft;

  const next: WorkoutDraft = {
    ...draft,
    updatedAt: Date.now(),
    source: "in_progress",
    ui: {
      ...(draft.ui ?? {}),
      lastOpenedAt: Date.now(),
    },
  };

  await saveWorkoutDraft(next);
  return next;
}

export async function markDraftCompleted(): Promise<void> {
  const draft = await loadWorkoutDraft();
  if (!draft) return;

  const next: WorkoutDraft = {
    ...draft,
    updatedAt: Date.now(),
    status: "completed",
    source: "manual",
  };

  await AsyncStorage.setItem(ACTIVE_WORKOUT_DRAFT_KEY, JSON.stringify(next));
}

export async function discardWorkoutDraft(): Promise<void> {
  const draft = await loadWorkoutDraft();
  if (!draft) {
    await clearWorkoutDraft();
    return;
  }

  const next: WorkoutDraft = {
    ...draft,
    updatedAt: Date.now(),
    status: "discarded",
    source: "manual",
  };

  await AsyncStorage.setItem(ACTIVE_WORKOUT_DRAFT_KEY, JSON.stringify(next));
  await clearWorkoutDraft();
}

export function isDraftResumable(draft: WorkoutDraft | null): boolean {
  if (!draft) return false;
  if (draft.status !== "active") return false;
  if (!hasMeaningfulProgress(draft.exercises)) return false;
  return true;
}

export function shouldShowResumeModal(draft: WorkoutDraft | null): boolean {
  if (!draft) return false;
  if (!isDraftResumable(draft)) return false;
  return draft.source === "interrupted";
}
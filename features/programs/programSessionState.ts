import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRAM_SESSION_STATE_KEY = "barbata_program_session_state";
const PROGRAM_DISMISSED_DRAFT_KEY = "barbata_program_dismissed_drafts";

export type ProgramSessionSkip = {
  programId: string;
  workoutId: string;
  skippedAt: string;
};

export type ProgramSessionDismissal = {
  programId: string;
  workoutId: string;
  dismissedAt: string;
};

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function sanitizeSkip(raw: any): ProgramSessionSkip | null {
  if (
    typeof raw?.programId !== "string" ||
    typeof raw?.workoutId !== "string" ||
    typeof raw?.skippedAt !== "string"
  ) {
    return null;
  }

  return {
    programId: raw.programId,
    workoutId: raw.workoutId,
    skippedAt: raw.skippedAt,
  };
}

function sanitizeDismissal(raw: any): ProgramSessionDismissal | null {
  if (
    typeof raw?.programId !== "string" ||
    typeof raw?.workoutId !== "string" ||
    typeof raw?.dismissedAt !== "string"
  ) {
    return null;
  }

  return {
    programId: raw.programId,
    workoutId: raw.workoutId,
    dismissedAt: raw.dismissedAt,
  };
}

export async function getProgramSessionSkips(): Promise<ProgramSessionSkip[]> {
  try {
    const raw = await AsyncStorage.getItem(PROGRAM_SESSION_STATE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return safeArray<any>(parsed).map(sanitizeSkip).filter(Boolean) as ProgramSessionSkip[];
  } catch {
    return [];
  }
}

export async function skipProgramSession(params: {
  programId: string;
  workoutId: string;
}): Promise<ProgramSessionSkip[]> {
  const current = await getProgramSessionSkips();
  const withoutDuplicate = current.filter(
    (item) =>
      item.programId !== params.programId || item.workoutId !== params.workoutId,
  );

  const next = [
    ...withoutDuplicate,
    {
      programId: params.programId,
      workoutId: params.workoutId,
      skippedAt: new Date().toISOString(),
    },
  ];

  await AsyncStorage.setItem(PROGRAM_SESSION_STATE_KEY, JSON.stringify(next));
  return next;
}

export async function getProgramSessionDismissals(): Promise<ProgramSessionDismissal[]> {
  try {
    const raw = await AsyncStorage.getItem(PROGRAM_DISMISSED_DRAFT_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return safeArray<any>(parsed)
      .map(sanitizeDismissal)
      .filter(Boolean) as ProgramSessionDismissal[];
  } catch {
    return [];
  }
}

export async function dismissProgramSessionDraft(params: {
  programId: string;
  workoutId: string;
}): Promise<ProgramSessionDismissal[]> {
  const current = await getProgramSessionDismissals();
  const withoutDuplicate = current.filter(
    (item) =>
      item.programId !== params.programId || item.workoutId !== params.workoutId,
  );

  const next = [
    ...withoutDuplicate,
    {
      programId: params.programId,
      workoutId: params.workoutId,
      dismissedAt: new Date().toISOString(),
    },
  ];

  await AsyncStorage.setItem(PROGRAM_DISMISSED_DRAFT_KEY, JSON.stringify(next));
  return next;
}

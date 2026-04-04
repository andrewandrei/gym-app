// app/lib/progress/progressViewState.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

type ProgressViewState = {
  programId: string;
  selectedWeek: number;
  visibleMonthKey?: string;
  selectedMonthDay?: number | null;
  updatedAt: string;
};

const KEY = "aa_fit_progress_view_state";

type ProgressViewStateMap = Record<string, ProgressViewState>;

async function readAll(): Promise<ProgressViewStateMap> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeAll(map: ProgressViewStateMap): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // noop
  }
}

export async function loadProgressViewState(
  programId: string,
): Promise<ProgressViewState | null> {
  const all = await readAll();
  return all[programId] ?? null;
}

export async function saveProgressViewState(params: {
  programId: string;
  selectedWeek: number;
  visibleMonthKey?: string;
  selectedMonthDay?: number | null;
}): Promise<void> {
  const all = await readAll();
  const previous = all[params.programId];

  all[params.programId] = {
    programId: params.programId,
    selectedWeek: params.selectedWeek,
    visibleMonthKey:
      params.visibleMonthKey !== undefined
        ? params.visibleMonthKey
        : previous?.visibleMonthKey,
    selectedMonthDay:
      params.selectedMonthDay !== undefined
        ? params.selectedMonthDay
        : previous?.selectedMonthDay,
    updatedAt: new Date().toISOString(),
  };

  await writeAll(all);
}
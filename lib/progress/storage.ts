// app/lib/progress/storage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getWorkoutHistory,
  type WorkoutHistoryEntry,
} from "../../features/workout/workoutHistory";
import type { CheckIn } from "./types";

const CHECKINS_KEY = "aa_fit_checkins";
const PROG_WEEK_KEY = "aa_fit_current_week";

export async function fetchWorkoutHistory(): Promise<WorkoutHistoryEntry[]> {
  return getWorkoutHistory();
}

export async function fetchCheckIns(): Promise<CheckIn[]> {
  try {
    const raw = await AsyncStorage.getItem(CHECKINS_KEY);
    if (raw) {
      const parsed: CheckIn[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // noop
  }

  return [];
}

export async function saveCheckIns(checkins: CheckIn[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(checkins));
  } catch {
    // noop
  }
}

export async function fetchCurrentWeek(programId: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(PROG_WEEK_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved?.programId === programId) {
        return saved.week ?? 1;
      }
    }
  } catch {
    // noop
  }

  return 1;
}

export async function saveCurrentWeek(programId: string, week: number): Promise<void> {
  try {
    await AsyncStorage.setItem(
      PROG_WEEK_KEY,
      JSON.stringify({
        programId,
        week,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // noop
  }
}

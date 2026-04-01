// app/lib/progress/historySelectors.ts

import { parseProgramWorkoutId } from "../../program/programWorkouts";
import type { WeekEntry, WeekSession } from "./types";

export function mergeHistory(rawHistory: any[], base: WeekEntry[]): WeekEntry[] {
  if (!rawHistory?.length) return base;

  const merged = base.map((w) => ({ ...w, sessions: [...w.sessions] }));

  rawHistory.forEach((entry) => {
    const parsed = parseProgramWorkoutId(entry.workoutId);
    if (!parsed) return;

    const week = merged.find((w) => w.n === parsed.weekNumber);
    if (!week) return;

    const lifts: string[] =
      entry.exercises?.flatMap((ex: any) => {
        const done = ex.sets?.filter((s: any) => s.done) ?? [];
        if (!done.length) return [];

        const best = done.reduce(
          (b: any, s: any) => (parseFloat(s.weight) > parseFloat(b.weight) ? s : b),
          done[0],
        );

        const isPR = done.some(
          (s: any) => s.comparison?.isWeightPR || s.comparison?.isRepPR,
        );

        return [`${ex.name} ${best.weight}kg×${best.reps}${isPR ? " 🏆" : ""}`];
      }) ?? [];

    const date = new Date(entry.completedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const real: WeekSession = {
      date,
      type: entry.workoutTitle,
      complete: entry.status === "completed",
      lifts,
    };

    const idx = week.sessions.findIndex(
      (s) => s.date === date || s.type === entry.workoutTitle,
    );

    if (idx >= 0) week.sessions[idx] = real;
    else week.sessions.unshift(real);
  });

  return merged;
}
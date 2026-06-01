// app/lib/progress/historySelectors.ts

import { parseProgramWorkoutId } from "../../features/programs/programWorkouts";
import type { WeekEntry, WeekSession } from "./types";

export function mergeHistory(
  rawHistory: any[],
  base: WeekEntry[],
  programId?: string,
): WeekEntry[] {
  if (!rawHistory?.length) return base;

  const merged = base.map((w) => ({ ...w, sessions: [...w.sessions] }));

  const sortedHistory = [...rawHistory].sort(
    (a, b) =>
      new Date(a.completedAt ?? 0).getTime() - new Date(b.completedAt ?? 0).getTime(),
  );

  sortedHistory.forEach((entry) => {
    const parsed = parseProgramWorkoutId(entry.workoutId);
    if (!parsed) return;
    if (
      programId &&
      parsed.programId !== programId &&
      entry.programId !== programId
    ) {
      return;
    }

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
      dayNumber: parsed.workoutNumber,
      type: entry.workoutTitle,
      complete: entry.status === "completed",
      lifts,
    };

    const idx = week.sessions.findIndex(
      (s) =>
        s.dayNumber === parsed.workoutNumber ||
        s.date === date ||
        s.type === entry.workoutTitle,
    );

    if (idx >= 0) week.sessions[idx] = real;
    else week.sessions.unshift(real);
  });

  return merged;
}

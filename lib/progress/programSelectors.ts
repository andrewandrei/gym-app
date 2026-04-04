// app/lib/progress/programSelectors.ts

import type { WeekDay, WeekEntry } from "./types";

export function buildThisWeekDays(
  rawHistory: any[],
  currentWeek: number,
  weekEntry: WeekEntry,
): WeekDay[] {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;

  const sessionLabels = weekEntry.sessions.map((s) => ({
    type: s.type.includes("Upper")
      ? "Upper"
      : s.type.includes("Lower")
        ? "Lower"
        : s.type.includes("Full")
          ? "Full"
          : s.type,
    complete: s.complete,
    planned: s.planned,
  }));

  const schedule: Array<{ type: string; sessionIdx: number | null }> = [
    { type: sessionLabels[0]?.type ?? "Upper", sessionIdx: 0 },
    { type: sessionLabels[1]?.type ?? "Lower", sessionIdx: 1 },
    { type: "Rest", sessionIdx: null },
    { type: sessionLabels[2]?.type ?? "Upper", sessionIdx: 2 },
    { type: sessionLabels[3]?.type ?? "Lower", sessionIdx: 3 },
    { type: "Rest", sessionIdx: null },
    { type: "Rest", sessionIdx: null },
  ];

  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return days.map((d, i) => {
    const slot = schedule[i];
    const isRest = slot.type === "Rest";
    const sessionIdx = slot.sessionIdx;
    const session = sessionIdx !== null ? weekEntry.sessions[sessionIdx] : null;

    let status: WeekDay["status"] = "rest";

    if (!isRest) {
      if (session?.complete) status = "done";
      else if (i === dayOfWeek) status = "today";
      else status = "planned";
    }

    return {
      d,
      type: isRest ? "Rest" : slot.type,
      status,
    };
  });
}
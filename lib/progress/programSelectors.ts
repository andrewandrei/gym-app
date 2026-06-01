// app/lib/progress/programSelectors.ts

import type { WeekDay, WeekEntry } from "./types";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function getShortSessionType(type: string) {
  if (type.includes("Upper")) return "Upper";
  if (type.includes("Lower")) return "Lower";
  if (type.includes("Full")) return "Full";
  if (type.includes("Test")) return "Test";
  return type;
}

function getWeekDayIndex(sessionCount: number, sessionIndex: number) {
  if (sessionCount >= 6) return Math.min(sessionIndex, 6);
  if (sessionCount === 5) return [0, 1, 2, 3, 4][sessionIndex] ?? sessionIndex;
  if (sessionCount === 4) return [0, 1, 3, 4][sessionIndex] ?? sessionIndex;
  if (sessionCount === 3) return [0, 2, 4][sessionIndex] ?? sessionIndex;
  if (sessionCount === 2) return [0, 3][sessionIndex] ?? sessionIndex;
  return sessionIndex;
}

export function buildThisWeekDays(
  _rawHistory: any[],
  _currentWeek: number,
  weekEntry: WeekEntry,
): WeekDay[] {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;

  const schedule = Array.from({ length: 7 }, () => null as number | null);

  weekEntry.sessions.forEach((session, index) => {
    const dayIndex =
      typeof session.dayNumber === "number"
        ? session.dayNumber - 1
        : getWeekDayIndex(weekEntry.sessions.length, index);
    if (dayIndex >= 0 && dayIndex < 7 && schedule[dayIndex] === null) {
      schedule[dayIndex] = index;
    }
  });

  return WEEK_DAYS.map((d, i) => {
    const sessionIndex = schedule[i];
    const session = sessionIndex !== null ? weekEntry.sessions[sessionIndex] : null;

    let status: WeekDay["status"] = "rest";

    if (session) {
      if (session.complete) status = "done";
      else if (session.lifts.length > 0) status = "partial";
      else if (session.skipped) status = "skipped";
      else if (i === dayOfWeek && weekEntry.current) status = "today";
      else status = "planned";
    }

    return {
      d,
      type: session ? getShortSessionType(session.type) : "Rest",
      status,
    };
  });
}

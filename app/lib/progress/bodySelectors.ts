// app/lib/progress/bodySelectors.ts

import type { MonthData } from "./types";

export function buildMonthData(
  rawHistory: any[],
  visibleDate: Date,
): MonthData {
  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();

  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() === month;

  const today = isCurrentMonth ? now.getDate() : null;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const offset = (firstDow + 6) % 7;

  const trainedDays = new Map<number, string>();

  rawHistory.forEach((entry) => {
    const d = new Date(entry.completedAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      const typeChar = entry.workoutTitle?.includes("Upper")
        ? "U"
        : entry.workoutTitle?.includes("Lower")
          ? "L"
          : "";
      trainedDays.set(dayNum, typeChar);
    }
  });

  const days = [];
  for (let i = 1; i <= daysInMonth; i += 1) {
    const isFuture =
      year > now.getFullYear() ||
      (year === now.getFullYear() && month > now.getMonth()) ||
      (year === now.getFullYear() &&
        month === now.getMonth() &&
        i > now.getDate());

    days.push({
      dayNum: i,
      trained: trainedDays.has(i),
      type: trainedDays.get(i),
      isToday: today === i,
      future: isFuture,
    });
  }

  const totalSessions = trainedDays.size;

  let thisWeekDone = 0;
  let thisWeekTotal = 0;

  if (isCurrentMonth && today !== null) {
    const dayOfWeek = (now.getDay() + 6) % 7;
    const weekStart = today - dayOfWeek;
    const weekEnd = weekStart + 6;

    thisWeekDone = days.filter(
      (d) => d.trained && d.dayNum >= weekStart && d.dayNum <= weekEnd,
    ).length;

    thisWeekTotal = 5;
  }

  const doneTotal = days.filter((d) => d.trained && !d.future).length;
  const scheduledTotal = days.filter((d) => !d.future).length;
  const consistency =
    scheduledTotal > 0
      ? Math.round((doneTotal / Math.max(doneTotal + 2, 1)) * 100)
      : 0;

  const monthLabel = visibleDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return {
    label: monthLabel,
    year,
    month,
    offset,
    daysInMonth,
    today,
    days,
    totalSessions,
    thisWeekDone,
    thisWeekTotal,
    consistency: Math.min(consistency, 100),
  };
}
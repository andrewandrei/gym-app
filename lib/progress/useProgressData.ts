// app/lib/progress/useProgressData.ts
//
// Single source of truth for all data the Progress screen needs.
// Current stack:
//   • Program config  → Supabase published programs
//   • Workout history → AsyncStorage via workoutHistory.ts
//   • Check-ins       → storage.ts
//   • Progress engine → progressEngine.ts

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getProgramBySlug,
  getPublishedPrograms,
  type SupabaseProgram,
} from "../../features/programs/programs.supabase";
import {
  getProgramSessionSkips,
  type ProgramSessionSkip,
} from "../../features/programs/programSessionState";
import { parseProgramWorkoutId } from "../../features/programs/programWorkouts";
import type { WorkoutHistoryEntry } from "../../features/workout/workoutHistory";
import { buildMonthData } from "./bodySelectors";
import { mergeHistory } from "./historySelectors";
import { buildThisWeekDays } from "./programSelectors";
import { buildProgressScreenData } from "./progressEngine";

import {
  fetchCheckIns,
  fetchCurrentWeek,
  fetchWorkoutHistory,
  saveCheckIns,
} from "./storage";


import type { CheckIn, ProgressData } from "./types";

function buildWeekHistoryFromProgram(
  program: SupabaseProgram | null,
  skips: ProgramSessionSkip[] = [],
) {
  if (!program) {
    return [
      {
        n: 1,
        label: "Week 1",
        dates: "No sessions yet",
        sessions: [],
      },
    ];
  }

  const weekMap = new Map<number, SupabaseProgram["workouts"]>();

  for (const workout of program.workouts) {
    const items = weekMap.get(workout.weekNumber) ?? [];
    items.push(workout);
    weekMap.set(workout.weekNumber, items);
  }

  const maxWeek =
    program.durationWeeks ??
    Math.max(0, ...program.workouts.map((workout) => workout.weekNumber));
  const skippedWorkoutIds = new Set(
    skips
      .filter((skip) => skip.programId === program.slug)
      .map((skip) => skip.workoutId),
  );

  return Array.from({ length: Math.max(1, maxWeek) }, (_, index) => {
    const weekNumber = index + 1;
    const workouts = [...(weekMap.get(weekNumber) ?? [])].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );

    return {
      n: weekNumber,
      label: `Week ${weekNumber}`,
      dates: workouts.length
        ? workouts
            .map((workout) => `Day ${workout.dayNumber}`)
            .join(" · ")
        : "No sessions yet",
      sessions: workouts.map((workout) => ({
        date: `Day ${workout.dayNumber}`,
        dayNumber: workout.dayNumber,
        type: workout.title,
        complete: false,
        planned: false,
        skipped: skippedWorkoutIds.has(
          `${program.slug}-week-${workout.weekNumber}-workout-${workout.dayNumber}`,
        ),
        lifts: [],
      })),
    };
  });
}

function getLatestLoggedProgramWeek(
  history: WorkoutHistoryEntry[],
  programId: string,
) {
  return history.reduce((latest, entry) => {
    const parsed = parseProgramWorkoutId(entry.workoutId);
    if (
      !parsed ||
      (parsed.programId !== programId && entry.programId !== programId)
    ) {
      return latest;
    }

    return parsed ? Math.max(latest, parsed.weekNumber) : latest;
  }, 0);
}

// ─── Main hook ────────────────────────────────────────────────────────────────
export function useProgressData(programId?: string): ProgressData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawHistory, setRawHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [resolvedProgramId, setResolvedProgramId] = useState(
    programId ?? "strength-foundations",
  );
  const [program, setProgram] = useState<SupabaseProgram | null>(null);
  const [programSkips, setProgramSkips] = useState<ProgramSessionSkip[]>([]);

  const weekHistoryBase = useMemo(
    () => buildWeekHistoryFromProgram(program, programSkips),
    [program, programSkips],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let nextProgramId = programId;

      if (!nextProgramId) {
        const summaries = await getPublishedPrograms();
        nextProgramId =
          summaries.find((item) => item.isActive)?.slug ??
          summaries[0]?.slug ??
          "strength-foundations";
      }

      const [fullProgram, history, cis, week, skips] = await Promise.all([
        getProgramBySlug(nextProgramId),
        fetchWorkoutHistory(),
        fetchCheckIns(),
        fetchCurrentWeek(nextProgramId),
        getProgramSessionSkips(),
      ]);

      setResolvedProgramId(nextProgramId);
      setProgram(fullProgram);
      setProgramSkips(skips);
      setRawHistory(history);
      setCheckins(cis);
      const totalWeeks = buildWeekHistoryFromProgram(fullProgram, skips).length;
      const latestLoggedWeek = getLatestLoggedProgramWeek(history, nextProgramId);
      const nextWeek = Math.max(week, latestLoggedWeek || 1);
      setCurrentWeek(Math.max(1, Math.min(nextWeek, totalWeeks || 1)));
    } catch (err) {
      console.warn("Progress data failed to load", err);
      setError("Progress could not refresh. Pull down to try again.");
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    load();
  }, [load]);

  const weekHistory = useMemo(
    () =>
      mergeHistory(rawHistory, weekHistoryBase, resolvedProgramId).map((week) => ({
        ...week,
        current: week.n === currentWeek,
        upcoming: week.n > currentWeek,
        sessions: week.sessions.map((session) => {
          const hasLoggedWork = session.complete || session.lifts.length > 0;
          return {
            ...session,
            planned: !hasLoggedWork && !session.skipped && week.n > currentWeek,
          };
        }),
      })),
    [rawHistory, weekHistoryBase, currentWeek, resolvedProgramId],
  );

  const currentWeekEntry = useMemo(
    () => weekHistory.find((w) => w.n === currentWeek) ?? weekHistory[0],
    [weekHistory, currentWeek],
  );

  const thisWeekDays = useMemo(
    () => buildThisWeekDays(rawHistory, currentWeek, currentWeekEntry),
    [rawHistory, currentWeek, currentWeekEntry],
  );

  const monthData = useMemo(() => buildMonthData(rawHistory, new Date()), [rawHistory]);

  const exerciseCards = useMemo(
    () =>
      buildProgressScreenData({
        history: rawHistory,
        range: "30D"
      }).exercises,
    [rawHistory],
  );

  const thisWeekDone = thisWeekDays.filter(
    (d) => d.status === "done" || d.status === "partial",
  ).length;
  const thisWeekTotal = thisWeekDays.filter((d) => d.status !== "rest").length;
  const phaseLabel = currentWeekEntry?.label ?? "";

  const programTitle = program?.title ?? "Strength Foundations";
  const totalWeeks = Math.max(1, weekHistory.length);
  const programSubtitle = `Week ${currentWeek} of ${totalWeeks}${
    phaseLabel ? ` · ${phaseLabel}` : ""
  }`;

  const addCheckin = useCallback(
    async (c: Omit<CheckIn, "id">) => {
      const next: CheckIn = { ...c, id: `ci_${Date.now()}` };
      const updated = [...checkins, next];
      setCheckins(updated);
      await saveCheckIns(updated);
    },
    [checkins],
  );

  return {
    programId: resolvedProgramId,
    programTitle,
    programSubtitle,
    currentWeek,
    totalWeeks,
    phaseLabel,
    thisWeekDays,
    thisWeekDone,
    thisWeekTotal,
    weekHistory,
    monthData,
    rawHistory,
    exerciseCards,
    checkins,
    addCheckin,
    loading,
    error,
    refresh: load,
  };
}

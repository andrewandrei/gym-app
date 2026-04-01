// app/lib/progress/useProgressData.ts
//
// Single source of truth for all data the Progress screen needs.
// Current stack:
//   • Program config  → app/program/program.data.ts
//   • Workout history → AsyncStorage via workoutHistory.ts
//   • Check-ins       → storage.ts
//   • Progress engine → progressEngine.ts

import { useCallback, useEffect, useMemo, useState } from "react";

import { getProgram } from "../../program/program.data";
import { buildMonthData } from "./bodySelectors";
import { SEED_CHECKINS } from "./checkinDemoData";
import { mergeHistory } from "./historySelectors";
import { buildThisWeekDays } from "./programSelectors";
import { buildProgressScreenData } from "./progressEngine";

import { SEED_WEEK_HISTORY } from "./demoData";
import {
  fetchCheckIns,
  fetchCurrentWeek,
  fetchWorkoutHistory,
  saveCheckIns,
} from "./storage";


import type { CheckIn, ProgressData } from "./types";
// ─── Main hook ────────────────────────────────────────────────────────────────
export function useProgressData(programId = "strength-foundations"): ProgressData {
  const [loading, setLoading] = useState(true);
  const [rawHistory, setRawHistory] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>(SEED_CHECKINS);
  const [currentWeek, setCurrentWeek] = useState(6);

  const program = useMemo(() => getProgram(programId), [programId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [history, cis, week] = await Promise.all([
        fetchWorkoutHistory(),
        fetchCheckIns(),
        fetchCurrentWeek(programId),
      ]);

      setRawHistory(history);
      setCheckins(cis);
      setCurrentWeek(week);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    load();
  }, [load]);

  const weekHistory = useMemo(() => mergeHistory(rawHistory, SEED_WEEK_HISTORY), [rawHistory]);

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

  const thisWeekDone = thisWeekDays.filter((d) => d.status === "done").length;
  const thisWeekTotal = thisWeekDays.filter((d) => d.status !== "rest").length;
  const phaseLabel = currentWeekEntry?.label ?? "";

  const programTitle = program?.title ?? "Strength Foundations";
  const totalWeeks = weekHistory.length;
  const programSubtitle = `Week ${currentWeek} of ${totalWeeks} · ${phaseLabel} phase`;

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
    refresh: load,
  };
}
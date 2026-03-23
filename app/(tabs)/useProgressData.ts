// app/(tabs)/useProgressData.ts
//
// Single source of truth for all data the Progress screen needs.
// Every section has a clear  ── SUPABASE SWAP  comment showing exactly
// what to replace once the database layer is ready.
//
// Current stack:
//   • Program config  → app/program/program.data.ts  (static JSON)
//   • Workout history → AsyncStorage via workoutHistory.ts
//   • Check-ins       → AsyncStorage (key: "aa_fit_checkins")
//   • Progress engine → progressEngine.ts (aggregates history → exercise cards)

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getProgram } from "../program/program.data";
import { parseProgramWorkoutId } from "../program/programWorkouts";
import { buildProgressScreenData, type ProgressRange } from "./progressEngine";

// ─── Public types ─────────────────────────────────────────────────────────────

export type DayStatus = "done" | "today" | "planned" | "rest";

export type WeekDay = {
  d: string;          // "M" | "T" | "W" | "T" | "F" | "S" | "S"
  type: string;       // "Upper" | "Lower" | "Rest" etc.
  status: DayStatus;
};

export type SessionLifts = string; // "Back Squat 95kg×3" or "Back Squat 95kg×3 🏆"

export type WeekSession = {
  date: string;
  type: string;
  complete: boolean;
  planned?: boolean;
  lifts: SessionLifts[];
};

export type WeekEntry = {
  n: number;
  label: string;
  dates: string;
  current?: boolean;
  upcoming?: boolean;
  sessions: WeekSession[];
};

export type CalendarDay = {
  dayNum: number;
  trained: boolean;
  type?: string;   // "U" | "L"
  isToday: boolean;
  future: boolean;
};

export type MonthData = {
  label: string;      // "March 2025"
  year: number;
  month: number;      // 0-based
  offset: number;     // Mon-first grid offset
  daysInMonth: number;
  today: number | null;
  days: CalendarDay[];
  totalSessions: number;
  thisWeekDone: number;
  thisWeekTotal: number;
  consistency: number; // 0–100
};

export type CheckIn = {
  id: string;
  date: string;        // display string e.g. "Mar 21"
  isoDate: string;     // ISO for sorting
  weight: number;
  meas: { waist: number; chest: number; arm: number };
};

export type ProgressData = {
  // ── Program ──────────────────────────────────────────────────────────────
  programTitle: string;
  programSubtitle: string;      // "Week 6 of 8 · Strength phase"
  currentWeek: number;
  totalWeeks: number;
  phaseLabel: string;           // "Strength"

  // ── This week ─────────────────────────────────────────────────────────────
  thisWeekDays: WeekDay[];
  thisWeekDone: number;
  thisWeekTotal: number;

  // ── Block (all weeks) ─────────────────────────────────────────────────────
  weekHistory: WeekEntry[];

  // ── Month calendar ────────────────────────────────────────────────────────
  monthData: MonthData;

  // ── Performance ───────────────────────────────────────────────────────────
  exerciseCards: ReturnType<typeof buildProgressScreenData>["exercises"];

  // ── Check-ins ─────────────────────────────────────────────────────────────
  checkins: CheckIn[];
  addCheckin: (c: Omit<CheckIn, "id">) => Promise<void>;

  // ── Loading ───────────────────────────────────────────────────────────────
  loading: boolean;
  refresh: () => Promise<void>;
};

// ─── Seed week history — lifted to module scope so functions can reference it ─

const SEED_WEEK_HISTORY: WeekEntry[] = [
  {
    n:1, label:"Intro", dates:"Feb 3–7",
    sessions:[
      { date:"Feb 3",  type:"Upper A", complete:true,  lifts:["Bench Press 60kg×4","OHP 45kg×4","Barbell Row 70kg×4"] },
      { date:"Feb 4",  type:"Lower A", complete:true,  lifts:["Back Squat 80kg×4","Romanian DL 70kg×4","Hip Thrust 100kg×4"] },
      { date:"Feb 6",  type:"Upper B", complete:true,  lifts:["Incline Press 55kg×4","OHP 45kg×4","Barbell Row 70kg×4"] },
      { date:"Feb 7",  type:"Lower B", complete:false, lifts:["Deadlift 100kg×4","Romanian DL 70kg×3","Hip Thrust 100kg×3"] },
    ],
  },
  {
    n:2, label:"Build", dates:"Feb 10–14",
    sessions:[
      { date:"Feb 10", type:"Upper A", complete:true, lifts:["Bench Press 62.5kg×4","OHP 47.5kg×4","Barbell Row 72.5kg×4"] },
      { date:"Feb 11", type:"Lower A", complete:true, lifts:["Back Squat 82.5kg×4","Romanian DL 75kg×4","Hip Thrust 110kg×4"] },
      { date:"Feb 13", type:"Upper B", complete:true, lifts:["Incline Press 57.5kg×4","OHP 47.5kg×4","Barbell Row 72.5kg×4"] },
      { date:"Feb 14", type:"Lower B", complete:true, lifts:["Deadlift 105kg×4","Romanian DL 75kg×4","Hip Thrust 110kg×4"] },
    ],
  },
  {
    n:3, label:"Build", dates:"Feb 17–21",
    sessions:[
      { date:"Feb 17", type:"Upper A", complete:true,  lifts:["Bench Press 62.5kg×5","OHP 47.5kg×5","Barbell Row 75kg×5"] },
      { date:"Feb 18", type:"Lower A", complete:true,  lifts:["Back Squat 85kg×5","Romanian DL 77.5kg×5","Hip Thrust 115kg×5"] },
      { date:"Feb 19", type:"Upper B", complete:false, lifts:["Incline Press 60kg×5","OHP 47.5kg×5","Barbell Row 75kg×5"] },
      { date:"Feb 20", type:"Lower B", complete:true,  lifts:["Deadlift 110kg×5","Romanian DL 77.5kg×5","Hip Thrust 115kg×4"] },
      { date:"Feb 21", type:"Upper A", complete:true,  lifts:["Bench Press 65kg×4","OHP 50kg×4","Barbell Row 75kg×4"] },
    ],
  },
  {
    n:4, label:"Deload", dates:"Feb 24–26",
    sessions:[
      { date:"Feb 24", type:"Upper", complete:true, lifts:["Bench Press 55kg×3","OHP 42.5kg×3","Barbell Row 65kg×3"] },
      { date:"Feb 25", type:"Lower", complete:true, lifts:["Back Squat 70kg×3","Romanian DL 65kg×3","Hip Thrust 90kg×3"] },
      { date:"Feb 26", type:"Full",  complete:true, lifts:["Incline Press 50kg×3","Deadlift 90kg×3","Hip Thrust 90kg×3"] },
    ],
  },
  {
    n:5, label:"Strength", dates:"Mar 3–7",
    sessions:[
      { date:"Mar 3",  type:"Upper A", complete:true,  lifts:["Bench Press 67.5kg×3","OHP 50kg×3","Barbell Row 77.5kg×3"] },
      { date:"Mar 4",  type:"Lower A", complete:true,  lifts:["Back Squat 87.5kg×3","Romanian DL 80kg×3","Hip Thrust 125kg×3"] },
      { date:"Mar 6",  type:"Upper B", complete:false, lifts:["Bench Press 67.5kg×3","Incline Press 62.5kg×3","Barbell Row 77.5kg×3"] },
      { date:"Mar 7",  type:"Lower B", complete:true,  lifts:["Deadlift 117.5kg×3","Romanian DL 80kg×3","Hip Thrust 125kg×3"] },
    ],
  },
  {
    n:6, label:"Strength", dates:"Mar 10–14", current:true,
    sessions:[
      { date:"Mar 10", type:"Upper A", complete:true,  lifts:["Bench Press 72.5kg×3 🏆","OHP 52.5kg×3","Barbell Row 80kg×3"] },
      { date:"Mar 11", type:"Lower A", complete:true,  lifts:["Back Squat 95kg×3 🏆","Romanian DL 82.5kg×3 🏆","Hip Thrust 130kg×3 🏆"] },
      { date:"Mar 13", type:"Upper B", complete:false, lifts:["Incline Press 65kg×3","OHP 52.5kg×3","Barbell Row 80kg×3"] },
      { date:"Mar 14", type:"Lower B", complete:true,  lifts:["Deadlift 122.5kg×3 🏆","Romanian DL 82.5kg×3","Hip Thrust 130kg×3"] },
    ],
  },
  {
    n:7, label:"Strength", dates:"Mar 17–21", upcoming:true,
    sessions:[
      { date:"Mar 17", type:"Upper A", complete:false, planned:true, lifts:["Bench Press ~75kg×2","OHP ~55kg×2","Barbell Row ~82.5kg×2"] },
      { date:"Mar 18", type:"Lower A", complete:false, planned:true, lifts:["Back Squat ~100kg×2","Romanian DL ~85kg×2","Hip Thrust ~135kg×2"] },
      { date:"Mar 20", type:"Upper B", complete:false, planned:true, lifts:["Incline Press ~67.5kg×2","OHP ~55kg×2"] },
      { date:"Mar 21", type:"Lower B", complete:false, planned:true, lifts:["Deadlift ~125kg×2","Romanian DL ~85kg×2"] },
    ],
  },
  {
    n:8, label:"Peak", dates:"Mar 24–28", upcoming:true,
    sessions:[
      { date:"Mar 24", type:"Test Day 1", complete:false, planned:true, lifts:["Back Squat 1RM test","Bench Press 1RM test"] },
      { date:"Mar 25", type:"Test Day 2", complete:false, planned:true, lifts:["Deadlift 1RM test","OHP 1RM test"] },
    ],
  },
];

// ─── Seed check-ins ───────────────────────────────────────────────────────────

const SEED_CHECKINS: CheckIn[] = [
  { id:"ci1", date:"Mar 1",  isoDate:"2025-03-01", weight:84.2, meas:{ waist:88,   chest:102, arm:36   } },
  { id:"ci2", date:"Mar 8",  isoDate:"2025-03-08", weight:83.5, meas:{ waist:87,   chest:102, arm:36.5 } },
  { id:"ci3", date:"Mar 15", isoDate:"2025-03-15", weight:82.4, meas:{ waist:86,   chest:103, arm:37   } },
  { id:"ci4", date:"Mar 21", isoDate:"2025-03-21", weight:81.8, meas:{ waist:85.5, chest:103, arm:37.5 } },
];

// ─── AsyncStorage keys ────────────────────────────────────────────────────────

const CHECKINS_KEY     = "aa_fit_checkins";
const PROG_WEEK_KEY    = "aa_fit_current_week";     // stores { programId, week, updatedAt }

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Load raw workout history safely, fall back to [] */
async function fetchWorkoutHistory(): Promise<any[]> {
  // ── SUPABASE SWAP ──────────────────────────────────────────────────────────
  // Replace this block with:
  //   const { data, error } = await supabase
  //     .from("workout_sessions")
  //     .select("*, exercises:session_exercises(*, sets:exercise_sets(*))")
  //     .eq("user_id", userId)
  //     .order("completed_at", { ascending: false });
  //   return error ? [] : data;
  // ──────────────────────────────────────────────────────────────────────────
  try {
    const { loadWorkoutHistory } = require("../workout/workoutHistory");
    if (typeof loadWorkoutHistory === "function") {
      const h = await loadWorkoutHistory();
      return h ?? [];
    }
  } catch { /* noop */ }
  return [];
}

/** Load persisted check-ins, fall back to seed data */
async function fetchCheckIns(): Promise<CheckIn[]> {
  // ── SUPABASE SWAP ──────────────────────────────────────────────────────────
  // Replace with:
  //   const { data, error } = await supabase
  //     .from("check_ins")
  //     .select("*")
  //     .eq("user_id", userId)
  //     .order("iso_date", { ascending: true });
  //   return error ? SEED_CHECKINS : data.map(mapSupabaseCheckIn);
  // ──────────────────────────────────────────────────────────────────────────
  try {
    const raw = await AsyncStorage.getItem(CHECKINS_KEY);
    if (raw) {
      const parsed: CheckIn[] = JSON.parse(raw);
      if (parsed?.length) return parsed;
    }
  } catch { /* noop */ }
  return SEED_CHECKINS;
}

/** Load current week number for the active program */
async function fetchCurrentWeek(programId: string): Promise<number> {
  // ── SUPABASE SWAP ──────────────────────────────────────────────────────────
  // Replace with:
  //   const { data } = await supabase
  //     .from("user_programs")
  //     .select("current_week")
  //     .eq("user_id", userId)
  //     .eq("program_id", programId)
  //     .single();
  //   return data?.current_week ?? 1;
  // ──────────────────────────────────────────────────────────────────────────
  try {
    const raw = await AsyncStorage.getItem(PROG_WEEK_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved?.programId === programId) return saved.week ?? 1;
    }
  } catch { /* noop */ }
  return 6; // fallback: week 6 of demo data
}

/** Merge real logged sessions back into seed week history */
function mergeHistory(rawHistory: any[], base: WeekEntry[]): WeekEntry[] {
  if (!rawHistory?.length) return base;

  const merged = base.map(w => ({ ...w, sessions: [...w.sessions] }));

  rawHistory.forEach(entry => {
    const parsed = parseProgramWorkoutId(entry.workoutId);
    if (!parsed) return;

    const week = merged.find(w => w.n === parsed.weekNumber);
    if (!week) return;

    const lifts: string[] = entry.exercises?.flatMap((ex: any) => {
      const done = ex.sets?.filter((s: any) => s.done) ?? [];
      if (!done.length) return [];
      const best = done.reduce((b: any, s: any) =>
        parseFloat(s.weight) > parseFloat(b.weight) ? s : b, done[0]);
      const isPR = done.some((s: any) => s.comparison?.isWeightPR || s.comparison?.isRepPR);
      return [`${ex.name} ${best.weight}kg×${best.reps}${isPR ? " 🏆" : ""}`];
    }) ?? [];

    const date = new Date(entry.completedAt)
      .toLocaleDateString("en-US", { month:"short", day:"numeric" });

    const real: WeekSession = {
      date,
      type: entry.workoutTitle,
      complete: entry.status === "completed",
      lifts,
    };

    const idx = week.sessions.findIndex(
      s => s.date === date || s.type === entry.workoutTitle,
    );
    if (idx >= 0) week.sessions[idx] = real;
    else          week.sessions.unshift(real);
  });

  return merged;
}

/** Build THIS week day blocks from history + program schedule */
function buildThisWeekDays(
  rawHistory: any[],
  currentWeek: number,
  weekEntry: WeekEntry,
): WeekDay[] {
  // ── SUPABASE SWAP ──────────────────────────────────────────────────────────
  // When program schedule is in Supabase, derive scheduled days from:
  //   program_weeks → week_sessions table
  // For now we derive from the seed week entry sessions
  // ──────────────────────────────────────────────────────────────────────────

  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Mon = 0

  // Map session type to short label
  const sessionLabels = weekEntry.sessions.map(s => ({
    type: s.type.includes("Upper") ? "Upper" :
          s.type.includes("Lower") ? "Lower" :
          s.type.includes("Full")  ? "Full"  : s.type,
    complete: s.complete,
    planned: s.planned,
  }));

  // Build 7-day grid. Simplified: assign sessions to Mon/Tue/Thu/Fri pattern
  const schedule: Array<{ type: string; sessionIdx: number | null }> = [
    { type: sessionLabels[0]?.type ?? "Upper", sessionIdx: 0 },  // Mon
    { type: sessionLabels[1]?.type ?? "Lower", sessionIdx: 1 },  // Tue
    { type: "Rest",   sessionIdx: null },                         // Wed
    { type: sessionLabels[2]?.type ?? "Upper", sessionIdx: 2 },  // Thu
    { type: sessionLabels[3]?.type ?? "Lower", sessionIdx: 3 },  // Fri
    { type: "Rest",   sessionIdx: null },                         // Sat
    { type: "Rest",   sessionIdx: null },                         // Sun
  ];

  const days = ["M","T","W","T","F","S","S"];

  return days.map((d, i) => {
    const slot = schedule[i];
    const isRest = slot.type === "Rest";
    const sessionIdx = slot.sessionIdx;
    const session = sessionIdx !== null ? weekEntry.sessions[sessionIdx] : null;

    let status: DayStatus = "rest";
    if (!isRest) {
      if (session?.complete)       status = "done";
      else if (i === dayOfWeek)    status = "today";
      else if (!session?.planned)  status = "planned";
      else                         status = "planned";
    }

    return { d, type: isRest ? "Rest" : slot.type, status };
  });
}

/** Build current month calendar from real history */
function buildMonthData(rawHistory: any[]): MonthData {
  // ── SUPABASE SWAP ──────────────────────────────────────────────────────────
  // Replace rawHistory loop with query:
  //   .from("workout_sessions")
  //   .select("completed_at")
  //   .gte("completed_at", startOfMonth)
  //   .lte("completed_at", endOfMonth)
  // ──────────────────────────────────────────────────────────────────────────

  const now    = new Date();
  const year   = now.getFullYear();
  const month  = now.getMonth();
  const today  = now.getDate();

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Mon-first offset for day 1 of month
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const offset = (firstDow + 6) % 7; // Mon=0

  // Which days in this month had real sessions
  const trainedDays = new Map<number, string>(); // dayNum → "U"|"L"|""
  rawHistory.forEach(entry => {
    const d = new Date(entry.completedAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      const typeChar = entry.workoutTitle?.includes("Upper") ? "U" :
                       entry.workoutTitle?.includes("Lower") ? "L" : "";
      trainedDays.set(dayNum, typeChar);
    }
  });

  // Fall back: if no real history for this month (demo mode), use March seed
  // This gets replaced once real users have logged sessions
  if (trainedDays.size === 0 && month === 2 /* March */ ) {
    const seedTrained: Record<number,string> = {
      3:"U",4:"L",6:"U",7:"L",10:"U",11:"L",13:"U",14:"L",17:"U",18:"L",24:"U",25:"L",27:"U",
    };
    Object.entries(seedTrained).forEach(([d, t]) => trainedDays.set(Number(d), t));
  }

  // Build days array
  const days: CalendarDay[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      dayNum: i,
      trained: trainedDays.has(i),
      type: trainedDays.get(i),
      isToday: i === today,
      future: i > today,
    });
  }

  // Stats
  const totalSessions    = trainedDays.size;
  const dayOfWeek        = (now.getDay() + 6) % 7;
  const weekStart        = today - dayOfWeek;
  const weekEnd          = weekStart + 6;
  const thisWeekDone     = days.filter(d => d.trained && d.dayNum >= weekStart && d.dayNum <= weekEnd).length;
  const thisWeekTotal    = 5; // scheduled sessions per week — TODO: derive from program
  const doneTotal        = days.filter(d => d.trained && !d.future).length;
  const scheduledTotal   = days.filter(d => !d.future).length;
  const consistency      = scheduledTotal > 0 ? Math.round((doneTotal / (doneTotal + 2)) * 100) : 0; // rough

  const monthLabel = now.toLocaleDateString("en-US", { month:"long", year:"numeric" });

  return {
    label: monthLabel,
    year, month, offset, daysInMonth,
    today,
    days,
    totalSessions,
    thisWeekDone,
    thisWeekTotal,
    consistency: Math.min(consistency, 100),
  };
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useProgressData(programId = "strength-foundations"): ProgressData {
  const [loading,      setLoading]      = useState(true);
  const [rawHistory,   setRawHistory]   = useState<any[]>([]);
  const [checkins,     setCheckins]     = useState<CheckIn[]>(SEED_CHECKINS);
  const [currentWeek,  setCurrentWeek]  = useState(6);

  // ── SUPABASE SWAP (program config) ────────────────────────────────────────
  // Replace with useMemo that fetches from supabase.from("programs")
  const program = useMemo(() => getProgram(programId), [programId]);
  // ──────────────────────────────────────────────────────────────────────────

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

  useEffect(() => { load(); }, [load]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const weekHistory = useMemo(
    () => mergeHistory(rawHistory, SEED_WEEK_HISTORY),
    [rawHistory],
  );

  const currentWeekEntry = useMemo(
    () => weekHistory.find(w => w.n === currentWeek) ?? weekHistory[0],
    [weekHistory, currentWeek],
  );

  const thisWeekDays = useMemo(
    () => buildThisWeekDays(rawHistory, currentWeek, currentWeekEntry),
    [rawHistory, currentWeek, currentWeekEntry],
  );

  const monthData = useMemo(
    () => buildMonthData(rawHistory),
    [rawHistory],
  );

  const exerciseCards = useMemo(
    () => buildProgressScreenData({ history: rawHistory, range: "30D" as ProgressRange }).exercises,
    [rawHistory],
  );

  const thisWeekDone  = thisWeekDays.filter(d => d.status === "done").length;
  const thisWeekTotal = thisWeekDays.filter(d => d.status !== "rest").length;
  const phaseLabel    = currentWeekEntry?.label ?? "";

  const programTitle    = program?.title ?? "Strength Foundations";
  const totalWeeks      = weekHistory.length;
  const programSubtitle = `Week ${currentWeek} of ${totalWeeks} · ${phaseLabel} phase`;

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addCheckin = useCallback(async (c: Omit<CheckIn, "id">) => {
    const next: CheckIn = { ...c, id: `ci_${Date.now()}` };
    const updated = [...checkins, next];
    setCheckins(updated);

    // ── SUPABASE SWAP ────────────────────────────────────────────────────────
    // Replace with:
    //   await supabase.from("check_ins").insert({
    //     user_id: userId, weight: next.weight,
    //     waist: next.meas.waist, chest: next.meas.chest, arm: next.meas.arm,
    //     iso_date: next.isoDate,
    //   });
    // ────────────────────────────────────────────────────────────────────────
    try {
      await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(updated));
    } catch { /* noop */ }
  }, [checkins]);

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
    exerciseCards,
    checkins,
    addCheckin,
    loading,
    refresh: load,
  };
}
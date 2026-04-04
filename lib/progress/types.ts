// app/lib/progress/types.ts

export type ProgressRange = "7D" | "30D" | "ALL";

// ─────────────────────────────────────────────────────────────────────────────
// Shared progress hook / UI types
// ─────────────────────────────────────────────────────────────────────────────

export type DayStatus = "done" | "today" | "planned" | "rest";

export type WeekDay = {
  d: string; // "M" | "T" | "W" | "T" | "F" | "S" | "S"
  type: string; // "Upper" | "Lower" | "Rest" etc.
  status: DayStatus;
};

export type SessionLifts = string; // "Back Squat 95kg×3" or "... 🏆"

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
  type?: string; // "U" | "L"
  isToday: boolean;
  future: boolean;
};

export type MonthData = {
  label: string; // "March 2025"
  year: number;
  month: number; // 0-based
  offset: number; // Mon-first grid offset
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
  date: string; // display string e.g. "Mar 21"
  isoDate: string; // ISO for sorting
  weight: number;
  meas: {
    waist: number;
    chest: number;
    arm: number;
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Progress engine types
// ─────────────────────────────────────────────────────────────────────────────

export type ProgressScreenData = {
  range: ProgressRange;
  overview: ProgressOverview;
  charts: ProgressCharts;
  calendar: ProgressWeekCalendar;
  highlights: ProgressHighlights;
  exercises: ExerciseProgressCard[];
  recentSessions: ProgressSessionRow[];
  bodyMetrics: ProgressBodyMetricsBlock;
  emptyState: ProgressEmptyState;
};

export type ProgressOverview = {
  totalSessions: number;
  completedSessions: number;
  partialSessions: number;

  completedSets: number;
  totalPlannedSets: number;

  totalVolume: number;
  totalDurationSec: number;

  completionRate: number; // 0..1
  averageSessionDurationSec: number;

  activeDays: number;
  currentStreakDays: number;
};

export type ProgressChartPoint = {
  key: string;
  label: string;
  value: number;
  secondaryValue?: number;
  date: string;
};

export type ProgressChart = {
  id: "workouts" | "volume" | "completion";
  title: string;
  subtitle: string;
  points: ProgressChartPoint[];
  trend: "up" | "down" | "flat";
  summaryLabel: string;
  empty: boolean;
};

export type ProgressCharts = {
  workouts: ProgressChart;
  volume: ProgressChart;
  completion: ProgressChart;
};

export type ProgressWeekCalendar = {
  weekLabel: string;
  days: ProgressWeekDay[];
  selectedDayKey: string;
  selectedDaySummary: ProgressSelectedDaySummary | null;
};

export type ProgressWeekDay = {
  key: string;
  label: string;
  dateLabel: string;
  isToday: boolean;
  sessionCount: number;
  status: "none" | "partial" | "completed" | "mixed";
};

export type ProgressSelectedDaySummary = {
  key: string;
  dateLabel: string;
  sessionCount: number;
  primaryStatus: "none" | "partial" | "completed" | "mixed";
  title: string;
  subtitle: string;
  note?: string;

  latestSessionId?: string;
  latestWorkoutId?: string;
};

export type ProgressHighlights = {
  latestPR: ProgressHighlightPR | null;
  strongestSession: ProgressHighlightSession | null;
  mostImprovedExercise: ProgressHighlightExercise | null;
};

export type ProgressHighlightPR = {
  exerciseId: string;
  exerciseName: string;
  type: "weight" | "reps" | "volume";
  valueLabel: string;
  achievedAt: string;
  sessionId: string;
};

export type ProgressHighlightSession = {
  sessionId: string;
  workoutId: string;
  workoutTitle: string;
  totalVolume: number;
  completedAt: string;
  status: "partial" | "completed";
};

export type ProgressHighlightExercise = {
  exerciseId: string;
  exerciseName: string;
  result: "better" | "same" | "mixed";
  improvedSets: number;
  prCount: number;
  lastTrainedAt: string;
};

export type ExerciseProgressCard = {
  exerciseId: string;
  exerciseName: string;
  unitLabel: string;

  sessionsLogged: number;
  lastTrainedAt: string;

  bestWeight?: number;
  bestReps?: number;
  bestVolume?: number;

  latestSession: {
    sessionId: string;
    completedAt: string;
    status: "partial" | "completed";
    completedSets: number;
    totalSetsPlanned: number;
    sessionVolume: number;
  } | null;

  trend: {
    result: "better" | "same" | "mixed" | "no_data";
    improvedSets: number;
    matchedSets: number;
    belowSets: number;
    prCount: number;
  };

  recentDelta?: {
    weight?: number;
    reps?: number;
    volume?: number;
  };
};

export type ProgressSessionRow = {
  sessionId: string;
  workoutId: string;
  workoutTitle: string;

  completedAt: string;
  dateLabel: string;

  durationSec: number;
  completedSets: number;
  totalSets: number;
  completionRate: number;

  totalVolume: number;
  status: "partial" | "completed";
};

export type ProgressBodyMetricTrend = "down" | "up" | "flat" | "no_data";

export type ProgressBodyMetricItem = {
  label: string;
  valueLabel: string;
  trend: ProgressBodyMetricTrend;
  trendLabel: string;
  updatedAtLabel: string;
  isPlaceholder: boolean;
};

export type ProgressBodyMetricsBlock = {
  weight: ProgressBodyMetricItem | null;
  waist: ProgressBodyMetricItem | null;
  hasRealData: boolean;
};

export type ProgressEmptyState = {
  hasAnyHistory: boolean;
  hasEnoughDataForCharts: boolean;
  hasEnoughDataForComparisons: boolean;
  hasAnyVolumeData: boolean;
  hasAnyPRData: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook return type
// ─────────────────────────────────────────────────────────────────────────────

export type ProgressData = {
  programTitle: string;
  programSubtitle: string;
  currentWeek: number;
  totalWeeks: number;
  phaseLabel: string;

  thisWeekDays: WeekDay[];
  thisWeekDone: number;
  thisWeekTotal: number;

  weekHistory: WeekEntry[];
  
  monthData: MonthData;

  rawHistory: any[];

  exerciseCards: ExerciseProgressCard[];

  checkins: CheckIn[];
  addCheckin: (c: Omit<CheckIn, "id">) => Promise<void>;

  loading: boolean;
  refresh: () => Promise<void>;
};
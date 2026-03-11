// app/workout/finishFeedback.ts

export type FinishSummary = {
  workoutTitle: string;
  durationSec: number;
  totals: {
    completedSets: number;
    totalSets: number;
    completedExercises: number;
    totalExercises: number;
    totalVolume: number;
    trackedStrengthVolume: number;
  };
  insights: {
    completionRate: number; // 0..1
    prCount: number;
    missingLoadCount: number;
    strengthSetCount: number;
    avgTrackedLoad: number;
    improvedExerciseCount: number;
    matchedExerciseCount: number;
  };
  prs: Array<{
    exerciseId: string;
    exerciseName: string;
    weight: string;
    reps: string;
  }>;
  wins: Array<{
    exerciseId: string;
    exerciseName: string;
    type: "heavier" | "more_reps" | "matched" | "volume_up";
    label: string;
  }>;
  exercises: Array<{
    id: string;
    name: string;
    completedSets: number;
    unitLabel: string;
    sessionVolume: number;
    comparedToLast?: {
      previousWeight?: number;
      previousReps?: number;
      previousVolume?: number;
      result: "better" | "same" | "mixed" | "no_data";
    };
    sets: Array<{
      set: number;
      weight: string;
      reps: string;
      rest: string;
      done: boolean;
    }>;
  }>;
};

export type FinishFeedbackTone =
  | "pr"
  | "excellent"
  | "solid"
  | "partial"
  | "log-load"
  | "recovery"
  | "volume"
  | "default";

export type FinishFeedback = {
  tone: FinishFeedbackTone;
  kicker: string;
  title: string;
  body: string;
};

function isRecoveryWorkout(title: string) {
  const t = title.toLowerCase();

  return (
    t.includes("mobility") ||
    t.includes("recovery") ||
    t.includes("zone 2") ||
    t.includes("cardio") ||
    t.includes("reset") ||
    t.includes("walk") ||
    t.includes("conditioning easy")
  );
}

function plural(count: number, singular: string, pluralForm?: string) {
  return `${count} ${count === 1 ? singular : pluralForm ?? `${singular}s`}`;
}

function pickBySeed<T>(items: T[], seedSource: string): T {
  const seed = seedSource
    .split("")
    .reduce((sum, ch, idx) => sum + ch.charCodeAt(0) * (idx + 1), 0);

  return items[seed % items.length];
}

const EXCELLENT_MESSAGES: FinishFeedback[] = [
  {
    tone: "excellent",
    kicker: "Excellent session",
    title: "You finished what you planned.",
    body: "That kind of consistency compounds. Sessions like this are what change your body.",
  },
  {
    tone: "excellent",
    kicker: "Locked in",
    title: "Strong work from start to finish.",
    body: "You showed discipline, not just motivation. That’s the kind of effort that builds real momentum.",
  },
  {
    tone: "excellent",
    kicker: "High standard",
    title: "You executed the full session well.",
    body: "Keep stacking workouts like this and the results take care of themselves.",
  },
];

const SOLID_MESSAGES: FinishFeedback[] = [
  {
    tone: "solid",
    kicker: "Solid work",
    title: "Another good session in the bank.",
    body: "Not every workout needs fireworks. Consistent execution is what drives progress.",
  },
  {
    tone: "solid",
    kicker: "Momentum",
    title: "You did the work that matters.",
    body: "You moved forward today. Stay patient, stay consistent, and keep building.",
  },
  {
    tone: "solid",
    kicker: "Nice work",
    title: "You kept the rhythm going.",
    body: "A steady standard beats random intensity. This was useful work.",
  },
];

const PARTIAL_MESSAGES: FinishFeedback[] = [
  {
    tone: "partial",
    kicker: "Still counts",
    title: "You kept the habit alive.",
    body: "Not every session has to be perfect. Showing up and getting some work done still moves you forward.",
  },
  {
    tone: "partial",
    kicker: "Keep going",
    title: "Progress is built on imperfect days too.",
    body: "The important thing today was staying in motion. You did that.",
  },
  {
    tone: "partial",
    kicker: "Momentum preserved",
    title: "You did enough to keep the chain going.",
    body: "A shorter session is still better than breaking the rhythm.",
  },
];

const LOG_LOAD_MESSAGES: FinishFeedback[] = [
  {
    tone: "log-load",
    kicker: "Coach note",
    title: "Good effort. Track the load more precisely next time.",
    body: "Better logging gives you better decisions next workout. Treat the numbers as part of the training.",
  },
  {
    tone: "log-load",
    kicker: "Tracking matters",
    title: "Your effort was there. Capture the data.",
    body: "When strength work is logged accurately, progression becomes much easier to manage.",
  },
];

const RECOVERY_MESSAGES: FinishFeedback[] = [
  {
    tone: "recovery",
    kicker: "Smart recovery",
    title: "Recovery is part of the program.",
    body: "Sessions like this protect progress, improve readiness, and help you come back stronger.",
  },
  {
    tone: "recovery",
    kicker: "Good call",
    title: "You trained with intention today.",
    body: "Not every day is about pushing harder. Recovery done well is a performance advantage.",
  },
];

const DEFAULT_MESSAGES: FinishFeedback[] = [
  {
    tone: "default",
    kicker: "Workout complete",
    title: "Progress comes from repeated effort.",
    body: "Today added another layer. Stay consistent, recover well, and come back stronger next session.",
  },
  {
    tone: "default",
    kicker: "Session saved",
    title: "Another step forward.",
    body: "You put in the work. Keep the rhythm going and let consistency do the heavy lifting.",
  },
];

function prFeedback(summary: FinishSummary): FinishFeedback {
  const prCount = summary.insights.prCount;
  const firstPr = summary.prs[0];

  if (prCount === 1 && firstPr) {
    return {
      tone: "pr",
      kicker: "New personal best",
      title: `${firstPr.exerciseName} moved forward today.`,
      body: `You hit ${firstPr.weight} × ${firstPr.reps}. That is clear proof your training is working.`,
    };
  }

  return {
    tone: "pr",
    kicker: "Breakthrough session",
    title: `You set ${plural(prCount, "new PR")}.`,
    body: "That is the clearest sign of progress. Recover well and build on it next session.",
  };
}

function improvedExercisesFeedback(summary: FinishSummary): FinishFeedback {
  const improved = summary.insights.improvedExerciseCount;
  const heavierWins = summary.wins.filter((w) => w.type === "heavier").length;
  const repsWins = summary.wins.filter((w) => w.type === "more_reps").length;
  const volumeWins = summary.wins.filter((w) => w.type === "volume_up").length;

  if (heavierWins > 0) {
    return {
      tone: "solid",
      kicker: "Load progression",
      title: `You lifted heavier on ${plural(heavierWins, "movement")}.`,
      body: improved > heavierWins
        ? `And overall, ${plural(improved, "exercise")} improved versus your last session.`
        : "That is exactly how strength progress is built over time.",
    };
  }

  if (repsWins > 0) {
    return {
      tone: "solid",
      kicker: "Rep progression",
      title: `You pushed more reps on ${plural(repsWins, "exercise")}.`,
      body: "Better output with the same work is real progress. Keep building from there.",
    };
  }

  if (volumeWins > 0) {
    return {
      tone: "volume",
      kicker: "More work completed",
      title: "Your session volume went up.",
      body: "More quality work over time is one of the strongest signs that your capacity is improving.",
    };
  }

  return {
    tone: "solid",
    kicker: "Forward progress",
    title: `${plural(improved, "exercise")} improved versus last time.`,
    body: "Even small improvements matter. Keep stacking them.",
  };
}

function matchedFeedback(summary: FinishSummary): FinishFeedback {
  return {
    tone: "solid",
    kicker: "Consistency",
    title: `You matched your previous level on ${plural(summary.insights.matchedExerciseCount, "exercise")}.`,
    body: "Matching strong performances consistently is often the step before another breakthrough.",
  };
}

function completionFeedback(summary: FinishSummary): FinishFeedback {
  const completionRate = summary.insights.completionRate;

  if (completionRate >= 0.95) {
    return pickBySeed(
      EXCELLENT_MESSAGES,
      `${summary.workoutTitle}-excellent-${summary.totals.completedSets}-${summary.durationSec}`,
    );
  }

  if (completionRate >= 0.65) {
    return pickBySeed(
      SOLID_MESSAGES,
      `${summary.workoutTitle}-solid-${summary.totals.completedSets}-${summary.durationSec}`,
    );
  }

  return pickBySeed(
    PARTIAL_MESSAGES,
    `${summary.workoutTitle}-partial-${summary.totals.completedSets}-${summary.durationSec}`,
  );
}

export function getFinishFeedback(summary: FinishSummary): FinishFeedback {
  const {
    prCount,
    missingLoadCount,
    strengthSetCount,
    improvedExerciseCount,
    matchedExerciseCount,
    completionRate,
  } = summary.insights;

  if (prCount > 0) {
    return prFeedback(summary);
  }

  if (isRecoveryWorkout(summary.workoutTitle)) {
    return pickBySeed(
      RECOVERY_MESSAGES,
      `${summary.workoutTitle}-recovery-${summary.totals.completedSets}`,
    );
  }

  if (
    strengthSetCount > 0 &&
    missingLoadCount >= Math.max(2, Math.ceil(strengthSetCount * 0.5))
  ) {
    return pickBySeed(
      LOG_LOAD_MESSAGES,
      `${summary.workoutTitle}-log-${missingLoadCount}-${strengthSetCount}`,
    );
  }

  if (improvedExerciseCount >= 2) {
    return improvedExercisesFeedback(summary);
  }

  if (improvedExerciseCount === 1 && completionRate >= 0.6) {
    return improvedExercisesFeedback(summary);
  }

  if (matchedExerciseCount >= 2 && completionRate >= 0.75) {
    return matchedFeedback(summary);
  }

  if (summary.totals.totalVolume > 0 && summary.wins.some((w) => w.type === "volume_up")) {
    return improvedExercisesFeedback(summary);
  }

  if (completionRate > 0) {
    return completionFeedback(summary);
  }

  return pickBySeed(DEFAULT_MESSAGES, `${summary.workoutTitle}-default`);
}
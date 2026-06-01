export type FinishSummary = {
  sessionId?: string;
  workoutId?: string;
  workoutTitle: string;
  programId?: string;
  completedAt?: string;
  status?: "partial" | "completed";
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
    completionRate: number;
    prCount: number;
    missingLoadCount: number;
    strengthSetCount: number;
    avgTrackedLoad: number;
    improvedExerciseCount: number;
    matchedExerciseCount: number;
    belowExerciseCount?: number;
    improvedSetCount?: number;
    matchedSetCount?: number;
    belowSetCount?: number;
    previousSessionFound?: boolean;
  };
  prs: {
    exerciseId: string;
    exerciseName: string;
    set?: number;
    type?: "weight" | "reps" | "volume";
    previousBestValue?: number;
    currentValue?: number;
    delta?: number;
    weight: string;
    reps: string;
  }[];
  wins: {
    exerciseId: string;
    exerciseName: string;
    type: "heavier" | "more_reps" | "matched" | "volume_up";
    label: string;
  }[];
  exercises: {
    id: string;
    name: string;
    completedSets: number;
    totalSetsPlanned: number;
    unitLabel: string;
    sessionVolume: number;
    comparedToLast?: {
      previousWeight?: number;
      previousReps?: number;
      previousVolume?: number;
      result: "better" | "same" | "mixed" | "no_data";
    };
    comparedToBest?: {
      bestWeight?: number;
      bestReps?: number;
      bestVolume?: number;
      result: "better" | "same" | "mixed" | "no_data";
    };
    insights?: {
      improvedSets: number;
      matchedSets: number;
      belowSets: number;
      prCount: number;
    };
    sets: {
      set: number;
      weight: string;
      reps: string;
      rest: string;
      done: boolean;
      note?: string;
      comparison?: {
        previous?: {
          weight?: number;
          reps?: number;
          volume?: number;
        };
        deltaVsPrevious?: {
          weight?: number;
          reps?: number;
          volume?: number;
        };
        best?: {
          weight?: number;
          reps?: number;
          volume?: number;
        };
        deltaVsBest?: {
          weight?: number;
          reps?: number;
          volume?: number;
        };
        state: "no_data" | "same" | "better" | "mixed" | "pr";
        isWeightPR: boolean;
        isRepPR: boolean;
        isVolumePR: boolean;
      };
    }[];
  }[];
};

export type FinishFeedbackTone =
  | "pr"
  | "excellent"
  | "solid"
  | "partial"
  | "log-load"
  | "recovery"
  | "volume"
  | "comeback"
  | "consistency"
  | "off-day"
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

const SOLID_MESSAGES: FinishFeedback[] = [
  {
    tone: "solid",
    kicker: "Solid work",
    title: "Another useful session in the bank.",
    body: "Not every workout needs fireworks. Good training repeated over time is what changes your body.",
  },
  {
    tone: "solid",
    kicker: "Momentum",
    title: "You kept things moving.",
    body: "That matters more than people think. Stay consistent and let the weeks add up.",
  },
  {
    tone: "solid",
    kicker: "Good session",
    title: "You did work that counts.",
    body: "A steady standard beats random intensity. Keep showing up.",
  },
];

const PARTIAL_MESSAGES: FinishFeedback[] = [
  {
    tone: "partial",
    kicker: "Momentum kept",
    title: "You kept the habit moving.",
    body: "Not every session needs to be perfect to matter. Showing up still counts, especially on the harder days.",
  },
  {
    tone: "partial",
    kicker: "Chain unbroken",
    title: "You did enough to keep the rhythm alive.",
    body: "A shorter session still protects the routine. The next win is coming back and adding to it.",
  },
  {
    tone: "partial",
    kicker: "Still progress",
    title: "This session still moved you forward.",
    body: "Progress is rarely perfect. Consistency is what makes it real.",
  },
];

const FULL_COMPLETION_MESSAGES: FinishFeedback[] = [
  {
    tone: "excellent",
    kicker: "Full session complete",
    title: "You closed the loop today.",
    body: "Every planned set got done. Bank that feeling and bring it into the next session.",
  },
  {
    tone: "excellent",
    kicker: "Session finished",
    title: "You finished what you came for.",
    body: "That kind of follow-through builds confidence as much as it builds results.",
  },
  {
    tone: "excellent",
    kicker: "Strong finish",
    title: "You saw the whole session through.",
    body: "Those complete sessions stack up fast. Recover well and keep the streak moving.",
  },
];

const LOG_LOAD_MESSAGES: FinishFeedback[] = [
  {
    tone: "log-load",
    kicker: "Coach note",
    title: "Good effort. Log the load more precisely next time.",
    body: "The better your numbers, the smarter your progression becomes.",
  },
  {
    tone: "log-load",
    kicker: "Tracking matters",
    title: "Your effort is there. Capture it better.",
    body: "Strength work gets more valuable when the data is clean.",
  },
];

const RECOVERY_MESSAGES: FinishFeedback[] = [
  {
    tone: "recovery",
    kicker: "Smart recovery",
    title: "Recovery is part of progress.",
    body: "Training hard only works when recovery is respected too.",
  },
  {
    tone: "recovery",
    kicker: "Intentional work",
    title: "You trained for the bigger picture today.",
    body: "Not every session should push harder. Recovery done well is a performance advantage.",
  },
];

const OFF_DAY_MESSAGES: FinishFeedback[] = [
  {
    tone: "off-day",
    kicker: "Off day",
    title: "Still worth it.",
    body: "Not every session peaks. Showing up keeps the system working.",
  },
  {
    tone: "off-day",
    kicker: "Not your best day",
    title: "You still got the work in.",
    body: "Even quieter sessions protect momentum. Come back stronger next time.",
  },
];

const DEFAULT_MESSAGES: FinishFeedback[] = [
  {
    tone: "default",
    kicker: "Workout complete",
    title: "Progress comes from repeated effort.",
    body: "Today added another layer. Recover well and come back ready.",
  },
  {
    tone: "default",
    kicker: "Session saved",
    title: "Another step forward.",
    body: "The work is done. Stay consistent and let time do the heavy lifting.",
  },
];

function prFeedback(summary: FinishSummary): FinishFeedback {
  const prCount = summary.insights.prCount;
  const firstPr = summary.prs[0];

  if (prCount === 1 && firstPr) {
    const prType = firstPr.type ? `${firstPr.type} PR` : "new personal best";
    return {
      tone: "pr",
      kicker: "New personal best",
      title: `${firstPr.exerciseName} moved forward today.`,
      body: `You hit a ${prType} on set ${firstPr.set ?? 1}. That is clear proof the training is working.`,
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
  const improvedSets = summary.insights.improvedSetCount ?? 0;

  if (heavierWins > 0) {
    return {
      tone: "solid",
      kicker: "Load progression",
      title: `You lifted heavier on ${plural(heavierWins, "movement")}.`,
      body:
        improvedSets > 0
          ? `You improved ${plural(improvedSets, "set")} overall. That is exactly how strength builds.`
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
    body:
      improvedSets > 0
        ? `You moved ${plural(improvedSets, "set")} forward today. Keep stacking that.`
        : "Even small improvements matter. Keep stacking them.",
  };
}

function matchedFeedback(summary: FinishSummary): FinishFeedback {
  const matchedExercises = summary.insights.matchedExerciseCount;
  const matchedSets = summary.insights.matchedSetCount ?? 0;

  return {
    tone: "consistency",
    kicker: "Consistency",
    title: `You matched your previous level on ${plural(matchedExercises, "exercise")}.`,
    body:
      matchedSets > 0
        ? `That included ${plural(matchedSets, "set")} right on target. Consistency like that matters.`
        : "Matching strong performances consistently is often the step before another breakthrough.",
  };
}

function offDayFeedback(summary: FinishSummary): FinishFeedback {
  return pickBySeed(
    OFF_DAY_MESSAGES,
    `${summary.workoutTitle}-off-${summary.totals.completedSets}-${summary.durationSec}`,
  );
}

function completionFeedback(summary: FinishSummary): FinishFeedback {
  const completionRate = summary.insights.completionRate;

  if (completionRate >= 0.95) {
    return pickBySeed(
      FULL_COMPLETION_MESSAGES,
      `${summary.workoutTitle}-full-${summary.totals.completedSets}-${summary.durationSec}`,
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
    belowExerciseCount = 0,
    improvedSetCount = 0,
    matchedSetCount = 0,
    completionRate,
    previousSessionFound = false,
  } = summary.insights;

  const isPartialSession =
    summary.status === "partial" || completionRate < 0.999;

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

  if (!previousSessionFound) {
    if (completionRate >= 0.95) {
      return {
        tone: "excellent",
        kicker: "First full session",
        title: "You finished your first session.",
        body: "That is a real starting line. You closed the loop, logged the work, and gave yourself something solid to build on.",
      };
    }

    if (isPartialSession) {
      return {
        tone: "partial",
        kicker: "First step taken",
        title: "You started the process today.",
        body: "A first session does not need to be perfect to matter. You have a baseline now, and the next win is coming back to build on it.",
      };
    }

    return {
      tone: "default",
      kicker: "First workout saved",
      title: "You’re officially underway now.",
      body: "The hardest part is starting. Now you have something real to return to and improve.",
    };
  }

  if (improvedExerciseCount >= 2 || improvedSetCount >= 3) {
    return improvedExercisesFeedback(summary);
  }

  if (improvedExerciseCount === 1 && completionRate >= 0.6) {
    return improvedExercisesFeedback(summary);
  }

  if (
    matchedExerciseCount >= 2 ||
    (matchedSetCount >= 3 && improvedExerciseCount === 0 && belowExerciseCount === 0)
  ) {
    return matchedFeedback(summary);
  }

  if (belowExerciseCount > 0 && improvedExerciseCount > 0) {
    return {
      tone: "solid",
      kicker: "Mixed session",
      title: "Some things moved, some things didn’t.",
      body: "That is normal. Progress is rarely perfectly linear — keep the rhythm going.",
    };
  }

  if (belowExerciseCount > 0 && improvedExerciseCount === 0 && matchedExerciseCount === 0) {
    return offDayFeedback(summary);
  }

  if (summary.totals.totalVolume > 0 && summary.wins.some((w) => w.type === "volume_up")) {
    return improvedExercisesFeedback(summary);
  }

  if (isPartialSession) {
    return pickBySeed(
      PARTIAL_MESSAGES,
      `${summary.workoutTitle}-partial-${summary.totals.completedSets}-${summary.durationSec}`,
    );
  }

  if (completionRate > 0) {
    return completionFeedback(summary);
  }

  return pickBySeed(DEFAULT_MESSAGES, `${summary.workoutTitle}-default`);
}

export type FinishSummary = {
  sessionId?: string;
  workoutId?: string;
  workoutTitle: string;
  programId?: string;
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
  prs: Array<{
    exerciseId: string;
    exerciseName: string;
    set?: number;
    type?: "weight" | "reps" | "volume";
    previousBestValue?: number;
    currentValue?: number;
    delta?: number;
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
    sets: Array<{
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

const EXCELLENT_MESSAGES: FinishFeedback[] = [
  {
    tone: "excellent",
    kicker: "Excellent session",
    title: "Everything moved in the right direction.",
    body: "You executed well, progressed well, and gave yourself something to build on next time.",
  },
  {
    tone: "excellent",
    kicker: "High standard",
    title: "This was a strong performance.",
    body: "Sessions like this are what make progress feel inevitable.",
  },
  {
    tone: "excellent",
    kicker: "Locked in",
    title: "You trained with intent today.",
    body: "Clean execution, solid output, and the kind of consistency that compounds.",
  },
];

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
    kicker: "Still counts",
    title: "You kept the habit alive.",
    body: "Not every session has to be perfect to be useful. Staying in motion still matters.",
  },
  {
    tone: "partial",
    kicker: "Momentum preserved",
    title: "You did enough to keep the chain going.",
    body: "A shorter session is still better than letting the rhythm break.",
  },
  {
    tone: "partial",
    kicker: "Progress is messy",
    title: "This one still moves you forward.",
    body: "Perfection is not the goal. Consistency is.",
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

const CONSISTENCY_MESSAGES: FinishFeedback[] = [
  {
    tone: "consistency",
    kicker: "Consistency",
    title: "You held your standard.",
    body: "Matching strong work consistently is often what comes right before another jump.",
  },
  {
    tone: "consistency",
    kicker: "Steady",
    title: "You stayed on level today.",
    body: "That stability matters. Keep stacking sessions like this.",
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
        kicker: "Strong first entry",
        title: "You set a solid baseline today.",
        body: "Now we have something real to build from. Keep showing up and the trend will take shape.",
      };
    }

    if (isPartialSession) {
      return {
        tone: "partial",
        kicker: "First session logged",
        title: "A first entry still matters.",
        body: "You started the process. Next step is simply showing up again.",
      };
    }

    return {
      tone: "default",
      kicker: "First session logged",
      title: "You’re underway now.",
      body: "The first saved session is important. Consistency turns it into momentum.",
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
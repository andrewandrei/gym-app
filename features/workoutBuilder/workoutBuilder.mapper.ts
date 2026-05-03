import type {
    SupabaseBlueprintExercise,
    SupabaseBlueprintSet,
    SupabaseExerciseTrackingType,
    SupabaseWorkoutBlockType,
    SupabaseWorkoutBlueprint,
} from "./workoutBuilder.supabase";

export type BuilderWorkoutSet = {
  id: string;
  setIndex: number;

  reps: string;
  minReps: string;
  maxReps: string;

  weightKg: string;
  weightLabel: string;

  timeSeconds: number | null;
  distanceMeters: string;
  speed: string;
  calories: string;

  restSeconds: number | null;
  notes: string;

  completed: boolean;
};

export type BuilderWorkoutExercise = {
  id: string;
  blueprintExerciseId: string;
  exerciseId: string;

  name: string;
  displayName: string;

  trackingType: SupabaseExerciseTrackingType;
  blockType: SupabaseWorkoutBlockType;
  blockKey: string;
  orderIndex: number;

  primaryMuscle: string;
  equipment: string;

  imageUrl: string;
  videoUrl: string;

  instructions: string;
  coachingCues: string[];

  notes: string;
  tempo: string;
  restSeconds: number | null;

  sets: BuilderWorkoutSet[];
};

export type BuilderWorkoutConfig = {
  id: string;
  source: "supabase";
  blueprintId: string;

  title: string;
  subtitle: string;
  description: string;

  estimatedDurationMin: number | null;
  imageUrl: string;

  exercises: BuilderWorkoutExercise[];
};

function numberToInput(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function mapSet(set: SupabaseBlueprintSet): BuilderWorkoutSet {
  return {
    id: set.id,
    setIndex: set.setIndex,

    reps: numberToInput(set.targetReps),
    minReps: numberToInput(set.targetRepsMin),
    maxReps: numberToInput(set.targetRepsMax),

    weightKg: numberToInput(set.targetWeightKg),
    weightLabel: set.targetWeightLabel,

    timeSeconds: set.targetTimeSeconds,
    distanceMeters: numberToInput(set.targetDistanceMeters),
    speed: set.targetSpeed,
    calories: numberToInput(set.targetCalories),

    restSeconds: set.restSeconds,
    notes: set.notes,

    completed: false,
  };
}

function getExerciseName(exercise: SupabaseBlueprintExercise) {
  if (exercise.displayName.trim()) return exercise.displayName.trim();
  if (exercise.exercise?.name) return exercise.exercise.name;
  return "Untitled exercise";
}

function mapExercise(
  blueprintExercise: SupabaseBlueprintExercise,
): BuilderWorkoutExercise {
  const exercise = blueprintExercise.exercise;

  return {
    id: blueprintExercise.id,
    blueprintExerciseId: blueprintExercise.id,
    exerciseId: blueprintExercise.exerciseId,

    name: exercise?.name ?? "Untitled exercise",
    displayName: getExerciseName(blueprintExercise),

    trackingType: exercise?.trackingType ?? "strength",
    blockType: blueprintExercise.blockType,
    blockKey: blueprintExercise.blockKey,
    orderIndex: blueprintExercise.orderIndex,

    primaryMuscle: exercise?.primaryMuscle ?? "",
    equipment: exercise?.equipment ?? "",

    imageUrl: exercise?.imageUrl ?? "",
    videoUrl: exercise?.videoUrl ?? "",

    instructions: exercise?.instructions ?? "",
    coachingCues: exercise?.coachingCues ?? [],

    notes: blueprintExercise.notes,
    tempo: blueprintExercise.tempo,
    restSeconds: blueprintExercise.restSeconds,

    sets: blueprintExercise.sets
      .slice()
      .sort((a, b) => a.setIndex - b.setIndex)
      .map(mapSet),
  };
}

export function mapSupabaseBlueprintToWorkoutConfig(
  blueprint: SupabaseWorkoutBlueprint,
): BuilderWorkoutConfig {
  return {
    id: blueprint.slug,
    source: "supabase",
    blueprintId: blueprint.id,

    title: blueprint.title,
    subtitle: blueprint.subtitle,
    description: blueprint.description,

    estimatedDurationMin: blueprint.estimatedDurationMin,
    imageUrl: blueprint.imageUrl,

    exercises: blueprint.exercises
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(mapExercise),
  };
}

export function getPrimaryInputModeForExercise(
  trackingType: SupabaseExerciseTrackingType,
) {
  switch (trackingType) {
    case "time":
    case "mobility":
      return "time";

    case "distance_speed":
      return "distance_speed";

    case "calories":
      return "calories";

    case "bodyweight":
    case "reps_only":
      return "reps";

    case "strength":
    default:
      return "weight_reps";
  }
}

export function formatSetPrescription(
  set: BuilderWorkoutSet,
  trackingType: SupabaseExerciseTrackingType,
) {
  if (trackingType === "time" || trackingType === "mobility") {
    return set.timeSeconds ? `${set.timeSeconds}s` : "Time";
  }

  if (trackingType === "calories") {
    return set.calories ? `${set.calories} cal` : "Calories";
  }

  if (trackingType === "distance_speed") {
    const distance = set.distanceMeters ? `${set.distanceMeters}m` : "Distance";
    const speed = set.speed ? ` · ${set.speed}` : "";
    return `${distance}${speed}`;
  }

  if (set.minReps && set.maxReps) {
    return `${set.minReps}-${set.maxReps} reps`;
  }

  if (set.reps) {
    return `${set.reps} reps`;
  }

  return "Reps";
}
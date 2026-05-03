import { supabase } from "@/lib/supabase";

export type SupabaseExerciseTrackingType =
  | "strength"
  | "bodyweight"
  | "reps_only"
  | "time"
  | "distance_speed"
  | "calories"
  | "mobility";

export type SupabaseWorkoutBlockType =
  | "single"
  | "superset"
  | "giant"
  | "circuit";

export type SupabaseWorkoutBlueprintOwnerType =
  | "individual_workout"
  | "program_workout";

export type SupabaseBlueprintExercise = {
  id: string;
  exerciseId: string;

  orderIndex: number;
  blockKey: string;
  blockType: SupabaseWorkoutBlockType;

  displayName: string;
  notes: string;
  restSeconds: number | null;
  tempo: string;

  exercise: {
    id: string;
    slug: string;
    name: string;
    trackingType: SupabaseExerciseTrackingType;
    primaryMuscle: string;
    secondaryMuscles: string[];
    equipment: string;
    difficulty: string;
    videoUrl: string;
    imageUrl: string;
    instructions: string;
    coachingCues: string[];
  } | null;

  sets: SupabaseBlueprintSet[];
};

export type SupabaseBlueprintSet = {
  id: string;
  setIndex: number;

  targetReps: number | null;
  targetRepsMin: number | null;
  targetRepsMax: number | null;

  targetWeightKg: number | null;
  targetWeightLabel: string;

  targetTimeSeconds: number | null;
  targetDistanceMeters: number | null;
  targetSpeed: string;
  targetCalories: number | null;

  restSeconds: number | null;
  notes: string;
};

export type SupabaseWorkoutBlueprint = {
  id: string;
  ownerType: SupabaseWorkoutBlueprintOwnerType;
  ownerId: string;

  slug: string;
  title: string;
  subtitle: string;
  description: string;

  estimatedDurationMin: number | null;
  imageUrl: string;

  status: "draft" | "published" | "archived";
  isActive: boolean;

  exercises: SupabaseBlueprintExercise[];
};

type BlueprintRow = {
  id: string;
  owner_type: SupabaseWorkoutBlueprintOwnerType;
  owner_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  estimated_duration_min: number | null;
  image_url: string | null;
  status: "draft" | "published" | "archived";
  is_active: boolean;
};

type BlueprintExerciseRow = {
  id: string;
  workout_blueprint_id: string;
  exercise_id: string;
  order_index: number;
  block_key: string;
  block_type: SupabaseWorkoutBlockType;
  display_name: string | null;
  notes: string | null;
  rest_seconds: number | null;
  tempo: string | null;
  exercises: {
    id: string;
    slug: string;
    name: string;
    tracking_type: SupabaseExerciseTrackingType;
    primary_muscle: string | null;
    secondary_muscles: string[] | null;
    equipment: string | null;
    difficulty: string | null;
    video_url: string | null;
    image_url: string | null;
    instructions: string | null;
    coaching_cues: string[] | null;
  } | null;
};

type BlueprintSetRow = {
  id: string;
  workout_blueprint_exercise_id: string;
  set_index: number;

  target_reps: number | null;
  target_reps_min: number | null;
  target_reps_max: number | null;

  target_weight_kg: number | null;
  target_weight_label: string | null;

  target_time_seconds: number | null;
  target_distance_meters: number | null;
  target_speed: string | null;
  target_calories: number | null;

  rest_seconds: number | null;
  notes: string | null;
};

function mapBlueprintSet(row: BlueprintSetRow): SupabaseBlueprintSet {
  return {
    id: row.id,
    setIndex: row.set_index,

    targetReps: row.target_reps,
    targetRepsMin: row.target_reps_min,
    targetRepsMax: row.target_reps_max,

    targetWeightKg: row.target_weight_kg,
    targetWeightLabel: row.target_weight_label ?? "",

    targetTimeSeconds: row.target_time_seconds,
    targetDistanceMeters: row.target_distance_meters,
    targetSpeed: row.target_speed ?? "",
    targetCalories: row.target_calories,

    restSeconds: row.rest_seconds,
    notes: row.notes ?? "",
  };
}

function mapBlueprintExercise(
  row: BlueprintExerciseRow,
  sets: BlueprintSetRow[],
): SupabaseBlueprintExercise {
  return {
    id: row.id,
    exerciseId: row.exercise_id,

    orderIndex: row.order_index,
    blockKey: row.block_key,
    blockType: row.block_type,

    displayName: row.display_name ?? "",
    notes: row.notes ?? "",
    restSeconds: row.rest_seconds,
    tempo: row.tempo ?? "",

    exercise: row.exercises
      ? {
          id: row.exercises.id,
          slug: row.exercises.slug,
          name: row.exercises.name,
          trackingType: row.exercises.tracking_type,
          primaryMuscle: row.exercises.primary_muscle ?? "",
          secondaryMuscles: row.exercises.secondary_muscles ?? [],
          equipment: row.exercises.equipment ?? "",
          difficulty: row.exercises.difficulty ?? "",
          videoUrl: row.exercises.video_url ?? "",
          imageUrl: row.exercises.image_url ?? "",
          instructions: row.exercises.instructions ?? "",
          coachingCues: row.exercises.coaching_cues ?? [],
        }
      : null,

    sets: sets
      .filter((set) => set.workout_blueprint_exercise_id === row.id)
      .sort((a, b) => a.set_index - b.set_index)
      .map(mapBlueprintSet),
  };
}

function mapWorkoutBlueprint(
  blueprint: BlueprintRow,
  exercises: BlueprintExerciseRow[],
  sets: BlueprintSetRow[],
): SupabaseWorkoutBlueprint {
  return {
    id: blueprint.id,
    ownerType: blueprint.owner_type,
    ownerId: blueprint.owner_id,

    slug: blueprint.slug,
    title: blueprint.title,
    subtitle: blueprint.subtitle ?? "",
    description: blueprint.description ?? "",

    estimatedDurationMin: blueprint.estimated_duration_min,
    imageUrl: blueprint.image_url ?? "",

    status: blueprint.status,
    isActive: blueprint.is_active,

    exercises: exercises
      .sort((a, b) => a.order_index - b.order_index)
      .map((exercise) => mapBlueprintExercise(exercise, sets)),
  };
}

export async function getWorkoutBlueprintForOwner({
  ownerType,
  ownerId,
}: {
  ownerType: SupabaseWorkoutBlueprintOwnerType;
  ownerId: string;
}): Promise<SupabaseWorkoutBlueprint | null> {
  const { data: blueprintData, error: blueprintError } = await supabase
    .from("workout_blueprints")
    .select(
      `
      id,
      owner_type,
      owner_id,
      slug,
      title,
      subtitle,
      description,
      estimated_duration_min,
      image_url,
      status,
      is_active
    `,
    )
    .eq("owner_type", ownerType)
    .eq("owner_id", ownerId)
    .eq("status", "published")
    .eq("is_active", true)
    .maybeSingle();

  if (blueprintError) {
  console.log(
    "❌ workout blueprint query error:",
    JSON.stringify(blueprintError, null, 2),
  );
  return null;
}

  if (!blueprintData) {
    console.log("⚠️ no workout blueprint found:", ownerType, ownerId);
    return null;
  }

  const blueprint = blueprintData as BlueprintRow;

  const { data: exerciseData, error: exerciseError } = await supabase
    .from("workout_blueprint_exercises")
    .select(
      `
      id,
      workout_blueprint_id,
      exercise_id,
      order_index,
      block_key,
      block_type,
      display_name,
      notes,
      rest_seconds,
      tempo,
      exercises (
        id,
        slug,
        name,
        tracking_type,
        primary_muscle,
        secondary_muscles,
        equipment,
        difficulty,
        video_url,
        image_url,
        instructions,
        coaching_cues
      )
    `,
    )
    .eq("workout_blueprint_id", blueprint.id)
    .order("order_index", { ascending: true });

  if (exerciseError) {
    console.log("❌ workout blueprint exercises query error:", exerciseError);
    return mapWorkoutBlueprint(blueprint, [], []);
  }

  const exercises = (exerciseData ?? []) as unknown as BlueprintExerciseRow[];
  const blueprintExerciseIds = exercises.map((exercise) => exercise.id);

  if (blueprintExerciseIds.length === 0) {
    console.log("✅ workout blueprint:", blueprint.title);
    console.log("✅ blueprint exercises:", 0);
    return mapWorkoutBlueprint(blueprint, [], []);
  }

  const { data: setData, error: setError } = await supabase
    .from("workout_blueprint_sets")
    .select(
      `
      id,
      workout_blueprint_exercise_id,
      set_index,
      target_reps,
      target_reps_min,
      target_reps_max,
      target_weight_kg,
      target_weight_label,
      target_time_seconds,
      target_distance_meters,
      target_speed,
      target_calories,
      rest_seconds,
      notes
    `,
    )
    .in("workout_blueprint_exercise_id", blueprintExerciseIds)
    .order("set_index", { ascending: true });

  if (setError) {
    console.log("❌ workout blueprint sets query error:", setError);
    return mapWorkoutBlueprint(blueprint, exercises, []);
  }

  const sets = (setData ?? []) as BlueprintSetRow[];

  console.log("✅ workout blueprint:", blueprint.title);
  console.log("✅ blueprint exercises:", exercises.length);
  console.log("✅ blueprint sets:", sets.length);

  return mapWorkoutBlueprint(blueprint, exercises, sets);
}

export async function getWorkoutBlueprintById(
  blueprintId: string,
): Promise<SupabaseWorkoutBlueprint | null> {
  const { data: blueprintData, error: blueprintError } = await supabase
    .from("workout_blueprints")
    .select(
      `
      id,
      owner_type,
      owner_id,
      slug,
      title,
      subtitle,
      description,
      estimated_duration_min,
      image_url,
      status,
      is_active
    `,
    )
    .eq("id", blueprintId)
    .maybeSingle();

  if (blueprintError) {
    console.log("❌ workout blueprint by id query error:", blueprintError);
    return null;
  }

  if (!blueprintData) return null;

  const blueprint = blueprintData as BlueprintRow;

  const { data: exerciseData, error: exerciseError } = await supabase
    .from("workout_blueprint_exercises")
    .select(
      `
      id,
      workout_blueprint_id,
      exercise_id,
      order_index,
      block_key,
      block_type,
      display_name,
      notes,
      rest_seconds,
      tempo,
      exercises (
        id,
        slug,
        name,
        tracking_type,
        primary_muscle,
        secondary_muscles,
        equipment,
        difficulty,
        video_url,
        image_url,
        instructions,
        coaching_cues
      )
    `,
    )
    .eq("workout_blueprint_id", blueprint.id)
    .order("order_index", { ascending: true });

  if (exerciseError) {
    console.log("❌ workout blueprint exercises by id query error:", exerciseError);
    return mapWorkoutBlueprint(blueprint, [], []);
  }

  const exercises = (exerciseData ?? []) as unknown as BlueprintExerciseRow[];
  const blueprintExerciseIds = exercises.map((exercise) => exercise.id);

  if (blueprintExerciseIds.length === 0) {
    return mapWorkoutBlueprint(blueprint, [], []);
  }

  const { data: setData, error: setError } = await supabase
    .from("workout_blueprint_sets")
    .select(
      `
      id,
      workout_blueprint_exercise_id,
      set_index,
      target_reps,
      target_reps_min,
      target_reps_max,
      target_weight_kg,
      target_weight_label,
      target_time_seconds,
      target_distance_meters,
      target_speed,
      target_calories,
      rest_seconds,
      notes
    `,
    )
    .in("workout_blueprint_exercise_id", blueprintExerciseIds)
    .order("set_index", { ascending: true });

  if (setError) {
    console.log("❌ workout blueprint sets by id query error:", setError);
    return mapWorkoutBlueprint(blueprint, exercises, []);
  }

  return mapWorkoutBlueprint(
    blueprint,
    exercises,
    (setData ?? []) as BlueprintSetRow[],
  );
}
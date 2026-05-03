import { supabase } from "@/lib/supabase";

export type WorkoutCategory =
  | "upper"
  | "lower"
  | "bodyweight"
  | "dumbbells"
  | "conditioning"
  | "core"
  | "full_body"
  | "at_home"
  | "gym"
  | "mobility";

export type IndividualWorkout = {
  id: string;
  slug: string;
  title: string;
  type: string;
  durationMin: number;
  meta: string;
  imageUrl: string;
  access: "free" | "premium" | "program_metered";
  paywallEnabled: boolean;
  isActive: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  categories: WorkoutCategory[];
};

type WorkoutRow = {
  id: string;
  slug: string;
  title: string;
  workout_type: string;
  duration_min: number;
  meta: string | null;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  published_at: string | null;
};

type AccessRuleRow = {
  content_id: string;
  access_type: "free" | "premium" | "program_metered";
  paywall_enabled: boolean;
};

type CategoryJoinRow = {
  individual_workout_id: string;
  workout_categories: {
    key: WorkoutCategory;
  } | null;
};

function mapWorkout(
  row: WorkoutRow,
  accessById: Map<string, AccessRuleRow>,
  categoriesById: Map<string, WorkoutCategory[]>,
): IndividualWorkout {
  const accessRule = accessById.get(row.id);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.workout_type,
    durationMin: row.duration_min,
    meta: row.meta ?? "",
    imageUrl: row.image_url ?? "",
    access: accessRule?.access_type ?? "free",
    paywallEnabled: accessRule?.paywall_enabled ?? false,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    publishedAt: row.published_at,
    categories: categoriesById.get(row.id) ?? [],
  };
}

async function getPublishedWorkoutRows() {
  const { data, error } = await supabase
    .from("individual_workouts")
    .select(
      `
      id,
      slug,
      title,
      workout_type,
      duration_min,
      meta,
      image_url,
      is_active,
      is_featured,
      published_at
    `,
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.log("❌ individual_workouts query error:", error);
    return [];
  }

  console.log("✅ individual_workouts rows:", data?.length ?? 0);
  return (data ?? []) as WorkoutRow[];
}

async function getAccessRulesForWorkouts(workoutIds: string[]) {
  if (!workoutIds.length) return new Map<string, AccessRuleRow>();

  const { data, error } = await supabase
    .from("content_access_rules")
    .select("content_id, access_type, paywall_enabled")
    .eq("content_type", "individual_workout")
    .in("content_id", workoutIds);

  if (error) {
    console.log("❌ content_access_rules query error:", error);
    return new Map<string, AccessRuleRow>();
  }

  const map = new Map<string, AccessRuleRow>();

  for (const row of data ?? []) {
    map.set(row.content_id, row as AccessRuleRow);
  }

  console.log("✅ workout access rules:", map.size);
  return map;
}

async function getCategoriesForWorkouts(workoutIds: string[]) {
  if (!workoutIds.length) return new Map<string, WorkoutCategory[]>();

  const { data, error } = await supabase
    .from("individual_workout_categories")
    .select(
      `
      individual_workout_id,
      workout_categories (
        key
      )
    `,
    )
    .in("individual_workout_id", workoutIds);

  if (error) {
    console.log("❌ workout categories query error:", error);
    return new Map<string, WorkoutCategory[]>();
  }

  const map = new Map<string, WorkoutCategory[]>();

  for (const row of (data ?? []) as CategoryJoinRow[]) {
    const key = row.workout_categories?.key;
    if (!key) continue;

    const current = map.get(row.individual_workout_id) ?? [];
    current.push(key);
    map.set(row.individual_workout_id, current);
  }

  console.log("✅ workout category joins:", data?.length ?? 0);
  return map;
}

export async function getAllIndividualWorkouts() {
  const workouts = await getPublishedWorkoutRows();
  const workoutIds = workouts.map((w) => w.id);

  const [accessById, categoriesById] = await Promise.all([
    getAccessRulesForWorkouts(workoutIds),
    getCategoriesForWorkouts(workoutIds),
  ]);

  return workouts.map((row) => mapWorkout(row, accessById, categoriesById));
}

export async function getLatestIndividualWorkouts(limit = 4) {
  const workouts = await getAllIndividualWorkouts();
  return workouts.slice(0, limit);
}

export async function getWorkoutsForCategory(category: WorkoutCategory) {
  const workouts = await getAllIndividualWorkouts();
  return workouts.filter((workout) => workout.categories.includes(category));
}
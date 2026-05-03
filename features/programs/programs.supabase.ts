import { supabase } from "@/lib/supabase";

export type ProgramWorkoutAccess = "free" | "premium" | "program_metered";

export type SupabaseProgramWorkout = {
  id: string;
  weekNumber: number;
  dayNumber: number;
  orderIndex: number;
  title: string;
  subtitle: string;
  estimatedDurationMin: number | null;
  imageUrl: string;
  publishedAt: string | null;
  access: ProgramWorkoutAccess;
  paywallEnabled: boolean;
  freeOrder: number | null;
};

export type SupabaseProgram = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  heroImageUrl: string;
  cardImageUrl: string;
  level: string;
  durationWeeks: number | null;
  workoutsPerWeek: number | null;
  goal: string;
  equipment: string;
  isActive: boolean;
  isFeatured: boolean;
  publishedAt: string | null;

  freeWorkoutCount: number | null;
  warningAfterWorkoutCount: number | null;
  programMeterEnabled: boolean;

  workouts: SupabaseProgramWorkout[];
};

type ProgramRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  hero_image_url: string | null;
  card_image_url: string | null;
  level: string | null;
  duration_weeks: number | null;
  workouts_per_week: number | null;
  goal: string | null;
  equipment: string | null;
  is_active: boolean;
  is_featured: boolean;
  published_at: string | null;

  free_workout_count: number | null;
  warning_after_workout_count: number | null;
  program_meter_enabled: boolean | null;
};

type ProgramWorkoutRow = {
  id: string;
  program_id: string;
  week_number: number;
  day_number: number;
  order_index: number;
  title: string;
  subtitle: string | null;
  estimated_duration_min: number | null;
  image_url: string | null;
  published_at: string | null;
};

type AccessRuleRow = {
  content_id: string;
  access_type: ProgramWorkoutAccess;
  paywall_enabled: boolean;
  free_order: number | null;
};

function mapProgram(
  program: ProgramRow,
  workouts: ProgramWorkoutRow[],
  accessById: Map<string, AccessRuleRow>,
): SupabaseProgram {
  return {
    id: program.id,
    slug: program.slug,
    title: program.title,
    subtitle: program.subtitle ?? "",
    description: program.description ?? "",
    heroImageUrl: program.hero_image_url ?? "",
    cardImageUrl: program.card_image_url ?? program.hero_image_url ?? "",
    level: program.level ?? "",
    durationWeeks: program.duration_weeks,
    workoutsPerWeek: program.workouts_per_week,
    goal: program.goal ?? "",
    equipment: program.equipment ?? "",
    isActive: program.is_active,
    isFeatured: program.is_featured,
    publishedAt: program.published_at,

    freeWorkoutCount: program.free_workout_count,
    warningAfterWorkoutCount: program.warning_after_workout_count,
    programMeterEnabled: program.program_meter_enabled ?? true,

    workouts: workouts.map((workout) => {
      const access = accessById.get(workout.id);

      return {
        id: workout.id,
        weekNumber: workout.week_number,
        dayNumber: workout.day_number,
        orderIndex: workout.order_index,
        title: workout.title,
        subtitle: workout.subtitle ?? "",
        estimatedDurationMin: workout.estimated_duration_min,
        imageUrl: workout.image_url ?? "",
        publishedAt: workout.published_at,
        access: access?.access_type ?? "free",
        paywallEnabled: access?.paywall_enabled ?? false,
        freeOrder: access?.free_order ?? null,
      };
    }),
  };
}

async function getProgramAccessRules(workoutIds: string[]) {
  if (!workoutIds.length) return new Map<string, AccessRuleRow>();

  const { data, error } = await supabase
    .from("content_access_rules")
    .select("content_id, access_type, paywall_enabled, free_order")
    .eq("content_type", "program_workout")
    .in("content_id", workoutIds);

  if (error) {
    console.log("❌ program access rules query error:", error);
    return new Map<string, AccessRuleRow>();
  }

  const map = new Map<string, AccessRuleRow>();

  for (const row of data ?? []) {
    map.set(row.content_id, row as AccessRuleRow);
  }

  console.log("✅ program workout access rules:", map.size);

  return map;
}

export async function getProgramBySlug(slug: string) {
  const { data: programData, error: programError } = await supabase
    .from("programs")
    .select(
      `
      id,
      slug,
      title,
      subtitle,
      description,
      hero_image_url,
      card_image_url,
      level,
      duration_weeks,
      workouts_per_week,
      goal,
      equipment,
      is_active,
      is_featured,
      published_at,
      free_workout_count,
      warning_after_workout_count,
      program_meter_enabled
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (programError) {
    console.log("❌ program query error:", programError);
    return null;
  }

  if (!programData) {
    console.log("⚠️ program not found:", slug);
    return null;
  }

  const { data: workoutData, error: workoutError } = await supabase
    .from("program_workouts")
    .select(
      `
      id,
      program_id,
      week_number,
      day_number,
      order_index,
      title,
      subtitle,
      estimated_duration_min,
      image_url,
      published_at
    `,
    )
    .eq("program_id", programData.id)
    .eq("status", "published")
    .order("order_index", { ascending: true });

  if (workoutError) {
    console.log("❌ program workouts query error:", workoutError);
    return mapProgram(programData as ProgramRow, [], new Map());
  }

  const workouts = (workoutData ?? []) as ProgramWorkoutRow[];
  const accessById = await getProgramAccessRules(workouts.map((w) => w.id));

  console.log("✅ program:", programData.title);
  console.log("✅ program workouts:", workouts.length);

  return mapProgram(programData as ProgramRow, workouts, accessById);
}
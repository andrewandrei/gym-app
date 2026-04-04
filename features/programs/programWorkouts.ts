// app/program/programWorkouts.ts

export const WORKOUTS_PER_WEEK = 5;

export type ProgramWorkoutTemplate = {
  slot: 1 | 2 | 3 | 4 | 5;
  title: string;
  meta: string;
  duration: string;
  image: string;
};

export const DEFAULT_PROGRAM_WORKOUT_TEMPLATES: ProgramWorkoutTemplate[] = [
  {
    slot: 1,
    title: "Strength & Row Conditioning",
    meta: "Hybrid strength",
    duration: "~90-98 min",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1400&q=70",
  },
  {
    slot: 2,
    title: "Power & Ski Conditioning",
    meta: "Explosive work",
    duration: "~72-97 min",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=70",
  },
  {
    slot: 3,
    title: "Upper Body Builder",
    meta: "7 exercises",
    duration: "~46 min",
    image:
      "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/690f510381f5fead2d6257b8_c7d8a728-2fde-4254-a1a7-a505e1a4cf3e-p-2000.jpeg",
  },
  {
    slot: 4,
    title: "Hyrox Engine Builder",
    meta: "Threshold work",
    duration: "~58-70 min",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=70",
  },
  {
    slot: 5,
    title: "Hypertrophy Focus",
    meta: "6 exercises",
    duration: "~44 min",
    image:
      "https://i.ytimg.com/vi/y3fAQLFi5Iw/maxresdefault.jpg",
  },
];

export function getWorkoutCountForWeek(weekIndex: number) {
  return weekIndex < 2 ? 5 : 3;
}

export function buildProgramWorkoutId(
  programId: string,
  weekIndex: number,
  workoutIndex: number,
) {
  return `${programId}-week-${weekIndex + 1}-workout-${workoutIndex + 1}`;
}

export function getProgramWorkoutTemplate(workoutIndex: number): ProgramWorkoutTemplate {
  return (
    DEFAULT_PROGRAM_WORKOUT_TEMPLATES[workoutIndex] ??
    DEFAULT_PROGRAM_WORKOUT_TEMPLATES[DEFAULT_PROGRAM_WORKOUT_TEMPLATES.length - 1]
  );
}

export function parseProgramWorkoutId(workoutId?: string | null) {
  if (!workoutId) return null;

  const match = workoutId.match(/^(.*)-week-(\d+)-workout-(\d+)$/);
  if (!match) return null;

  return {
    programId: match[1],
    weekNumber: Number(match[2]),
    workoutNumber: Number(match[3]),
    workoutIndex: Number(match[3]) - 1,
  };
}
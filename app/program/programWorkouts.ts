// app/program/programWorkouts.ts

export const WORKOUTS_PER_WEEK = 3;

export type ProgramWorkoutTemplate = {
  slot: 1 | 2 | 3;
  title: string;
  meta: string;
  duration: string;
  image: string;
};

export const DEFAULT_PROGRAM_WORKOUT_TEMPLATES: ProgramWorkoutTemplate[] = [
  {
    slot: 1,
    title: "Strength & Conditioning",
    meta: "6 exercises",
    duration: "52 min",
    image:
      "https://images.unsplash.com/photo-1517964603305-11c0f6f66012?auto=format&fit=crop&w=1400&q=70",
  },
  {
    slot: 2,
    title: "Upper Body Builder",
    meta: "7 exercises",
    duration: "46 min",
    image:
      "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/690f510381f5fead2d6257b8_c7d8a728-2fde-4254-a1a7-a505e1a4cf3e-p-2000.jpeg",
  },
  {
    slot: 3,
    title: "Hypertrophy Focus",
    meta: "6 exercises",
    duration: "44 min",
    image: "https://i.ytimg.com/vi/y3fAQLFi5Iw/maxresdefault.jpg",
  },
];

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
// app/workout/workout.data.ts

import { getProgramWorkoutTemplate, parseProgramWorkoutId } from "../../features/programs/programWorkouts";
import type {
  Exercise,
  ExerciseAlternative,
  ExerciseHistorySession,
  StrengthBlock,
} from "./WorkoutPreview";

export type WorkoutConfig = {
  id: string;
  title: string;
  estimatedMinutes?: number;
  exercises: Exercise[];
  blocks: StrengthBlock[];
  exerciseAlternatives?: Record<string, ExerciseAlternative[]>;
  historyByExerciseId?: Record<string, ExerciseHistorySession[]>;
};

const FULL_BODY_FOUNDATION_EXERCISES: Exercise[] = [
  {
    id: "ex-1",
    name: "Rower (Easy Prime)",
    tempo: "—",
    image:
      "https://images.unsplash.com/photo-1517964603305-11c0f6f66012?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "REPS",
    trackingMode: "time",
    // stored as seconds
    sets: [{ id: "s1", weight: "60", reps: "", rest: "0:30", done: false }],
  },
  {
    id: "ex-2",
    name: "Barbell Back Squat (Controlled)",
    tempo: "3-0-1-0",
    image:
      "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "LBS",
    trackingMode: "weight_reps",
    videoUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8",
    description:
      "The king of lower body exercises. Build massive quads, glutes, and overall leg strength with proper squat technique.",
    tutorial: [
      "Set bar at shoulder height on rack",
      "Grip bar slightly wider than shoulders",
      "Step under bar, rest on upper traps",
      "Unrack and step back with stable stance",
      "Descend slowly: 3 seconds down",
      "Keep chest up, knees track over toes",
      "Drive through heels to stand",
      "Control: 1 second pause at bottom",
    ],
    musclesWorked: ["Quadriceps", "Glutes", "Hamstrings", "Core", "Lower Back"],
    sets: [
      { id: "s1", weight: "185", reps: "8", rest: "1:30", done: false },
      { id: "s2", weight: "185", reps: "8", rest: "1:30", done: false },
      { id: "s3", weight: "205", reps: "6", rest: "1:30", done: false },
    ],
  },
  {
    id: "ex-3",
    name: "Romanian Deadlift",
    tempo: "3-1-1-0",
    image:
      "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "LBS",
    trackingMode: "weight_reps",
    videoUrl: "https://vimeo.com/522443498",
    description:
      "Target your hamstrings and glutes with this hip-hinge movement. Perfect for building posterior chain strength.",
    tutorial: [
      "Stand with feet hip-width apart",
      "Hold barbell with overhand grip",
      "Keep slight knee bend throughout",
      "Hinge at hips, push butt back",
      "Lower bar along thighs to mid-shin",
      "Feel stretch in hamstrings",
      "Drive hips forward to return",
      "Squeeze glutes at top",
    ],
    musclesWorked: ["Hamstrings", "Glutes", "Lower Back", "Core"],
    sets: [
      { id: "s1", weight: "165", reps: "10", rest: "1:30", done: false },
      { id: "s2", weight: "185", reps: "8", rest: "1:30", done: false },
      { id: "s3", weight: "185", reps: "8", rest: "1:30", done: false },
    ],
  },
  {
    id: "ex-4",
    name: "Incline Dumbbell Press",
    tempo: "2-0-2-0",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "LBS",
    trackingMode: "weight_reps",
    videoUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
    description: "Build upper chest strength and size with controlled incline pressing.",
    tutorial: [
      "Set bench to 30-45 degree incline",
      "Sit back with dumbbells on thighs",
      "Kick weights up to shoulder height",
      "Press dumbbells up and slightly together",
      "Lower with control to stretch position",
      "Keep elbows at 45-degree angle",
      "Drive through chest to press up",
      "Maintain stable core throughout",
    ],
    musclesWorked: ["Upper Chest", "Front Delts", "Triceps"],
    sets: [
      { id: "s1", weight: "60", reps: "10", rest: "1:15", done: false },
      { id: "s2", weight: "60", reps: "10", rest: "1:15", done: false },
      { id: "s3", weight: "65", reps: "8", rest: "1:15", done: false },
    ],
  },
  {
    id: "ex-5",
    name: "Chest-Supported Row",
    tempo: "2-1-2-0",
    image:
      "https://images.unsplash.com/photo-1599058917765-142b2a07f930?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "LBS",
    trackingMode: "weight_reps",
    videoUrl: "https://cdn.muscleandstrength.com/sites/default/files/chest-supported-dumbbell-row.mp4",
    description: "Isolate your back muscles by removing momentum. Great for building a thick, wide back.",
    tutorial: [
      "Set adjustable bench to 30-45 degrees",
      "Lie face down with chest on the pad",
      "Hold dumbbells with arms hanging straight",
      "Pull elbows back, squeezing shoulder blades",
      "Hold 1 second at the top",
      "Lower with control over 2 seconds",
    ],
    musclesWorked: ["Lats", "Rhomboids", "Rear Delts", "Biceps"],
    sets: [
      { id: "s1", weight: "55", reps: "12", rest: "1:15", done: false },
      { id: "s2", weight: "55", reps: "12", rest: "1:15", done: false },
      { id: "s3", weight: "60", reps: "10", rest: "1:15", done: false },
    ],
  },
  {
    id: "ex-6",
    name: "Lateral Raise",
    tempo: "2-0-2-0",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "LBS",
    trackingMode: "weight_reps",
    videoUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    description: "Build wider shoulders with strict lateral raises. Focus on controlled tempo and mind-muscle connection.",
    tutorial: [
      "Stand with dumbbells at your sides",
      "Slight bend in elbows, palms facing in",
      "Raise arms out to the sides to shoulder height",
      "Lead with elbows, not hands",
      "Pause briefly at the top",
      "Lower slowly over 2 seconds",
    ],
    musclesWorked: ["Lateral Delts", "Traps"],
    sets: [
      { id: "s1", weight: "20", reps: "15", rest: "1:15", done: false },
      { id: "s2", weight: "20", reps: "15", rest: "1:15", done: false },
      { id: "s3", weight: "20", reps: "15", rest: "1:15", done: false },
    ],
  },
  {
    id: "ex-7",
    name: "Leg Press",
    tempo: "2-0-2-0",
    image:
      "https://images.unsplash.com/photo-1526401485004-2aa7f3d0bd19?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "LBS",
    trackingMode: "weight_reps",
    videoUrl: "https://vimeo.com/363691956",
    description: "High-volume quad builder. A safer alternative to squats for accumulating leg volume.",
    tutorial: [
      "Sit in the leg press with back flat against pad",
      "Place feet shoulder-width on the platform",
      "Release the safety handles",
      "Lower the weight slowly, knees tracking over toes",
      "Press through your heels to extend legs",
      "Don't lock knees at the top",
    ],
    musclesWorked: ["Quadriceps", "Glutes", "Hamstrings"],
    sets: [
      { id: "s1", weight: "250", reps: "12", rest: "1:00", done: false },
      { id: "s2", weight: "250", reps: "12", rest: "1:00", done: false },
      { id: "s3", weight: "270", reps: "10", rest: "1:00", done: false },
    ],
  },
  {
    id: "ex-8",
    name: "Push-Up (Tempo)",
    tempo: "2-0-2-0",
    image:
      "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "REPS",
    trackingMode: "bodyweight_reps",
    videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
    description: "Classic bodyweight push-up with slow tempo for time under tension.",
    tutorial: [
      "Start in plank position, hands shoulder-width",
      "Lower your body over 2 seconds",
      "Chest should nearly touch the floor",
      "Push back up over 2 seconds",
      "Keep core tight throughout",
      "Don't let hips sag",
    ],
    musclesWorked: ["Chest", "Triceps", "Front Delts", "Core"],
    sets: [
      { id: "s1", weight: "", reps: "12", rest: "1:00", done: false },
      { id: "s2", weight: "10", reps: "10", rest: "1:00", done: false },
      { id: "s3", weight: "", reps: "15", rest: "1:00", done: false },
    ],
  },
  {
    id: "ex-9",
    name: "Dead Bug",
    tempo: "—",
    image:
      "https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "REPS",
    trackingMode: "reps_only",
    videoUrl: "https://www.youtube.com/watch?v=I5xbsA71v1A",
    description: "Core stability exercise that teaches anti-extension. Great for building a strong, stable midsection.",
    tutorial: [
      "Lie on your back, arms pointing to ceiling",
      "Knees bent at 90 degrees, shins parallel to floor",
      "Press lower back into the floor",
      "Extend opposite arm and leg slowly",
      "Return to start, then switch sides",
      "Keep lower back pressed down throughout",
    ],
    musclesWorked: ["Core", "Deep Stabilizers"],
    sets: [
      { id: "s1", weight: "", reps: "10", rest: "1:00", done: false },
      { id: "s2", weight: "", reps: "10", rest: "1:00", done: false },
      { id: "s3", weight: "", reps: "12", rest: "1:00", done: false },
    ],
  },
];

const FULL_BODY_FOUNDATION_BLOCKS: StrengthBlock[] = [
  { id: "b0", type: "single", title: "Primer", exerciseIds: ["ex-1"] },
  { id: "b1", type: "superset", title: "Superset A", exerciseIds: ["ex-2", "ex-3"] },
  { id: "b2", type: "giant", title: "Giant Set B", exerciseIds: ["ex-4", "ex-5", "ex-6"] },
  {
    id: "b3",
    type: "circuit",
    title: "Circuit 1",
    rounds: 3,
    exerciseIds: ["ex-7", "ex-8", "ex-9"],
  },
];

const FULL_BODY_FOUNDATION_ALTERNATIVES: Record<string, ExerciseAlternative[]> = {
  "ex-2": [
    {
      id: "alt-1",
      name: "Hack Squat",
      category: "gym",
      image:
        "https://images.unsplash.com/photo-1526401485004-2aa7f3d0bd19?auto=format&fit=crop&w=600&q=70",
    },
    {
      id: "alt-2",
      name: "Goblet Squat",
      category: "home",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=70",
    },
  ],
};

const FULL_BODY_FOUNDATION_HISTORY: Record<string, ExerciseHistorySession[]> = {
  "ex-1": [
    {
      id: "rower-h1",
      dateLabel: "Mar 7, 2026",
      sets: [{ set: 1, weight: "60", reps: "", rest: "0:30", done: true }],
    },
    {
      id: "rower-h2",
      dateLabel: "Mar 3, 2026",
      sets: [{ set: 1, weight: "50", reps: "", rest: "0:30", done: true }],
    },
  ],
  "ex-2": [
    {
      id: "squat-h1",
      dateLabel: "Mar 8, 2026",
      sets: [
        { set: 1, weight: "185", reps: "8", rest: "1:30", done: true },
        { set: 2, weight: "185", reps: "8", rest: "1:30", done: true },
        { set: 3, weight: "205", reps: "6", rest: "2:00", done: true },
      ],
    },
  ],
  "ex-8": [
    {
      id: "pushup-h1",
      dateLabel: "Mar 8, 2026",
      sets: [
        { set: 1, weight: "", reps: "10", rest: "1:00", done: true },
        { set: 2, weight: "10", reps: "8", rest: "1:00", done: true },
        { set: 3, weight: "", reps: "12", rest: "1:00", done: true },
      ],
    },
  ],
  "ex-9": [
    {
      id: "deadbug-h1",
      dateLabel: "Mar 8, 2026",
      sets: [
        { set: 1, weight: "", reps: "8", rest: "1:00", done: true },
        { set: 2, weight: "", reps: "8", rest: "1:00", done: true },
        { set: 3, weight: "", reps: "10", rest: "1:00", done: true },
      ],
    },
  ],
};

const WARMUP_SEQUENCE_EXERCISES: Exercise[] = [
  {
    id: "wu-1",
    name: "Arm Circles",
    tempo: "—",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "REPS",
    trackingMode: "reps_only",
    sets: [{ id: "s1", weight: "", reps: "20", rest: "0:20", done: false }],
  },
  {
    id: "wu-2",
    name: "Band Pull-Apart",
    tempo: "2-0-2-0",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "REPS",
    trackingMode: "reps_only",
    sets: [{ id: "s1", weight: "", reps: "15", rest: "0:30", done: false }],
  },
  {
    id: "wu-3",
    name: "Scap Push-Up",
    tempo: "2-0-2-0",
    image:
      "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "REPS",
    trackingMode: "bodyweight_reps",
    sets: [{ id: "s1", weight: "", reps: "12", rest: "0:30", done: false }],
  },
];

const WARMUP_SEQUENCE_BLOCKS: StrengthBlock[] = [
  { id: "wb-1", type: "circuit", title: "Warm-up Flow", rounds: 2, exerciseIds: ["wu-1", "wu-2", "wu-3"] },
];

const COOLDOWN_SEQUENCE_EXERCISES: Exercise[] = [
  {
    id: "cd-1",
    name: "Breathing Reset",
    tempo: "—",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "REPS",
    trackingMode: "time",
    sets: [{ id: "s1", weight: "360", reps: "", rest: "0:20", done: false }],
  },
  {
    id: "cd-2",
    name: "Child's Pose Reach",
    tempo: "—",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "REPS",
    trackingMode: "time",
    sets: [{ id: "s1", weight: "45", reps: "", rest: "0:20", done: false }],
  },
  {
    id: "cd-3",
    name: "Hip Flexor Stretch",
    tempo: "—",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=70",
    unitLabel: "REPS",
    trackingMode: "time",
    sets: [{ id: "s1", weight: "45", reps: "", rest: "0:20", done: false }],
  },
];

const COOLDOWN_SEQUENCE_BLOCKS: StrengthBlock[] = [
  { id: "cb-1", type: "circuit", title: "Cool-down Flow", rounds: 2, exerciseIds: ["cd-1", "cd-2", "cd-3"] },
];

export const WORKOUTS_BY_ID: Record<string, WorkoutConfig> = {
  "full-body-foundation": {
    id: "full-body-foundation",
    title: "Full Body — Foundation",
    exercises: FULL_BODY_FOUNDATION_EXERCISES,
    blocks: FULL_BODY_FOUNDATION_BLOCKS,
    exerciseAlternatives: FULL_BODY_FOUNDATION_ALTERNATIVES,
    historyByExerciseId: FULL_BODY_FOUNDATION_HISTORY,
  },

  "warmup-sequence": {
    id: "warmup-sequence",
    title: "Upper Body Warm-up Sequence",
    exercises: WARMUP_SEQUENCE_EXERCISES,
    blocks: WARMUP_SEQUENCE_BLOCKS,
    exerciseAlternatives: {},
    historyByExerciseId: {},
  },

  "cooldown-sequence": {
    id: "cooldown-sequence",
    title: "Cooldown & Recovery Flow",
    exercises: COOLDOWN_SEQUENCE_EXERCISES,
    blocks: COOLDOWN_SEQUENCE_BLOCKS,
    exerciseAlternatives: {},
    historyByExerciseId: {},
  },

  "w-001": {
    id: "w-001",
    title: "Arms & Shoulders Minimum Equipment",
    exercises: FULL_BODY_FOUNDATION_EXERCISES,
    blocks: FULL_BODY_FOUNDATION_BLOCKS,
    exerciseAlternatives: FULL_BODY_FOUNDATION_ALTERNATIVES,
    historyByExerciseId: FULL_BODY_FOUNDATION_HISTORY,
  },

  "w-002": {
    id: "w-002",
    title: "Legs Strength Session",
    exercises: FULL_BODY_FOUNDATION_EXERCISES,
    blocks: FULL_BODY_FOUNDATION_BLOCKS,
    exerciseAlternatives: FULL_BODY_FOUNDATION_ALTERNATIVES,
    historyByExerciseId: FULL_BODY_FOUNDATION_HISTORY,
  },

  "w-003": {
    id: "w-003",
    title: "Upper Body Hypertrophy",
    exercises: FULL_BODY_FOUNDATION_EXERCISES,
    blocks: FULL_BODY_FOUNDATION_BLOCKS,
    exerciseAlternatives: FULL_BODY_FOUNDATION_ALTERNATIVES,
    historyByExerciseId: FULL_BODY_FOUNDATION_HISTORY,
  },

  "w-004": {
    id: "w-004",
    title: "Conditioning Finisher",
    exercises: FULL_BODY_FOUNDATION_EXERCISES,
    blocks: FULL_BODY_FOUNDATION_BLOCKS,
    exerciseAlternatives: FULL_BODY_FOUNDATION_ALTERNATIVES,
    historyByExerciseId: FULL_BODY_FOUNDATION_HISTORY,
  },

  "strength-foundations-week-1-workout-1": {
    id: "strength-foundations-week-1-workout-1",
    title: "Strength & Conditioning",
    exercises: FULL_BODY_FOUNDATION_EXERCISES,
    blocks: FULL_BODY_FOUNDATION_BLOCKS,
    exerciseAlternatives: FULL_BODY_FOUNDATION_ALTERNATIVES,
    historyByExerciseId: FULL_BODY_FOUNDATION_HISTORY,
  },

  "strength-foundations-week-1-workout-2": {
    id: "strength-foundations-week-1-workout-2",
    title: "Upper Body Builder",
    exercises: FULL_BODY_FOUNDATION_EXERCISES,
    blocks: FULL_BODY_FOUNDATION_BLOCKS,
    exerciseAlternatives: FULL_BODY_FOUNDATION_ALTERNATIVES,
    historyByExerciseId: FULL_BODY_FOUNDATION_HISTORY,
  },

  "strength-foundations-week-1-workout-3": {
    id: "strength-foundations-week-1-workout-3",
    title: "Hypertrophy Focus",
    exercises: FULL_BODY_FOUNDATION_EXERCISES,
    blocks: FULL_BODY_FOUNDATION_BLOCKS,
    exerciseAlternatives: FULL_BODY_FOUNDATION_ALTERNATIVES,
    historyByExerciseId: FULL_BODY_FOUNDATION_HISTORY,
  },

  "strength-foundations-week-2-workout-1": {
    id: "strength-foundations-week-2-workout-1",
    title: "Strength & Conditioning",
    exercises: FULL_BODY_FOUNDATION_EXERCISES,
    blocks: FULL_BODY_FOUNDATION_BLOCKS,
    exerciseAlternatives: FULL_BODY_FOUNDATION_ALTERNATIVES,
    historyByExerciseId: FULL_BODY_FOUNDATION_HISTORY,
  },

  "strength-foundations-week-2-workout-2": {
    id: "strength-foundations-week-2-workout-2",
    title: "Upper Body Builder",
    exercises: FULL_BODY_FOUNDATION_EXERCISES,
    blocks: FULL_BODY_FOUNDATION_BLOCKS,
    exerciseAlternatives: FULL_BODY_FOUNDATION_ALTERNATIVES,
    historyByExerciseId: FULL_BODY_FOUNDATION_HISTORY,
  },

  "strength-foundations-week-2-workout-3": {
    id: "strength-foundations-week-2-workout-3",
    title: "Hypertrophy Focus",
    exercises: FULL_BODY_FOUNDATION_EXERCISES,
    blocks: FULL_BODY_FOUNDATION_BLOCKS,
    exerciseAlternatives: FULL_BODY_FOUNDATION_ALTERNATIVES,
    historyByExerciseId: FULL_BODY_FOUNDATION_HISTORY,
  },
};

export function getWorkoutConfig(workoutId?: string | null): WorkoutConfig {
  if (!workoutId) return WORKOUTS_BY_ID["full-body-foundation"];

  if (WORKOUTS_BY_ID[workoutId]) {
    return WORKOUTS_BY_ID[workoutId];
  }

  const parsedProgramWorkout = parseProgramWorkoutId(workoutId);

  if (parsedProgramWorkout) {
    const template = getProgramWorkoutTemplate(parsedProgramWorkout.workoutIndex);

    return {
      id: workoutId,
      title: template.title,
      exercises: FULL_BODY_FOUNDATION_EXERCISES,
      blocks: FULL_BODY_FOUNDATION_BLOCKS,
      exerciseAlternatives: FULL_BODY_FOUNDATION_ALTERNATIVES,
      historyByExerciseId: FULL_BODY_FOUNDATION_HISTORY,
    };
  }

  return WORKOUTS_BY_ID["full-body-foundation"];
}
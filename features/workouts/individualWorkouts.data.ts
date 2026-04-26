export type WorkoutCategory =
  | "upper"
  | "lower"
  | "bodyweight"
  | "dumbbells"
  | "conditioning";

export type IndividualWorkout = {
  id: string;
  title: string;
  type: string;
  durationMin: number;
  meta: string;
  imageUrl: string;
  access: "free" | "premium";
  isActive?: boolean;
  publishedAt: string;
  categories: WorkoutCategory[];
};

export const INDIVIDUAL_WORKOUTS: IndividualWorkout[] = [
  {
    id: "arms_shoulders_min",
    title: "Arms & Shoulders Minimum Equipment",
    type: "Strength",
    durationMin: 42,
    meta: "Arms · Shoulders",
    imageUrl:
      "https://chrisheria.com/cdn/shop/articles/06_6_19.jpg?v=1559860885",
    access: "free",
    isActive: true,
    publishedAt: "2026-04-15",
    categories: ["upper", "bodyweight"],
  },
  {
    id: "legs_strength",
    title: "Legs Strength Builder",
    type: "Strength",
    durationMin: 45,
    meta: "Legs · Glutes",
    imageUrl:
      "https://chrisheria.com/cdn/shop/articles/02_21_19.jpg?v=1550776060",
    access: "free",
    publishedAt: "2026-04-14",
    categories: ["lower", "conditioning"],
  },
  {
    id: "chest_hypertrophy",
    title: "Chest Hypertrophy Session",
    type: "Hypertrophy",
    durationMin: 47,
    meta: "Chest · Pressing",
    imageUrl:
      "https://i.ytimg.com/vi/K2h9lPvT0jU/maxresdefault.jpg",
    access: "premium",
    publishedAt: "2026-04-13",
    categories: ["upper"],
  },
  {
    id: "back_posterior",
    title: "Back & Posterior Chain",
    type: "Strength",
    durationMin: 49,
    meta: "Back · Posterior Chain",
    imageUrl:
      "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1800&q=80",
    access: "premium",
    publishedAt: "2026-04-12",
    categories: ["upper"],
  },
  {
    id: "dumbbell_upper",
    title: "Dumbbell Upper Body",
    type: "Dumbbell",
    durationMin: 40,
    meta: "Dumbbells · Upper Body",
    imageUrl:
      "https://cmmodels.de/wp-content/uploads/2022/01/sport-mann-weiss-schwarz-hose-oberteil-muetze-natur.jpg",
    access: "premium",
    publishedAt: "2026-04-11",
    categories: ["dumbbells", "upper"],
  },
  {
    id: "dumbbell_legs",
    title: "Dumbbell Legs Burner",
    type: "Dumbbell",
    durationMin: 34,
    meta: "Dumbbells · Legs",
    imageUrl:
      "https://i.ytimg.com/vi/w0zPgPkx8yI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCB-fSirLZ7-OC0R2z5r58bt-aUvQ",
    access: "premium",
    publishedAt: "2026-04-10",
    categories: ["dumbbells", "lower"],
  },
  {
    id: "push_pull_bw",
    title: "Push Pull Bodyweight",
    type: "Bodyweight",
    durationMin: 30,
    meta: "Bodyweight · Upper Body",
    imageUrl:
      "https://i.ytimg.com/vi/6O8SRDEK5F4/maxresdefault.jpg",
    access: "free",
    publishedAt: "2026-04-09",
    categories: ["bodyweight", "upper"],
  },
  {
    id: "bodyweight_core",
    title: "Bodyweight Core & Conditioning",
    type: "Bodyweight",
    durationMin: 28,
    meta: "Bodyweight · Core",
    imageUrl:
      "https://i.ytimg.com/vi/2ZgCRBLg2Zs/maxresdefault.jpg",
    access: "premium",
    publishedAt: "2026-04-08",
    categories: ["bodyweight", "conditioning"],
  },
  {
    id: "conditioning_erg",
    title: "Conditioning Erg Intervals",
    type: "Conditioning",
    durationMin: 24,
    meta: "Conditioning · Erg",
    imageUrl:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1800&q=80",
    access: "premium",
    publishedAt: "2026-04-07",
    categories: ["conditioning"],
  },
];

function byNewest(a: IndividualWorkout, b: IndividualWorkout) {
  return (
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getWorkoutById(id: string) {
  return INDIVIDUAL_WORKOUTS.find((w) => w.id === id) ?? null;
}

export function getWorkoutsForCategory(category: WorkoutCategory) {
  return INDIVIDUAL_WORKOUTS.filter((w) => w.categories.includes(category));
}

export function getLatestIndividualWorkouts(limit = 4) {
  return [...INDIVIDUAL_WORKOUTS].sort(byNewest).slice(0, limit);
}
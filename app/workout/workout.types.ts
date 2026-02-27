// app/workout/workout.types.ts

export type CircuitSubtype = "standard" | "tabata";

export type CircuitRotation = "sequence" | "alternate";

export type TabataConfig = {
  subtype: "tabata";
  workSeconds: number;   // default 20
  restSeconds: number;   // default 10
  intervals: number;     // default 8
  rotation?: CircuitRotation; // default "sequence"
};

export type StandardCircuitConfig = {
  subtype?: "standard";
  rounds?: number;
  restBetweenRoundsSeconds?: number;
  strictOrder?: boolean;
};

export type CircuitConfig = TabataConfig | StandardCircuitConfig;

export type CircuitExercise = {
  id: string;
  name: string;
  image?: string;
};

// “block” concept (you can expand later to superset/giant/circuit)
export type WorkoutBlock =
  | {
      id: string;
      type: "circuit";
      title?: string; // e.g. "Tabata Finisher"
      exercises: CircuitExercise[];
      config: CircuitConfig;
    };
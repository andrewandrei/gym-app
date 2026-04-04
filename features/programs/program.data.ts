// app/program/program.data.ts

export type Week = {
  id: string;
  label: string;
};

export type ProgramConfig = {
  id: string;
  title: string;
  subtitle: string;
  coach: string;
  meta: string;
  description: string;
  bullets: string[];
  weeks: Week[];
  hero: string;
};

function buildWeeks(count: number): Week[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `week-${i + 1}`,
    label: `Week ${i + 1}`,
  }));
}

export const PROGRAMS: Record<string, ProgramConfig> = {
  "strength-foundations": {
    id: "strength-foundations",
    title: "Strength Foundations",
    subtitle: "Build strength and lean muscle with structured progression",
    coach: "Andrei Andrei",
    meta: "Intermediate · Gym · 8 weeks",
    description:
      "A structured strength and hypertrophy plan built to help you gain muscle, improve performance, and stay consistent week after week. Clear progression, clean structure, and one obvious next step every session.",
    bullets: [
      "Strength progression",
      "Lean muscle focus",
      "Consistent weekly structure",
    ],
    weeks: buildWeeks(8),
    hero:
      "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/690f510381f5fead2d6257b8_c7d8a728-2fde-4254-a1a7-a505e1a4cf3e-p-2000.jpeg",
  },

  "hybrid-athlete": {
    id: "hybrid-athlete",
    title: "Hybrid Athlete",
    subtitle: "Build strength, engine, and athletic capacity",
    coach: "Andrei Andrei",
    meta: "Advanced · Gym · 12 weeks",
    description:
      "A performance-driven plan built to improve strength, conditioning, and overall athletic capacity. Designed for advanced trainees who want structure, intensity, and progression across the full training week.",
    bullets: [
      "Strength progression",
      "Conditioning capacity",
      "Athletic work output",
    ],
    weeks: buildWeeks(12),
    hero:
      "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/6784fa945db9e2462bde508b_675b0276e2206c6b6a37ff0c_Hybrid%20Athlete%20(1)-p-800.jpg",
  },
};

export function getProgram(programId?: string | null) {
  if (!programId) return PROGRAMS["strength-foundations"];
  return PROGRAMS[programId] ?? PROGRAMS["strength-foundations"];
}
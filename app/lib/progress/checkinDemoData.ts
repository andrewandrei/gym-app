// app/lib/progress/checkinDemoData.ts

import type { CheckIn } from "./types";

export const SEED_CHECKINS: CheckIn[] = [
  {
    id: "ci1",
    date: "Mar 1",
    isoDate: "2025-03-01",
    weight: 84.2,
    meas: { waist: 88, chest: 102, arm: 36 },
  },
  {
    id: "ci2",
    date: "Mar 8",
    isoDate: "2025-03-08",
    weight: 83.5,
    meas: { waist: 87, chest: 102, arm: 36.5 },
  },
  {
    id: "ci3",
    date: "Mar 15",
    isoDate: "2025-03-15",
    weight: 82.4,
    meas: { waist: 86, chest: 103, arm: 37 },
  },
  {
    id: "ci4",
    date: "Mar 21",
    isoDate: "2025-03-21",
    weight: 81.8,
    meas: { waist: 85.5, chest: 103, arm: 37.5 },
  },
];
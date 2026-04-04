import type { WeekEntry } from "./types";

export const SEED_WEEK_HISTORY: WeekEntry[] = [
  {
    n: 1,
    label: "Intro",
    dates: "Feb 3–7",
    sessions: [
      { date: "Feb 3", type: "Upper A", complete: true, lifts: ["Bench Press 60kg×4", "OHP 45kg×4", "Barbell Row 70kg×4"] },
      { date: "Feb 4", type: "Lower A", complete: true, lifts: ["Back Squat 80kg×4", "Romanian DL 70kg×4", "Hip Thrust 100kg×4"] },
      { date: "Feb 6", type: "Upper B", complete: true, lifts: ["Incline Press 55kg×4", "OHP 45kg×4", "Barbell Row 70kg×4"] },
      { date: "Feb 7", type: "Lower B", complete: false, lifts: ["Deadlift 100kg×4", "Romanian DL 70kg×3", "Hip Thrust 100kg×3"] },
    ],
  },
  {
    n: 2,
    label: "Build",
    dates: "Feb 10–14",
    sessions: [
      { date: "Feb 10", type: "Upper A", complete: true, lifts: ["Bench Press 62.5kg×4", "OHP 47.5kg×4", "Barbell Row 72.5kg×4"] },
      { date: "Feb 11", type: "Lower A", complete: true, lifts: ["Back Squat 82.5kg×4", "Romanian DL 75kg×4", "Hip Thrust 110kg×4"] },
      { date: "Feb 13", type: "Upper B", complete: true, lifts: ["Incline Press 57.5kg×4", "OHP 47.5kg×4", "Barbell Row 72.5kg×4"] },
      { date: "Feb 14", type: "Lower B", complete: true, lifts: ["Deadlift 105kg×4", "Romanian DL 75kg×4", "Hip Thrust 110kg×4"] },
    ],
  },
  {
    n: 3,
    label: "Build",
    dates: "Feb 17–21",
    sessions: [
      { date: "Feb 17", type: "Upper A", complete: true, lifts: ["Bench Press 62.5kg×5", "OHP 47.5kg×5", "Barbell Row 75kg×5"] },
      { date: "Feb 18", type: "Lower A", complete: true, lifts: ["Back Squat 85kg×5", "Romanian DL 77.5kg×5", "Hip Thrust 115kg×5"] },
      { date: "Feb 19", type: "Upper B", complete: false, lifts: ["Incline Press 60kg×5", "OHP 47.5kg×5", "Barbell Row 75kg×5"] },
      { date: "Feb 20", type: "Lower B", complete: true, lifts: ["Deadlift 110kg×5", "Romanian DL 77.5kg×5", "Hip Thrust 115kg×4"] },
    ],
  },
  {
    n: 4,
    label: "Deload",
    dates: "Feb 24–28",
    sessions: [
      { date: "Feb 24", type: "Upper", complete: true, lifts: ["Bench Press 55kg×3", "OHP 42.5kg×3", "Barbell Row 65kg×3"] },
      { date: "Feb 25", type: "Lower", complete: true, lifts: ["Back Squat 70kg×3", "Romanian DL 65kg×3", "Hip Thrust 90kg×3"] },
      { date: "Feb 27", type: "Full", complete: true, lifts: ["Incline Press 50kg×3", "Deadlift 90kg×3", "Hip Thrust 90kg×3"] },
    ],
  },
  {
    n: 5,
    label: "Strength",
    dates: "Mar 3–7",
    sessions: [
      { date: "Mar 3", type: "Upper A", complete: true, lifts: ["Bench Press 67.5kg×3", "OHP 50kg×3", "Barbell Row 77.5kg×3"] },
      { date: "Mar 4", type: "Lower A", complete: true, lifts: ["Back Squat 87.5kg×3", "Romanian DL 80kg×3", "Hip Thrust 125kg×3"] },
      { date: "Mar 6", type: "Upper B", complete: false, lifts: ["Bench Press 67.5kg×3", "Incline Press 62.5kg×3", "Barbell Row 77.5kg×3"] },
      { date: "Mar 7", type: "Lower B", complete: true, lifts: ["Deadlift 117.5kg×3", "Romanian DL 80kg×3", "Hip Thrust 125kg×3"] },
    ],
  },
  {
    n: 6,
    label: "Strength",
    dates: "Mar 10–14",
    current: true,
    sessions: [
      { date: "Mar 10", type: "Upper A", complete: true, lifts: ["Bench Press 72.5kg×3 🏆", "OHP 52.5kg×3", "Barbell Row 80kg×3"] },
      { date: "Mar 11", type: "Lower A", complete: true, lifts: ["Back Squat 95kg×3 🏆", "Romanian DL 82.5kg×3 🏆", "Hip Thrust 130kg×3 🏆"] },
      { date: "Mar 13", type: "Upper B", complete: false, lifts: ["Incline Press 65kg×3", "OHP 52.5kg×3", "Barbell Row 80kg×3"] },
      { date: "Mar 14", type: "Lower B", complete: true, lifts: ["Deadlift 122.5kg×3 🏆", "Romanian DL 82.5kg×3", "Hip Thrust 130kg×3"] },
    ],
  },
  {
    n: 7,
    label: "Strength",
    dates: "Mar 17–21",
    upcoming: true,
    sessions: [
      { date: "Mar 17", type: "Upper A", complete: false, planned: true, lifts: ["Bench Press ~75kg×2", "OHP ~55kg×2", "Barbell Row ~82.5kg×2"] },
      { date: "Mar 18", type: "Lower A", complete: false, planned: true, lifts: ["Back Squat ~100kg×2", "Romanian DL ~85kg×2", "Hip Thrust ~135kg×2"] },
      { date: "Mar 20", type: "Upper B", complete: false, planned: true, lifts: ["Incline Press ~67.5kg×2", "OHP ~55kg×2"] },
      { date: "Mar 21", type: "Lower B", complete: false, planned: true, lifts: ["Deadlift ~125kg×2", "Romanian DL ~85kg×2"] },
    ],
  },
  {
    n: 8,
    label: "Peak",
    dates: "Mar 24–28",
    upcoming: true,
    sessions: [
      { date: "Mar 24", type: "Test Day 1", complete: false, planned: true, lifts: ["Back Squat 1RM test", "Bench Press 1RM test"] },
      { date: "Mar 25", type: "Test Day 2", complete: false, planned: true, lifts: ["Deadlift 1RM test", "OHP 1RM test"] },
    ],
  },
  {
    n: 9,
    label: "Rebuild",
    dates: "Mar 31–Apr 4",
    upcoming: true,
    sessions: [
      { date: "Mar 31", type: "Upper A", complete: false, planned: true, lifts: ["Bench Press ~70kg×4", "OHP ~50kg×4"] },
      { date: "Apr 1", type: "Lower A", complete: false, planned: true, lifts: ["Back Squat ~90kg×4", "RDL ~80kg×4"] },
      { date: "Apr 3", type: "Upper B", complete: false, planned: true, lifts: ["Incline Press ~62.5kg×4", "Row ~77.5kg×4"] },
      { date: "Apr 4", type: "Lower B", complete: false, planned: true, lifts: ["Deadlift ~115kg×4", "Hip Thrust ~125kg×4"] },
    ],
  },
  {
    n: 10,
    label: "Rebuild",
    dates: "Apr 7–11",
    upcoming: true,
    sessions: [
      { date: "Apr 7", type: "Upper A", complete: false, planned: true, lifts: ["Bench Press ~72.5kg×4", "OHP ~52.5kg×4"] },
      { date: "Apr 8", type: "Lower A", complete: false, planned: true, lifts: ["Back Squat ~92.5kg×4", "RDL ~82.5kg×4"] },
      { date: "Apr 10", type: "Upper B", complete: false, planned: true, lifts: ["Incline Press ~65kg×4", "Row ~80kg×4"] },
      { date: "Apr 11", type: "Lower B", complete: false, planned: true, lifts: ["Deadlift ~117.5kg×4", "Hip Thrust ~127.5kg×4"] },
    ],
  },
  {
    n: 11,
    label: "Push",
    dates: "Apr 14–18",
    upcoming: true,
    sessions: [
      { date: "Apr 14", type: "Upper A", complete: false, planned: true, lifts: ["Bench Press ~75kg×3", "OHP ~55kg×3"] },
      { date: "Apr 15", type: "Lower A", complete: false, planned: true, lifts: ["Back Squat ~95kg×3", "RDL ~85kg×3"] },
      { date: "Apr 17", type: "Upper B", complete: false, planned: true, lifts: ["Incline Press ~67.5kg×3", "Row ~82.5kg×3"] },
      { date: "Apr 18", type: "Lower B", complete: false, planned: true, lifts: ["Deadlift ~120kg×3", "Hip Thrust ~130kg×3"] },
    ],
  },
  {
    n: 12,
    label: "Push",
    dates: "Apr 21–25",
    upcoming: true,
    sessions: [
      { date: "Apr 21", type: "Upper A", complete: false, planned: true, lifts: ["Bench Press ~77.5kg×2", "OHP ~57.5kg×2"] },
      { date: "Apr 22", type: "Lower A", complete: false, planned: true, lifts: ["Back Squat ~100kg×2", "RDL ~87.5kg×2"] },
      { date: "Apr 24", type: "Upper B", complete: false, planned: true, lifts: ["Incline Press ~70kg×2", "Row ~85kg×2"] },
      { date: "Apr 25", type: "Lower B", complete: false, planned: true, lifts: ["Deadlift ~125kg×2", "Hip Thrust ~135kg×2"] },
    ],
  },
];
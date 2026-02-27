// app/workout/index.tsx

import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Check, MoreVertical, Repeat, Trophy, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  findNodeHandle,
  Image,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
// If you don't have this installed yet:
//   npx expo install @react-native-community/slider
import Slider from "@react-native-community/slider";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Colors } from "@/styles/colors";
import { S } from "./workout.styles";

/* ───────────────────────── Types ───────────────────────── */

type SetRow = {
  id: string;
  weight?: string;
  reps?: string;
  rest?: string;
  done?: boolean;
};

type UnitLabel = "LBS" | "KG" | "REPS";

type Exercise = {
  id: string;
  name: string;
  tempo: string;
  image: string;
  unitLabel: UnitLabel;
  sets: SetRow[];
};

type ExerciseAlternative = {
  id: string;
  name: string;
  category: string;
  image: string;
};

type HistorySet = {
  set: number;
  weight: string;
  reps: string;
  rest: string;
  done: boolean;
};

type ExerciseHistorySession = {
  id: string;
  dateLabel: string;
  sets: HistorySet[];
};

type StrengthBlock = {
  id: string;
  type: "single" | "superset" | "giant" | "circuit";
  title?: string;
  rounds?: number; // circuit
  exerciseIds: string[];
};

type WorkoutBlock = StrengthBlock | { id: string; type: "tabata" };

type Cursor = { exId: string; setIndex: number };

type FocusScope =
  | { type: "block"; blockId: string }
  | { type: "exercise"; exId: string }
  | null;

type ManualTimerState = {
  running: boolean;
  totalSeconds: number;
  secondsLeft: number;
};

/* ───────────────────────── Screen ───────────────────────── */

export default function WorkoutLogScreen() {
  const workoutTitle = "Full Body — Foundation";

  const [isPreview, setIsPreview] = useState(true);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  /* ───────────────────────── Demo Workout (Full Body + all block types) ───────────────────────── */

  const initialExercises: Exercise[] = useMemo(
    () => [
      // SINGLE (primer)
      {
        id: "ex-1",
        name: "Rower (Easy Prime)",
        tempo: "—",
        image:
          "https://images.unsplash.com/photo-1517964603305-11c0f6f66012?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "REPS",
        sets: [{ id: "s1", weight: "", reps: "60", rest: "30", done: false }],
      },

      // SUPERSET A (same set count)
      {
        id: "ex-2",
        name: "Barbell Back Squat (Controlled)",
        tempo: "3-0-1-0",
        image:
          "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "185", reps: "8", rest: "90", done: false },
          { id: "s2", weight: "185", reps: "8", rest: "90", done: false },
          { id: "s3", weight: "", reps: "8", rest: "90", done: false },
        ],
      },
      {
        id: "ex-3",
        name: "Romanian Deadlift",
        tempo: "3-1-1-0",
        image:
          "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "165", reps: "10", rest: "90", done: false },
          { id: "s2", weight: "", reps: "10", rest: "90", done: false },
          { id: "s3", weight: "", reps: "10", rest: "90", done: false },
        ],
      },

      // GIANT SET B (same set count)
      {
        id: "ex-4",
        name: "Incline Dumbbell Press",
        tempo: "2-0-2-0",
        image:
          "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "", reps: "10", rest: "75", done: false },
          { id: "s2", weight: "", reps: "10", rest: "75", done: false },
          { id: "s3", weight: "", reps: "10", rest: "75", done: false },
        ],
      },
      {
        id: "ex-5",
        name: "Chest-Supported Row",
        tempo: "2-1-2-0",
        image:
          "https://images.unsplash.com/photo-1599058917765-142b2a07f930?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "", reps: "12", rest: "75", done: false },
          { id: "s2", weight: "", reps: "12", rest: "75", done: false },
          { id: "s3", weight: "", reps: "12", rest: "75", done: false },
        ],
      },
      {
        id: "ex-6",
        name: "Lateral Raise",
        tempo: "2-0-2-0",
        image:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "", reps: "15", rest: "75", done: false },
          { id: "s2", weight: "", reps: "15", rest: "75", done: false },
          { id: "s3", weight: "", reps: "15", rest: "75", done: false },
        ],
      },

      // CIRCUIT 1 (same set count)
      {
        id: "ex-7",
        name: "Leg Press",
        tempo: "2-0-2-0",
        image:
          "https://images.unsplash.com/photo-1526401485004-2aa7f3d0bd19?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "", reps: "12", rest: "60", done: false },
          { id: "s2", weight: "", reps: "12", rest: "60", done: false },
          { id: "s3", weight: "", reps: "12", rest: "60", done: false },
        ],
      },
      {
        id: "ex-8",
        name: "Push-Up (Tempo)",
        tempo: "2-0-2-0",
        image:
          "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "REPS",
        sets: [
          { id: "s1", weight: "", reps: "12", rest: "60", done: false },
          { id: "s2", weight: "", reps: "12", rest: "60", done: false },
          { id: "s3", weight: "", reps: "12", rest: "60", done: false },
        ],
      },
      {
        id: "ex-9",
        name: "Dead Bug",
        tempo: "—",
        image:
          "https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "REPS",
        sets: [
          { id: "s1", weight: "", reps: "10", rest: "60", done: false },
          { id: "s2", weight: "", reps: "10", rest: "60", done: false },
          { id: "s3", weight: "", reps: "10", rest: "60", done: false },
        ],
      },
    ],
    [],
  );

  const [exercises, setExercises] = useState(initialExercises);

  const exerciseById = useMemo(() => {
    const map: Record<string, Exercise> = {};
    exercises.forEach((e) => (map[e.id] = e));
    return map;
  }, [exercises]);

  /* Blocks (includes single + superset + giant + circuit) */
  const blocks: WorkoutBlock[] = useMemo(
    () => [
      { id: "b0", type: "single", title: "Primer", exerciseIds: ["ex-1"] },
      { id: "b1", type: "superset", title: "Superset A", exerciseIds: ["ex-2", "ex-3"] },
      { id: "b2", type: "giant", title: "Giant Set B", exerciseIds: ["ex-4", "ex-5", "ex-6"] },
      { id: "b3", type: "circuit", title: "Circuit 1", rounds: 3, exerciseIds: ["ex-7", "ex-8", "ex-9"] },
      // { id: "b4", type: "tabata" },
    ],
    [],
  );

  const strengthBlocks = useMemo(
    () => blocks.filter((b) => b.type !== "tabata") as StrengthBlock[],
    [blocks],
  );

  const blockById = useMemo(() => {
    const map: Record<string, StrengthBlock> = {};
    strengthBlocks.forEach((b) => (map[b.id] = b));
    return map;
  }, [strengthBlocks]);

  const blockByExerciseId = useMemo(() => {
    const map: Record<string, StrengthBlock> = {};
    strengthBlocks.forEach((b) => {
      b.exerciseIds.forEach((id) => {
        map[id] = b;
      });
    });
    return map;
  }, [strengthBlocks]);

  const isGroupedBlock = (b: StrengthBlock) =>
    b.type === "superset" || b.type === "giant" || b.type === "circuit";

  /* ───────────────────────── Ensure equal set counts inside groups ───────────────────────── */

  const ensureEqualSetsInGroup = (prev: Exercise[], block: StrengthBlock) => {
    if (!isGroupedBlock(block)) return prev;

    const ids = block.exerciseIds;
    const maxLen = Math.max(...ids.map((id) => prev.find((e) => e.id === id)?.sets.length ?? 0));
    if (!isFinite(maxLen) || maxLen <= 0) return prev;

    return prev.map((ex) => {
      if (!ids.includes(ex.id)) return ex;
      if (ex.sets.length === maxLen) return ex;

      const deficit = maxLen - ex.sets.length;
      const restDefault = block.type === "circuit" ? "60" : "90";

      const fill: SetRow[] = Array.from({ length: deficit }).map((_, k) => ({
        id: `auto-${ex.id}-${Date.now()}-${k}`,
        weight: "",
        reps: "",
        rest: restDefault,
        done: false,
      }));

      return { ...ex, sets: [...ex.sets, ...fill] };
    });
  };

  const normalizeAllGroups = (prev: Exercise[]) => {
    let next = prev;
    for (const b of strengthBlocks) {
      next = ensureEqualSetsInGroup(next, b);
    }
    return next;
  };

  /* ───────────────────────── Alternatives + History demo ───────────────────────── */

  const exerciseAlternatives: Record<string, ExerciseAlternative[]> = useMemo(
    () => ({
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
      "ex-8": [
        {
          id: "alt-3",
          name: "Incline Push-Up",
          category: "home",
          image:
            "https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=600&q=70",
        },
      ],
    }),
    [],
  );

  const historyByExerciseId: Record<string, ExerciseHistorySession[]> = useMemo(
    () => ({
      "ex-2": [
        {
          id: "h1",
          dateLabel: "Feb 18, 2026",
          sets: [
            { set: 1, weight: "185", reps: "8", rest: "90", done: true },
            { set: 2, weight: "185", reps: "8", rest: "90", done: true },
            { set: 3, weight: "175", reps: "8", rest: "90", done: true },
          ],
        },
      ],
    }),
    [],
  );

  /* ───────────────────────── Swipe management ───────────────────────── */

  const rowRefs = useRef<Record<string, Swipeable | null>>({});
  const openRowKeyRef = useRef<string | null>(null);

  const closeOpenRow = () => {
    const key = openRowKeyRef.current;
    if (key) rowRefs.current[key]?.close();
    openRowKeyRef.current = null;
  };

  /* ───────────────────────── Active Cursor + Scroll (scoped) ───────────────────────── */

  const scrollRef = useRef<ScrollView | null>(null);
  const rowViewRefs = useRef<Record<string, any>>({});
  const rowKeyFor = (exId: string, setIndex: number) => `${exId}::${setIndex}`;

  const [activeCursor, setActiveCursor] = useState<Cursor | null>(null);

  // ✅ scope of intent (prevents confusing global auto-scroll)
  const [focusScope, setFocusScope] = useState<FocusScope>(null);

  // ✅ per-block resume point (where user left off inside a group)
  const blockResumeRef = useRef<Record<string, Cursor>>({});

  const orderedExerciseIds = useMemo(() => {
    const ids: string[] = [];
    strengthBlocks.forEach((b) => b.exerciseIds.forEach((id) => ids.push(id)));
    return ids;
  }, [strengthBlocks]);

  /* ───────────────────────── Manual Rest Timer ───────────────────────── */

  const [timerOpen, setTimerOpen] = useState(false);
  const [manualTimer, setManualTimer] = useState<ManualTimerState | null>(null);

  const [timerMinutes, setTimerMinutes] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const manualTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clampInt = (n: number, min: number, max: number) => Math.max(min, Math.min(max, Math.floor(n)));

  const formatMMSS = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };

  const stopManualTimerInterval = () => {
    if (manualTimerIntervalRef.current) {
      clearInterval(manualTimerIntervalRef.current);
      manualTimerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    stopManualTimerInterval();

    if (!manualTimer?.running) return;

    manualTimerIntervalRef.current = setInterval(() => {
      setManualTimer((prev) => {
        if (!prev) return null;
        if (!prev.running) return prev;

        const nextLeft = prev.secondsLeft - 1;
        if (nextLeft <= 0) {
          stopManualTimerInterval();
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          return { ...prev, running: false, secondsLeft: 0 };
        }

        // subtle “near end” ticks
        if (nextLeft <= 3 && Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        return { ...prev, secondsLeft: nextLeft };
      });
    }, 1000);

    return () => stopManualTimerInterval();
  }, [manualTimer?.running]);

  const openTimer = async () => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    setTimerOpen(true);
  };

  const closeTimer = async () => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    setTimerOpen(false);
  };

  const startManualTimer = async () => {
    const total = clampInt(timerMinutes, 0, 20) * 60 + clampInt(timerSeconds, 0, 59);
    if (total <= 0) return;

    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setManualTimer({ running: true, totalSeconds: total, secondsLeft: total });
  };

  const pauseManualTimer = async () => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    setManualTimer((prev) => (prev ? { ...prev, running: false } : prev));
  };

  const resumeManualTimer = async () => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    setManualTimer((prev) => {
      if (!prev) return prev;
      if (prev.secondsLeft <= 0) return prev;
      return { ...prev, running: true };
    });
  };

  const resetManualTimer = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setManualTimer(null);
  };

  const scrollToCursor = (cursor: Cursor) => {
    const key = rowKeyFor(cursor.exId, cursor.setIndex);
    const targetRef = rowViewRefs.current[key];
    const sc = scrollRef.current;
    if (!targetRef || !sc) return;

    if (Platform.OS === "web") {
      const node: any = targetRef;
      if (typeof node?.scrollIntoView === "function") {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const targetHandle = findNodeHandle(targetRef);
    const scrollHandle = findNodeHandle(sc);
    if (!targetHandle || !scrollHandle) return;

    // 🔥 keep dynamic offset structure (timer UI affects perceived landing)
    const topOffset = manualTimer && !kbVisible ? 220 : 160;

    UIManager.measureLayout(targetHandle, scrollHandle, () => {}, (_x, y) => {
      sc.scrollTo({ y: Math.max(0, y - topOffset), animated: true });
    });
  };

  const findFirstIncompleteGlobal = () => {
    for (const exId of orderedExerciseIds) {
      const ex = exerciseById[exId];
      if (!ex) continue;
      const idx = ex.sets.findIndex((s) => !s.done);
      if (idx >= 0) return { exId, setIndex: idx };
    }
    return null;
  };

  // next cursor inside an exercise (skip completed)
  const findNextIncompleteInExercise = (exId: string, fromSetIndex: number) => {
    const ex = exerciseById[exId];
    if (!ex?.sets?.length) return null;
    for (let i = fromSetIndex + 1; i < ex.sets.length; i++) {
      if (!ex.sets[i].done) return { exId, setIndex: i };
    }
    return null;
  };

  // next cursor inside a grouped block, A→B→C then next round order, skipping completed
  const findNextIncompleteInBlock = (blockId: string, from: Cursor) => {
    const block = blockById[blockId];
    if (!block) return null;

    const exIds = block.exerciseIds;
    const maxSets = Math.max(...exIds.map((id) => exerciseById[id]?.sets.length ?? 0));
    if (!isFinite(maxSets) || maxSets <= 0) return null;

    const startExPos = exIds.findIndex((id) => id === from.exId);
    const startSet = from.setIndex;

    const totalCandidates = exIds.length * maxSets;

    const candidateAt = (n: number) => {
      const posInRow = (startExPos + 1 + n) % exIds.length;
      const rowAdvance = Math.floor((startExPos + 1 + n) / exIds.length);
      const setIndex = startSet + rowAdvance;
      const exId = exIds[posInRow];
      return { exId, setIndex };
    };

    for (let k = 0; k < totalCandidates; k++) {
      const cand = candidateAt(k);
      if (cand.setIndex >= maxSets) break;
      const ex = exerciseById[cand.exId];
      const set = ex?.sets?.[cand.setIndex];
      if (set && !set.done) return cand;
    }

    return null;
  };

  // decide next cursor based on scope, always skipping completed
  const getNextCursorScoped = (current: Cursor) => {
    const currentBlock = blockByExerciseId[current.exId];

    if (focusScope?.type === "exercise") {
      return findNextIncompleteInExercise(focusScope.exId, current.setIndex);
    }

    if (focusScope?.type === "block") {
      return findNextIncompleteInBlock(focusScope.blockId, current);
    }

    if (currentBlock && isGroupedBlock(currentBlock)) {
      return findNextIncompleteInBlock(currentBlock.id, current) ?? findFirstIncompleteGlobal();
    }

    return findNextIncompleteInExercise(current.exId, current.setIndex) ?? findFirstIncompleteGlobal();
  };

  // whether we should auto-scroll (only when staying in same scope)
  const shouldAutoScrollTo = (from: Cursor, to: Cursor | null) => {
    if (!to) return false;

    if (focusScope?.type === "exercise") return to.exId === focusScope.exId;

    if (focusScope?.type === "block") {
      const toBlock = blockByExerciseId[to.exId];
      return !!toBlock && toBlock.id === focusScope.blockId;
    }

    return true;
  };

  /* ───────────────────────── Modals / Menu ───────────────────────── */

  const [finishOpen, setFinishOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyExerciseId, setHistoryExerciseId] = useState<string | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuExerciseId, setMenuExerciseId] = useState<string | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);

  /* ───────────────────────── iOS Input Accessory: Timer + Done ───────────────────────── */

  const IOS_ACCESSORY_ID = "workoutAccessoryDone";
  const iosAccessoryProps = Platform.OS === "ios" ? { inputAccessoryViewID: IOS_ACCESSORY_ID } : null;

  /* ───────────────────────── Keyboard visibility (hide floating time UI) ───────────────────────── */

  const [kbVisible, setKbVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const subShow = Keyboard.addListener(showEvt as any, () => setKbVisible(true));
    const subHide = Keyboard.addListener(hideEvt as any, () => setKbVisible(false));

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  /* ───────────────────────── Actions ───────────────────────── */

  const startWorkout = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setExercises((prev) => normalizeAllGroups(prev));

    setIsPreview(false);

    requestAnimationFrame(() => {
      const first = findFirstIncompleteGlobal();
      setFocusScope(null);
      setActiveCursor(first);
      if (first) requestAnimationFrame(() => scrollToCursor(first));
    });
  };

  const handleBack = async () => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();

    if (isPreview) {
      if (router.canGoBack()) router.back();
      else router.replace("/");
      return;
    }

    setExitConfirmOpen(true);
  };

  const confirmExit = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExitConfirmOpen(false);
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const estimatedTime = useMemo(() => {
    const totalSetsCount = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const avgRestTime = 75;
    const avgSetTime = 45;
    return Math.round((totalSetsCount * (avgSetTime + avgRestTime)) / 60);
  }, [exercises]);

  const updateSet = (exId: string, setId: string, patch: Partial<SetRow>) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId ? ex : { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) },
      ),
    );
  };

  const toggleSetDone = async (exId: string, setId: string) => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();

    const ex = exercises.find((e) => e.id === exId);
    const set = ex?.sets.find((s) => s.id === setId);
    if (!set || !ex) return;

    const setIndex = ex.sets.findIndex((s) => s.id === setId);
    const willBecomeDone = !set.done;

    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id !== exId
          ? exercise
          : { ...exercise, sets: exercise.sets.map((s) => (s.id === setId ? { ...s, done: willBecomeDone } : s)) },
      ),
    );

    if (willBecomeDone) {
      const current: Cursor = { exId, setIndex };
      const next = getNextCursorScoped(current);

      const b = blockByExerciseId[exId];
      if (b && isGroupedBlock(b) && next) {
        blockResumeRef.current[b.id] = next;
      }

      if (next) {
        setActiveCursor(next);
        if (shouldAutoScrollTo(current, next)) {
          requestAnimationFrame(() => scrollToCursor(next));
        }
      } else {
        setActiveCursor(null);
      }
    } else {
      setActiveCursor({ exId, setIndex });
    }
  };

  const deleteSetAtIndexAcrossGroup = async (block: StrengthBlock, setIndex: number) => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeOpenRow();

    setExercises((prev) => {
      const next = prev.map((ex) => {
        if (!block.exerciseIds.includes(ex.id)) return ex;
        if (setIndex < 0 || setIndex >= ex.sets.length) return ex;
        return { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) };
      });
      return ensureEqualSetsInGroup(next, block);
    });
  };

  const deleteSet = async (exId: string, setId: string) => {
    const block = blockByExerciseId[exId];
    if (block && isGroupedBlock(block)) {
      const ex = exercises.find((e) => e.id === exId);
      if (!ex) return;
      const idx = ex.sets.findIndex((s) => s.id === setId);
      if (idx < 0) return;
      await deleteSetAtIndexAcrossGroup(block, idx);
      return;
    }

    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeOpenRow();
    setExercises((prev) => prev.map((ex) => (ex.id !== exId ? ex : { ...ex, sets: ex.sets.filter((s) => s.id !== setId) })));
  };

  const addSetToExercises = async (exerciseIds: string[], restDefault: string) => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    setExercises((prev) =>
      prev.map((ex) => {
        if (!exerciseIds.includes(ex.id)) return ex;
        const nextIdx = ex.sets.length + 1;
        return {
          ...ex,
          sets: [...ex.sets, { id: `s${nextIdx}-${Date.now()}-${ex.id}`, weight: "", reps: "", rest: restDefault, done: false }],
        };
      }),
    );
  };

  const addSetSingle = async (exId: string) => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId ? ex : { ...ex, sets: [...ex.sets, { id: `s${ex.sets.length + 1}-${Date.now()}`, weight: "", reps: "", rest: "90", done: false }] },
      ),
    );
  };

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0);
  const pct = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;
  const isComplete = totalSets > 0 && completedSets === totalSets;

  const openFinish = async () => {
    closeOpenRow();
    Keyboard.dismiss();
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    setFinishOpen(true);
  };

  const confirmFinish = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFinishOpen(false);
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const openHistory = async (exId: string) => {
    closeOpenRow();
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    setHistoryExerciseId(exId);
    setHistoryOpen(true);
  };

  const openMenu = async (exId: string) => {
    closeOpenRow();
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    setMenuExerciseId(exId);
    setMenuOpen(true);
  };

  const swapExercise = async (alternative: ExerciseAlternative) => {
    if (!menuExerciseId) return;
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setExercises((prev) => {
      const swapped = prev.map((ex) =>
        ex.id !== menuExerciseId
          ? ex
          : {
              ...ex,
              name: alternative.name,
              image: alternative.image,
              sets: ex.sets.map((s) => ({ ...s, weight: "", reps: "", done: false })),
            },
      );
      return normalizeAllGroups(swapped);
    });

    setSwapOpen(false);
    setMenuOpen(false);
    setMenuExerciseId(null);
  };

  const getPersonalBest = (exId: string) => {
    const sessions = historyByExerciseId[exId] ?? [];
    if (!sessions.length) return null;

    let maxWeight = 0;
    let maxReps = 0;
    let prDate = "";

    sessions.forEach((session) => {
      session.sets.forEach((set) => {
        const w = parseFloat(set.weight);
        const r = parseFloat(set.reps);
        if (w > maxWeight || (w === maxWeight && r > maxReps)) {
          maxWeight = w;
          maxReps = r;
          prDate = session.dateLabel;
        }
      });
    });

    return maxWeight > 0 ? { weight: maxWeight, reps: maxReps, date: prDate } : null;
  };

  const pr = useMemo(() => (historyExerciseId ? getPersonalBest(historyExerciseId) : null), [historyExerciseId]);

  const applySpecificSession = async (sessionId: string) => {
    if (!historyExerciseId) return;

    const sessions = historyByExerciseId[historyExerciseId] ?? [];
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setExercises((prev) => {
      const next = prev.map((ex) => {
        if (ex.id !== historyExerciseId) return ex;
        const newSets: SetRow[] = session.sets.map((hs, idx) => ({
          id: `s${idx + 1}-${Date.now()}`,
          weight: hs.weight,
          reps: hs.reps,
          rest: hs.rest,
          done: false,
        }));
        return { ...ex, sets: newSets };
      });
      return normalizeAllGroups(next);
    });

    setHistoryOpen(false);
  };

  const addToCurrentExercise = async () => {
    if (!historyExerciseId) return;

    const sessions = historyByExerciseId[historyExerciseId] ?? [];
    const session = sessions[0];
    if (!session) return;

    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setExercises((prev) => {
      const next = prev.map((ex) => {
        if (ex.id !== historyExerciseId) return ex;

        const incoming: SetRow[] = session.sets.map((hs, idx) => ({
          id: `h${Date.now()}-${idx}`,
          weight: hs.weight,
          reps: hs.reps,
          rest: hs.rest,
          done: false,
        }));

        const hasAnyInput = ex.sets.some((s) => (s.weight ?? "") || (s.reps ?? "") || (s.rest ?? ""));
        return { ...ex, sets: hasAnyInput ? [...ex.sets, ...incoming] : incoming };
      });

      return normalizeAllGroups(next);
    });

    setHistoryOpen(false);
  };

  const currentExercise = exercises.find((ex) => ex.id === menuExerciseId);

  /* ───────────────────────── Render Helpers ───────────────────────── */

  const blockKickerFor = (block: StrengthBlock) => {
    if (block.type === "superset") return "SUPERSET";
    if (block.type === "giant") return "GIANT SET";
    if (block.type === "circuit") return "CIRCUIT";
    return "SINGLE";
  };

  const blockMetaFor = (block: StrengthBlock) => {
    const count = block.exerciseIds.length;
    if (block.type === "circuit") return `${count} exercises • ${block.rounds ?? 3} rounds • Move across`;
    if (block.type === "superset" || block.type === "giant") return `${count} exercises • Move across`;
    return `${count} exercise`;
  };

  const letter = (i: number) => String.fromCharCode("A".charCodeAt(0) + i);

  const tagFor = (block: StrengthBlock, idx: number) => {
    if (block.type === "superset" || block.type === "giant") return letter(idx);
    if (block.type === "circuit") return String(idx + 1);
    return undefined;
  };

  const groupAccentStyle = (block: StrengthBlock) => {
    if (block.type === "superset") return S.groupRailSuperset;
    if (block.type === "giant") return S.groupRailGiant;
    if (block.type === "circuit") return S.groupRailCircuit;
    return null;
  };

  const adoptScopeFromExercise = (exId: string) => {
    const b = blockByExerciseId[exId];
    if (b && isGroupedBlock(b)) {
      setFocusScope({ type: "block", blockId: b.id });
    } else {
      setFocusScope({ type: "exercise", exId });
    }
  };

  const accessoryDone = async () => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    Keyboard.dismiss();
  };

  /* ───────────────────────── UI ───────────────────────── */

  return (
    <SafeAreaView style={S.safe}>
      {isPreview ? (
        <View style={S.previewPage}>
          <ScrollView
            ref={scrollRef as any}
            style={S.scroll}
            contentContainerStyle={S.previewContent}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardDismissMode="on-drag"
          >
            <ScreenHeader
              variant="page"
              title={workoutTitle}
              subtitle={`${exercises.length} exercises • ~${estimatedTime} min • ${totalSets} sets`}
              after="default"
            />

            <View style={S.previewList}>
              {strengthBlocks.map((block, blockIndex) => (
                <View key={block.id} style={S.previewGroupWrap}>
                  <View style={[S.previewGroupRail, groupAccentStyle(block)]} />

                  <View style={S.previewBlockHeader}>
                    <Text style={S.previewBlockKicker}>{blockKickerFor(block)}</Text>
                    <Text style={S.previewBlockTitle}>{block.title ?? blockKickerFor(block)}</Text>
                    <Text style={S.previewBlockMeta}>{blockMetaFor(block)}</Text>
                  </View>

                  {block.exerciseIds.map((exId, idx) => {
                    const ex = exerciseById[exId];
                    if (!ex) return null;

                    const blockTag = tagFor(block, idx);
                    const isLastExerciseInBlock = idx === block.exerciseIds.length - 1;
                    const isLastBlock = blockIndex === strengthBlocks.length - 1;

                    return (
                      <View key={ex.id}>
                        <View style={S.previewCard}>
                          <View style={S.previewCardLeft}>
                            {blockTag ? (
                              <View style={S.previewBlockTag}>
                                <Text style={S.previewBlockTagText}>{blockTag}</Text>
                              </View>
                            ) : (
                              <View style={S.previewNumber}>
                                <Text style={S.previewNumberText}>{idx + 1}</Text>
                              </View>
                            )}

                            <Image source={{ uri: ex.image }} style={S.previewImage} />
                          </View>

                          <View style={S.previewCardRight}>
                            <Text style={S.previewExName} numberOfLines={2}>
                              {ex.name}
                            </Text>
                            <Text style={S.previewExMeta}>
                              {ex.sets.length} sets • {ex.sets[0]?.reps || "—"} reps • {ex.sets[0]?.rest || "—"}s rest
                            </Text>
                          </View>
                        </View>

                        {!isLastExerciseInBlock ? <View style={S.previewSeparator} /> : null}
                        {isLastExerciseInBlock && !isLastBlock ? <View style={S.previewBlockSpacer} /> : null}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={{ height: 110 }} />
          </ScrollView>

          <View style={S.previewBottom}>
            <Pressable onPress={startWorkout} style={S.startBtn}>
              <Text style={S.startBtnText}>Start Workout</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView style={S.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={S.page}>
            <ScrollView
              ref={scrollRef as any}
              style={[S.scroll, Platform.OS === "web" ? S.scrollWeb : null]}
              contentContainerStyle={S.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              onScrollBeginDrag={() => {
                closeOpenRow();
                Keyboard.dismiss();
              }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <ScreenHeader variant="page" title={workoutTitle} subtitle="In progress" after="none" />

              <View style={S.header}>
                <Text style={S.setsLine}>
                  {completedSets} of {totalSets} sets completed
                </Text>

                <View style={S.progressTrack}>
                  <View style={[S.progressFill, { width: `${pct}%` }]} />
                </View>
              </View>

              {/* FULL BLEED EXERCISE LIST */}
              <View style={S.exerciseList}>
                {strengthBlocks.map((block, blockIndex) => (
                  <View key={block.id} style={S.groupWrap}>
                    <View style={[S.groupRail, groupAccentStyle(block)]} />
                    <View style={S.groupSurface} />

                    <View style={S.blockHeader}>
                      <Text style={S.blockKicker}>{blockKickerFor(block)}</Text>
                      <View style={S.blockTitleRow}>
                        <Text style={S.blockTitle}>{block.title ?? blockKickerFor(block)}</Text>
                        <Text style={S.blockMeta}>{blockMetaFor(block)}</Text>
                      </View>
                    </View>

                    {block.exerciseIds.map((exId, idx) => {
                      const ex = exerciseById[exId];
                      if (!ex) return null;

                      const blockTag = tagFor(block, idx);
                      const grouped = isGroupedBlock(block);

                      return (
                        <View key={ex.id}>
                          <View style={S.card}>
                            {/* Header row */}
                            <View style={S.exerciseHeader}>
                              <Image source={{ uri: ex.image }} style={S.thumb} />
                              <View style={S.exerciseText}>
                                <View style={S.titleRow}>
                                  {blockTag ? (
                                    <View style={S.blockTag}>
                                      <Text style={S.blockTagText}>{blockTag}</Text>
                                    </View>
                                  ) : null}
                                  <Text style={S.exerciseTitle} numberOfLines={2}>
                                    {ex.name}
                                  </Text>
                                </View>

                                <Text style={S.exerciseSub}>Tempo: {ex.tempo}</Text>
                              </View>

                              <Pressable style={S.menuBtn} onPress={() => openMenu(ex.id)}>
                                <MoreVertical size={18} color={Colors.text} />
                              </Pressable>
                            </View>

                            {/* Column labels */}
                            <View style={S.cols}>
                              <Text style={[S.colLabel, { width: 40 }]}>SET</Text>
                              <Text style={S.colLabel}>{ex.unitLabel}</Text>
                              <Text style={S.colLabel}>REPS</Text>
                              <Text style={S.colLabel}>REST</Text>
                              <Text style={[S.colLabel, { width: 44, textAlign: "center" }]}>✓</Text>
                            </View>

                            {/* Sets */}
                            {ex.sets.map((s, i) => {
                              const swipeKey = `${ex.id}:${s.id}`;
                              const isActive = !!activeCursor && activeCursor.exId === ex.id && activeCursor.setIndex === i;
                              const isCompleted = !!s.done;

                              return (
                                <Swipeable
                                  key={s.id}
                                  overshootRight={false}
                                  rightThreshold={28}
                                  friction={2}
                                  onSwipeableWillOpen={async () => {
                                    if (openRowKeyRef.current && openRowKeyRef.current !== swipeKey) {
                                      rowRefs.current[openRowKeyRef.current]?.close();
                                    }
                                    openRowKeyRef.current = swipeKey;
                                    if (Platform.OS !== "web") await Haptics.selectionAsync();
                                  }}
                                  onSwipeableClose={() => {
                                    if (openRowKeyRef.current === swipeKey) openRowKeyRef.current = null;
                                  }}
                                  renderRightActions={() => (
                                    <View style={S.swipeBg}>
                                      <Pressable onPress={() => deleteSet(ex.id, s.id)} style={S.deletePill}>
                                        <Text style={S.deleteText}>Delete</Text>
                                      </Pressable>
                                    </View>
                                  )}
                                  ref={(ref) => {
                                    rowRefs.current[swipeKey] = ref;
                                  }}
                                >
                                  <View
                                    ref={(ref) => {
                                      rowViewRefs.current[rowKeyFor(ex.id, i)] = ref;
                                    }}
                                    style={[S.row, S.rowBottomBorder, isCompleted && S.rowCompleted, isActive && S.rowActive]}
                                  >
                                    {isActive ? <View style={S.rowActiveBar} /> : null}

                                    <Text style={[S.setIndex, isActive && S.setIndexActive]}>{i + 1}</Text>

                                    {(["weight", "reps", "rest"] as const).map((field) => (
                                      <View key={field} style={[S.cell, isCompleted && S.cellCompleted, isActive && S.cellActive]}>
                                        <TextInput
                                          value={(s[field] ?? "") as string}
                                          onFocus={() => {
                                            closeOpenRow();
                                            adoptScopeFromExercise(ex.id);
                                            setActiveCursor({ exId: ex.id, setIndex: i });

                                            const b = blockByExerciseId[ex.id];
                                            if (b && grouped) {
                                              const resume = blockResumeRef.current[b.id];
                                              if (
                                                resume &&
                                                (!activeCursor ||
                                                  b.id !== (focusScope?.type === "block" ? focusScope.blockId : ""))
                                              ) {
                                                setActiveCursor(resume);
                                                requestAnimationFrame(() => scrollToCursor(resume));
                                              }
                                            }
                                          }}
                                          onChangeText={(t) =>
                                            updateSet(ex.id, s.id, { [field]: t.replace(/[^\d.]/g, "") } as any)
                                          }
                                          keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                                          inputMode="numeric"
                                          style={S.input}
                                          placeholder="—"
                                          placeholderTextColor="rgba(0,0,0,0.28)"
                                          returnKeyType="done"
                                          blurOnSubmit={false}
                                          onSubmitEditing={undefined}
                                          autoCorrect={false}
                                          autoComplete="off"
                                          {...(iosAccessoryProps as any)} // ✅ REQUIRED: attach accessory to EVERY input
                                        />
                                      </View>
                                    ))}

                                    <Pressable onPress={() => toggleSetDone(ex.id, s.id)} style={[S.checkBtn, s.done && S.checkBtnOn]}>
                                      {s.done && <Check size={16} color="#FFF" />}
                                    </Pressable>
                                  </View>
                                </Swipeable>
                              );
                            })}

                            <View style={S.cardActions}>
                              <Pressable onPress={() => openHistory(ex.id)} style={S.ghostBtn}>
                                <Text style={S.ghostText}>Exercise History</Text>
                              </Pressable>

                              <Pressable
                                onPress={() => {
                                  adoptScopeFromExercise(ex.id);

                                  if (grouped) {
                                    const restDefault = block.type === "circuit" ? "60" : "90";
                                    addSetToExercises(block.exerciseIds, restDefault);
                                  } else {
                                    addSetSingle(ex.id);
                                  }
                                }}
                                style={S.ghostBtn}
                              >
                                <Text style={S.ghostText}>{grouped ? "Add set to group" : "Add Set"}</Text>
                              </Pressable>
                            </View>
                          </View>

                          {blockIndex < blocks.length - 1 || idx < block.exerciseIds.length - 1 ? (
                            <>
                              <View style={S.exerciseSeparator} />
                              <View style={S.exerciseGap} />
                            </>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>

              <View style={S.finishSectionWrap}>
                <View style={S.finishSection}>
                  <Pressable onPress={openFinish} style={S.finishBtn} accessibilityRole="button">
                    <Text style={S.finishBtnText}>Complete Workout</Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            {/* ✅ Floating timer pill/button (HIDE while keyboard is active) */}
            {!kbVisible && (
              <View
                pointerEvents="box-none"
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: 18,
                }}
              >
                <Pressable
                  onPress={openTimer}
                  style={({ pressed }) => [
                    {
                      height: 52,
                      paddingHorizontal: 16,
                      borderRadius: 999,
                      backgroundColor: Colors.text,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 10,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.18,
                      shadowRadius: 14,
                    },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={{ color: Colors.surface, fontWeight: "900", fontSize: 16, letterSpacing: -0.2 }}>
                    Timer
                  </Text>

                  {manualTimer ? (
                    <Text style={{ color: "rgba(255,255,255,0.92)", fontWeight: "900", fontSize: 16, letterSpacing: -0.2 }}>
                      {formatMMSS(manualTimer.secondsLeft)}
                    </Text>
                  ) : null}
                </Pressable>
              </View>
            )}

            {/* ✅ iOS InputAccessoryView rendered ONCE (always mounted on iOS) */}
            {Platform.OS === "ios" && (
              <InputAccessoryView nativeID={IOS_ACCESSORY_ID}>
                <View
                  style={{
                    backgroundColor: "rgba(245,245,245,0.92)",
                    borderTopWidth: 1,
                    borderTopColor: "rgba(0,0,0,0.08)",
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <Pressable
                    onPress={openTimer}
                    style={({ pressed }) => [
                      {
                        height: 40,
                        paddingHorizontal: 16,
                        borderRadius: 999,
                        backgroundColor: "rgba(0,0,0,0.06)",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      pressed && { opacity: 0.88 },
                    ]}
                  >
                    <Text style={{ color: "#111", fontWeight: "900", fontSize: 15, letterSpacing: -0.2 }}>Timer</Text>
                  </Pressable>

                  <Pressable
                    onPress={accessoryDone}
                    style={({ pressed }) => [
                      {
                        height: 40,
                        paddingHorizontal: 18,
                        borderRadius: 999,
                        backgroundColor: Colors.text,
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      pressed && { opacity: 0.88 },
                    ]}
                  >
                    <Text style={{ color: Colors.surface, fontWeight: "900", fontSize: 15, letterSpacing: -0.2 }}>Done</Text>
                  </Pressable>
                </View>
              </InputAccessoryView>
            )}

            {/* TIMER MODAL (big time + sliders) */}
            <Modal visible={timerOpen} transparent animationType="fade" onRequestClose={closeTimer}>
              <Pressable
                style={[S.modalOverlay, { backgroundColor: "rgba(0,0,0,0.18)" }]}
                onPress={closeTimer}
              />
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: Colors.surface,
                  borderTopLeftRadius: 22,
                  borderTopRightRadius: 22,
                  paddingHorizontal: 18,
                  paddingTop: 14,
                  paddingBottom: 18,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -10 },
                  shadowOpacity: 0.12,
                  shadowRadius: 18,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ width: 40 }} />
                  <Text style={{ fontWeight: "900", fontSize: 16, letterSpacing: -0.2, color: "#111" }}>Timer</Text>
                  <Pressable onPress={closeTimer} style={{ width: 40, height: 40, alignItems: "flex-end", justifyContent: "center" }}>
                    <X size={18} color="#111" />
                  </Pressable>
                </View>

                <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 10 }}>
                  <Text
                    style={{
                      fontSize: 84,
                      fontWeight: "900",
                      letterSpacing: -2.2,
                      color: "#111",
                    }}
                  >
                    {formatMMSS(manualTimer ? manualTimer.secondsLeft : timerMinutes * 60 + timerSeconds)}
                  </Text>
                </View>

                {/* Sliders only when NOT running (so it feels stable) */}
                {!manualTimer?.running ? (
                  <View style={{ gap: 14, paddingTop: 6, paddingBottom: 10 }}>
                    <View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                        <Text style={{ color: "rgba(0,0,0,0.55)", fontWeight: "800" }}>Minutes</Text>
                        <Text style={{ color: "#111", fontWeight: "900" }}>{timerMinutes}</Text>
                      </View>
                      <Slider
                        minimumValue={0}
                        maximumValue={20}
                        step={1}
                        value={timerMinutes}
                        onValueChange={(v) => setTimerMinutes(clampInt(v as number, 0, 20))}
                        minimumTrackTintColor={Colors.text}
                        maximumTrackTintColor={"rgba(0,0,0,0.12)"}
                        thumbTintColor={Colors.text}
                      />
                    </View>

                    <View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                        <Text style={{ color: "rgba(0,0,0,0.55)", fontWeight: "800" }}>Seconds</Text>
                        <Text style={{ color: "#111", fontWeight: "900" }}>{timerSeconds}</Text>
                      </View>
                      <Slider
                        minimumValue={0}
                        maximumValue={59}
                        step={1}
                        value={timerSeconds}
                        onValueChange={(v) => setTimerSeconds(clampInt(v as number, 0, 59))}
                        minimumTrackTintColor={Colors.text}
                        maximumTrackTintColor={"rgba(0,0,0,0.12)"}
                        thumbTintColor={Colors.text}
                      />
                    </View>
                  </View>
                ) : null}

                <View style={{ alignItems: "center", paddingTop: 6 }}>
                  {!manualTimer ? (
                    <Pressable
                      onPress={startManualTimer}
                      style={({ pressed }) => [
                        {
                          width: 122,
                          height: 122,
                          borderRadius: 999,
                          backgroundColor: Colors.text,
                          alignItems: "center",
                          justifyContent: "center",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 10 },
                          shadowOpacity: 0.14,
                          shadowRadius: 14,
                        },
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      <Text style={{ color: Colors.surface, fontWeight: "900", fontSize: 16, letterSpacing: -0.2 }}>Start</Text>
                    </Pressable>
                  ) : manualTimer.running ? (
                    <Pressable
                      onPress={pauseManualTimer}
                      style={({ pressed }) => [
                        {
                          width: 122,
                          height: 122,
                          borderRadius: 999,
                          backgroundColor: Colors.text,
                          alignItems: "center",
                          justifyContent: "center",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 10 },
                          shadowOpacity: 0.14,
                          shadowRadius: 14,
                        },
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      <Text style={{ color: Colors.surface, fontWeight: "900", fontSize: 16, letterSpacing: -0.2 }}>Pause</Text>
                    </Pressable>
                  ) : (
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <Pressable
                        onPress={resumeManualTimer}
                        style={({ pressed }) => [
                          {
                            height: 52,
                            paddingHorizontal: 18,
                            borderRadius: 999,
                            backgroundColor: Colors.text,
                            alignItems: "center",
                            justifyContent: "center",
                          },
                          pressed && { opacity: 0.9 },
                        ]}
                      >
                        <Text style={{ color: Colors.surface, fontWeight: "900", fontSize: 16, letterSpacing: -0.2 }}>Resume</Text>
                      </Pressable>

                      <Pressable
                        onPress={resetManualTimer}
                        style={({ pressed }) => [
                          {
                            height: 52,
                            paddingHorizontal: 18,
                            borderRadius: 999,
                            backgroundColor: "rgba(0,0,0,0.06)",
                            alignItems: "center",
                            justifyContent: "center",
                          },
                          pressed && { opacity: 0.88 },
                        ]}
                      >
                        <Text style={{ color: "#111", fontWeight: "900", fontSize: 16, letterSpacing: -0.2 }}>Reset</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            </Modal>

            {/* EXIT CONFIRM */}
            <Modal visible={exitConfirmOpen} transparent animationType="fade" onRequestClose={() => setExitConfirmOpen(false)}>
              <Pressable style={S.modalOverlay} onPress={() => setExitConfirmOpen(false)} />
              <View style={S.modalSheet}>
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle}>Exit Workout?</Text>
                  <Pressable onPress={() => setExitConfirmOpen(false)} style={S.modalX}>
                    <X size={18} color="#111" />
                  </Pressable>
                </View>

                <Text style={S.modalBody}>Your progress will be lost. Are you sure you want to exit?</Text>

                <View style={S.modalActions}>
                  <Pressable onPress={() => setExitConfirmOpen(false)} style={S.modalGhost}>
                    <Text style={S.modalGhostText}>Keep Going</Text>
                  </Pressable>
                  <Pressable onPress={confirmExit} style={S.modalDanger}>
                    <Text style={S.modalDangerText}>Exit</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            {/* FINISH */}
            <Modal visible={finishOpen} transparent animationType="fade" onRequestClose={() => setFinishOpen(false)}>
              <Pressable style={S.modalOverlay} onPress={() => setFinishOpen(false)} />
              <View style={S.modalSheet}>
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle}>{isComplete ? "Finish workout?" : "Finish anyway?"}</Text>
                  <Pressable onPress={() => setFinishOpen(false)} style={S.modalX}>
                    <X size={18} color="#111" />
                  </Pressable>
                </View>

                <Text style={S.modalBody}>
                  {isComplete
                    ? "All sets are completed. Ready to finish?"
                    : "Some sets are incomplete. You can still finish and log partial progress."}
                </Text>

                <View style={S.modalActions}>
                  <Pressable onPress={() => setFinishOpen(false)} style={S.modalGhost}>
                    <Text style={S.modalGhostText}>Keep logging</Text>
                  </Pressable>
                  <Pressable onPress={confirmFinish} style={S.modalPrimary}>
                    <Text style={S.modalPrimaryText}>Finish</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            {/* MENU */}
            <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
              <Pressable style={S.modalOverlay} onPress={() => setMenuOpen(false)} />
              <View style={S.modalSheet}>
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle} numberOfLines={2}>
                    {currentExercise?.name}
                  </Text>
                  <Pressable onPress={() => setMenuOpen(false)} style={S.modalX}>
                    <X size={18} color="#111" />
                  </Pressable>
                </View>

                <View style={S.menuList}>
                  <Pressable
                    onPress={() => {
                      setMenuOpen(false);
                      setSwapOpen(true);
                    }}
                    style={S.menuItem}
                  >
                    <Repeat size={20} color="#111" />
                    <Text style={S.menuItemText}>Swap Exercise</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            {/* SWAP */}
            <Modal visible={swapOpen} transparent animationType="fade" onRequestClose={() => setSwapOpen(false)}>
              <Pressable style={S.modalOverlay} onPress={() => setSwapOpen(false)} />
              <View style={S.modalSheetLarge}>
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle}>Swap Exercise</Text>
                  <Pressable onPress={() => setSwapOpen(false)} style={S.modalX}>
                    <X size={18} color="#111" />
                  </Pressable>
                </View>

                <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
                  <View style={S.swapList}>
                    {menuExerciseId &&
                      exerciseAlternatives[menuExerciseId]?.map((alt) => (
                        <Pressable key={alt.id} onPress={() => swapExercise(alt)} style={S.swapItem}>
                          <Image source={{ uri: alt.image }} style={S.swapThumb} />
                          <View style={S.swapTextContainer}>
                            <Text style={S.swapName}>{alt.name}</Text>
                            <Text style={S.swapCategory}>
                              {alt.category === "gym" && "🏋️ Gym"}
                              {alt.category === "home" && "🏠 Home"}
                              {alt.category === "bodyweight" && "🤸 Bodyweight"}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                  </View>
                </ScrollView>
              </View>
            </Modal>

            {/* HISTORY */}
            <Modal visible={historyOpen} transparent animationType="fade" onRequestClose={() => setHistoryOpen(false)}>
              <Pressable style={S.modalOverlay} onPress={() => setHistoryOpen(false)} />
              <View style={S.modalSheetLarge}>
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle}>Exercise History</Text>
                  <Pressable onPress={() => setHistoryOpen(false)} style={S.modalX}>
                    <X size={18} color="#111" />
                  </Pressable>
                </View>

                {historyExerciseId && pr && (
                  <View style={S.prBanner}>
                    <Trophy size={16} color="#F4C84A" />
                    <Text style={S.prText}>
                      PR: {pr.weight} lbs × {pr.reps} reps
                    </Text>
                    <Text style={S.prDate}>({pr.date})</Text>
                  </View>
                )}

                <ScrollView
                  style={{ maxHeight: 420 }}
                  contentContainerStyle={{ paddingBottom: 12 }}
                  showsVerticalScrollIndicator={false}
                >
                  {(historyExerciseId ? historyByExerciseId[historyExerciseId] : [])?.length ? (
                    (historyByExerciseId[historyExerciseId as string] ?? []).map((session, index) => (
                      <View key={session.id}>
                        <View style={[S.historyCard, index > 0 && S.historyCardSpaced]}>
                          <View style={S.historyCardHeader}>
                            <Text style={S.historyDate}>{session.dateLabel}</Text>
                            <Pressable onPress={() => applySpecificSession(session.id)} style={S.useSessionBtn}>
                              <Text style={S.useSessionText}>Copy Sets</Text>
                            </Pressable>
                          </View>

                          <View style={S.historyTableHead}>
                            <Text style={[S.historyHead, { width: 40 }]}>SET</Text>
                            <Text style={S.historyHead}>W</Text>
                            <Text style={S.historyHead}>R</Text>
                            <Text style={S.historyHead}>REST</Text>
                            <Text style={[S.historyHead, { width: 42, textAlign: "center" }]}>✓</Text>
                          </View>

                          {session.sets.map((hs) => (
                            <View key={`${session.id}-${hs.set}`} style={S.historyRow}>
                              <Text style={[S.historyCellText, { width: 40 }]}>{hs.set}</Text>
                              <Text style={S.historyCellText}>{hs.weight}</Text>
                              <Text style={S.historyCellText}>{hs.reps}</Text>
                              <Text style={S.historyCellText}>{hs.rest}</Text>
                              <View style={[S.historyDot, hs.done && S.historyDotOn]}>
                                {hs.done && <Check size={14} color="#fff" />}
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={{ color: "#666", fontWeight: "700", marginTop: 12 }}>No history yet.</Text>
                  )}
                </ScrollView>

                <View style={S.modalActions}>
                  <Pressable onPress={addToCurrentExercise} style={S.modalPrimary}>
                    <Text style={S.modalPrimaryText}>Add to current exercise</Text>
                  </Pressable>
                  <Pressable onPress={() => setHistoryOpen(false)} style={S.modalGhost}>
                    <Text style={S.modalGhostText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
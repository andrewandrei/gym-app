// app/workout/index.tsx

import { ResizeMode, Video } from "expo-av";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { Check, Repeat, Trophy, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  InputAccessoryView,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Colors } from "@/styles/colors";
import { S } from "./workout.styles";

import type { SetRow as SetRowLocal } from "./SetRowItem";
import { WorkoutPlayer } from "./WorkoutPlayer";
import { WorkoutPreview, type Exercise, type ExerciseAlternative, type ExerciseHistorySession, type StrengthBlock } from "./WorkoutPreview";

/* ───────────────────────── iOS Done accessory (single source of truth) ───────────────────────── */

const IOS_ACCESSORY_ID = "workoutAccessoryDone";
const iosAccessoryProps: { inputAccessoryViewID: string } | {} =
  Platform.OS === "ios" ? { inputAccessoryViewID: IOS_ACCESSORY_ID } : {};

/* ───────────────────────── Types ───────────────────────── */

type UndoAction = {
  type: "delete";
  exId: string;
  setId: string;
  set: SetRowLocal;
  index: number;
};

export default function WorkoutLogScreen() {
  const workoutTitle = "Full Body — Foundation";
  const workoutStartTime = useRef(Date.now());

  const [isPreview, setIsPreview] = useState(true);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const [currentStreak, setCurrentStreak] = useState(7);
  const [totalWorkouts, setTotalWorkouts] = useState(42);

  /* ───────────────────────── Data (demo) ───────────────────────── */

  const initialExercises: Exercise[] = useMemo(
    () => [
      {
        id: "ex-1",
        name: "Rower (Easy Prime)",
        tempo: "—",
        image: "https://images.unsplash.com/photo-1517964603305-11c0f6f66012?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "REPS",
        sets: [{ id: "s1", weight: "", reps: "60", rest: "0:30", done: false }],
      },
      {
        id: "ex-2",
        name: "Barbell Back Squat (Controlled)",
        tempo: "3-0-1-0",
        image: "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
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
          { id: "s3", weight: "", reps: "8", rest: "1:30", done: false },
        ],
      },
      {
        id: "ex-3",
        name: "Romanian Deadlift",
        tempo: "3-1-1-0",
        image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        videoUrl: "https://www.youtube.com/watch?v=2SHsk9AzdjA",
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
          { id: "s2", weight: "", reps: "10", rest: "1:30", done: false },
          { id: "s3", weight: "", reps: "10", rest: "1:30", done: false },
        ],
      },
      {
        id: "ex-4",
        name: "Incline Dumbbell Press",
        tempo: "2-0-2-0",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
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
          { id: "s1", weight: "", reps: "10", rest: "1:15", done: false },
          { id: "s2", weight: "", reps: "10", rest: "1:15", done: false },
          { id: "s3", weight: "", reps: "10", rest: "1:15", done: false },
        ],
      },
      {
        id: "ex-5",
        name: "Chest-Supported Row",
        tempo: "2-1-2-0",
        image: "https://images.unsplash.com/photo-1599058917765-142b2a07f930?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "", reps: "12", rest: "1:15", done: false },
          { id: "s2", weight: "", reps: "12", rest: "1:15", done: false },
          { id: "s3", weight: "", reps: "12", rest: "1:15", done: false },
        ],
      },
      {
        id: "ex-6",
        name: "Lateral Raise",
        tempo: "2-0-2-0",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "", reps: "15", rest: "1:15", done: false },
          { id: "s2", weight: "", reps: "15", rest: "1:15", done: false },
          { id: "s3", weight: "", reps: "15", rest: "1:15", done: false },
        ],
      },
      {
        id: "ex-7",
        name: "Leg Press",
        tempo: "2-0-2-0",
        image: "https://images.unsplash.com/photo-1526401485004-2aa7f3d0bd19?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "", reps: "12", rest: "1:00", done: false },
          { id: "s2", weight: "", reps: "12", rest: "1:00", done: false },
          { id: "s3", weight: "", reps: "12", rest: "1:00", done: false },
        ],
      },
      {
        id: "ex-8",
        name: "Push-Up (Tempo)",
        tempo: "2-0-2-0",
        image: "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "REPS",
        sets: [
          { id: "s1", weight: "", reps: "12", rest: "1:00", done: false },
          { id: "s2", weight: "", reps: "12", rest: "1:00", done: false },
          { id: "s3", weight: "", reps: "12", rest: "1:00", done: false },
        ],
      },
      {
        id: "ex-9",
        name: "Dead Bug",
        tempo: "—",
        image: "https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "REPS",
        sets: [
          { id: "s1", weight: "", reps: "10", rest: "1:00", done: false },
          { id: "s2", weight: "", reps: "10", rest: "1:00", done: false },
          { id: "s3", weight: "", reps: "10", rest: "1:00", done: false },
        ],
      },
    ],
    [],
  );

  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);

  const exerciseById = useMemo(() => {
    const map: Record<string, Exercise> = {};
    exercises.forEach((e) => (map[e.id] = e));
    return map;
  }, [exercises]);

  const blocks: StrengthBlock[] = useMemo(
    () => [
      { id: "b0", type: "single", title: "Primer", exerciseIds: ["ex-1"] },
      { id: "b1", type: "superset", title: "Superset A", exerciseIds: ["ex-2", "ex-3"] },
      { id: "b2", type: "giant", title: "Giant Set B", exerciseIds: ["ex-4", "ex-5", "ex-6"] },
      { id: "b3", type: "circuit", title: "Circuit 1", rounds: 3, exerciseIds: ["ex-7", "ex-8", "ex-9"] },
    ],
    [],
  );

  const exerciseAlternatives: Record<string, ExerciseAlternative[]> = useMemo(
    () => ({
      "ex-2": [
        {
          id: "alt-1",
          name: "Hack Squat",
          category: "gym",
          image: "https://images.unsplash.com/photo-1526401485004-2aa7f3d0bd19?auto=format&fit=crop&w=600&q=70",
        },
        {
          id: "alt-2",
          name: "Goblet Squat",
          category: "home",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=70",
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
            { set: 1, weight: "185", reps: "8", rest: "1:30", done: true },
            { set: 2, weight: "185", reps: "8", rest: "1:30", done: true },
            { set: 3, weight: "175", reps: "8", rest: "1:30", done: true },
          ],
        },
      ],
    }),
    [],
  );

  /* ───────────────────────── Refs ───────────────────────── */

  const scrollRef = useRef<ScrollView | null>(null);
  const exerciseRefs = useRef<Record<string, View | null>>({});
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const swipeRefs = useRef<Record<string, any>>({});

  /* ───────────────────────── States ───────────────────────── */

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyExerciseId, setHistoryExerciseId] = useState<string | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuExerciseId, setMenuExerciseId] = useState<string | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);

  const [celebratingBlock, setCelebratingBlock] = useState<string | null>(null);
  const [activeSetKey, setActiveSetKey] = useState<string | null>(null);

  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [lastCelebratedPct, setLastCelebratedPct] = useState(0);

  // Notes
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteExId, setNoteExId] = useState<string | null>(null);
  const [noteSetId, setNoteSetId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // Video
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoExId, setVideoExId] = useState<string | null>(null);

  // Workout Duration
  const [workoutDuration, setWorkoutDuration] = useState(0);

  // Rest Timer (manual only)
  const [restTimer, setRestTimer] = useState<{ seconds: number; total: number } | null>(null);
  const [customTimeOpen, setCustomTimeOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const [customSeconds, setCustomSeconds] = useState("");

  // Keyboard visibility
  const [kbVisible, setKbVisible] = useState(false);

  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const subShow = Keyboard.addListener(showEvt as any, () => setKbVisible(true));
    const subHide = Keyboard.addListener(hideEvt as any, () => setKbVisible(false));

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  /* ───────────────────────── Time Helpers ───────────────────────── */

  const timeToSeconds = (time: string): number => {
    const parts = time.split(":");
    if (parts.length === 2) {
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      return mins * 60 + secs;
    }
    return parseInt(time) || 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /* ───────────────────────── Workout Duration Timer ───────────────────────── */

  useEffect(() => {
    if (isPreview) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - workoutStartTime.current) / 1000);
      setWorkoutDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPreview]);

  /* ───────────────────────── Background Notifications ───────────────────────── */

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === "web") return;
      try {
        await Notifications.requestPermissionsAsync();
      } catch {
        // silent
      }
    };

    requestPermissions();

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch {
      // silent
    }
  }, []);

  /* ───────────────────────── Auto-scroll Helpers ───────────────────────── */

  const isGroupedBlock = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    return !!block && (block.type === "superset" || block.type === "giant" || block.type === "circuit");
  };

  const getBlockForExercise = (exId: string) => {
    return blocks.find((b) => b.exerciseIds.includes(exId));
  };

  const getNextSetInGroup = (exId: string, currentSetIndex: number) => {
    const block = getBlockForExercise(exId);
    if (!block || !isGroupedBlock(block.id)) return null;

    const currentExIndex = block.exerciseIds.indexOf(exId);

    for (let i = 1; i < block.exerciseIds.length; i++) {
      const nextExIndex = (currentExIndex + i) % block.exerciseIds.length;
      const nextExId = block.exerciseIds[nextExIndex];
      const nextEx = exercises.find((e) => e.id === nextExId);

      if (nextEx && nextEx.sets[currentSetIndex] && !nextEx.sets[currentSetIndex].done) {
        return { exId: nextExId, setIndex: currentSetIndex };
      }
    }

    const nextSetIndex = currentSetIndex + 1;
    const firstExId = block.exerciseIds[0];
    const firstEx = exercises.find((e) => e.id === firstExId);

    if (firstEx && firstEx.sets[nextSetIndex] && !firstEx.sets[nextSetIndex].done) {
      return { exId: firstExId, setIndex: nextSetIndex };
    }

    return null;
  };

  const getNextIncompleteSet = (exId: string, currentSetIndex: number) => {
    const block = getBlockForExercise(exId);

    if (block && isGroupedBlock(block.id)) {
      return getNextSetInGroup(exId, currentSetIndex);
    }

    const ex = exercises.find((e) => e.id === exId);
    if (!ex) return null;

    for (let i = currentSetIndex + 1; i < ex.sets.length; i++) {
      if (!ex.sets[i].done) return { exId, setIndex: i };
    }

    const currentBlockIndex = blocks.findIndex((b) => b.exerciseIds.includes(exId));
    for (let i = currentBlockIndex + 1; i < blocks.length; i++) {
      for (const nextExId of blocks[i].exerciseIds) {
        const nextEx = exercises.find((e) => e.id === nextExId);
        if (nextEx && nextEx.sets[0] && !nextEx.sets[0].done) {
          return { exId: nextExId, setIndex: 0 };
        }
      }
    }

    return null;
  };

  const isBlockComplete = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return false;

    return block.exerciseIds.every((exId) => {
      const ex = exercises.find((e) => e.id === exId);
      return !!ex && ex.sets.every((s) => s.done);
    });
  };

  const scrollToSet = (exId: string, setIndex: number) => {
    const exerciseRef = exerciseRefs.current[exId];
    if (!exerciseRef || !scrollRef.current) return;

    exerciseRef.measureLayout(
      scrollRef.current as any,
      (_x: number, y: number) => {
        const setRowOffset = setIndex * 76;
        scrollRef.current?.scrollTo({
          y: Math.max(0, y + setRowOffset - 150),
          animated: true,
        });
      },
      () => {},
    );
  };

  /* ───────────────────────── Rest Timer (manual only) ───────────────────────── */

  const startRestTimer = async (restTime: string) => {
    const seconds = timeToSeconds(restTime);
    if (seconds <= 0) return;

    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestTimer({ seconds, total: seconds });

    if (Platform.OS !== "web") {
      try {
        await Notifications.scheduleNotificationAsync({
          content: { title: "Rest Complete! 💪", body: "Time for your next set", sound: true },
          trigger: { seconds },
        });
      } catch {
        // silent
      }
    }

    restIntervalRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (!prev || prev.seconds <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return null;
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);
  };

  const skipRestTimer = async () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestTimer(null);

    if (Platform.OS !== "web") {
      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
      } catch {
        // silent
      }
    }
  };

  const add15Seconds = () => {
    setRestTimer((prev) => {
      if (!prev) return null;
      return { ...prev, seconds: prev.seconds + 15, total: prev.total + 15 };
    });
  };

  const startCustomTimer = async () => {
    const mins = parseInt(customMinutes) || 0;
    const secs = parseInt(customSeconds) || 0;
    const totalSeconds = mins * 60 + secs;

    if (totalSeconds <= 0) return;

    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestTimer({ seconds: totalSeconds, total: totalSeconds });

    if (Platform.OS !== "web") {
      try {
        await Notifications.scheduleNotificationAsync({
          content: { title: "Rest Complete! 💪", body: "Time for your next set", sound: true },
          trigger: { seconds: totalSeconds },
        });
      } catch {
        // silent
      }
    }

    restIntervalRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (!prev || prev.seconds <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return null;
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);

    setCustomTimeOpen(false);
    setCustomMinutes("");
    setCustomSeconds("");
  };

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      if (Platform.OS !== "web") {
        Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
      }
    };
  }, []);

  /* ───────────────────────── Milestone Celebrations ───────────────────────── */

  const checkMilestone = (pctLocal: number) => {
    const milestones = [25, 50, 75];
    for (const milestone of milestones) {
      if (pctLocal >= milestone && lastCelebratedPct < milestone) {
        setLastCelebratedPct(milestone);
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      }
    }
  };

  /* ───────────────────────── Social Sharing ───────────────────────── */

  const shareWorkout = async () => {
    const totalSetsLocal = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSetsLocal = exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0);

    const message =
      `💪 Just crushed ${workoutTitle}!\n\n` +
      `✅ ${completedSetsLocal}/${totalSetsLocal} sets\n` +
      `⏱️ ${formatDuration(workoutDuration)}\n` +
      `🔥 ${currentStreak} day streak!\n\n` +
      `#AndreiAndreiFit`;

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(`data:text/plain,${encodeURIComponent(message)}`);
      }
    } catch {
      // silent
    }
  };

  /* ───────────────────────── Swipe close helper ───────────────────────── */

  const closeAllSwipesExcept = useCallback((keepKey: string) => {
    const map = swipeRefs.current;
    Object.keys(map).forEach((k) => {
      if (k !== keepKey) map[k]?.close?.();
    });
  }, []);

  /* ───────────────────────── Actions ───────────────────────── */

  const startWorkout = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    workoutStartTime.current = Date.now();
    setIsPreview(false);

    const firstIncomplete = getNextIncompleteSet("ex-1", -1);
    if (firstIncomplete) setActiveSetKey(`${firstIncomplete.exId}:${firstIncomplete.setIndex}`);
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
    return Math.round((totalSetsCount * 120) / 60);
  }, [exercises]);

  const updateSet = useCallback((exId: string, setId: string, patch: Partial<SetRowLocal>) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId ? ex : { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) },
      ),
    );
  }, []);

  const openNoteModal = useCallback(async (exId: string, setId: string) => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setExercises((prev) => {
      const ex = prev.find((e) => e.id === exId);
      const set = ex?.sets.find((s) => s.id === setId);

      setNoteExId(exId);
      setNoteSetId(setId);
      setNoteText(set?.note || "");
      setNoteModalOpen(true);

      return prev;
    });
  }, []);

  const saveNote = () => {
    if (noteExId && noteSetId) updateSet(noteExId, noteSetId, { note: noteText.trim() });
    setNoteModalOpen(false);
    setNoteText("");
  };

  const toggleSetDone = useCallback(
    async (exId: string, setId: string) => {
      if (Platform.OS !== "web") await Haptics.selectionAsync();
      Keyboard.dismiss();

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
        // ✅ REMOVED: no auto-start rest timer

        const block = getBlockForExercise(exId);
        const nextSet = getNextIncompleteSet(exId, setIndex);

        if (nextSet) {
          setActiveSetKey(`${nextSet.exId}:${nextSet.setIndex}`);
          setTimeout(() => scrollToSet(nextSet.exId, nextSet.setIndex), 250);
        } else if (block && isBlockComplete(block.id)) {
          if (Platform.OS !== "web") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setCelebratingBlock(block.id);
          setTimeout(() => setCelebratingBlock(null), 1200);
        }

        const totalSetsLocal = exercises.reduce((sum, e) => sum + e.sets.length, 0);
        const completedSetsLocal = exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.done).length, 0) + 1;
        const pctLocal = totalSetsLocal ? Math.round((completedSetsLocal / totalSetsLocal) * 100) : 0;
        checkMilestone(pctLocal);
      }
    },
    [exercises, lastCelebratedPct],
  );

  const deleteSet = useCallback(
    async (exId: string, setId: string) => {
      if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const ex = exercises.find((e) => e.id === exId);
      const set = ex?.sets.find((s) => s.id === setId);
      const index = ex?.sets.findIndex((s) => s.id === setId);

      if (!set || index === undefined) return;

      setUndoAction({ type: "delete", exId, setId, set, index });

      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => setUndoAction(null), 4000);

      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id !== exId ? exercise : { ...exercise, sets: exercise.sets.filter((s) => s.id !== setId) },
        ),
      );
    },
    [exercises],
  );

  const undoDelete = async () => {
    if (!undoAction || undoAction.type !== "delete") return;

    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { exId, set, index } = undoAction;

    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exId) return ex;
        const newSets = [...ex.sets];
        newSets.splice(index, 0, set);
        return { ...ex, sets: newSets };
      }),
    );

    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    setUndoAction(null);
  };

  const addSet = async (exId: string) => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();

    const ex = exercises.find((e) => e.id === exId);
    if (!ex) return;

    const lastSet = ex.sets[ex.sets.length - 1];

    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id !== exId
          ? exercise
          : {
              ...exercise,
              sets: [
                ...exercise.sets,
                {
                  id: `s${exercise.sets.length + 1}-${Date.now()}`,
                  weight: lastSet?.weight || "",
                  reps: lastSet?.reps || "",
                  rest: lastSet?.rest || "1:30",
                  done: false,
                },
              ],
            },
      ),
    );
  };

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0);
  const pct = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;

  const openHistory = async (exId: string) => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    setHistoryExerciseId(exId);
    setHistoryOpen(true);
  };

  const openMenu = async (exId: string) => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    setMenuExerciseId(exId);
    setMenuOpen(true);
  };

  const swapExercise = async (alternative: ExerciseAlternative) => {
    if (!menuExerciseId) return;
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== menuExerciseId
          ? ex
          : {
              ...ex,
              name: alternative.name,
              image: alternative.image,
              sets: ex.sets.map((s) => ({ ...s, weight: "", reps: "", done: false })),
            },
      ),
    );

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

  const currentExercise = exercises.find((ex) => ex.id === menuExerciseId);

  /* ───────────────────────── Render helpers ───────────────────────── */

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

  /* ───────────────────────── Finish summary (✅ ONLY completed exercises + sets) ───────────────────────── */

  const buildFinishSummary = useCallback(() => {
    const completedExercises = exercises
      .map((ex) => {
        const completedSetsOnly = ex.sets
          .map((s, idx) => ({
            set: idx + 1,
            weight: s.weight ?? "",
            reps: s.reps ?? "",
            rest: s.rest ?? "",
            done: !!s.done,
          }))
          .filter((x) => x.done); // ✅ only completed sets

        if (completedSetsOnly.length === 0) return null; // ✅ ignore exercises with 0 completed sets

        return {
          id: ex.id,
          name: ex.name,
          completedSets: completedSetsOnly.length,
          sets: completedSetsOnly,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      name: string;
      completedSets: number;
      sets: { set: number; weight: string; reps: string; rest: string; done: boolean }[];
    }>;

    const totalCompletedSets = completedExercises.reduce((sum, ex) => sum + ex.completedSets, 0);

    return {
      workoutTitle,
      durationSec: workoutDuration,
      totals: { completedSets: totalCompletedSets },
      exercises: completedExercises,
    };
  }, [exercises, workoutDuration, workoutTitle]);

  const openFinish = useCallback(async () => {
    Keyboard.dismiss();
    if (Platform.OS !== "web") await Haptics.selectionAsync();

    const summary = buildFinishSummary();

    router.push({
      pathname: "/workout/finish",
      params: { summary: encodeURIComponent(JSON.stringify(summary)) },
    });
  }, [buildFinishSummary]);

  /* ───────────────────────── Video trigger (thumbnail press) ───────────────────────── */

  const onPressThumbnail = useCallback(
    (exId: string) => {
      const ex = exerciseById[exId];
      if (!ex?.videoUrl) return;
      setVideoExId(exId);
      setVideoModalOpen(true);
    },
    [exerciseById],
  );

  /* ───────────────────────── UI ───────────────────────── */

  return (
    <SafeAreaView style={S.safe}>
      {isPreview ? (
        <WorkoutPreview
          workoutTitle={workoutTitle}
          exercises={exercises}
          blocks={blocks}
          exerciseById={exerciseById}
          estimatedTime={estimatedTime}
          totalSets={totalSets}
          currentStreak={currentStreak}
          totalWorkouts={totalWorkouts}
          onStartWorkout={startWorkout}
          onBack={handleBack}
          groupAccentStyle={groupAccentStyle}
          blockKickerFor={blockKickerFor}
          blockMetaFor={blockMetaFor}
          tagFor={tagFor}
        />
      ) : (
        <WorkoutPlayer
          workoutTitle={workoutTitle}
          exercises={exercises}
          blocks={blocks}
          exerciseById={exerciseById}
          estimatedTime={estimatedTime}
          totalSets={totalSets}
          completedSets={completedSets}
          pct={pct}
          kbVisible={kbVisible}
          restTimer={restTimer}
          scrollRef={scrollRef as any}
          exerciseRefs={exerciseRefs}
          swipeRefs={swipeRefs}
          celebratingBlock={celebratingBlock}
          activeSetKey={activeSetKey}
          iosAccessoryProps={iosAccessoryProps}
          formatDuration={formatDuration}
          shareWorkout={shareWorkout}
          openMenu={openMenu}
          openHistory={openHistory}
          addSet={addSet}
          openFinish={openFinish}
          setCustomTimeOpen={setCustomTimeOpen}
          updateSet={updateSet}
          deleteSet={deleteSet}
          openNoteModal={openNoteModal}
          toggleSetDone={toggleSetDone}
          setActiveSetKey={setActiveSetKey}
          closeAllSwipesExcept={closeAllSwipesExcept}
          groupAccentStyle={groupAccentStyle}
          blockKickerFor={blockKickerFor}
          blockMetaFor={blockMetaFor}
          tagFor={tagFor}
          workoutDuration={workoutDuration}
          onPressThumbnail={onPressThumbnail}
        />
      )}

      {/* iOS InputAccessoryView: single source of truth */}
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={IOS_ACCESSORY_ID}>
          <View style={S.accessory}>
            <Pressable
              onPress={async () => {
                try {
                  await Haptics.selectionAsync();
                } catch {}
                Keyboard.dismiss();
              }}
              style={({ pressed }) => [S.accessoryBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={S.accessoryText}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}

      {/* Rest timer overlay (manual only) */}
      {restTimer && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 200,
            backgroundColor: Colors.text,
            paddingTop: 20,
            paddingBottom: 30,
            paddingHorizontal: 20,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 20,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "900",
              color: "rgba(255,255,255,0.6)",
              letterSpacing: 1.5,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            REST TIMER
          </Text>

          <Text
            style={{
              fontSize: 72,
              fontWeight: "900",
              color: Colors.surface,
              letterSpacing: -2,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {formatTime(restTimer.seconds)}
          </Text>

          <View
            style={{
              height: 8,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: `${(restTimer.seconds / restTimer.total) * 100}%`,
                height: "100%",
                backgroundColor: (Colors as any).premium ?? "#F4C84A",
                borderRadius: 4,
              }}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={add15Seconds}
              style={({ pressed }) => [
                {
                  flex: 1,
                  height: 54,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={{ fontSize: 16, fontWeight: "900", color: Colors.surface }}>+ 15 seconds</Text>
            </Pressable>

            <Pressable
              onPress={skipRestTimer}
              style={({ pressed }) => [
                {
                  flex: 1,
                  height: 54,
                  backgroundColor: (Colors as any).premium ?? "#F4C84A",
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                },
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={{ fontSize: 16, fontWeight: "900", color: Colors.text }}>Skip Rest</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Undo toast */}
      {undoAction && !restTimer && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 16,
            right: 16,
            zIndex: 199,
            backgroundColor: Colors.text,
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
          <Text style={{ color: Colors.surface, fontWeight: "800", fontSize: 15 }}>Set deleted</Text>
          <Pressable
            onPress={undoDelete}
            style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: (Colors as any).premium ?? "#F4C84A", borderRadius: 10 }}
          >
            <Text style={{ color: Colors.text, fontWeight: "900", fontSize: 14 }}>UNDO</Text>
          </Pressable>
        </View>
      )}

      {/* ───────────────────────── MODALS ───────────────────────── */}

      {/* Exit confirm */}
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

      {/* Exercise menu */}
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

      {/* Swap exercise */}
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

      {/* History */}
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
              <Trophy size={16} color={(Colors as any).premium ?? "#F4C84A"} />
              <Text style={S.prText}>
                PR: {pr.weight} lbs × {pr.reps} reps
              </Text>
              <Text style={S.prDate}>({pr.date})</Text>
            </View>
          )}

          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
            {(historyExerciseId ? historyByExerciseId[historyExerciseId] : [])?.length ? (
              (historyByExerciseId[historyExerciseId as string] ?? []).map((session, index) => (
                <View key={session.id}>
                  <View style={[S.historyCard, index > 0 && S.historyCardSpaced]}>
                    <View style={S.historyCardHeader}>
                      <Text style={S.historyDate}>{session.dateLabel}</Text>
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
                        <View style={[S.historyDot, hs.done && S.historyDotOn]}>{hs.done ? <Check size={14} color="#fff" /> : null}</View>
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
            <Pressable onPress={() => setHistoryOpen(false)} style={S.modalGhost}>
              <Text style={S.modalGhostText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Custom timer modal */}
      <Modal visible={customTimeOpen} transparent animationType="fade" onRequestClose={() => setCustomTimeOpen(false)}>
        <Pressable style={S.modalOverlay} onPress={() => setCustomTimeOpen(false)} />
        <View style={S.modalSheet}>
          <View style={S.modalHeader}>
            <Text style={S.modalTitle}>Rest Timer</Text>
            <Pressable onPress={() => setCustomTimeOpen(false)} style={S.modalX}>
              <X size={18} color="#111" />
            </Pressable>
          </View>

          <View style={{ marginTop: 16 }}>
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.04)",
                borderRadius: 16,
                padding: 20,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "900", color: "rgba(0,0,0,0.4)", marginBottom: 8 }}>SET DURATION</Text>
              <Text style={{ fontSize: 48, fontWeight: "900", color: Colors.text, letterSpacing: 2 }}>
                {customMinutes || "0"}:{(customSeconds || "00").padStart(2, "0")}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: "900", color: "rgba(0,0,0,0.4)", marginBottom: 8, textAlign: "center" }}>
                  MINUTES
                </Text>
                <ScrollView
                  style={{ height: 150, backgroundColor: "rgba(0,0,0,0.02)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" }}
                  showsVerticalScrollIndicator={false}
                >
                  {Array.from({ length: 11 }, (_, i) => i).map((min) => (
                    <Pressable
                      key={min}
                      onPress={() => setCustomMinutes(min.toString())}
                      style={{
                        paddingVertical: 16,
                        alignItems: "center",
                        backgroundColor: customMinutes === min.toString() ? ((Colors as any).premium ?? "#F4C84A") : "transparent",
                        borderRadius: 8,
                        marginHorizontal: 4,
                        marginVertical: 2,
                      }}
                    >
                      <Text style={{ fontSize: 24, fontWeight: "900", color: customMinutes === min.toString() ? Colors.text : "rgba(0,0,0,0.3)" }}>
                        {min}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: "900", color: "rgba(0,0,0,0.4)", marginBottom: 8, textAlign: "center" }}>
                  SECONDS
                </Text>
                <ScrollView
                  style={{ height: 150, backgroundColor: "rgba(0,0,0,0.02)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" }}
                  showsVerticalScrollIndicator={false}
                >
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((sec) => (
                    <Pressable
                      key={sec}
                      onPress={() => setCustomSeconds(sec.toString())}
                      style={{
                        paddingVertical: 16,
                        alignItems: "center",
                        backgroundColor: customSeconds === sec.toString() ? ((Colors as any).premium ?? "#F4C84A") : "transparent",
                        borderRadius: 8,
                        marginHorizontal: 4,
                        marginVertical: 2,
                      }}
                    >
                      <Text style={{ fontSize: 24, fontWeight: "900", color: customSeconds === sec.toString() ? Colors.text : "rgba(0,0,0,0.3)" }}>
                        {sec.toString().padStart(2, "0")}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={{ gap: 8, marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: "900", color: "rgba(0,0,0,0.4)", marginBottom: 4 }}>QUICK SELECT</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[
                  { label: "30s", m: "0", s: "30" },
                  { label: "1m", m: "1", s: "0" },
                  { label: "1:30", m: "1", s: "30" },
                  { label: "2m", m: "2", s: "0" },
                ].map((preset) => (
                  <Pressable
                    key={preset.label}
                    onPress={() => {
                      setCustomMinutes(preset.m);
                      setCustomSeconds(preset.s);
                    }}
                    style={{ flex: 1, paddingVertical: 12, backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 10, alignItems: "center" }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "900", color: Colors.text }}>{preset.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={startCustomTimer}
              style={{ height: 56, borderRadius: 14, backgroundColor: Colors.text, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 17, fontWeight: "900", color: Colors.surface }}>START TIMER</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Note modal */}
      <Modal visible={noteModalOpen} transparent animationType="fade" onRequestClose={() => setNoteModalOpen(false)}>
        <Pressable style={S.modalOverlay} onPress={() => setNoteModalOpen(false)} />
        <View style={S.modalSheet}>
          <View style={S.modalHeader}>
            <Text style={S.modalTitle}>Set Note</Text>
            <Pressable onPress={() => setNoteModalOpen(false)} style={S.modalX}>
              <X size={18} color="#111" />
            </Pressable>
          </View>

          <TextInput
            {...(iosAccessoryProps as any)}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="e.g., Felt heavy, Perfect form, Lower back pain..."
            placeholderTextColor="rgba(0,0,0,0.3)"
            multiline
            style={{
              marginTop: 16,
              height: 100,
              borderWidth: 2,
              borderColor: "rgba(0,0,0,0.12)",
              borderRadius: 12,
              padding: 12,
              fontSize: 15,
              fontWeight: "600",
              color: Colors.text,
              textAlignVertical: "top",
            }}
          />

          <View style={[S.modalActions, { marginTop: 20 }]}>
            <Pressable onPress={() => setNoteModalOpen(false)} style={S.modalGhost}>
              <Text style={S.modalGhostText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={saveNote} style={S.modalPrimary}>
              <Text style={S.modalPrimaryText}>Save Note</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Video modal */}
      <Modal visible={videoModalOpen} animationType="slide" onRequestClose={() => setVideoModalOpen(false)} presentationStyle="fullScreen">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <SafeAreaView style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 }}>
            <View style={{ padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#FFF", flex: 1, paddingRight: 16 }}>
                {videoExId ? exerciseById[videoExId]?.name : ""}
              </Text>
              <Pressable
                onPress={() => setVideoModalOpen(false)}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" }}
              >
                <X size={20} color="#FFF" />
              </Pressable>
            </View>
          </SafeAreaView>

          <View style={{ flex: 1, justifyContent: "center" }}>
            {videoExId && exerciseById[videoExId]?.videoUrl ? (
              <Video
                source={{ uri: exerciseById[videoExId].videoUrl }}
                style={{ width: "100%", height: "100%" }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
              />
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>No video available</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
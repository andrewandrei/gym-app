// app/workout/index.tsx

import { ResizeMode, Video } from "expo-av";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { Check, Repeat, Trophy, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
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

import { useAppTheme } from "@/app/_providers/theme";
import type { SetRow as SetRowLocal } from "./SetRowItem";
import { getWorkoutConfig } from "./workout.data";
import { createWorkoutStyles } from "./workout.styles";
import {
  hasMeaningfulProgress,
  loadWorkoutDraft,
  saveWorkoutDraft,
  type WorkoutDraft,
} from "./workoutDraft";
import { WorkoutPlayer } from "./WorkoutPlayer";
import {
  WorkoutPreview,
  type Exercise,
  type ExerciseAlternative,
  type ExerciseHistorySession,
  type StrengthBlock,
} from "./WorkoutPreview";

/* ───────────────────────── iOS Done accessory ───────────────────────── */

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

type FinishSummary = {
  workoutTitle: string;
  durationSec: number;
  totals: {
    completedSets: number;
    totalSets: number;
    completedExercises: number;
    totalExercises: number;
    totalVolume: number;
    trackedStrengthVolume: number;
  };
  insights: {
    completionRate: number;
    prCount: number;
    missingLoadCount: number;
    strengthSetCount: number;
    avgTrackedLoad: number;
    improvedExerciseCount: number;
    matchedExerciseCount: number;
  };
  prs: Array<{
    exerciseId: string;
    exerciseName: string;
    weight: string;
    reps: string;
  }>;
  wins: Array<{
    exerciseId: string;
    exerciseName: string;
    type: "heavier" | "more_reps" | "matched" | "volume_up";
    label: string;
  }>;
  exercises: Array<{
    id: string;
    name: string;
    completedSets: number;
    unitLabel: string;
    sessionVolume: number;
    comparedToLast?: {
      previousWeight?: number;
      previousReps?: number;
      previousVolume?: number;
      result: "better" | "same" | "mixed" | "no_data";
    };
    sets: Array<{
      set: number;
      weight: string;
      reps: string;
      rest: string;
      done: boolean;
    }>;
  }>;
};

export default function WorkoutLogScreen() {
  const { colors, isDark } = useAppTheme();
  const S = useMemo(() => createWorkoutStyles(colors, isDark), [colors, isDark]);

  const params = useLocalSearchParams<{
    resumeDraft?: string | string[];
    workoutId?: string | string[];
    programId?: string | string[];
    source?: string | string[];
  }>();

  const selectedWorkoutId = Array.isArray(params.workoutId)
    ? params.workoutId[0]
    : params.workoutId;

  const resumeDraftFlag = Array.isArray(params.resumeDraft)
    ? params.resumeDraft[0]
    : params.resumeDraft;

  const workoutConfig = useMemo(
    () => getWorkoutConfig(selectedWorkoutId),
    [selectedWorkoutId],
  );

  const workoutTitle = workoutConfig.title;
  const workoutStartTime = useRef(Date.now());

  const [isPreview, setIsPreview] = useState(true);
  const [isHydratingDraft, setIsHydratingDraft] = useState(resumeDraftFlag === "1");
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const [currentStreak, setCurrentStreak] = useState(7);
  const [totalWorkouts, setTotalWorkouts] = useState(42);

  const initialExercises: Exercise[] = useMemo(
    () => workoutConfig.exercises,
    [workoutConfig],
  );

  const initialExerciseMap = useMemo(() => {
    const map: Record<string, Exercise> = {};
    initialExercises.forEach((ex) => {
      map[ex.id] = ex;
    });
    return map;
  }, [initialExercises]);

  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);

  useEffect(() => {
    if (resumeDraftFlag === "1") return;
    setExercises(initialExercises);
  }, [initialExercises, resumeDraftFlag]);

  const exerciseById = useMemo(() => {
    const map: Record<string, Exercise> = {};
    exercises.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [exercises]);

  const blocks: StrengthBlock[] = useMemo(
    () => workoutConfig.blocks,
    [workoutConfig],
  );

  const exerciseAlternatives: Record<string, ExerciseAlternative[]> = useMemo(
    () => workoutConfig.exerciseAlternatives ?? {},
    [workoutConfig],
  );

  const historyByExerciseId: Record<string, ExerciseHistorySession[]> = useMemo(
    () => workoutConfig.historyByExerciseId ?? {},
    [workoutConfig],
  );

  const scrollRef = useRef<ScrollView | null>(null);
  const exerciseRefs = useRef<Record<string, View | null>>({});
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const swipeRefs = useRef<Record<string, any>>({});
  const appliedToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteExId, setNoteExId] = useState<string | null>(null);
  const [noteSetId, setNoteSetId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoExId, setVideoExId] = useState<string | null>(null);

  const [workoutDuration, setWorkoutDuration] = useState(0);

  const [restTimer, setRestTimer] = useState<{ seconds: number; total: number } | null>(null);
  const [customTimeOpen, setCustomTimeOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const [customSeconds, setCustomSeconds] = useState("");

  const [kbVisible, setKbVisible] = useState(false);
  const [appliedHistoryToast, setAppliedHistoryToast] = useState<string | null>(null);

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

  useEffect(() => {
    if (isPreview) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - workoutStartTime.current) / 1000);
      setWorkoutDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPreview]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === "web") return;
      try {
        await Notifications.requestPermissionsAsync();
      } catch {}
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
    } catch {}
  }, []);

  const buildWorkoutDraft = useCallback((): WorkoutDraft => {
    return {
      id: "full-body-foundation-draft",
      workoutId: selectedWorkoutId ?? "full-body-foundation",
      workoutTitle,
      startedAt: workoutStartTime.current,
      updatedAt: Date.now(),
      elapsedSeconds: workoutDuration,
      activeSetKey,
      exercises: exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        unitLabel: ex.unitLabel,
        sets: ex.sets.map((s) => ({
          id: s.id,
          weight: s.weight ?? "",
          reps: s.reps ?? "",
          rest: s.rest ?? "",
          done: !!s.done,
          note: s.note ?? "",
        })),
      })),
    };
  }, [activeSetKey, exercises, selectedWorkoutId, workoutDuration, workoutTitle]);

  useEffect(() => {
    if (isPreview) return;

    const draft = buildWorkoutDraft();
    if (!hasMeaningfulProgress(draft.exercises)) return;

    saveWorkoutDraft(draft).catch(() => {});
  }, [isPreview, buildWorkoutDraft]);

  useEffect(() => {
    if (isPreview) return;

    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "background" && state !== "inactive") return;

      const draft = buildWorkoutDraft();
      if (!hasMeaningfulProgress(draft.exercises)) return;

      saveWorkoutDraft(draft).catch(() => {});
    });

    return () => sub.remove();
  }, [isPreview, buildWorkoutDraft]);

  useEffect(() => {
    let mounted = true;

    const restoreDraft = async () => {
      if (resumeDraftFlag !== "1") {
        if (mounted) setIsHydratingDraft(false);
        return;
      }

      try {
        const draft = await loadWorkoutDraft();

        if (!draft || !mounted) {
          if (mounted) setIsHydratingDraft(false);
          return;
        }

        const restoredExercises: Exercise[] = draft.exercises.map((draftEx) => {
          const base = initialExerciseMap[draftEx.id];

          return {
            id: draftEx.id,
            name: base?.name ?? draftEx.name,
            tempo: base?.tempo ?? "—",
            image: base?.image ?? "",
            unitLabel: draftEx.unitLabel,
            videoUrl: base?.videoUrl,
            description: base?.description,
            tutorial: base?.tutorial,
            musclesWorked: base?.musclesWorked,
            sets: draftEx.sets.map((s) => ({
              id: s.id,
              weight: s.weight ?? "",
              reps: s.reps ?? "",
              rest: s.rest ?? "",
              done: !!s.done,
              note: s.note ?? "",
            })),
          };
        });

        setExercises(restoredExercises);
        setActiveSetKey(draft.activeSetKey ?? null);
        setWorkoutDuration(draft.elapsedSeconds ?? 0);
        workoutStartTime.current = Date.now() - (draft.elapsedSeconds ?? 0) * 1000;
        setIsPreview(false);
      } catch {
      } finally {
        if (mounted) setIsHydratingDraft(false);
      }
    };

    restoreDraft();

    return () => {
      mounted = false;
    };
  }, [resumeDraftFlag, initialExerciseMap]);

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

  const startRestTimer = async (restTime: string) => {
    const seconds = timeToSeconds(restTime);
    if (seconds <= 0) return;

    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestTimer({ seconds, total: seconds });

    if (Platform.OS !== "web") {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Rest Complete! 💪",
            body: "Time for your next set",
            sound: true,
          },
          trigger: { seconds },
        });
      } catch {}
    }

    restIntervalRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (!prev || prev.seconds <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
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
      } catch {}
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
          content: {
            title: "Rest Complete! 💪",
            body: "Time for your next set",
            sound: true,
          },
          trigger: { seconds: totalSeconds },
        });
      } catch {}
    }

    restIntervalRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (!prev || prev.seconds <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
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
      if (appliedToastTimeoutRef.current) clearTimeout(appliedToastTimeoutRef.current);
      if (Platform.OS !== "web") {
        Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
      }
    };
  }, []);

  const checkMilestone = (pctLocal: number) => {
    const milestones = [25, 50, 75];
    for (const milestone of milestones) {
      if (pctLocal >= milestone && lastCelebratedPct < milestone) {
        setLastCelebratedPct(milestone);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        break;
      }
    }
  };

  const shareWorkout = async () => {
    const totalSetsLocal = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSetsLocal = exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.done).length,
      0,
    );

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
    } catch {}
  };

  const closeAllSwipesExcept = useCallback((keepKey: string) => {
    const map = swipeRefs.current;
    Object.keys(map).forEach((k) => {
      if (k !== keepKey) map[k]?.close?.();
    });
  }, []);

  const startWorkout = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    workoutStartTime.current = Date.now();
    setIsPreview(false);

    const firstIncomplete = getNextIncompleteSet(exercises[0]?.id ?? "", -1);
    if (firstIncomplete) {
      setActiveSetKey(`${firstIncomplete.exId}:${firstIncomplete.setIndex}`);
    }
  };

  const handleBack = async () => {
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }

    if (isPreview) {
      if (router.canGoBack()) router.back();
      else router.replace("/");
      return;
    }

    setExitConfirmOpen(true);
  };

  const confirmExit = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

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
        ex.id !== exId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
            },
      ),
    );
  }, []);

  const openNoteModal = useCallback(async (exId: string, setId: string) => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

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
    if (noteExId && noteSetId) {
      updateSet(noteExId, noteSetId, { note: noteText.trim() });
    }
    setNoteModalOpen(false);
    setNoteText("");
  };

  const toggleSetDone = useCallback(
    async (exId: string, setId: string) => {
      if (Platform.OS !== "web") {
        await Haptics.selectionAsync();
      }
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
            : {
                ...exercise,
                sets: exercise.sets.map((s) =>
                  s.id === setId ? { ...s, done: willBecomeDone } : s,
                ),
              },
        ),
      );

      if (willBecomeDone) {
        const block = getBlockForExercise(exId);
        const nextSet = getNextIncompleteSet(exId, setIndex);

        if (nextSet) {
          setActiveSetKey(`${nextSet.exId}:${nextSet.setIndex}`);
          setTimeout(() => {
            scrollToSet(nextSet.exId, nextSet.setIndex);
          }, 250);
        } else if (block && isBlockComplete(block.id)) {
          if (Platform.OS !== "web") {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          setCelebratingBlock(block.id);
          setTimeout(() => setCelebratingBlock(null), 1200);
        }

        const totalSetsLocal = exercises.reduce((sum, e) => sum + e.sets.length, 0);
        const completedSetsLocal =
          exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.done).length, 0) + 1;
        const pctLocal = totalSetsLocal
          ? Math.round((completedSetsLocal / totalSetsLocal) * 100)
          : 0;
        checkMilestone(pctLocal);
      }
    },
    [exercises, lastCelebratedPct],
  );

  const deleteSet = useCallback(
    async (exId: string, setId: string) => {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const ex = exercises.find((e) => e.id === exId);
      const set = ex?.sets.find((s) => s.id === setId);
      const index = ex?.sets.findIndex((s) => s.id === setId);

      if (!set || index === undefined) return;

      setUndoAction({ type: "delete", exId, setId, set, index });

      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => {
        setUndoAction(null);
      }, 4000);

      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id !== exId
            ? exercise
            : { ...exercise, sets: exercise.sets.filter((s) => s.id !== setId) },
        ),
      );
    },
    [exercises],
  );

  const undoDelete = async () => {
    if (!undoAction || undoAction.type !== "delete") return;

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

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
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }

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
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.done).length,
    0,
  );
  const pct = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;

  const openHistory = async (exId: string) => {
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
    setHistoryExerciseId(exId);
    setHistoryOpen(true);
  };

  const openMenu = async (exId: string) => {
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
    setMenuExerciseId(exId);
    setMenuOpen(true);
  };

  const swapExercise = async (alternative: ExerciseAlternative) => {
    if (!menuExerciseId) return;
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

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

  const pr = useMemo(
    () => (historyExerciseId ? getPersonalBest(historyExerciseId) : null),
    [historyExerciseId, historyByExerciseId],
  );

  const currentExercise = exercises.find((ex) => ex.id === menuExerciseId);
  const historyExercise = historyExerciseId ? exerciseById[historyExerciseId] : null;
  const historySessions = historyExerciseId ? historyByExerciseId[historyExerciseId] ?? [] : [];

  const sessionHasPR = useCallback(
    (session: ExerciseHistorySession) => {
      if (!pr) return false;
      return session.sets.some((set) => {
        const w = parseFloat(set.weight);
        const r = parseFloat(set.reps);
        return w === pr.weight && r === pr.reps;
      });
    },
    [pr],
  );

  const applyHistorySessionToCurrentWorkout = useCallback(
    async (session: ExerciseHistorySession) => {
      if (!historyExerciseId) return;

      const exName = exerciseById[historyExerciseId]?.name ?? "Exercise";

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id !== historyExerciseId) return ex;

          const updatedSets = [...ex.sets];

          session.sets.forEach((pastSet, idx) => {
            if (updatedSets[idx]) {
              updatedSets[idx] = {
                ...updatedSets[idx],
                weight: pastSet.weight ?? "",
                reps: pastSet.reps ?? "",
                rest: pastSet.rest ?? "",
                done: false,
              };
            } else {
              updatedSets.push({
                id: `s${idx + 1}-${Date.now()}-${idx}`,
                weight: pastSet.weight ?? "",
                reps: pastSet.reps ?? "",
                rest: pastSet.rest ?? "",
                done: false,
              });
            }
          });

          return { ...ex, sets: updatedSets };
        }),
      );

      setHistoryOpen(false);
      setActiveSetKey(`${historyExerciseId}:0`);

      setTimeout(() => {
        scrollToSet(historyExerciseId, 0);
      }, 260);

      if (appliedToastTimeoutRef.current) {
        clearTimeout(appliedToastTimeoutRef.current);
      }

      setAppliedHistoryToast(`${exName} applied`);

      appliedToastTimeoutRef.current = setTimeout(() => {
        setAppliedHistoryToast(null);
      }, 2200);
    },
    [exerciseById, historyExerciseId],
  );

  const blockKickerFor = (block: StrengthBlock) => {
    if (block.type === "superset") return "SUPERSET";
    if (block.type === "giant") return "GIANT SET";
    if (block.type === "circuit") return "CIRCUIT";
    return "SINGLE";
  };

  const blockMetaFor = (block: StrengthBlock) => {
    const count = block.exerciseIds.length;
    if (block.type === "circuit") {
      return `${count} exercises • ${block.rounds ?? 3} rounds • Move across`;
    }
    if (block.type === "superset" || block.type === "giant") {
      return `${count} exercises • Move across`;
    }
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

  const buildFinishSummary = useCallback((): FinishSummary => {
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
          .filter((x) => x.done);

        if (completedSetsOnly.length === 0) return null;

        const sessionVolume = completedSetsOnly.reduce((sum, set) => {
          const weight = parseFloat(set.weight ?? "");
          const reps = parseFloat(set.reps ?? "");
          if (Number.isNaN(weight) || Number.isNaN(reps)) return sum;
          if (weight <= 0 || reps <= 0) return sum;
          return sum + weight * reps;
        }, 0);

        const previousSession = (historyByExerciseId[ex.id] ?? [])[0];

        let comparedToLast: FinishSummary["exercises"][number]["comparedToLast"] = {
          result: "no_data",
        };

        if (previousSession) {
          const previousBestWeight = previousSession.sets.reduce((max, set) => {
            const w = parseFloat(set.weight ?? "");
            return Number.isNaN(w) ? max : Math.max(max, w);
          }, 0);

          const previousBestReps = previousSession.sets.reduce((max, set) => {
            const r = parseFloat(set.reps ?? "");
            return Number.isNaN(r) ? max : Math.max(max, r);
          }, 0);

          const previousVolume = previousSession.sets.reduce((sum, set) => {
            const w = parseFloat(set.weight ?? "");
            const r = parseFloat(set.reps ?? "");
            if (Number.isNaN(w) || Number.isNaN(r) || w <= 0 || r <= 0) return sum;
            return sum + w * r;
          }, 0);

          const currentBestWeight = completedSetsOnly.reduce((max, set) => {
            const w = parseFloat(set.weight ?? "");
            return Number.isNaN(w) ? max : Math.max(max, w);
          }, 0);

          const currentBestReps = completedSetsOnly.reduce((max, set) => {
            const r = parseFloat(set.reps ?? "");
            return Number.isNaN(r) ? max : Math.max(max, r);
          }, 0);

          const improvedWeight = currentBestWeight > previousBestWeight;
          const improvedReps = currentBestReps > previousBestReps;
          const improvedVolume = sessionVolume > previousVolume;

          let result: "better" | "same" | "mixed" | "no_data" = "same";

          if (improvedWeight || improvedReps || improvedVolume) result = "better";
          else if (
            currentBestWeight === previousBestWeight &&
            currentBestReps === previousBestReps &&
            Math.round(sessionVolume) === Math.round(previousVolume)
          ) {
            result = "same";
          } else {
            result = "mixed";
          }

          comparedToLast = {
            previousWeight: previousBestWeight || undefined,
            previousReps: previousBestReps || undefined,
            previousVolume: previousVolume || undefined,
            result,
          };
        }

        return {
          id: ex.id,
          name: ex.name,
          completedSets: completedSetsOnly.length,
          unitLabel: ex.unitLabel,
          sessionVolume,
          comparedToLast,
          sets: completedSetsOnly,
        };
      })
      .filter(Boolean) as FinishSummary["exercises"];

    const totalCompletedSets = completedExercises.reduce((sum, ex) => sum + ex.completedSets, 0);
    const totalExercisesCount = exercises.length;
    const completedExercisesCount = completedExercises.length;
    const completionRate = totalSets > 0 ? totalCompletedSets / totalSets : 0;

    let strengthSetCount = 0;
    let missingLoadCount = 0;
    let trackedStrengthVolume = 0;
    let totalTrackedLoad = 0;
    let trackedLoadCount = 0;

    const prs: FinishSummary["prs"] = [];
    const wins: FinishSummary["wins"] = [];

    exercises.forEach((ex) => {
      const personalBest = getPersonalBest(ex.id);
      const previousSession = (historyByExerciseId[ex.id] ?? [])[0];
      const isStrengthExercise = ex.unitLabel === "LBS" || ex.unitLabel === "KG";

      const completedSetsOnly = ex.sets.filter((s) => s.done);

      const currentBestWeight = completedSetsOnly.reduce((max, set) => {
        const w = parseFloat(set.weight ?? "");
        return Number.isNaN(w) ? max : Math.max(max, w);
      }, 0);

      const currentBestReps = completedSetsOnly.reduce((max, set) => {
        const r = parseFloat(set.reps ?? "");
        return Number.isNaN(r) ? max : Math.max(max, r);
      }, 0);

      const currentVolume = completedSetsOnly.reduce((sum, set) => {
        const w = parseFloat(set.weight ?? "");
        const r = parseFloat(set.reps ?? "");
        if (Number.isNaN(w) || Number.isNaN(r) || w <= 0 || r <= 0) return sum;
        return sum + w * r;
      }, 0);

      const prevBestWeight = previousSession
        ? previousSession.sets.reduce((max, set) => {
            const w = parseFloat(set.weight ?? "");
            return Number.isNaN(w) ? max : Math.max(max, w);
          }, 0)
        : 0;

      const prevBestReps = previousSession
        ? previousSession.sets.reduce((max, set) => {
            const r = parseFloat(set.reps ?? "");
            return Number.isNaN(r) ? max : Math.max(max, r);
          }, 0)
        : 0;

      const prevVolume = previousSession
        ? previousSession.sets.reduce((sum, set) => {
            const w = parseFloat(set.weight ?? "");
            const r = parseFloat(set.reps ?? "");
            if (Number.isNaN(w) || Number.isNaN(r) || w <= 0 || r <= 0) return sum;
            return sum + w * r;
          }, 0)
        : 0;

      if (previousSession && completedSetsOnly.length > 0) {
        if (currentBestWeight > prevBestWeight) {
          wins.push({
            exerciseId: ex.id,
            exerciseName: ex.name,
            type: "heavier",
            label: `Heavier than last session`,
          });
        } else if (currentBestReps > prevBestReps) {
          wins.push({
            exerciseId: ex.id,
            exerciseName: ex.name,
            type: "more_reps",
            label: `More reps than last session`,
          });
        } else if (
          currentBestWeight === prevBestWeight &&
          currentBestReps === prevBestReps &&
          currentBestWeight > 0
        ) {
          wins.push({
            exerciseId: ex.id,
            exerciseName: ex.name,
            type: "matched",
            label: `Matched last session`,
          });
        } else if (currentVolume > prevVolume && currentVolume > 0) {
          wins.push({
            exerciseId: ex.id,
            exerciseName: ex.name,
            type: "volume_up",
            label: `Higher session volume`,
          });
        }
      }

      ex.sets.forEach((s) => {
        if (!s.done) return;

        if (isStrengthExercise) {
          strengthSetCount += 1;

          const rawWeight = (s.weight ?? "").trim();
          const weightVal = parseFloat(rawWeight);

          if (!rawWeight || Number.isNaN(weightVal) || weightVal <= 0) {
            missingLoadCount += 1;
          } else {
            totalTrackedLoad += weightVal;
            trackedLoadCount += 1;
          }

          const repsVal = parseFloat(s.reps ?? "");
          if (!Number.isNaN(weightVal) && !Number.isNaN(repsVal) && weightVal > 0 && repsVal > 0) {
            trackedStrengthVolume += weightVal * repsVal;
          }
        }

        const setWeight = parseFloat(s.weight ?? "");
        const setReps = parseFloat(s.reps ?? "");

        if (
          personalBest &&
          !Number.isNaN(setWeight) &&
          !Number.isNaN(setReps) &&
          (setWeight > personalBest.weight ||
            (setWeight === personalBest.weight && setReps > personalBest.reps))
        ) {
          const alreadyAdded = prs.some((item) => item.exerciseId === ex.id);
          if (!alreadyAdded) {
            prs.push({
              exerciseId: ex.id,
              exerciseName: ex.name,
              weight: s.weight ?? "",
              reps: s.reps ?? "",
            });
          }
        }
      });
    });

    const totalVolume = completedExercises.reduce((sum, ex) => sum + ex.sessionVolume, 0);
    const avgTrackedLoad = trackedLoadCount > 0 ? totalTrackedLoad / trackedLoadCount : 0;
    const improvedExerciseCount = completedExercises.filter(
      (ex) => ex.comparedToLast?.result === "better",
    ).length;
    const matchedExerciseCount = completedExercises.filter(
      (ex) => ex.comparedToLast?.result === "same",
    ).length;

    return {
      workoutTitle,
      durationSec: workoutDuration,
      totals: {
        completedSets: totalCompletedSets,
        totalSets,
        completedExercises: completedExercisesCount,
        totalExercises: totalExercisesCount,
        totalVolume,
        trackedStrengthVolume,
      },
      insights: {
        completionRate,
        prCount: prs.length,
        missingLoadCount,
        strengthSetCount,
        avgTrackedLoad,
        improvedExerciseCount,
        matchedExerciseCount,
      },
      prs,
      wins,
      exercises: completedExercises,
    };
  }, [exercises, historyByExerciseId, totalSets, workoutDuration, workoutTitle]);

  const openFinish = useCallback(async () => {
    Keyboard.dismiss();

    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }

    const summary = buildFinishSummary();

    router.push({
      pathname: "/workout/finish",
      params: {
        summary: JSON.stringify(summary),
      },
    });
  }, [buildFinishSummary]);

  const onPressThumbnail = useCallback(
    (exId: string) => {
      const ex = exerciseById[exId];
      if (!ex?.videoUrl) return;
      setVideoExId(exId);
      setVideoModalOpen(true);
    },
    [exerciseById],
  );

  if (isHydratingDraft) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: colors.muted }}>
            Restoring workout…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {isPreview ? (
        <WorkoutPreview
          workoutTitle={workoutTitle}
          exercises={exercises}
          blocks={blocks}
          exerciseById={exerciseById}
          estimatedTime={estimatedTime}
          totalSets={totalSets}
          onStartWorkout={startWorkout}
          onBack={handleBack}
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

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={IOS_ACCESSORY_ID}>
          <View style={[S.accessory, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <Pressable
              onPress={async () => {
                try {
                  await Haptics.selectionAsync();
                } catch {}
                Keyboard.dismiss();
              }}
              style={({ pressed }) => [S.accessoryBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={[S.accessoryText, { color: colors.text }]}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}

      {restTimer && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 200,
            backgroundColor: colors.text,
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
              color: colors.surface,
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
                backgroundColor: colors.premium,
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
              <Text style={{ fontSize: 16, fontWeight: "900", color: colors.surface }}>
                + 15 seconds
              </Text>
            </Pressable>

            <Pressable
              onPress={skipRestTimer}
              style={({ pressed }) => [
                {
                  flex: 1,
                  height: 54,
                  backgroundColor: colors.premium,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                },
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={{ fontSize: 16, fontWeight: "900", color: colors.text }}>
                Skip Rest
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {undoAction && !restTimer && !appliedHistoryToast && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 16,
            right: 16,
            zIndex: 199,
            backgroundColor: colors.text,
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
          <Text style={{ color: colors.surface, fontWeight: "800", fontSize: 15 }}>
            Set deleted
          </Text>
          <Pressable
            onPress={undoDelete}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: colors.premium,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "900", fontSize: 14 }}>
              UNDO
            </Text>
          </Pressable>
        </View>
      )}

      {appliedHistoryToast && !restTimer && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 16,
            right: 16,
            zIndex: 199,
            backgroundColor: colors.text,
            borderRadius: 16,
            paddingVertical: 15,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: colors.premium,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={14} color={colors.text} strokeWidth={3} />
          </View>

          <Text
            style={{
              flex: 1,
              color: colors.surface,
              fontWeight: "800",
              fontSize: 15,
              letterSpacing: -0.1,
            }}
          >
            {appliedHistoryToast}
          </Text>
        </View>
      )}

      <Modal
        visible={exitConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setExitConfirmOpen(false)}
      >
        <Pressable style={S.modalOverlay} onPress={() => setExitConfirmOpen(false)} />
        <View style={[S.modalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={S.modalHeader}>
            <Text style={[S.modalTitle, { color: colors.text }]}>Exit Workout?</Text>
            <Pressable onPress={() => setExitConfirmOpen(false)} style={S.modalX}>
              <X size={18} color={colors.text} />
            </Pressable>
          </View>
          <Text style={[S.modalBody, { color: colors.muted }]}>
            Your progress will be lost. Are you sure you want to exit?
          </Text>
          <View style={S.modalActions}>
            <Pressable onPress={() => setExitConfirmOpen(false)} style={S.modalGhost}>
              <Text style={[S.modalGhostText, { color: colors.text }]}>Keep Going</Text>
            </Pressable>
            <Pressable onPress={confirmExit} style={S.modalDanger}>
              <Text style={S.modalDangerText}>Exit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={S.modalOverlay} onPress={() => setMenuOpen(false)} />
        <View style={[S.modalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={S.modalHeader}>
            <Text style={[S.modalTitle, { color: colors.text }]} numberOfLines={2}>
              {currentExercise?.name}
            </Text>
            <Pressable onPress={() => setMenuOpen(false)} style={S.modalX}>
              <X size={18} color={colors.text} />
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
              <Repeat size={20} color={colors.text} />
              <Text style={[S.menuItemText, { color: colors.text }]}>Swap Exercise</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={swapOpen} transparent animationType="fade" onRequestClose={() => setSwapOpen(false)}>
        <Pressable style={S.modalOverlay} onPress={() => setSwapOpen(false)} />
        <View style={[S.modalSheetLarge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={S.modalHeader}>
            <Text style={[S.modalTitle, { color: colors.text }]}>Swap Exercise</Text>
            <Pressable onPress={() => setSwapOpen(false)} style={S.modalX}>
              <X size={18} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
            <View style={S.swapList}>
              {menuExerciseId &&
                exerciseAlternatives[menuExerciseId]?.map((alt) => (
                  <Pressable key={alt.id} onPress={() => swapExercise(alt)} style={S.swapItem}>
                    <Image source={{ uri: alt.image }} style={S.swapThumb} />
                    <View style={S.swapTextContainer}>
                      <Text style={[S.swapName, { color: colors.text }]}>{alt.name}</Text>
                      <Text style={[S.swapCategory, { color: colors.muted }]}>
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

      <Modal visible={historyOpen} transparent animationType="fade" onRequestClose={() => setHistoryOpen(false)}>
        <Pressable style={S.modalOverlay} onPress={() => setHistoryOpen(false)} />
        <View style={[S.modalSheetLarge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={S.modalHeader}>
            <Text style={[S.modalTitle, { color: colors.text }]} numberOfLines={2}>
              {historyExercise?.name ?? "Exercise History"}
            </Text>
            <Pressable onPress={() => setHistoryOpen(false)} style={S.modalX}>
              <X size={18} color={colors.text} />
            </Pressable>
          </View>

          {historyExerciseId && pr && (
            <View style={[S.prBanner, { backgroundColor: isDark ? "rgba(244,200,74,0.12)" : "rgba(244,200,74,0.18)" }]}>
              <Trophy size={16} color={colors.premium} />
              <Text style={[S.prText, { color: colors.text }]}>
                PR: {pr.weight}{" "}
                {historyExercise?.unitLabel === "REPS"
                  ? "reps"
                  : historyExercise?.unitLabel?.toLowerCase() ?? "lbs"}{" "}
                × {pr.reps}
              </Text>
              <Text style={[S.prDate, { color: colors.muted }]}>({pr.date})</Text>
            </View>
          )}

          <ScrollView
            style={{ maxHeight: 460 }}
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {historySessions.length ? (
              historySessions.map((session, index) => (
                <View key={session.id} style={[S.historyCard, index > 0 && S.historyCardSpaced]}>
                  <View style={S.historyCardHeader}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={[S.historyDate, { color: colors.text }]}>{session.dateLabel}</Text>
                    </View>

                    {sessionHasPR(session) ? (
                      <View
                        style={{
                          paddingHorizontal: 10,
                          height: 28,
                          borderRadius: 999,
                          backgroundColor: "rgba(244,200,74,0.18)",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "900",
                            color: colors.text,
                            letterSpacing: 0.2,
                          }}
                        >
                          PR
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={S.historyTableHead}>
                    <Text style={[S.historyHead, { width: 40, color: colors.muted }]}>SET</Text>
                    <Text style={[S.historyHead, { color: colors.muted }]}>
                      {historyExercise?.unitLabel === "REPS"
                        ? "WORK"
                        : historyExercise?.unitLabel ?? "W"}
                    </Text>
                    <Text style={[S.historyHead, { color: colors.muted }]}>REPS</Text>
                    <Text style={[S.historyHead, { color: colors.muted }]}>REST</Text>
                    <Text style={[S.historyHead, { width: 42, textAlign: "center", color: colors.muted }]}>✓</Text>
                  </View>

                  {session.sets.map((hs) => {
                    const isPrSet =
                      !!pr &&
                      parseFloat(hs.weight) === pr.weight &&
                      parseFloat(hs.reps) === pr.reps;

                    return (
                      <View key={`${session.id}-${hs.set}`} style={S.historyRow}>
                        <Text style={[S.historyCellText, { width: 40, color: colors.text }]}>{hs.set}</Text>
                        <Text style={[S.historyCellText, { color: colors.text }]}>{hs.weight}</Text>
                        <Text style={[S.historyCellText, { color: colors.text }]}>{hs.reps}</Text>
                        <Text style={[S.historyCellText, { color: colors.text }]}>{hs.rest}</Text>
                        <View
                          style={[
                            S.historyDot,
                            hs.done && S.historyDotOn,
                            isPrSet && {
                              backgroundColor: colors.premium,
                              borderColor: colors.premium,
                            },
                          ]}
                        >
                          {hs.done ? <Check size={14} color="#fff" /> : null}
                        </View>
                      </View>
                    );
                  })}

                  <Pressable
                    onPress={() => applyHistorySessionToCurrentWorkout(session)}
                    style={({ pressed }) => [
                      {
                        marginTop: 14,
                        height: 46,
                        borderRadius: 999,
                        backgroundColor: colors.text,
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      pressed && { opacity: 0.82 },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "900",
                        color: colors.surface,
                        letterSpacing: -0.1,
                      }}
                    >
                      Apply to Current Workout
                    </Text>
                  </Pressable>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.muted, fontWeight: "700", marginTop: 12 }}>
                No history yet.
              </Text>
            )}
          </ScrollView>

          <View style={S.modalActions}>
            <Pressable onPress={() => setHistoryOpen(false)} style={S.modalGhost}>
              <Text style={[S.modalGhostText, { color: colors.text }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={customTimeOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomTimeOpen(false)}
      >
        <Pressable style={S.modalOverlay} onPress={() => setCustomTimeOpen(false)} />
        <View style={[S.modalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={S.modalHeader}>
            <Text style={[S.modalTitle, { color: colors.text }]}>Rest Timer</Text>
            <Pressable onPress={() => setCustomTimeOpen(false)} style={S.modalX}>
              <X size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={{ marginTop: 16 }}>
            <View
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                borderRadius: 16,
                padding: 20,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "900",
                  color: colors.muted,
                  marginBottom: 8,
                }}
              >
                SET DURATION
              </Text>
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "900",
                  color: colors.text,
                  letterSpacing: 2,
                }}
              >
                {customMinutes || "0"}:{(customSeconds || "00").padStart(2, "0")}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "900",
                    color: colors.muted,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  MINUTES
                </Text>
                <ScrollView
                  style={{
                    height: 150,
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  showsVerticalScrollIndicator={false}
                >
                  {Array.from({ length: 11 }, (_, i) => i).map((min) => (
                    <Pressable
                      key={min}
                      onPress={() => setCustomMinutes(min.toString())}
                      style={{
                        paddingVertical: 16,
                        alignItems: "center",
                        backgroundColor:
                          customMinutes === min.toString() ? colors.premium : "transparent",
                        borderRadius: 8,
                        marginHorizontal: 4,
                        marginVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "900",
                          color: customMinutes === min.toString() ? colors.text : colors.muted,
                        }}
                      >
                        {min}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "900",
                    color: colors.muted,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  SECONDS
                </Text>
                <ScrollView
                  style={{
                    height: 150,
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  showsVerticalScrollIndicator={false}
                >
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((sec) => (
                    <Pressable
                      key={sec}
                      onPress={() => setCustomSeconds(sec.toString())}
                      style={{
                        paddingVertical: 16,
                        alignItems: "center",
                        backgroundColor:
                          customSeconds === sec.toString() ? colors.premium : "transparent",
                        borderRadius: 8,
                        marginHorizontal: 4,
                        marginVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "900",
                          color: customSeconds === sec.toString() ? colors.text : colors.muted,
                        }}
                      >
                        {sec.toString().padStart(2, "0")}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={{ gap: 8, marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "900",
                  color: colors.muted,
                  marginBottom: 4,
                }}
              >
                QUICK SELECT
              </Text>
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
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                      borderRadius: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "900", color: colors.text }}>
                      {preset.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={startCustomTimer}
              style={{
                height: 56,
                borderRadius: 14,
                backgroundColor: colors.text,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: "900", color: colors.surface }}>
                START TIMER
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={noteModalOpen} transparent animationType="fade" onRequestClose={() => setNoteModalOpen(false)}>
        <Pressable style={S.modalOverlay} onPress={() => setNoteModalOpen(false)} />
        <View style={[S.modalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={S.modalHeader}>
            <Text style={[S.modalTitle, { color: colors.text }]}>Set Note</Text>
            <Pressable onPress={() => setNoteModalOpen(false)} style={S.modalX}>
              <X size={18} color={colors.text} />
            </Pressable>
          </View>

          <TextInput
            {...(iosAccessoryProps as any)}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="e.g., Felt heavy, Perfect form, Lower back pain..."
            placeholderTextColor={colors.muted}
            multiline
            style={{
              marginTop: 16,
              height: 100,
              borderWidth: 2,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 12,
              fontSize: 15,
              fontWeight: "600",
              color: colors.text,
              textAlignVertical: "top",
              backgroundColor: colors.surface,
            }}
          />

          <View style={[S.modalActions, { marginTop: 20 }]}>
            <Pressable onPress={() => setNoteModalOpen(false)} style={S.modalGhost}>
              <Text style={[S.modalGhostText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={saveNote} style={[S.modalPrimary, { backgroundColor: colors.text }]}>
              <Text style={[S.modalPrimaryText, { color: colors.surface }]}>Save Note</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={videoModalOpen}
        animationType="slide"
        onRequestClose={() => setVideoModalOpen(false)}
        presentationStyle="fullScreen"
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <SafeAreaView style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 }}>
            <View
              style={{
                padding: 16,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "900",
                  color: "#FFF",
                  flex: 1,
                  paddingRight: 16,
                }}
              >
                {videoExId ? exerciseById[videoExId]?.name : ""}
              </Text>
              <Pressable
                onPress={() => setVideoModalOpen(false)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
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
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
                  No video available
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
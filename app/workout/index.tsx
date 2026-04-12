import AsyncStorage from "@react-native-async-storage/async-storage";
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
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppSettings } from "@/providers/appSettings";
import { useAppTheme } from "@/providers/theme";
import type { SetRow as SetRowLocal } from "../../features/workout/SetRowItem";
import { getWorkoutConfig } from "../../features/workout/workout.data";
import { createWorkoutStyles } from "../../features/workout/workout.styles";
import {
  clearWorkoutDraft,
  discardWorkoutDraft,
  hasMeaningfulProgress,
  loadWorkoutDraft,
  markDraftCompleted,
  markDraftInterrupted,
  markDraftResumed,
  saveWorkoutDraft,
  shouldShowResumeModal,
  type WorkoutDraft,
} from "../../features/workout/workoutDraft";
import {
  buildFinishSummary,
  makeSessionId,
  type FinishSummary,
} from "../../features/workout/workoutEngine";
import {
  appendWorkoutHistoryEntry,
  buildExerciseHistorySessions,
  getWorkoutHistoryByWorkoutId,
  type WorkoutHistoryEntry,
} from "../../features/workout/workoutHistory";
import WorkoutPlayer from "../../features/workout/WorkoutPlayer";
import {
  WorkoutPreview,
  type Exercise,
  type ExerciseAlternative,
  type ExerciseHistorySession,
  type StrengthBlock,
} from "../../features/workout/WorkoutPreview";
import {
  convertInputWeightStringToStoredKgString,
  formatStoredWeightStringForDisplay,
} from "../../lib/weightUnits";



const IOS_ACCESSORY_ID = "workoutAccessoryDone";
const FINISH_SUMMARY_STORAGE_KEY = "aa_fit_finish_summary";

const iosAccessoryProps: { inputAccessoryViewID: string } | {} =
  Platform.OS === "ios" ? { inputAccessoryViewID: IOS_ACCESSORY_ID } : {};

type UndoAction = {
  type: "delete";
  exId: string;
  setId: string;
  set: SetRowLocal;
  index: number;
};

export default function WorkoutLogScreen() {
  const { colors, isDark } = useAppTheme();
    console.log("DEBUG workout imports", {
      WorkoutPreview,
      WorkoutPlayer,
      Video,
      SafeAreaView,
    });

  const { settings } = useAppSettings();
  const weightUnit = settings.weightUnit;
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

  const selectedProgramId = Array.isArray(params.programId)
    ? params.programId[0]
    : params.programId;

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
  const [partialFinishConfirmOpen, setPartialFinishConfirmOpen] = useState(false);
  const [completeFinishConfirmOpen, setCompleteFinishConfirmOpen] = useState(false);
  const [resumeDraftPromptOpen, setResumeDraftPromptOpen] = useState(false);
  const [availableDraft, setAvailableDraft] = useState<WorkoutDraft | null>(null);

  const [currentStreak] = useState(7);

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
  const [realWorkoutHistory, setRealWorkoutHistory] = useState<WorkoutHistoryEntry[]>([]);

  useEffect(() => {
    if (resumeDraftFlag === "1") return;
    setExercises(initialExercises);
  }, [initialExercises, resumeDraftFlag]);

  useEffect(() => {
    let mounted = true;

    const loadRealHistory = async () => {
      const workoutId = selectedWorkoutId ?? "full-body-foundation";
      const history = await getWorkoutHistoryByWorkoutId(workoutId);
      if (!mounted) return;
      setRealWorkoutHistory(history);
    };

    loadRealHistory();

    return () => {
      mounted = false;
    };
  }, [selectedWorkoutId]);

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

  const fallbackHistoryByExerciseId: Record<string, ExerciseHistorySession[]> = useMemo(
    () => workoutConfig.historyByExerciseId ?? {},
    [workoutConfig],
  );

  const historyByExerciseId: Record<string, ExerciseHistorySession[]> = useMemo(() => {
    const derivedFromRealHistory: Record<string, ExerciseHistorySession[]> = {};

    exercises.forEach((ex) => {
      const sessions = buildExerciseHistorySessions(
        realWorkoutHistory,
        ex.id,
        ex.name,
      ) as ExerciseHistorySession[];

      if (sessions.length > 0) {
        derivedFromRealHistory[ex.id] = sessions;
      } else if (fallbackHistoryByExerciseId[ex.id]) {
        derivedFromRealHistory[ex.id] = fallbackHistoryByExerciseId[ex.id];
      } else {
        derivedFromRealHistory[ex.id] = [];
      }
    });

    return derivedFromRealHistory;
  }, [exercises, fallbackHistoryByExerciseId, realWorkoutHistory]);

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
    const existingSessionId = availableDraft?.sessionId;

    return {
      id: "full-body-foundation-draft",
      sessionId:
        existingSessionId ??
        `${selectedWorkoutId ?? "full-body-foundation"}-${workoutStartTime.current}`,
      workoutId: selectedWorkoutId ?? "full-body-foundation",
      workoutTitle,
      programId: selectedProgramId ?? undefined,
      startedAt: workoutStartTime.current,
      updatedAt: Date.now(),
      elapsedSeconds: workoutDuration,
      activeSetKey,
      status: "active",
      source: "in_progress",
      exercises: exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        unitLabel: ex.unitLabel,
        trackingMode: ex.trackingMode,
        sets: ex.sets.map((s) => ({
          id: s.id,
          weight: s.weight ?? "",
          reps: s.reps ?? "",
          rest: s.rest ?? "",
          done: !!s.done,
          note: s.note ?? "",
        })),
      })),
      ui: {
        lastOpenedAt: Date.now(),
      },
    };
  }, [
    activeSetKey,
    availableDraft?.sessionId,
    exercises,
    selectedProgramId,
    selectedWorkoutId,
    workoutDuration,
    workoutTitle,
  ]);

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
      markDraftInterrupted().catch(() => {});
    });

    return () => sub.remove();
  }, [isPreview]);

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

        await markDraftResumed();

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

        setAvailableDraft(draft);
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

  useEffect(() => {
    let mounted = true;

    const checkExistingDraft = async () => {
      if (resumeDraftFlag === "1") return;
      if (!isPreview) return;

      try {
        const draft = await loadWorkoutDraft();

        if (!mounted) return;

        if (shouldShowResumeModal(draft)) {
          setAvailableDraft(draft);
        } else {
          setAvailableDraft(null);
        }
      } catch {
        if (mounted) setAvailableDraft(null);
      }
    };

    checkExistingDraft();

    return () => {
      mounted = false;
    };
  }, [resumeDraftFlag, isPreview]);

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

    for (let i = 1; i < block.exerciseIds.length; i += 1) {
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
    const nextInGroup = getNextSetInGroup(exId, currentSetIndex);
    if (nextInGroup) return nextInGroup;
    // fall through to next blocks if grouped block is exhausted
  }

  const ex = exercises.find((e) => e.id === exId);
  if (!ex) return null;

  for (let i = currentSetIndex + 1; i < ex.sets.length; i += 1) {
    if (!ex.sets[i].done) return { exId, setIndex: i };
  }

  const currentBlockIndex = blocks.findIndex((b) => b.exerciseIds.includes(exId));
  for (let i = currentBlockIndex + 1; i < blocks.length; i += 1) {
    for (const nextExId of blocks[i].exerciseIds) {
      const nextEx = exercises.find((e) => e.id === nextExId);
      if (!nextEx) continue;

      const firstIncompleteSetIndex = nextEx.sets.findIndex((s) => !s.done);
      if (firstIncompleteSetIndex !== -1) {
        return { exId: nextExId, setIndex: firstIncompleteSetIndex };
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

  const startCustomTimer = async () => {
    const mins = parseInt(customMinutes, 10) || 0;
    const secs = parseInt(customSeconds, 10) || 0;
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

  const beginFreshWorkout = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    workoutStartTime.current = Date.now();
    setWorkoutDuration(0);
    setAvailableDraft(null);
    setIsPreview(false);

    const firstIncomplete = getNextIncompleteSet(exercises[0]?.id ?? "", -1);
    if (firstIncomplete) {
      setActiveSetKey(`${firstIncomplete.exId}:${firstIncomplete.setIndex}`);
    }
  }, [exercises]);

  const startWorkout = useCallback(async () => {
    if (availableDraft && shouldShowResumeModal(availableDraft)) {
      setResumeDraftPromptOpen(true);
      return;
    }

    await beginFreshWorkout();
  }, [availableDraft, beginFreshWorkout]);

  const continueExistingWorkout = useCallback(async () => {
    if (!availableDraft) return;

    await markDraftResumed();
    setResumeDraftPromptOpen(false);

    router.replace({
      pathname: "/workout",
      params: {
        workoutId: availableDraft.workoutId,
        resumeDraft: "1",
      },
    });
  }, [availableDraft]);

  const startNewSession = useCallback(async () => {
    setResumeDraftPromptOpen(false);
    await discardWorkoutDraft();
    setAvailableDraft(null);
    await beginFreshWorkout();
  }, [beginFreshWorkout]);

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

  const updateSet = useCallback(
    (exId: string, setId: string, patch: Partial<SetRowLocal>) => {
      const nextPatch = { ...patch };

      if (patch.weight !== undefined) {
        nextPatch.weight = convertInputWeightStringToStoredKgString({
          inputWeight: patch.weight,
          inputUnit: weightUnit,
        });
      }

      setExercises((prev) =>
        prev.map((ex) =>
          ex.id !== exId
            ? ex
            : {
                ...ex,
                sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...nextPatch } : s)),
              },
        ),
      );
    },
    [weightUnit],
  );

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
  const isWorkoutComplete = totalSets > 0 && completedSets === totalSets;

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

  const getPersonalBest = useCallback(
    (exId: string) => {
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
    },
    [historyByExerciseId],
  );

  const pr = useMemo(
    () => (historyExerciseId ? getPersonalBest(historyExerciseId) : null),
    [historyExerciseId, getPersonalBest],
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

  const tagFor = (block: StrengthBlock, idx: number) => {
    if (block.type === "superset" || block.type === "giant") {
      return String.fromCharCode("A".charCodeAt(0) + idx);
    }
    if (block.type === "circuit") return String(idx + 1);
    return undefined;
  };

  const groupAccentStyle = (block: StrengthBlock) => {
    if (block.type === "superset") return S.groupRailSuperset;
    if (block.type === "giant") return S.groupRailGiant;
    if (block.type === "circuit") return S.groupRailCircuit;
    return null;
  };

 const goToFinish = useCallback(
  async (sessionStatus: "partial" | "completed") => {
    Keyboard.dismiss();

    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }

    const sessionId =
      availableDraft?.sessionId ?? makeSessionId(selectedWorkoutId ?? "full-body-foundation");

    const { summary, historyEntry } = buildFinishSummary({
      sessionId,
      workoutId: selectedWorkoutId ?? "full-body-foundation",
      workoutTitle,
      programId: selectedProgramId ?? undefined,
      status: sessionStatus,
      durationSec: workoutDuration,
      exercises: exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        unitLabel: ex.unitLabel,
        trackingMode: ex.trackingMode,
        sets: ex.sets.map((s) => ({
          id: s.id,
          weight: s.weight ?? "",
          reps: s.reps ?? "",
          rest: s.rest ?? "",
          done: !!s.done,
          note: s.note ?? "",
        })),
      })),
      history: realWorkoutHistory,
    });

    await appendWorkoutHistoryEntry(historyEntry);
    setRealWorkoutHistory((prev) => [historyEntry, ...prev]);

    await AsyncStorage.setItem(
      FINISH_SUMMARY_STORAGE_KEY,
      JSON.stringify(summary satisfies FinishSummary),
    );

    await markDraftCompleted();
    await clearWorkoutDraft();
    setAvailableDraft(null);

    setPartialFinishConfirmOpen(false);
    setCompleteFinishConfirmOpen(false);

    router.replace({
      pathname: "/workout/finish",
      params: { sessionStatus },
    });
  },
  [
    availableDraft?.sessionId,
    exercises,
    realWorkoutHistory,
    selectedProgramId,
    selectedWorkoutId,
    workoutDuration,
    workoutTitle,
  ],
);

  const handleFinishPress = useCallback(async () => {
    Keyboard.dismiss();

    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }

    if (isWorkoutComplete) {
      setCompleteFinishConfirmOpen(true);
      return;
    }

    setPartialFinishConfirmOpen(true);
  }, [isWorkoutComplete]);

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
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["left", "right"]}
      >
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: colors.muted }}>
            Restoring workout…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={isPreview ? ["left", "right"] : ["top", "left", "right", "bottom"]}
    >
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
          openFinish={handleFinishPress}
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
          weightUnit={weightUnit}
          formatWeight={formatStoredWeightStringForDisplay}
        />
      )}

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={IOS_ACCESSORY_ID}>
          <View
            style={[
              S.accessory,
              { backgroundColor: colors.surface, borderTopColor: colors.border },
            ]}
          >
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

      <Modal
        visible={resumeDraftPromptOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setResumeDraftPromptOpen(false)}
      >
        <Pressable style={S.modalOverlay} onPress={() => setResumeDraftPromptOpen(false)} />
        <View
          style={[
            S.modalSheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={S.modalHeader}>
            <Text style={[S.modalTitle, { color: colors.text }]}>
              Resume your workout?
            </Text>
            <Pressable onPress={() => setResumeDraftPromptOpen(false)} style={S.modalX}>
              <X size={18} color={colors.text} />
            </Pressable>
          </View>

          <View
            style={{
              marginTop: 14,
              borderRadius: 18,
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              padding: 14,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "900",
                letterSpacing: 0.5,
                textTransform: "uppercase",
                color: colors.muted,
              }}
            >
              Unfinished session
            </Text>

            <Text
              style={{
                marginTop: 6,
                fontSize: 18,
                lineHeight: 22,
                fontWeight: "900",
                color: colors.text,
                letterSpacing: -0.15,
              }}
            >
              {availableDraft?.workoutTitle ?? "Workout"}
            </Text>

            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                lineHeight: 20,
                fontWeight: "700",
                color: colors.muted,
              }}
            >
              {availableDraft
                ? `${availableDraft.exercises.reduce(
                    (sum, ex) => sum + ex.sets.filter((s) => s.done).length,
                    0,
                  )}/${availableDraft.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} sets · ${formatDuration(
                    availableDraft.elapsedSeconds ?? 0,
                  )}`
                : "Continue where you left off"}
            </Text>
          </View>

          <Text style={[S.modalBody, { color: colors.muted, marginTop: 14 }]}>
            Starting a new session will discard your current progress.
          </Text>

          <View style={S.modalActions}>
            <Pressable onPress={continueExistingWorkout} style={S.modalPrimary}>
              <Text style={S.modalPrimaryText}>Continue workout</Text>
            </Pressable>

            <Pressable onPress={startNewSession} style={S.modalGhost}>
              <Text style={[S.modalGhostText, { color: colors.text }]}>Start new session</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={partialFinishConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPartialFinishConfirmOpen(false)}
      >
        <Pressable style={S.modalOverlay} onPress={() => setPartialFinishConfirmOpen(false)} />
        <View
          style={[
            S.modalSheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={S.modalHeader}>
            <Text style={[S.modalTitle, { color: colors.text }]}>Finish workout early?</Text>
            <Pressable onPress={() => setPartialFinishConfirmOpen(false)} style={S.modalX}>
              <X size={18} color={colors.text} />
            </Pressable>
          </View>

          <Text style={[S.modalBody, { color: colors.muted }]}>
            You still have unfinished sets. Completed sets will be saved as this session.
          </Text>

          <View style={S.modalActions}>
            <Pressable
              onPress={() => setPartialFinishConfirmOpen(false)}
              style={S.modalGhost}
            >
              <Text style={[S.modalGhostText, { color: colors.text }]}>Resume workout</Text>
            </Pressable>

            <Pressable onPress={() => goToFinish("partial")} style={S.modalPrimary}>
              <Text style={S.modalPrimaryText}>Finish anyway</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={completeFinishConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCompleteFinishConfirmOpen(false)}
      >
        <Pressable style={S.modalOverlay} onPress={() => setCompleteFinishConfirmOpen(false)} />
        <View
          style={[
            S.modalSheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={S.modalHeader}>
            <Text style={[S.modalTitle, { color: colors.text }]}>Complete workout?</Text>
            <Pressable onPress={() => setCompleteFinishConfirmOpen(false)} style={S.modalX}>
              <X size={18} color={colors.text} />
            </Pressable>
          </View>

          <Text style={[S.modalBody, { color: colors.muted }]}>
            All sets are done. You can go back to review or complete the session now.
          </Text>

          <View style={S.modalActions}>
            <Pressable
              onPress={() => setCompleteFinishConfirmOpen(false)}
              style={S.modalGhost}
            >
              <Text style={[S.modalGhostText, { color: colors.text }]}>Go back</Text>
            </Pressable>

            <Pressable onPress={() => goToFinish("completed")} style={S.modalPrimary}>
              <Text style={S.modalPrimaryText}>Complete workout</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={exitConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setExitConfirmOpen(false)}
      >
        <Pressable style={S.modalOverlay} onPress={() => setExitConfirmOpen(false)} />
        <View
          style={[
            S.modalSheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
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
        <View
          style={[
            S.modalSheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
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
        <View
          style={[
            S.modalSheetLarge,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
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
        <View
          style={[
            S.modalSheetLarge,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={S.modalHeader}>
            <Text style={[S.modalTitle, { color: colors.text }]} numberOfLines={2}>
              {historyExercise?.name ?? "Exercise History"}
            </Text>
            <Pressable onPress={() => setHistoryOpen(false)} style={S.modalX}>
              <X size={18} color={colors.text} />
            </Pressable>
          </View>

          {historyExerciseId && pr && (
            <View
              style={[
                S.prBanner,
                {
                  backgroundColor: isDark
                    ? "rgba(244,200,74,0.12)"
                    : "rgba(244,200,74,0.18)",
                },
              ]}
            >
              <Trophy size={16} color={colors.premium} />
              <Text style={[S.prText, { color: colors.text }]}>
                PR:{" "}
                {historyExercise?.unitLabel === "REPS"
                  ? pr.weight
                  : formatStoredWeightStringForDisplay({
                      storedWeight: String(pr.weight),
                      unit: weightUnit,
                    })}{" "}
                {historyExercise?.unitLabel === "REPS" ? "reps" : weightUnit} × {pr.reps}
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
                      <Text style={[S.historyDate, { color: colors.text }]}>
                        {session.dateLabel}
                      </Text>
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
                        : weightUnit.toUpperCase()}
                    </Text>
                    <Text style={[S.historyHead, { color: colors.muted }]}>REPS</Text>
                    <Text style={[S.historyHead, { color: colors.muted }]}>REST</Text>
                    <Text
                      style={[
                        S.historyHead,
                        { width: 42, textAlign: "center", color: colors.muted },
                      ]}
                    >
                      ✓
                    </Text>
                  </View>

                  {session.sets.map((hs) => {
                    const isPrSet =
                      !!pr &&
                      parseFloat(hs.weight) === pr.weight &&
                      parseFloat(hs.reps) === pr.reps;

                    return (
                      <View key={`${session.id}-${hs.set}`} style={S.historyRow}>
                        <Text style={[S.historyCellText, { width: 40, color: colors.text }]}>
                          {hs.set}
                        </Text>
                        <Text style={[S.historyCellText, { color: colors.text }]}>
                          {historyExercise?.unitLabel === "REPS"
                            ? hs.weight
                            : formatStoredWeightStringForDisplay({
                                storedWeight: hs.weight,
                                unit: weightUnit,
                              }) || "—"}
                        </Text>
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
        <View
          style={[
            S.modalSheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
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

      <Modal
        visible={noteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setNoteModalOpen(false)}
      >
        <Pressable style={S.modalOverlay} onPress={() => setNoteModalOpen(false)} />
        <View
          style={[
            S.modalSheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
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
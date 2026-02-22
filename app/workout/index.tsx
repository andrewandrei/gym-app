import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Check, ChevronLeft, MoreVertical, Repeat, Trophy, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";

type SetRow = {
  id: string;
  weight?: string;
  reps?: string;
  rest?: string;
  done?: boolean;
};

type Exercise = {
  id: string;
  name: string;
  tempo: string;
  image: string;
  unitLabel: "LBS" | "KG";
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

const HAIR = StyleSheet.hairlineWidth;
const IOS_ACCESSORY_ID = "workoutAccessoryDone";

export default function WorkoutLogScreen() {
  const workoutTitle = "Foundation & Form";

  const [isPreview, setIsPreview] = useState(true);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const initialExercises: Exercise[] = useMemo(
    () => [
      {
        id: "ex-1",
        name: "Barbell Back Squat with Safety Bar and Chains",
        tempo: "3-0-1-0",
        image:
          "https://images.unsplash.com/photo-1517964603305-11c0f6f66012?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "185", reps: "10", rest: "90", done: false },
          { id: "s2", weight: "185", reps: "10", rest: "90", done: false },
          { id: "s3", weight: "", reps: "", rest: "90", done: false },
        ],
      },
      {
        id: "ex-2",
        name: "Romanian Deadlift",
        tempo: "3-1-1-0",
        image:
          "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "165", reps: "10", rest: "90", done: false },
          { id: "s2", weight: "", reps: "", rest: "90", done: false },
        ],
      },
      {
        id: "ex-3",
        name: "Leg Press",
        tempo: "2-0-2-0",
        image:
          "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "", reps: "12", rest: "60", done: false },
          { id: "s2", weight: "", reps: "12", rest: "60", done: false },
          { id: "s3", weight: "", reps: "12", rest: "60", done: false },
        ],
      },
    ],
    []
  );

  const exerciseAlternatives: Record<string, ExerciseAlternative[]> = useMemo(
    () => ({
      "ex-1": [
        {
          id: "alt-1",
          name: "Leg Press",
          category: "gym",
          image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=400&q=70",
        },
        {
          id: "alt-2",
          name: "Goblet Squat",
          category: "home",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=70",
        },
      ],
      "ex-2": [
        {
          id: "alt-4",
          name: "Dumbbell RDL",
          category: "gym",
          image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=70",
        },
      ],
    }),
    []
  );

  const historyByExerciseId: Record<string, ExerciseHistorySession[]> = useMemo(
    () => ({
      "ex-1": [
        {
          id: "h1",
          dateLabel: "Feb 18, 2026",
          sets: [
            { set: 1, weight: "185", reps: "10", rest: "90", done: true },
            { set: 2, weight: "185", reps: "10", rest: "90", done: true },
            { set: 3, weight: "175", reps: "10", rest: "90", done: true },
            { set: 4, weight: "175", reps: "8", rest: "90", done: true },
          ],
        },
      ],
      "ex-2": [
        {
          id: "h3",
          dateLabel: "Feb 18, 2026",
          sets: [
            { set: 1, weight: "165", reps: "10", rest: "90", done: true },
            { set: 2, weight: "165", reps: "10", rest: "90", done: true },
          ],
        },
      ],
    }),
    []
  );

  const [exercises, setExercises] = useState(initialExercises);
  const openRowRef = useRef<Swipeable | null>(null);
  const closeOpenRow = () => {
    openRowRef.current?.close();
    openRowRef.current = null;
  };

  const [finishOpen, setFinishOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyExerciseId, setHistoryExerciseId] = useState<string | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuExerciseId, setMenuExerciseId] = useState<string | null>(null);

  const [swapOpen, setSwapOpen] = useState(false);

  const [activeTimer, setActiveTimer] = useState<{
    exId: string;
    setId: string;
    setNumber: number;
    totalSeconds: number;
    secondsLeft: number;
    nextExerciseName?: string;
  } | null>(null);

  const [timerDismissed, setTimerDismissed] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [keyboardShown, setKeyboardShown] = useState(false);
  useEffect(() => {
    const s1 = Keyboard.addListener("keyboardDidShow", () => setKeyboardShown(true));
    const s2 = Keyboard.addListener("keyboardDidHide", () => setKeyboardShown(false));
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  useEffect(() => {
    if (!activeTimer) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev) return null;

        const newSecondsLeft = prev.secondsLeft - 1;

        if (newSecondsLeft <= 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          setTimerDismissed(false);
          return null;
        }

        if (newSecondsLeft <= 3) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        return { ...prev, secondsLeft: newSecondsLeft };
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [activeTimer?.exId, activeTimer?.setId]);

  const startWorkout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPreview(false);
  };

  const handleBack = async () => {
  await Haptics.selectionAsync();
  if (isPreview) {
    // FIX: Check if we can go back, otherwise push to home
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback for web - replace with your home route
      router.replace('/'); // or wherever your program list is
    }
  } else {
    setExitConfirmOpen(true);
  }
};

  const confirmExit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExitConfirmOpen(false);
    router.back();
  };

  const estimatedTime = useMemo(() => {
    const totalSetsCount = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const avgRestTime = 90;
    const avgSetTime = 45;
    const totalMinutes = Math.round((totalSetsCount * (avgSetTime + avgRestTime)) / 60);
    return totalMinutes;
  }, [exercises]);

  const updateSet = (exId: string, setId: string, patch: Partial<SetRow>) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId
          ? ex
          : { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }
      )
    );
  };

  const toggleSetDone = async (exId: string, setId: string) => {
    await Haptics.selectionAsync();

    const ex = exercises.find((e) => e.id === exId);
    const set = ex?.sets.find((s) => s.id === setId);

    if (!set || !ex) return;

    if (!set.done && set.rest && parseInt(set.rest) > 0) {
      const setIndex = ex.sets.findIndex((s) => s.id === setId);
      const nextSet = ex.sets[setIndex + 1];

      let nextExerciseName: string | undefined;
      if (!nextSet) {
        const exIndex = exercises.findIndex((e) => e.id === exId);
        const nextEx = exercises[exIndex + 1];
        nextExerciseName = nextEx?.name;
      }

      setActiveTimer({
        exId,
        setId,
        setNumber: setIndex + 1,
        totalSeconds: parseInt(set.rest),
        secondsLeft: parseInt(set.rest),
        nextExerciseName,
      });
      setTimerDismissed(false);
    }

    if (set.done && activeTimer?.exId === exId && activeTimer?.setId === setId) {
      setActiveTimer(null);
    }

    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id !== exId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((s) => (s.id === setId ? { ...s, done: !s.done } : s)),
            }
      )
    );
  };

  const skipRestTimer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTimer(null);
    setTimerDismissed(false);
  };

  const addTimeToRest = async (seconds: number) => {
    await Haptics.selectionAsync();
    setActiveTimer((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        secondsLeft: prev.secondsLeft + seconds,
        totalSeconds: prev.totalSeconds + seconds,
      };
    });
  };

  const deleteSet = async (exId: string, setId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeOpenRow();
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId ? ex : { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
      )
    );
  };

  const addSet = async (exId: string) => {
    await Haptics.selectionAsync();
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId
          ? ex
          : {
              ...ex,
              sets: [
                ...ex.sets,
                { id: `s${ex.sets.length + 1}`, weight: "", reps: "", rest: "90", done: false },
              ],
            }
      )
    );
  };

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0);
  const pct = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;
  const isComplete = totalSets > 0 && completedSets === totalSets;

  const openFinish = async () => {
    await Haptics.selectionAsync();
    setFinishOpen(true);
  };

  const confirmFinish = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFinishOpen(false);
    router.back();
  };

  const openHistory = async (exId: string) => {
    await Haptics.selectionAsync();
    setHistoryExerciseId(exId);
    setHistoryOpen(true);
  };

  const openMenu = async (exId: string) => {
    await Haptics.selectionAsync();
    setMenuExerciseId(exId);
    setMenuOpen(true);
  };

  const swapExercise = async (alternative: ExerciseAlternative) => {
    if (!menuExerciseId) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== menuExerciseId
          ? ex
          : {
              ...ex,
              name: alternative.name,
              image: alternative.image,
              sets: ex.sets.map((s) => ({
                ...s,
                weight: "",
                reps: "",
                done: false,
              })),
            }
      )
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
        const weight = parseFloat(set.weight);
        const reps = parseFloat(set.reps);
        if (weight > maxWeight || (weight === maxWeight && reps > maxReps)) {
          maxWeight = weight;
          maxReps = reps;
          prDate = session.dateLabel;
        }
      });
    });

    return maxWeight > 0 ? { weight: maxWeight, reps: maxReps, date: prDate } : null;
  };

  const applySpecificSession = async (sessionId: string) => {
    if (!historyExerciseId) return;
    const sessions = historyByExerciseId[historyExerciseId] ?? [];
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== historyExerciseId) return ex;

        const newSets: SetRow[] = session.sets.map((historySet, index) => ({
          id: `s${index + 1}`,
          weight: historySet.weight,
          reps: historySet.reps,
          rest: historySet.rest,
          done: false,
        }));

        return { ...ex, sets: newSets };
      })
    );

    setHistoryOpen(false);
  };

  const currentExercise = exercises.find((ex) => ex.id === menuExerciseId);

  // PREVIEW MODE - CLEAN DESIGN
// PREVIEW MODE - REFINED & CLEAN
if (isPreview) {
  return (
    <SafeAreaView style={S.safe}>
      <View style={S.page}>
        <ScrollView style={S.scroll} contentContainerStyle={S.previewContent} showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <View style={S.previewHeader}>
            <Pressable onPress={handleBack} style={S.backBtn}>
              <ChevronLeft size={24} color={Colors.text} />
            </Pressable>
            <Text style={S.previewTitle}>{workoutTitle}</Text>
            <Text style={S.previewMeta}>
              {exercises.length} exercises • ~{estimatedTime} min • {totalSets} sets
            </Text>
          </View>

          {/* EXERCISE LIST */}
          <View style={S.previewList}>
            {exercises.map((ex, index) => (
              <View key={ex.id} style={S.previewCard}>
                <View style={S.previewCardLeft}>
                  <View style={S.previewNumber}>
                    <Text style={S.previewNumberText}>{index + 1}</Text>
                  </View>
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
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* START BUTTON */}
        <View style={S.previewBottom}>
          <Pressable onPress={startWorkout} style={S.startBtn}>
            <Text style={S.startBtnText}>Start Workout</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
  // WORKOUT MODE
  return (
    <SafeAreaView style={S.safe}>
      <KeyboardAvoidingView style={S.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={S.page}>
          {activeTimer && !timerDismissed && (
            <Pressable onPress={() => setTimerDismissed(true)} style={S.timerPill}>
              <View style={S.timerPillContent}>
                <View style={S.timerPillLeft}>
                  <Text style={S.timerPillTime}>
                    {Math.floor(activeTimer.secondsLeft / 60)}:
                    {(activeTimer.secondsLeft % 60).toString().padStart(2, "0")}
                  </Text>
                  <View style={S.timerPillProgress}>
                    <View
                      style={[
                        S.timerPillProgressFill,
                        {
                          width: `${(activeTimer.secondsLeft / activeTimer.totalSeconds) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={S.timerPillActions}>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      addTimeToRest(15);
                    }}
                    style={S.timerPillBtn}
                  >
                    <Text style={S.timerPillBtnText}>+15</Text>
                  </Pressable>

                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      skipRestTimer();
                    }}
                    style={S.timerPillBtnSkip}
                  >
                    <Text style={S.timerPillBtnTextSkip}>Skip</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          )}

          <ScrollView
            style={[S.scroll, Platform.OS === "web" ? S.scrollWeb : null]}
            contentContainerStyle={S.scrollContent}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={closeOpenRow}
            showsVerticalScrollIndicator={false}
          >
            <View style={S.header}>
              <Pressable onPress={handleBack} style={S.headerBackBtn}>
                <ChevronLeft size={20} color="#111" />
                <Text style={S.headerBackText}>Exit</Text>
              </Pressable>

              <Text style={S.title} numberOfLines={1} ellipsizeMode="tail">
                {workoutTitle}
              </Text>
              <Text style={S.status}>In progress</Text>

              <Text style={S.setsLine}>
                {completedSets} of {totalSets} sets completed
              </Text>

              <View style={S.progressTrack}>
                <View style={[S.progressFill, { width: `${pct}%` }]} />
              </View>
            </View>

            <View style={S.exerciseList}>
              {exercises.map((ex) => (
                <View key={ex.id} style={S.card}>
                  <View style={S.cardInner}>
                    <View style={S.exerciseHeader}>
                      <Image source={{ uri: ex.image }} style={S.thumb} />
                      <View style={S.exerciseText}>
                        <Text style={S.exerciseTitle} numberOfLines={2}>
                          {ex.name}
                        </Text>
                        <Text style={S.exerciseSub}>Tempo: {ex.tempo}</Text>
                      </View>
                      <Pressable style={S.menuBtn} onPress={() => openMenu(ex.id)}>
                        <MoreVertical size={18} color={Colors.text} />
                      </Pressable>
                    </View>

                    <View style={S.cols}>
                      <Text style={[S.colLabel, { width: 40 }]}>SET</Text>
                      <Text style={S.colLabel}>{ex.unitLabel}</Text>
                      <Text style={S.colLabel}>REPS</Text>
                      <Text style={S.colLabel}>REST</Text>
                      <Text style={[S.colLabel, { width: 44, textAlign: "center" }]}>✓</Text>
                    </View>

                    {ex.sets.map((s, i) => (
                      <Swipeable
                        key={s.id}
                        overshootRight={false}
                        rightThreshold={28}
                        onSwipeableOpen={() => {
                          if (openRowRef.current) openRowRef.current.close();
                        }}
                        renderRightActions={() => (
                          <View style={S.swipeBg}>
                            <Pressable onPress={() => deleteSet(ex.id, s.id)} style={S.deletePill}>
                              <Text style={S.deleteText}>Delete</Text>
                            </Pressable>
                          </View>
                        )}
                        ref={(ref) => {
                          if (ref) openRowRef.current = ref;
                        }}
                      >
                        <View style={S.row}>
                          <Text style={S.setIndex}>{i + 1}</Text>

                          {(["weight", "reps", "rest"] as const).map((field) => (
                            <View key={field} style={S.cell}>
                              <TextInput
                                value={(s[field] ?? "") as string}
                                onChangeText={(t) =>
                                  updateSet(ex.id, s.id, {
                                    [field]: t.replace(/[^\d.]/g, ""),
                                  })
                                }
                                keyboardType="numeric"
                                style={S.input}
                                placeholder="—"
                                placeholderTextColor="#999"
                                returnKeyType="done"
                                blurOnSubmit
                                onSubmitEditing={() => Keyboard.dismiss()}
                                {...(Platform.OS === "ios"
                                  ? { inputAccessoryViewID: IOS_ACCESSORY_ID }
                                  : null)}
                              />
                            </View>
                          ))}

                          <Pressable
                            onPress={() => toggleSetDone(ex.id, s.id)}
                            style={[S.checkBtn, s.done && S.checkBtnOn]}
                          >
                            {s.done && <Check size={16} color="#FFF" />}
                          </Pressable>
                        </View>
                      </Swipeable>
                    ))}

                    <View style={S.cardActions}>
                      <Pressable onPress={() => openHistory(ex.id)} style={S.ghostBtn}>
                        <Text style={S.ghostText}>Exercise History</Text>
                      </Pressable>

                      <Pressable onPress={() => addSet(ex.id)} style={S.ghostBtn}>
                        <Text style={S.ghostText}>Add Set</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={S.finishSection}>
              <Pressable onPress={openFinish} style={S.finishBtn} accessibilityRole="button">
                <Text style={S.finishBtnText}>Complete Workout</Text>
              </Pressable>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          {Platform.OS === "ios" && (
            <InputAccessoryView nativeID={IOS_ACCESSORY_ID}>
              <View style={S.accessory}>
                <Pressable
                  onPress={() => Keyboard.dismiss()}
                  style={({ pressed }) => [S.accessoryBtn, pressed && { opacity: 0.85 }]}
                >
                  <Text style={S.accessoryText}>Done</Text>
                </Pressable>
              </View>
            </InputAccessoryView>
          )}

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

          <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
            <Pressable style={S.modalOverlay} onPress={() => setMenuOpen(false)} />
            <View style={S.modalSheet}>
              <View style={S.modalHeader}>
                <Text style={S.modalTitle}>{currentExercise?.name}</Text>
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

          <Modal visible={historyOpen} transparent animationType="fade" onRequestClose={() => setHistoryOpen(false)}>
            <Pressable style={S.modalOverlay} onPress={() => setHistoryOpen(false)} />
            <View style={S.modalSheetLarge}>
              <View style={S.modalHeader}>
                <Text style={S.modalTitle}>Exercise History</Text>
                <Pressable onPress={() => setHistoryOpen(false)} style={S.modalX}>
                  <X size={18} color="#111" />
                </Pressable>
              </View>

              {historyExerciseId && getPersonalBest(historyExerciseId) && (
                <View style={S.prBanner}>
                  <Trophy size={16} color="#FFD700" />
                  <Text style={S.prText}>
                    PR: {getPersonalBest(historyExerciseId)!.weight} lbs × {getPersonalBest(historyExerciseId)!.reps}{" "}
                    reps
                  </Text>
                  <Text style={S.prDate}>({getPersonalBest(historyExerciseId)!.date})</Text>
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
                <Pressable onPress={() => setHistoryOpen(false)} style={S.modalPrimary}>
                  <Text style={S.modalPrimaryText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  page: { flex: 1 },

  scroll: { flex: 1 },
  scrollWeb: {
    // @ts-ignore
    scrollbarWidth: "none",
    // @ts-ignore
    msOverflowStyle: "none",
  },

  scrollContent: {},

  // CLEAN PREVIEW STYLES
// PREVIEW STYLES - REFINED
previewContent: {
  paddingTop: 0,
},

previewHeader: {
  paddingHorizontal: Spacing.lg,
  paddingTop: Spacing.md,
  paddingBottom: Spacing.lg,
},

backBtn: {
  width: 40,
  height: 40,
  alignItems: "flex-start",
  justifyContent: "center",
  marginBottom: Spacing.sm,
},

previewTitle: {
  fontSize: 32,
  fontWeight: "900",
  color: Colors.text,
  letterSpacing: -1,
  marginBottom: Spacing.sm,
},

previewMeta: {
  fontSize: 15,
  fontWeight: "600",
  color: Colors.muted,
},

previewList: {
  gap: Spacing.md,
  paddingHorizontal: Spacing.lg,
},

previewCard: {
  flexDirection: "row",
  backgroundColor: Colors.surface,
  borderRadius: 16,
  padding: Spacing.md,
  borderWidth: 1,
  borderColor: Colors.border,
},

previewCardLeft: {
  flexDirection: "row",
  alignItems: "center",
  marginRight: Spacing.md,
},

previewNumber: {
  width: 36,
  alignItems: "center",
  justifyContent: "center",
  marginRight: Spacing.md,
},

previewNumberText: {
  fontSize: 24,
  fontWeight: "900",
  color: Colors.text,
  letterSpacing: -0.5,
},

previewImage: {
  width: 72,
  height: 72,
  borderRadius: 12,
},

previewCardRight: {
  flex: 1,
  justifyContent: "center",
},

previewExName: {
  fontSize: 17,
  fontWeight: "800",
  color: Colors.text,
  lineHeight: 22,
  marginBottom: 4,
},

previewExMeta: {
  fontSize: 14,
  fontWeight: "600",
  color: Colors.muted,
},

previewBottom: {
  padding: Spacing.md,
  backgroundColor: Colors.surface,
  borderTopWidth: 1,
  borderTopColor: Colors.border,
},

startBtn: {
  height: 54,
  borderRadius: 999,
  backgroundColor: Colors.text,
  alignItems: "center",
  justifyContent: "center",
},

startBtnText: {
  color: Colors.surface,
  fontWeight: "900",
  fontSize: 17,
},

  // WORKOUT MODE STYLES
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 8,
    paddingBottom: 12,
  },

  headerBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },

  headerBackText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  title: { fontSize: 26, fontWeight: "900", color: Colors.text, letterSpacing: -0.2 },
  status: { marginTop: 6, fontSize: 13, color: "#777", fontWeight: "600" },
  setsLine: { marginTop: 10, fontSize: 16, fontWeight: "900", color: "#333" },

  progressTrack: { marginTop: 8, height: 8, borderRadius: 999, backgroundColor: "#eee" },
  progressFill: { height: 8, borderRadius: 999, backgroundColor: "#000" },

  exerciseList: { gap: 12 },

  card: {
    marginHorizontal: Spacing.lg,
    borderRadius: 18,
    borderWidth: HAIR,
    borderColor: Colors.border,
    backgroundColor: "#fff",
    overflow: "hidden",
  },

  cardInner: { padding: 12 },

  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    paddingBottom: 8,
  },

  thumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },

  exerciseText: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "center",
    paddingRight: 8,
  },

  exerciseTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
    lineHeight: 22,
  },

  exerciseSub: { marginTop: 3, fontSize: 12, color: "#666", fontWeight: "700" },

  menuBtn: { padding: 8 },

  cols: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    paddingVertical: 8,
    borderTopWidth: HAIR,
    borderTopColor: "#eee",
    borderBottomWidth: HAIR,
    borderBottomColor: "#eee",
  },

  colLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    color: "#9a9a9a",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    borderBottomWidth: HAIR,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },

  setIndex: { width: 40, fontSize: 18, fontWeight: "900", color: "#555", textAlign: "center" },

  cell: {
    flex: 1,
    height: 48,
    marginHorizontal: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  input: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
    paddingVertical: 0,
    paddingHorizontal: 8,
    height: "100%",
  },

  checkBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  checkBtnOn: { backgroundColor: "#000", borderColor: "#000" },

  swipeBg: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 12,
    backgroundColor: "#fff",
  },

  deletePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#eee",
    borderWidth: HAIR,
    borderColor: "#ddd",
  },

  deleteText: { fontWeight: "900", color: "#111" },

  cardActions: { flexDirection: "row", gap: 10, marginTop: 10 },

  ghostBtn: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  ghostText: { fontWeight: "900", color: "#111" },

  finishSection: {
    marginTop: 24,
    marginHorizontal: Spacing.lg,
  },

  finishBtn: {
    height: 54,
    borderRadius: 999,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  finishBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },

  timerPill: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "#000",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    zIndex: 998,
    elevation: 19,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  timerPillContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timerPillLeft: {
    flex: 1,
  },

  timerPillTime: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
  },

  timerPillProgress: {
    marginTop: 4,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#333",
    overflow: "hidden",
    width: "100%",
  },

  timerPillProgressFill: {
    height: 3,
    backgroundColor: "#fff",
  },

  timerPillActions: {
    flexDirection: "row",
    gap: 6,
    marginLeft: 12,
  },

  timerPillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#222",
  },

  timerPillBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#fff",
  },

  timerPillBtnSkip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#fff",
  },

  timerPillBtnTextSkip: {
    fontSize: 12,
    fontWeight: "900",
    color: "#000",
  },

  accessory: {
    padding: 10,
    backgroundColor: "#f7f7f7",
    borderTopWidth: HAIR,
    borderTopColor: "#ddd",
    alignItems: "flex-end",
  },
  accessoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#000",
    borderRadius: 999,
  },
  accessoryText: { color: "#fff", fontWeight: "900" },

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0005" },

  modalSheet: {
    marginTop: "auto",
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: HAIR,
    borderTopColor: "#eee",
  },

  modalSheetLarge: {
    marginTop: "auto",
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: HAIR,
    borderTopColor: "#eee",
  },

  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  modalX: { padding: 8, borderRadius: 999, backgroundColor: "#f2f2f2" },

  modalBody: { marginTop: 10, color: "#444", fontWeight: "700", lineHeight: 18 },

  modalActions: { flexDirection: "row", gap: 10, marginTop: 14 },

  modalGhost: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  modalGhostText: { fontWeight: "900", color: "#111" },

  modalPrimary: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryText: { fontWeight: "900", color: "#fff" },

  modalDanger: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#ff3b30",
    alignItems: "center",
    justifyContent: "center",
  },
  modalDangerText: { fontWeight: "900", color: "#fff" },

  menuList: {
    marginTop: 12,
    gap: 8,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    borderWidth: HAIR,
    borderColor: "#eee",
  },

  menuItemText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  swapList: {
    marginTop: 12,
    gap: 10,
  },

  swapItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    borderWidth: HAIR,
    borderColor: "#eee",
  },

  swapThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },

  swapTextContainer: {
    flex: 1,
  },

  swapName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
  },

  swapCategory: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
    marginTop: 2,
  },

  prBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF9E6",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  prText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111",
  },
  prDate: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
  },

  historyCard: {
    borderWidth: HAIR,
    borderColor: "#e7e7e7",
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    backgroundColor: "#fff",
  },

  historyCardSpaced: {
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  historyCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  historyDate: { fontWeight: "900", color: "#111" },

  useSessionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#000",
    borderRadius: 8,
  },
  useSessionText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  historyTableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderTopWidth: HAIR,
    borderTopColor: "#eee",
    borderBottomWidth: HAIR,
    borderBottomColor: "#eee",
  },

  historyHead: {
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    color: "#9a9a9a",
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: HAIR,
    borderBottomColor: "#f0f0f0",
  },

  historyCellText: { flex: 1, textAlign: "center", fontWeight: "900", color: "#222" },

  historyDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },

  historyDotOn: { backgroundColor: "#000", borderColor: "#000" },
});
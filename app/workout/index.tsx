// app/workout/index.tsx

import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Check, MoreVertical, Repeat, Trophy, X } from "lucide-react-native";
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
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { AppHeader } from "@/components/AppHeader";
import { Colors } from "@/styles/colors";
import { S } from "./workout.styles";

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
    [],
  );

  const exerciseAlternatives: Record<string, ExerciseAlternative[]> = useMemo(
    () => ({
      "ex-1": [
        {
          id: "alt-1",
          name: "Leg Press",
          category: "gym",
          image:
            "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=400&q=70",
        },
        {
          id: "alt-2",
          name: "Goblet Squat",
          category: "home",
          image:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=70",
        },
      ],
      "ex-2": [
        {
          id: "alt-4",
          name: "Dumbbell RDL",
          category: "gym",
          image:
            "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=70",
        },
      ],
    }),
    [],
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
    [],
  );

  const [exercises, setExercises] = useState(initialExercises);

  // Swipe management (stable: per-row refs + currently open row key)
  const rowRefs = useRef<Record<string, Swipeable | null>>({});
  const openRowKeyRef = useRef<string | null>(null);

  const closeOpenRow = () => {
    const key = openRowKeyRef.current;
    if (key) rowRefs.current[key]?.close();
    openRowKeyRef.current = null;
  };

  const [finishOpen, setFinishOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyExerciseId, setHistoryExerciseId] = useState<string | null>(
    null,
  );

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
        const secondsLeft = prev.secondsLeft - 1;

        if (secondsLeft <= 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          setTimerDismissed(false);
          return null;
        }

        if (secondsLeft <= 3) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        return { ...prev, secondsLeft };
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeTimer?.exId, activeTimer?.setId]);

  const startWorkout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPreview(false);
  };

  const handleBack = async () => {
    await Haptics.selectionAsync();

    if (isPreview) {
      if (router.canGoBack()) router.back();
      else router.replace("/");
      return;
    }

    setExitConfirmOpen(true);
  };

  const confirmExit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExitConfirmOpen(false);
    router.back();
  };

  const estimatedTime = useMemo(() => {
    const totalSetsCount = exercises.reduce(
      (sum, ex) => sum + ex.sets.length,
      0,
    );
    const avgRestTime = 90;
    const avgSetTime = 45;
    return Math.round((totalSetsCount * (avgSetTime + avgRestTime)) / 60);
  }, [exercises]);

  const updateSet = (exId: string, setId: string, patch: Partial<SetRow>) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, ...patch } : s,
              ),
            },
      ),
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
        nextExerciseName = exercises[exIndex + 1]?.name;
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
              sets: exercise.sets.map((s) =>
                s.id === setId ? { ...s, done: !s.done } : s,
              ),
            },
      ),
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
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeOpenRow();

    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId
          ? ex
          : { ...ex, sets: ex.sets.filter((s) => s.id !== setId) },
      ),
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
                {
                  id: `s${ex.sets.length + 1}-${Date.now()}`,
                  weight: "",
                  reps: "",
                  rest: "90",
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
  const isComplete = totalSets > 0 && completedSets === totalSets;

  const openFinish = async () => {
    closeOpenRow();
    Keyboard.dismiss();
    await Haptics.selectionAsync();
    setFinishOpen(true);
  };

  const confirmFinish = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFinishOpen(false);
    router.back();
  };

  const openHistory = async (exId: string) => {
    closeOpenRow();
    await Haptics.selectionAsync();
    setHistoryExerciseId(exId);
    setHistoryOpen(true);
  };

  const openMenu = async (exId: string) => {
    closeOpenRow();
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

  const pr = useMemo(() => {
    return historyExerciseId ? getPersonalBest(historyExerciseId) : null;
  }, [historyExerciseId, historyByExerciseId]);

  const applySpecificSession = async (sessionId: string) => {
    if (!historyExerciseId) return;

    const sessions = historyByExerciseId[historyExerciseId] ?? [];
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== historyExerciseId) return ex;

        const newSets: SetRow[] = session.sets.map((hs, idx) => ({
          id: `s${idx + 1}-${Date.now()}`,
          weight: hs.weight,
          reps: hs.reps,
          rest: hs.rest,
          done: false,
        }));

        return { ...ex, sets: newSets };
      }),
    );

    setHistoryOpen(false);
  };

  // Add-to-current (append if user already started logging, else replace)
  const addToCurrentExercise = async () => {
    if (!historyExerciseId) return;

    const sessions = historyByExerciseId[historyExerciseId] ?? [];
    const session = sessions[0];
    if (!session) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== historyExerciseId) return ex;

        const incoming: SetRow[] = session.sets.map((hs, idx) => ({
          id: `h${Date.now()}-${idx}`,
          weight: hs.weight,
          reps: hs.reps,
          rest: hs.rest,
          done: false,
        }));

        const hasAnyInput = ex.sets.some(
          (s) => (s.weight ?? "") || (s.reps ?? "") || (s.rest ?? ""),
        );

        return { ...ex, sets: hasAnyInput ? [...ex.sets, ...incoming] : incoming };
      }),
    );

    setHistoryOpen(false);
  };

  const currentExercise = exercises.find((ex) => ex.id === menuExerciseId);

  return (
    <SafeAreaView style={S.safe}>
      {/* PREVIEW MODE */}
      {isPreview ? (
        <View style={S.previewPage}>
          <ScrollView
            style={S.scroll}
            contentContainerStyle={S.previewContent}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardDismissMode="on-drag"
          >
            <AppHeader
              title={workoutTitle}
              subtitle={`${exercises.length} exercises • ~${estimatedTime} min • ${totalSets} sets`}
              onBack={handleBack}
            />

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
                      {ex.sets.length} sets • {ex.sets[0]?.reps || "—"} reps •{" "}
                      {ex.sets[0]?.rest || "—"}s rest
                    </Text>
                  </View>
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
        // WORKOUT MODE
        <KeyboardAvoidingView
          style={S.safe}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={S.page}>
            {/* TIMER PILL (wrapped so it doesn’t steal touches) */}
            {activeTimer && !timerDismissed && (
              <View pointerEvents="box-none" style={S.timerPillWrap}>
                <Pressable
                  onPress={() => setTimerDismissed(true)}
                  style={S.timerPill}
                >
                  <View style={S.timerPillContent}>
                    <View style={S.timerPillLeft}>
                      <Text style={S.timerPillTime}>
                        {Math.floor(activeTimer.secondsLeft / 60)}:
                        {(activeTimer.secondsLeft % 60)
                          .toString()
                          .padStart(2, "0")}
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
              </View>
            )}

            <ScrollView
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
              <AppHeader
                title={workoutTitle}
                subtitle="In progress"
                onBack={handleBack}
                compact
              />

              <View style={S.header}>
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
                        <Pressable
                          style={S.menuBtn}
                          onPress={() => openMenu(ex.id)}
                        >
                          <MoreVertical size={18} color={Colors.text} />
                        </Pressable>
                      </View>

                      <View style={S.cols}>
                        <Text style={[S.colLabel, { width: 40 }]}>SET</Text>
                        <Text style={S.colLabel}>{ex.unitLabel}</Text>
                        <Text style={S.colLabel}>REPS</Text>
                        <Text style={S.colLabel}>REST</Text>
                        <Text
                          style={[
                            S.colLabel,
                            { width: 44, textAlign: "center" },
                          ]}
                        >
                          ✓
                        </Text>
                      </View>

                      {ex.sets.map((s, i) => {
                        const rowKey = `${ex.id}:${s.id}`;
                        return (
                          <Swipeable
                            key={s.id}
                            overshootRight={false}
                            rightThreshold={28}
                            friction={2}
                            onSwipeableWillOpen={async () => {
                              if (
                                openRowKeyRef.current &&
                                openRowKeyRef.current !== rowKey
                              ) {
                                rowRefs.current[openRowKeyRef.current]?.close();
                              }
                              openRowKeyRef.current = rowKey;
                              await Haptics.selectionAsync();
                            }}
                            onSwipeableClose={() => {
                              if (openRowKeyRef.current === rowKey) {
                                openRowKeyRef.current = null;
                              }
                            }}
                            renderRightActions={() => (
                              <View style={S.swipeBg}>
                                <Pressable
                                  onPress={() => deleteSet(ex.id, s.id)}
                                  style={S.deletePill}
                                >
                                  <Text style={S.deleteText}>Delete</Text>
                                </Pressable>
                              </View>
                            )}
                            ref={(ref) => {
                              rowRefs.current[rowKey] = ref;
                            }}
                          >
                            <View style={S.row}>
                              <Text style={S.setIndex}>{i + 1}</Text>

                              {(["weight", "reps", "rest"] as const).map(
                                (field) => (
                                  <View key={field} style={S.cell}>
                                    <TextInput
                                      value={(s[field] ?? "") as string}
                                      onFocus={() => closeOpenRow()}
                                      onChangeText={(t) =>
                                        updateSet(ex.id, s.id, {
                                          [field]: t.replace(/[^\d.]/g, ""),
                                        })
                                      }
                                      keyboardType="numeric"
                                      style={S.input}
                                      placeholder="—"
                                      placeholderTextColor="rgba(0,0,0,0.28)"
                                      returnKeyType="done"
                                      blurOnSubmit
                                      onSubmitEditing={() => Keyboard.dismiss()}
                                      autoCorrect={false}
                                      autoComplete="off"
                                      {...(Platform.OS === "ios"
                                        ? {
                                            inputAccessoryViewID:
                                              IOS_ACCESSORY_ID,
                                          }
                                        : null)}
                                    />
                                  </View>
                                ),
                              )}

                              <Pressable
                                onPress={() => toggleSetDone(ex.id, s.id)}
                                style={[S.checkBtn, s.done && S.checkBtnOn]}
                              >
                                {s.done && <Check size={16} color="#FFF" />}
                              </Pressable>
                            </View>
                          </Swipeable>
                        );
                      })}

                      <View style={S.cardActions}>
                        <Pressable
                          onPress={() => openHistory(ex.id)}
                          style={S.ghostBtn}
                        >
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

              <View style={S.finishSectionWrap}>
                <View style={S.finishSection}>
                  <Pressable
                    onPress={openFinish}
                    style={S.finishBtn}
                    accessibilityRole="button"
                  >
                    <Text style={S.finishBtnText}>Complete Workout</Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            {Platform.OS === "ios" && (
              <InputAccessoryView nativeID={IOS_ACCESSORY_ID}>
                <View style={S.accessory}>
                  <Pressable
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      Keyboard.dismiss();
                    }}
                    style={({ pressed }) => [
                      S.accessoryBtn,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text style={S.accessoryText}>Done</Text>
                  </Pressable>
                </View>
              </InputAccessoryView>
            )}

            {/* EXIT CONFIRM */}
            <Modal
              visible={exitConfirmOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setExitConfirmOpen(false)}
            >
              <Pressable
                style={S.modalOverlay}
                onPress={() => setExitConfirmOpen(false)}
              />
              <View style={S.modalSheet}>
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle}>Exit Workout?</Text>
                  <Pressable
                    onPress={() => setExitConfirmOpen(false)}
                    style={S.modalX}
                  >
                    <X size={18} color="#111" />
                  </Pressable>
                </View>

                <Text style={S.modalBody}>
                  Your progress will be lost. Are you sure you want to exit?
                </Text>

                <View style={S.modalActions}>
                  <Pressable
                    onPress={() => setExitConfirmOpen(false)}
                    style={S.modalGhost}
                  >
                    <Text style={S.modalGhostText}>Keep Going</Text>
                  </Pressable>
                  <Pressable onPress={confirmExit} style={S.modalDanger}>
                    <Text style={S.modalDangerText}>Exit</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            {/* FINISH */}
            <Modal
              visible={finishOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setFinishOpen(false)}
            >
              <Pressable
                style={S.modalOverlay}
                onPress={() => setFinishOpen(false)}
              />
              <View style={S.modalSheet}>
                <View style={S.modalHeader}>
                  <Text style={S.modalTitle}>
                    {isComplete ? "Finish workout?" : "Finish anyway?"}
                  </Text>
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
                  <Pressable
                    onPress={() => setFinishOpen(false)}
                    style={S.modalGhost}
                  >
                    <Text style={S.modalGhostText}>Keep logging</Text>
                  </Pressable>
                  <Pressable onPress={confirmFinish} style={S.modalPrimary}>
                    <Text style={S.modalPrimaryText}>Finish</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            {/* MENU */}
            <Modal
              visible={menuOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setMenuOpen(false)}
            >
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

            {/* SWAP */}
            <Modal
              visible={swapOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setSwapOpen(false)}
            >
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
                        <Pressable
                          key={alt.id}
                          onPress={() => swapExercise(alt)}
                          style={S.swapItem}
                        >
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
            <Modal
              visible={historyOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setHistoryOpen(false)}
            >
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
                  {(historyExerciseId
                    ? historyByExerciseId[historyExerciseId]
                    : [])?.length ? (
                    (historyByExerciseId[historyExerciseId as string] ?? []).map(
                      (session, index) => (
                        <View key={session.id}>
                          <View
                            style={[
                              S.historyCard,
                              index > 0 && S.historyCardSpaced,
                            ]}
                          >
                            <View style={S.historyCardHeader}>
                              <Text style={S.historyDate}>{session.dateLabel}</Text>
                              <Pressable
                                onPress={() => applySpecificSession(session.id)}
                                style={S.useSessionBtn}
                              >
                                <Text style={S.useSessionText}>Copy Sets</Text>
                              </Pressable>
                            </View>

                            <View style={S.historyTableHead}>
                              <Text style={[S.historyHead, { width: 40 }]}>SET</Text>
                              <Text style={S.historyHead}>W</Text>
                              <Text style={S.historyHead}>R</Text>
                              <Text style={S.historyHead}>REST</Text>
                              <Text
                                style={[
                                  S.historyHead,
                                  { width: 42, textAlign: "center" },
                                ]}
                              >
                                ✓
                              </Text>
                            </View>

                            {session.sets.map((hs) => (
                              <View
                                key={`${session.id}-${hs.set}`}
                                style={S.historyRow}
                              >
                                <Text style={[S.historyCellText, { width: 40 }]}>
                                  {hs.set}
                                </Text>
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
                      ),
                    )
                  ) : (
                    <Text style={{ color: "#666", fontWeight: "700", marginTop: 12 }}>
                      No history yet.
                    </Text>
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
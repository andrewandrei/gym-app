import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Check, MoreVertical, X } from "lucide-react-native";
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

  const initialExercises: Exercise[] = useMemo(
    () => [
      {
        id: "ex-1",
        name: "Barbell Squat",
        tempo: "3-0-1-0",
        image:
          "https://images.unsplash.com/photo-1517964603305-11c0f6f66012?auto=format&fit=crop&w=1200&q=70",
        unitLabel: "LBS",
        sets: [
          { id: "s1", weight: "185", reps: "10", rest: "90", done: true },
          { id: "s2", weight: "185", reps: "10", rest: "90", done: true },
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
    ],
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
        {
          id: "h2",
          dateLabel: "Feb 11, 2026",
          sets: [
            { set: 1, weight: "180", reps: "10", rest: "90", done: true },
            { set: 2, weight: "180", reps: "10", rest: "90", done: true },
            { set: 3, weight: "170", reps: "10", rest: "90", done: true },
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
            { set: 3, weight: "155", reps: "12", rest: "90", done: true },
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

  // REST TIMER STATE
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

  // TIMER COUNTDOWN
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
          setTimerDismissed(false); // Show timer again for next set
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
      setTimerDismissed(false); // Make sure timer is visible
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

  const applyLastSessionToExercise = async () => {
    if (!historyExerciseId) return;
    const sessions = historyByExerciseId[historyExerciseId] ?? [];
    if (!sessions.length) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const latest = sessions[0];
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== historyExerciseId) return ex;

        const incoming = latest.sets;
        const nextSets: SetRow[] = [...ex.sets].map((s) => ({ ...s }));
        let incomingIdx = 0;

        for (let i = 0; i < nextSets.length && incomingIdx < incoming.length; i++) {
          const s = nextSets[i];
          const isEmpty =
            (!s.weight || s.weight.trim() === "") &&
            (!s.reps || s.reps.trim() === "") &&
            (!s.rest || s.rest.trim() === "");

          if (isEmpty) {
            const inc = incoming[incomingIdx++];
            nextSets[i] = {
              ...s,
              weight: inc.weight,
              reps: inc.reps,
              rest: inc.rest,
              done: false,
            };
          }
        }

        while (incomingIdx < incoming.length) {
          const inc = incoming[incomingIdx++];
          nextSets.push({
            id: `s${nextSets.length + 1}`,
            weight: inc.weight,
            reps: inc.reps,
            rest: inc.rest,
            done: false,
          });
        }

        return { ...ex, sets: nextSets };
      })
    );

    setHistoryOpen(false);
  };

  return (
    <SafeAreaView style={S.safe}>
      <KeyboardAvoidingView style={S.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={S.page}>
          {/* COMPACT TIMER PILL AT TOP */}
          {activeTimer && !timerDismissed && (
            <Pressable 
              onPress={() => setTimerDismissed(true)}
              style={S.timerPill}
            >
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
            {/* HEADER */}
            <View style={S.header}>
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

            {/* EXERCISES */}
            <View style={S.exerciseList}>
              {exercises.map((ex) => (
                <View key={ex.id} style={S.card}>
                  <View style={S.cardInner}>
                    <View style={S.exerciseHeader}>
                      <Image source={{ uri: ex.image }} style={S.thumb} />
                      <View style={S.exerciseText}>
                        <Text style={S.exerciseTitle} numberOfLines={1} ellipsizeMode="tail">
                          {ex.name}
                        </Text>
                        <Text style={S.exerciseSub}>Tempo: {ex.tempo}</Text>
                      </View>
                      <Pressable style={S.menuBtn} onPress={() => {}}>
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

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* CTA */}
          <View style={S.bottomBar} pointerEvents="box-none">
            <View style={S.bottomBarInner}>
              <Pressable onPress={openFinish} style={S.cta} accessibilityRole="button">
                <Text style={S.ctaText}>Complete workout</Text>
              </Pressable>
            </View>
          </View>

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

          {/* FINISH MODAL */}
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

          {/* HISTORY MODAL */}
          <Modal visible={historyOpen} transparent animationType="fade" onRequestClose={() => setHistoryOpen(false)}>
            <Pressable style={S.modalOverlay} onPress={() => setHistoryOpen(false)} />
            <View style={S.modalSheetLarge}>
              <View style={S.modalHeader}>
                <Text style={S.modalTitle}>Exercise History</Text>
                <Pressable onPress={() => setHistoryOpen(false)} style={S.modalX}>
                  <X size={18} color="#111" />
                </Pressable>
              </View>

              <ScrollView
                style={{ maxHeight: 420 }}
                contentContainerStyle={{ paddingBottom: 12 }}
                showsVerticalScrollIndicator={false}
              >
                {(historyExerciseId ? historyByExerciseId[historyExerciseId] : [])?.length ? (
                  (historyByExerciseId[historyExerciseId as string] ?? []).map((session) => (
                    <View key={session.id} style={S.historyCard}>
                      <Text style={S.historyDate}>{session.dateLabel}</Text>

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
                  ))
                ) : (
                  <Text style={{ color: "#666", fontWeight: "700" }}>No history yet.</Text>
                )}
              </ScrollView>

              <View style={S.modalActions}>
                <Pressable onPress={() => setHistoryOpen(false)} style={S.modalGhost}>
                  <Text style={S.modalGhostText}>Close</Text>
                </Pressable>
                <Pressable onPress={applyLastSessionToExercise} style={S.modalPrimary}>
                  <Text style={S.modalPrimaryText}>Add to this exercise</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* STYLES */

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

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 8,
    paddingBottom: 12,
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
    minHeight: 54,
    paddingBottom: 8,
  },

  thumb: { width: 48, height: 48, borderRadius: 12 },

  exerciseText: { flex: 1, paddingLeft: 12, justifyContent: "center" },

  exerciseTitle: { fontSize: 20, fontWeight: "900", color: Colors.text },

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
    height: 54,
    borderBottomWidth: HAIR,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },

  setIndex: { width: 40, fontSize: 18, fontWeight: "900", color: "#555", textAlign: "center" },

  cell: {
    flex: 1,
    height: 42,
    marginHorizontal: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  input: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
    paddingVertical: 0,
    paddingHorizontal: 8,
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

  // COMPACT TIMER PILL (NEW!)
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

  // CTA
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 20,
  },

  bottomBarInner: {
    padding: 14,
    backgroundColor: "#fff",
    borderTopWidth: HAIR,
    borderTopColor: "#eee",
  },

  cta: {
    height: 54,
    borderRadius: 999,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  ctaText: { color: "#fff", fontWeight: "900", fontSize: 18 },

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

  historyCard: {
    borderWidth: HAIR,
    borderColor: "#e7e7e7",
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    backgroundColor: "#fff",
  },

  historyDate: { fontWeight: "900", color: "#111", marginBottom: 8 },

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
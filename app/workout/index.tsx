import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Check, MoreVertical } from "lucide-react-native";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
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

type HistoryEntry = {
  dateLabel: string;
  weight: string;
  reps: string;
  rest: string;
};

const HAIR = StyleSheet.hairlineWidth;

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

  const [exercises, setExercises] = useState(initialExercises);

  // Keep only one swipe row open
  const openRowRef = useRef<Swipeable | null>(null);
  const closeOpenRow = () => {
    openRowRef.current?.close();
    openRowRef.current = null;
  };

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
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, done: !s.done } : s)),
            }
      )
    );
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
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.done).length,
    0
  );
  const pct = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;

  // ✅ FIX: make complete workout ALWAYS do something
  const finishWorkout = async () => {
    await Haptics.selectionAsync();

    if (completedSets < totalSets) {
      Alert.alert("Finish workout?", "Some sets are incomplete.", [
        { text: "Keep logging", style: "cancel" },
        {
          text: "Finish",
          style: "destructive",
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.back();
          },
        },
      ]);
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const historyMock: HistoryEntry[] = [
    { dateLabel: "Last week", weight: "185", reps: "10", rest: "90" },
    { dateLabel: "2 weeks ago", weight: "180", reps: "10", rest: "90" },
  ];
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <SafeAreaView style={S.safe}>
      <KeyboardAvoidingView style={S.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={S.page}>
          <ScrollView
            style={S.scroll}
            contentContainerStyle={S.scrollContent}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={closeOpenRow}
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

                    {/* Column labels */}
                    <View style={S.cols}>
                      <Text style={[S.colLabel, { width: 40 }]}>SET</Text>
                      <Text style={S.colLabel}>{ex.unitLabel}</Text>
                      <Text style={S.colLabel}>REPS</Text>
                      <Text style={S.colLabel}>REST</Text>
                      <Text style={[S.colLabel, { width: 44, textAlign: "center" }]}>✓</Text>
                    </View>

                    {/* SETS */}
                    {ex.sets.map((s, i) => (
                      <Swipeable
                        key={s.id}
                        overshootRight={false}
                        rightThreshold={24}
                        onSwipeableOpen={() => {
                          // auto-close previously open row
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
                          // store only the last interacted row
                          // (good enough for “single open row” behavior)
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

                    {/* ACTIONS */}
                    <View style={S.cardActions}>
                      <Pressable onPress={() => setHistoryOpen(true)} style={S.ghostBtn}>
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

            {/* spacer so last card isn't hidden behind CTA */}
            <View style={{ height: 110 }} />
          </ScrollView>

          {/* ✅ CTA (touch priority fixed) */}
          <View style={S.bottomBar} pointerEvents="box-none">
            <View style={S.bottomBarInner}>
              <Pressable onPress={finishWorkout} style={S.cta} accessibilityRole="button">
                <Text style={S.ctaText}>Complete workout</Text>
              </Pressable>
            </View>
          </View>

          {/* HISTORY MODAL */}
          <Modal visible={historyOpen} transparent animationType="fade" onRequestClose={() => setHistoryOpen(false)}>
            <Pressable style={S.modalOverlay} onPress={() => setHistoryOpen(false)} />
            <View style={S.modalSheet}>
              <Text style={S.modalTitle}>Last workout</Text>
              {historyMock.map((h, idx) => (
                <Text key={idx} style={S.modalRow}>
                  {h.dateLabel}: {h.weight} × {h.reps} (rest {h.rest}s)
                </Text>
              ))}
              <Pressable onPress={() => setHistoryOpen(false)} style={S.modalClose}>
                <Text style={S.modalCloseText}>Close</Text>
              </Pressable>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- STYLES (SMALLER TEXT, SAME LAYOUT/FUNCTIONALITY) ---------- */

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },

  page: { flex: 1 },

  scroll: { flex: 1 },

  // ✅ more bottom space so CTA never overlaps content
  scrollContent: { paddingBottom: 0 },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 8,
    paddingBottom: 12,
  },

  // ✅ smaller
  title: { fontSize: 26, fontWeight: "900", color: Colors.text, letterSpacing: -0.2 },

  status: { marginTop: 6, fontSize: 13, color: "#777" },

  // ✅ smaller
  setsLine: { marginTop: 10, fontSize: 16, fontWeight: "800", color: "#333" },

  progressTrack: {
    marginTop: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#eee",
  },

  progressFill: { height: 8, borderRadius: 999, backgroundColor: "#000" },

  exerciseList: { gap: 12 },

  card: {
    marginHorizontal: Spacing.lg,
    borderRadius: 18,
    borderWidth: HAIR,
    borderColor: Colors.border,
    backgroundColor: "#fff",
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

  // ✅ smaller so long names don’t dominate
  exerciseTitle: { fontSize: 20, fontWeight: "900", color: Colors.text },

  exerciseSub: { marginTop: 3, fontSize: 12, color: "#666", fontWeight: "600" },

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
    fontWeight: "800",
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
  },

  // ✅ smaller
  setIndex: { width: 40, fontSize: 18, fontWeight: "900", color: "#555" },

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

  // ✅ smaller
  input: { textAlign: "center", fontSize: 16, fontWeight: "800", color: "#111" },

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
    backgroundColor: "transparent",
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

  // ✅ FIX: make CTA clickable above everything
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

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0005" },

  modalSheet: {
    marginTop: "auto",
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  modalTitle: { fontSize: 16, fontWeight: "900", marginBottom: 8 },

  modalRow: { paddingVertical: 6, fontWeight: "700", color: "#222" },

  modalClose: {
    marginTop: 12,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCloseText: { color: "#fff", fontWeight: "900" },
});

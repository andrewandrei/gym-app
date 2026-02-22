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
    updateSet(exId, setId, { done: !exercises.find((e) => e.id === exId)?.sets.find((s) => s.id === setId)?.done });
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

  const finishWorkout = async () => {
    if (completedSets < totalSets) {
      Alert.alert("Finish workout?", "Some sets are incomplete.", [
        { text: "Keep logging", style: "cancel" },
        { text: "Finish", onPress: () => router.back() },
      ]);
      return;
    }
    router.back();
  };

  const historyMock: HistoryEntry[] = [
    { dateLabel: "Last week", weight: "185", reps: "10", rest: "90" },
    { dateLabel: "2 weeks ago", weight: "180", reps: "10", rest: "90" },
  ];

  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <SafeAreaView style={S.safe}>
      <KeyboardAvoidingView
        style={S.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={S.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={closeOpenRow}
        >
          {/* HEADER */}
          <View style={S.header}>
            <Text style={S.title}>{workoutTitle}</Text>
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
                      <Text
                        style={S.exerciseTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {ex.name}
                      </Text>

                      <Text style={S.exerciseSub}>
                        Tempo: {ex.tempo}
                      </Text>
                    </View>

                    <Pressable style={S.menuBtn}>
                      <MoreVertical size={18} color={Colors.text} />
                    </Pressable>
                  </View>

                  {/* SETS */}
                  {ex.sets.map((s, i) => (
                    <Swipeable
                      key={s.id}
                      overshootRight={false}
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
                        if (ref) openRowRef.current = ref;
                      }}
                    >
                      <View style={S.row}>
                        <Text style={S.setIndex}>{i + 1}</Text>

                        {["weight", "reps", "rest"].map((field) => (
                          <View key={field} style={S.cell}>
                            <TextInput
                              value={(s as any)[field] ?? ""}
                              onChangeText={(t) =>
                                updateSet(ex.id, s.id, {
                                  [field]: t.replace(/[^\d.]/g, ""),
                                })
                              }
                              keyboardType="numeric"
                              style={S.input}
                              placeholder="—"
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
                    <Pressable
                      onPress={() => setHistoryOpen(true)}
                      style={S.ghostBtn}
                    >
                      <Text style={S.ghostText}>Exercise History</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => addSet(ex.id)}
                      style={S.ghostBtn}
                    >
                      <Text style={S.ghostText}>Add Set</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* CTA */}
        <View style={S.bottomBar}>
          <Pressable onPress={finishWorkout} style={S.cta}>
            <Text style={S.ctaText}>Complete workout</Text>
          </Pressable>
        </View>

        {/* HISTORY MODAL */}
        <Modal visible={historyOpen} transparent animationType="fade">
          <Pressable style={S.modalOverlay} onPress={() => setHistoryOpen(false)} />
          <View style={S.modalSheet}>
            {historyMock.map((h, i) => (
              <Text key={i} style={S.modalRow}>
                {h.dateLabel}: {h.weight}×{h.reps}
              </Text>
            ))}
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- STYLES (COMPACT) ---------- */

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },

  scrollContent: { paddingBottom: 96 },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: "900", color: Colors.text },
  status: { marginTop: 6, fontSize: 14, color: "#777" },
  setsLine: { marginTop: 10, fontSize: 18, fontWeight: "800" },

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
    minHeight: 56,
  },

  thumb: { width: 48, height: 48, borderRadius: 12 },

  exerciseText: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "center",
  },

  exerciseTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.text,
  },

  exerciseSub: { marginTop: 3, fontSize: 13, color: "#666" },

  menuBtn: { padding: 8 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
  },

  setIndex: { width: 40, fontSize: 20, fontWeight: "900" },

  cell: {
    flex: 1,
    height: 42,
    marginHorizontal: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
  },

  input: { textAlign: "center", fontSize: 18 },

  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  checkBtnOn: { backgroundColor: "#000", borderColor: "#000" },

  swipeBg: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 12,
  },

  deletePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#eee",
  },
  deleteText: { fontWeight: "900" },

  cardActions: { flexDirection: "row", gap: 10, marginTop: 10 },

  ghostBtn: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },

  ghostText: { fontWeight: "900" },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
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
  },

  modalRow: { paddingVertical: 8, fontWeight: "700" },
});

// app/workout/ExerciseHistoryModal.tsx

import { BorderWidth } from "@/styles/hairline";
import { Check, Sparkles, X } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/styles/colors";

type HistorySet = {
  id: string;
  weight?: string;
  reps?: string;
  rest?: string;
  done?: boolean;
  isPR?: boolean;
};

type HistorySession = {
  id: string;
  dateLabel: string;
  relativeLabel?: string;
  note?: string;
  sets: HistorySet[];
  hasPR?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
  unitLabel?: "LBS" | "KG" | "REPS";
  history?: HistorySession[];
  onApplySession?: (session: HistorySession) => void;
};

const DEMO_HISTORY: Record<string, HistorySession[]> = {
  "Rower (Easy Prime)": [
    {
      id: "rower-1",
      dateLabel: "Mar 7, 2026",
      relativeLabel: "2 days ago",
      note: "Felt smoother on pacing.",
      sets: [
        { id: "1", weight: "—", reps: "60", rest: "0:30", done: true },
      ],
    },
    {
      id: "rower-2",
      dateLabel: "Mar 3, 2026",
      relativeLabel: "6 days ago",
      sets: [{ id: "1", weight: "—", reps: "50", rest: "0:30", done: true }],
    },
  ],
  "Barbell Back Squat (Controlled)": [
    {
      id: "squat-1",
      dateLabel: "Mar 8, 2026",
      relativeLabel: "Yesterday",
      note: "Top set moved well.",
      hasPR: true,
      sets: [
        { id: "1", weight: "185", reps: "8", rest: "1:30", done: true },
        { id: "2", weight: "185", reps: "8", rest: "1:30", done: true },
        { id: "3", weight: "205", reps: "6", rest: "2:00", done: true, isPR: true },
      ],
    },
    {
      id: "squat-2",
      dateLabel: "Mar 1, 2026",
      relativeLabel: "1 week ago",
      sets: [
        { id: "1", weight: "175", reps: "8", rest: "1:30", done: true },
        { id: "2", weight: "175", reps: "8", rest: "1:30", done: true },
        { id: "3", weight: "185", reps: "6", rest: "2:00", done: true },
      ],
    },
    {
      id: "squat-3",
      dateLabel: "Feb 22, 2026",
      relativeLabel: "2 weeks ago",
      sets: [
        { id: "1", weight: "165", reps: "10", rest: "1:30", done: true },
        { id: "2", weight: "165", reps: "10", rest: "1:30", done: true },
        { id: "3", weight: "175", reps: "8", rest: "1:30", done: true },
      ],
    },
  ],
  "Romanian Deadlift": [
    {
      id: "rdl-1",
      dateLabel: "Mar 8, 2026",
      relativeLabel: "Yesterday",
      sets: [
        { id: "1", weight: "165", reps: "10", rest: "1:30", done: true },
        { id: "2", weight: "165", reps: "10", rest: "1:30", done: true },
        { id: "3", weight: "185", reps: "8", rest: "1:30", done: true, isPR: true },
      ],
      hasPR: true,
    },
    {
      id: "rdl-2",
      dateLabel: "Mar 2, 2026",
      relativeLabel: "1 week ago",
      sets: [
        { id: "1", weight: "155", reps: "10", rest: "1:30", done: true },
        { id: "2", weight: "155", reps: "10", rest: "1:30", done: true },
        { id: "3", weight: "165", reps: "8", rest: "1:30", done: true },
      ],
    },
  ],
};

export function ExerciseHistoryModal({
  visible,
  onClose,
  exerciseName,
  unitLabel = "LBS",
  history,
  onApplySession,
}: Props) {
  const resolvedHistory = useMemo(() => {
    if (history && history.length > 0) return history;
    return DEMO_HISTORY[exerciseName] ?? [];
  }, [exerciseName, history]);

  const latestPR = useMemo(() => {
    for (const session of resolvedHistory) {
      const prSet = session.sets.find((s) => s.isPR);
      if (prSet) {
        return {
          dateLabel: session.dateLabel,
          weight: prSet.weight,
          reps: prSet.reps,
        };
      }
    }
    return null;
  }, [resolvedHistory]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>Exercise History</Text>
              <Text style={styles.title} numberOfLines={2}>
                {exerciseName}
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={Colors.text} />
            </Pressable>
          </View>

          {latestPR ? (
            <View style={styles.prBanner}>
              <View style={styles.prIconWrap}>
                <Sparkles size={16} color={Colors.text} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.prTitle}>Personal Record</Text>
                <Text style={styles.prBody}>
                  {latestPR.weight} {unitLabel} × {latestPR.reps} on {latestPR.dateLabel}
                </Text>
              </View>
            </View>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {resolvedHistory.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>No history yet</Text>
                <Text style={styles.emptyBody}>
                  Completed sessions for this exercise will appear here.
                </Text>
              </View>
            ) : (
              resolvedHistory.map((session, sessionIndex) => (
                <View
                  key={session.id}
                  style={[
                    styles.sessionCard,
                    sessionIndex > 0 && styles.sessionCardSpaced,
                  ]}
                >
                  <View style={styles.sessionHeader}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <View style={styles.dateRow}>
                        <Text style={styles.sessionDate}>{session.dateLabel}</Text>
                        {session.relativeLabel ? (
                          <Text style={styles.relativeLabel}>{session.relativeLabel}</Text>
                        ) : null}
                      </View>

                      {session.note ? (
                        <Text style={styles.sessionNote}>{session.note}</Text>
                      ) : null}
                    </View>

                    {session.hasPR ? (
                      <View style={styles.prPill}>
                        <Text style={styles.prPillText}>PR</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.tableHead}>
                    <Text style={[styles.headCell, styles.headSet]}>Set</Text>
                    <Text style={styles.headCell}>{unitLabel}</Text>
                    <Text style={styles.headCell}>Reps</Text>
                    <Text style={styles.headCell}>Rest</Text>
                    <Text style={[styles.headCell, styles.headDone]}>Done</Text>
                  </View>

                  {session.sets.map((set, idx) => (
                    <View key={set.id} style={styles.tableRow}>
                      <Text style={[styles.bodyCell, styles.bodySet]}>{idx + 1}</Text>
                      <Text style={styles.bodyCell}>{set.weight || "—"}</Text>
                      <Text style={styles.bodyCell}>{set.reps || "—"}</Text>
                      <Text style={styles.bodyCell}>{set.rest || "—"}</Text>

                      <View style={[styles.bodyCell, styles.doneWrap]}>
                        {set.done ? (
                          <View style={[styles.doneDot, set.isPR && styles.doneDotPr]}>
                            <Check size={14} color="#FFF" strokeWidth={3} />
                          </View>
                        ) : (
                          <View style={styles.doneDotOff} />
                        )}
                      </View>
                    </View>
                  ))}

                  <Pressable
                    onPress={() => onApplySession?.(session)}
                    style={({ pressed }) => [
                      styles.applyBtn,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.applyBtnText}>Apply to Current Workout</Text>
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.24)",
    justifyContent: "flex-end",
  },

  sheet: {
    maxHeight: "84%",
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  headerText: {
    flex: 1,
    paddingTop: 4,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(0,0,0,0.40)",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  title: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.4,
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },

  prBanner: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(244,200,74,0.18)",
  },

  prIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  prTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 2,
  },

  prBody: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(0,0,0,0.66)",
  },

  scrollContent: {
    paddingTop: 14,
    paddingBottom: 8,
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
  },

  emptyBody: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "rgba(0,0,0,0.52)",
    textAlign: "center",
  },

  sessionCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: Colors.surface,
    borderWidth: BorderWidth.default,
    borderColor: "rgba(0,0,0,0.08)",
  },

  sessionCardSpaced: {
    marginTop: 12,
  },

  sessionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  sessionDate: {
    fontSize: 15,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.15,
  },

  relativeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(0,0,0,0.45)",
  },

  sessionNote: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: "rgba(0,0,0,0.52)",
  },

  prPill: {
    minWidth: 36,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(244,200,74,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  prPillText: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: 0.2,
  },

  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
  },

  headCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    color: "rgba(0,0,0,0.30)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },

  headSet: {
    width: 42,
    flex: 0,
  },

  headDone: {
    width: 54,
    flex: 0,
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },

  bodyCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: Colors.text,
  },

  bodySet: {
    width: 42,
    flex: 0,
    color: "rgba(0,0,0,0.52)",
  },

  doneWrap: {
    width: 54,
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  doneDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },

  doneDotPr: {
    backgroundColor: (Colors as any).premium ?? "#F4C84A",
  },

  doneDotOff: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.16)",
    backgroundColor: Colors.surface,
  },

  applyBtn: {
    marginTop: 14,
    height: 44,
    borderRadius: 999,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },

  applyBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.surface,
    letterSpacing: -0.15,
  },
});
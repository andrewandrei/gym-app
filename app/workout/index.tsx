

import { router } from "expo-router";
import { Check, ChevronLeft, MoreVertical } from "lucide-react-native";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/ui/PressableScale";
import { Colors } from "@/styles/colors";
import { styles } from "./workout.styles";

type FieldKey = "weight" | "reps" | "rest";

type SetEntry = {
  id: string;
  setNumber: number;
  weight: string;
  reps: string;
  rest: string; // seconds
  done: boolean;
};

type ExerciseEntry = {
  id: string;
  name: string;
  tempo?: string;
  image: string;
  sets: SetEntry[];
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseSeconds(s: string, fallback: number) {
  const n = Number(String(s).trim());
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function formatMMSS(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${mm}:${ss}`;
}

function makeSets(count: number, rest = "90"): SetEntry[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: uid("set"),
    setNumber: i + 1,
    weight: "",
    reps: "",
    rest,
    done: false,
  }));
}

type Grid = { setColW: number; checkColW: number; gap: number; inputW: number };

const DEFAULT_GRID: Grid = { setColW: 44, checkColW: 44, gap: 12, inputW: 86 };

function computeGrid(tableW: number): Grid {
  const setColW = 44;
  const checkColW = 44;
  const gap = 12;

  if (!tableW || tableW < 260) return DEFAULT_GRID;

  const available = tableW - setColW - checkColW - gap * 3;
  const raw = Math.floor(available / 3);
  const inputW = clamp(raw, 78, 98);

  return { setColW, checkColW, gap, inputW };
}

type RestState =
  | { active: false }
  | { active: true; secondsLeft: number; label: string; exerciseId: string; setId: string };

export default function WorkoutSessionScreen() {
  const insets = useSafeAreaInsets();

  // DEMO DATA (later: load from params + backend)
  const initial = useMemo(() => {
    return {
      title: "Foundation & Form",
      status: "In progress",
      exercises: [
        {
          id: "ex1",
          name: "Barbell Squat",
          tempo: "3-0-1-0",
          image:
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=70",
          sets: [
            { id: uid("s"), setNumber: 1, weight: "185", reps: "10", rest: "90", done: true },
            { id: uid("s"), setNumber: 2, weight: "185", reps: "10", rest: "90", done: true },
            { id: uid("s"), setNumber: 3, weight: "", reps: "", rest: "90", done: false },
            { id: uid("s"), setNumber: 4, weight: "", reps: "", rest: "90", done: false },
          ],
        },
        {
          id: "ex2",
          name: "Romanian Deadlift",
          tempo: "3-1-1-0",
          image:
            "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=70",
          sets: makeSets(4, "90"),
        },
        {
          id: "ex3",
          name: "Leg Press",
          tempo: "2-0-2-0",
          image:
            "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=900&q=70",
          sets: makeSets(3, "75"),
        },
        {
          id: "ex4",
          name: "Seated Leg Curl",
          tempo: "2-1-2-0",
          image:
            "https://images.unsplash.com/photo-1599058917765-3b0b0b1b845a?auto=format&fit=crop&w=900&q=70",
          sets: makeSets(3, "60"),
        },
      ] as ExerciseEntry[],
    };
  }, []);

  const [title] = useState(initial.title);
  const [status] = useState(initial.status);
  const [exercises, setExercises] = useState<ExerciseEntry[]>(initial.exercises);

  // Per-exercise measured width -> perfect grid on any device/web
  const [tableWidths, setTableWidths] = useState<Record<string, number>>({});
  const setTableWidth = (exerciseId: string, w: number) => {
    setTableWidths((prev) => {
      if (prev[exerciseId] === w) return prev;
      return { ...prev, [exerciseId]: w };
    });
  };

  // Rest timer (appears in bottom bar)
  const [rest, setRest] = useState<RestState>({ active: false });

  useEffect(() => {
    if (!rest.active) return;

    const t = setInterval(() => {
      setRest((prev) => {
        if (!prev.active) return prev;
        const next = prev.secondsLeft - 1;
        if (next <= 0) return { active: false };
        return { ...prev, secondsLeft: next };
      });
    }, 1000);

    return () => clearInterval(t);
  }, [rest.active]);

  const totals = useMemo(() => {
    const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const doneSets = exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.done).length, 0);
    const pct = Math.round((doneSets / Math.max(1, totalSets)) * 100);
    return { totalSets, doneSets, pct };
  }, [exercises]);

  const canComplete = totals.doneSets === totals.totalSets;

  const updateSet = (exerciseId: string, setId: string, patch: Partial<SetEntry>) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
        };
      })
    );
  };

  const toggleSetDone = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;

        const nextSets = ex.sets.map((s) => {
          if (s.id !== setId) return s;
          return { ...s, done: !s.done };
        });

        // If we just toggled ON, start rest timer using that set’s rest value
        const toggled = nextSets.find((s) => s.id === setId);
        if (toggled?.done) {
          const sec = parseSeconds(toggled.rest, 90);
          setRest({
            active: true,
            secondsLeft: sec,
            label: `Rest · ${ex.name}`,
            exerciseId,
            setId,
          });
        }

        return { ...ex, sets: nextSets };
      })
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const next = ex.sets.length + 1;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: uid("s"),
              setNumber: next,
              weight: "",
              reps: "",
              rest: last?.rest ?? "90",
              done: false,
            },
          ],
        };
      })
    );
  };

  // Input refs -> auto-advance focus
  const inputRefs = useRef<
    Record<string, { weight?: TextInput | null; reps?: TextInput | null; rest?: TextInput | null }>
  >({});

  const keyFor = (exerciseId: string, setId: string) => `${exerciseId}:${setId}`;

  const focusNext = (exerciseId: string, setIndex: number, field: FieldKey) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;

    const current = ex.sets[setIndex];
    if (!current) return;

    const curKey = keyFor(exerciseId, current.id);

    if (field === "weight") {
      inputRefs.current[curKey]?.reps?.focus?.();
      return;
    }
    if (field === "reps") {
      inputRefs.current[curKey]?.rest?.focus?.();
      return;
    }

    // field === rest -> next set weight
    const next = ex.sets[setIndex + 1];
    if (!next) return;
    const nextKey = keyFor(exerciseId, next.id);
    inputRefs.current[nextKey]?.weight?.focus?.();
  };

  const onComplete = () => {
    if (!canComplete) return;
    router.back();
  };

  const Header = (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.status}>{status}</Text>

      <View style={styles.progressBlock}>
        <Text style={styles.progressLabel}>
          {totals.doneSets} of {totals.totalSets} sets completed
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${totals.pct}%` }]} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 10) }]}>
          <PressableScale onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <ChevronLeft size={22} color={Colors.text} />
            <Text style={styles.backText}>Back</Text>
          </PressableScale>

          <PressableScale onPress={() => {}} style={styles.dotsBtn} hitSlop={12}>
            <MoreVertical size={18} color={Colors.text} />
          </PressableScale>
        </View>

        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={Header}
          renderItem={({ item }) => {
            const w = tableWidths[item.id] ?? 0;
            const grid = computeGrid(w);

            return (
              <ExerciseCard
                exercise={item}
                grid={grid}
                onLayoutTable={(ev) => {
                  const width = Math.floor(ev.nativeEvent.layout.width);
                  if (width) setTableWidth(item.id, width);
                }}
                onToggleDone={toggleSetDone}
                onChange={updateSet}
                onAddSet={addSet}
                inputRefs={inputRefs}
                focusNext={focusNext}
                keyFor={keyFor}
              />
            );
          }}
        />

        {/* Sticky bottom bar (rest timer + CTA) */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {rest.active ? (
            <View style={styles.restRow}>
              <View style={styles.restLeft}>
                <Text style={styles.restLabel} numberOfLines={1}>
                  {rest.label}
                </Text>
                <Text style={styles.restTime}>{formatMMSS(rest.secondsLeft)}</Text>
              </View>

              <PressableScale
                onPress={() => setRest({ active: false })}
                style={styles.restSkip}
                scaleTo={0.98}
                opacityTo={0.9}
              >
                <Text style={styles.restSkipText}>Skip</Text>
              </PressableScale>
            </View>
          ) : null}

          <PressableScale
            onPress={onComplete}
            style={[styles.completeCta, !canComplete && styles.completeCtaDisabled]}
            scaleTo={0.985}
            opacityTo={0.92}
            hitSlop={8}
          >
            <Text style={[styles.completeCtaText, !canComplete && styles.completeCtaTextDisabled]}>
              Complete workout
            </Text>
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ExerciseCard = memo(function ExerciseCard(props: {
  exercise: ExerciseEntry;
  grid: Grid;
  onLayoutTable: (e: LayoutChangeEvent) => void;
  onToggleDone: (exerciseId: string, setId: string) => void;
  onChange: (exerciseId: string, setId: string, patch: Partial<SetEntry>) => void;
  onAddSet: (exerciseId: string) => void;
  inputRefs: React.MutableRefObject<
    Record<string, { weight?: TextInput | null; reps?: TextInput | null; rest?: TextInput | null }>
  >;
  focusNext: (exerciseId: string, setIndex: number, field: FieldKey) => void;
  keyFor: (exerciseId: string, setId: string) => string;
}) {
  const { exercise: ex, grid, onLayoutTable, onToggleDone, onChange, onAddSet, inputRefs, focusNext, keyFor } = props;

  return (
    <View style={styles.card}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={styles.thumbWrap}>
          <Image source={{ uri: ex.image }} style={styles.thumbImage} />
        </View>

        <View style={styles.cardHeaderMid}>
          <Text style={styles.exerciseTitle} numberOfLines={1}>
            {ex.name}
          </Text>
          {!!ex.tempo && (
            <Text style={styles.exerciseTempo} numberOfLines={1}>
              Tempo: {ex.tempo}
            </Text>
          )}
        </View>

        <PressableScale onPress={() => {}} style={styles.cardDotsBtn} hitSlop={12}>
          <MoreVertical size={18} color={Colors.text} />
        </PressableScale>
      </View>

      {/* Table */}
      <View onLayout={onLayoutTable} style={styles.tableOuter}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { width: grid.setColW }]}>SET</Text>
          <Text style={[styles.th, { width: grid.inputW, textAlign: "center" }]}>LBS</Text>
          <Text style={[styles.th, { width: grid.inputW, textAlign: "center" }]}>REPS</Text>
          <Text style={[styles.th, { width: grid.inputW, textAlign: "center" }]}>REST</Text>
          <Text style={[styles.th, { width: grid.checkColW, textAlign: "right" }]}>✓</Text>
        </View>

        <View style={styles.tableDivider} />

        {ex.sets.map((s, idx) => {
          const isLast = idx === ex.sets.length - 1;
          const key = keyFor(ex.id, s.id);

          const isEmptyW = !s.weight;
          const isEmptyR = !s.reps;
          const isEmptyRest = !s.rest;

          return (
            <View key={s.id} style={styles.row}>
              <Text style={[styles.setNum, { width: grid.setColW }]}>{s.setNumber}</Text>

              <TextInput
                ref={(r) => {
                  inputRefs.current[key] = inputRefs.current[key] ?? {};
                  inputRefs.current[key].weight = r;
                }}
                value={s.weight}
                onChangeText={(t) => onChange(ex.id, s.id, { weight: t })}
                placeholder="—"
                placeholderTextColor="rgba(0,0,0,0.35)"
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => focusNext(ex.id, idx, "weight")}
                style={[
                  styles.cellInput,
                  isEmptyW && styles.cellInputEmpty,
                  { width: grid.inputW, marginRight: grid.gap },
                ]}
              />

              <TextInput
                ref={(r) => {
                  inputRefs.current[key] = inputRefs.current[key] ?? {};
                  inputRefs.current[key].reps = r;
                }}
                value={s.reps}
                onChangeText={(t) => onChange(ex.id, s.id, { reps: t })}
                placeholder="—"
                placeholderTextColor="rgba(0,0,0,0.35)"
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => focusNext(ex.id, idx, "reps")}
                style={[
                  styles.cellInput,
                  isEmptyR && styles.cellInputEmpty,
                  { width: grid.inputW, marginRight: grid.gap },
                ]}
              />

              <TextInput
                ref={(r) => {
                  inputRefs.current[key] = inputRefs.current[key] ?? {};
                  inputRefs.current[key].rest = r;
                }}
                value={s.rest}
                onChangeText={(t) => onChange(ex.id, s.id, { rest: t })}
                placeholder="—"
                placeholderTextColor="rgba(0,0,0,0.35)"
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={() => focusNext(ex.id, idx, "rest")}
                style={[
                  styles.cellInput,
                  isEmptyRest && styles.cellInputEmpty,
                  { width: grid.inputW, marginRight: grid.gap },
                ]}
              />

              <PressableScale
                onPress={() => onToggleDone(ex.id, s.id)}
                style={[styles.check, s.done && styles.checkDone]}
                hitSlop={10}
                scaleTo={0.96}
                opacityTo={0.92}
              >
                {s.done ? <Check size={16} color="#FFFFFF" /> : null}
              </PressableScale>

              {!isLast && <View style={[styles.rowDivider, { left: grid.setColW }]} />}
            </View>
          );
        })}
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        <PressableScale style={styles.actionBtn} onPress={() => {}} scaleTo={0.985} opacityTo={0.92}>
          <Text style={styles.actionText}>Exercise History</Text>
        </PressableScale>

        <PressableScale style={styles.actionBtn} onPress={() => onAddSet(ex.id)} scaleTo={0.985} opacityTo={0.92}>
          <Text style={styles.actionText}>Add Set</Text>
        </PressableScale>
      </View>
    </View>
  );
});

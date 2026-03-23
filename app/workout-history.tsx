// app/workout-history.tsx
// Register in app/_layout.tsx:
// <Stack.Screen name="workout-history" options={{ headerShown: false }} />

import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";
import { FontWeight, Typography } from "@/styles/typography";
import { useAppTheme } from "./_providers/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type Session = {
  type: string;
  date: string;
  complete: boolean;
  prs: string[];
};

type MonthData = {
  label: string;
  weeks: Record<string, Session[]>;
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const ALL_DATA: Record<string, MonthData> = {
  jan25: { label: "Jan 25", weeks: {
    "W1 · Intro": [
      { type: "Upper A", date: "Jan 6",  complete: true,  prs: [] },
      { type: "Lower A", date: "Jan 7",  complete: true,  prs: [] },
      { type: "Upper B", date: "Jan 9",  complete: true,  prs: [] },
      { type: "Lower B", date: "Jan 10", complete: false, prs: [] },
    ],
    "W2 · Build": [
      { type: "Upper A", date: "Jan 13", complete: true, prs: [] },
      { type: "Lower A", date: "Jan 14", complete: true, prs: [] },
      { type: "Upper B", date: "Jan 16", complete: true, prs: [] },
      { type: "Lower B", date: "Jan 17", complete: true, prs: [] },
    ],
  }},
  feb25: { label: "Feb 25", weeks: {
    "W3 · Build": [
      { type: "Upper A", date: "Feb 17", complete: true,  prs: [] },
      { type: "Lower A", date: "Feb 18", complete: true,  prs: [] },
      { type: "Upper B", date: "Feb 19", complete: false, prs: [] },
      { type: "Lower B", date: "Feb 20", complete: true,  prs: [] },
      { type: "Upper A", date: "Feb 21", complete: true,  prs: [] },
    ],
    "W4 · Deload": [
      { type: "Upper", date: "Feb 24", complete: true, prs: [] },
      { type: "Lower", date: "Feb 25", complete: true, prs: [] },
      { type: "Full",  date: "Feb 26", complete: true, prs: [] },
    ],
  }},
  mar25: { label: "Mar 25", weeks: {
    "W5 · Strength": [
      { type: "Upper A", date: "Mar 3",  complete: true,  prs: [] },
      { type: "Lower A", date: "Mar 4",  complete: true,  prs: [] },
      { type: "Upper B", date: "Mar 6",  complete: false, prs: [] },
      { type: "Lower B", date: "Mar 7",  complete: true,  prs: [] },
    ],
    "W6 · Strength": [
      { type: "Upper A", date: "Mar 10", complete: true,  prs: ["Bench Press 72.5kg×3"] },
      { type: "Lower A", date: "Mar 11", complete: true,  prs: ["Back Squat 95kg×3", "Romanian DL 82.5kg×3"] },
      { type: "Upper B", date: "Mar 13", complete: false, prs: [] },
      { type: "Lower B", date: "Mar 14", complete: true,  prs: ["Deadlift 122.5kg×3"] },
    ],
  }},
};

// ─── Merge real history ───────────────────────────────────────────────────────

function mergeRealHistory(real: any[]): Record<string, MonthData> {
  if (!real?.length) return ALL_DATA;
  const merged: Record<string, MonthData> = { ...ALL_DATA };
  real.forEach(entry => {
    const d     = new Date(entry.completedAt);
    const key   = `${d.toLocaleString("en-US", { month: "short" }).toLowerCase()}${String(d.getFullYear()).slice(2)}`;
    const label = `${d.toLocaleString("en-US", { month: "short" })} ${String(d.getFullYear()).slice(2)}`;
    const date  = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const prs: string[] = entry.exercises
      ?.flatMap((ex: any) => ex.sets?.filter((s: any) => s.comparison?.isWeightPR || s.comparison?.isRepPR)
        .map(() => ex.name) ?? [])
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i) ?? [];
    if (!merged[key]) merged[key] = { label, weeks: {} };
    const wk = "Logged sessions";
    if (!merged[key].weeks[wk]) merged[key].weeks[wk] = [];
    merged[key].weeks[wk].unshift({ type: entry.workoutTitle ?? "Workout", date, complete: entry.status === "completed", prs });
  });
  return merged;
}

// ─── Month summary ────────────────────────────────────────────────────────────

function MonthlySummary({ weeks, colors, isDark }: {
  weeks: Record<string, Session[]>; colors: any; isDark: boolean;
}) {
  const all        = Object.values(weeks).flat();
  const total      = all.length;
  const completed  = all.filter(s => s.complete).length;
  const prSessions = all.filter(s => s.prs.length > 0).length;
  const pct        = Math.round((completed / total) * 100);
  const pctColor   = pct >= 80 ? "#22C55E" : pct >= 60 ? colors.premium : "#EF4444";
  const soft       = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  return (
    <View style={[styles.summaryCard, { backgroundColor: soft, borderColor: colors.borderSubtle }]}>
      {[
        { label: "Sessions",    value: `${completed}/${total}`, color: colors.text      },
        { label: "With PRs",    value: String(prSessions),       color: prSessions > 0 ? colors.premium : colors.text },
        { label: "Consistency", value: `${pct}%`,                color: pctColor         },
      ].map((s, i, arr) => (
        <View key={i} style={[
          styles.summaryTile,
          i < arr.length - 1 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.borderSubtle },
        ]}>
          <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
          <Text style={[styles.caption, { color: colors.muted }]}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────

function SessionCard({ session, onPress, colors }: {
  session: Session; onPress: () => void; colors: any;
}) {
  const hasPR = session.prs.length > 0;

  return (
    <Pressable onPress={onPress}
      style={({ pressed }) => [styles.sessionCard, {
        backgroundColor: hasPR ? colors.premium + "10" : colors.card,
        borderColor:     hasPR ? colors.premium + "40" : colors.borderSubtle,
        opacity: pressed ? 0.78 : 1,
      }]}>

      {hasPR && (
        <View style={[styles.prBadge, { backgroundColor: colors.premium }]}>
          <Text style={styles.prBadgeText}>★ PR</Text>
        </View>
      )}

      <View style={[styles.sessionTop, hasPR && { marginTop: 8 }]}>
        <Text style={[styles.headline, { color: colors.text, flex: 1, paddingRight: 10, fontWeight: session.complete ? FontWeight.heavy : FontWeight.bold }]} numberOfLines={1}>
          {session.type}
        </Text>
        <View style={[styles.pill, {
          backgroundColor: session.complete ? "#22C55E" : "#F59E0B",
          borderColor:     "transparent",
        }]}>
          <Text style={[styles.pillText, { color: "#FFFFFF" }]}>
            {session.complete ? "Complete" : "Partial"}
          </Text>
        </View>
      </View>

      <Text style={[styles.caption, { color: colors.muted, marginBottom: hasPR ? 6 : 0 }]}>{session.date}</Text>

      {hasPR ? (
        <View style={{ gap: 4, marginTop: 2 }}>
          {session.prs.map((pr, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.premium }} />
              <Text style={[styles.caption, { color: colors.premium, fontWeight: FontWeight.bold }]}>{pr}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.caption, { color: colors.muted, marginTop: 2 }]}>No PRs this session</Text>
      )}

      <View style={[styles.viewHint, { borderTopColor: colors.borderSubtle }]}>
        <Text style={[styles.caption, { fontWeight: FontWeight.medium, color: colors.muted }]}>View session details</Text>
        <Text style={[styles.caption, { fontSize: 14, color: colors.muted }]}>›</Text>
      </View>
    </Pressable>
  );
}

// ─── Week section ─────────────────────────────────────────────────────────────

function WeekSection({ weekLabel, sessions, onSessionPress, colors }: {
  weekLabel: string;
  sessions: Session[];
  onSessionPress: (s: Session) => void;
  colors: any;
}) {
  const done = sessions.filter(s => s.complete).length;

  return (
    <View>
      <View style={styles.weekHeader}>
        <Text style={[styles.subhead, { color: colors.muted, fontSize: 12 }]}>{weekLabel}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {sessions.map((s, i) => (
              <View key={i} style={[styles.pip, {
                backgroundColor: s.complete ? colors.premium : colors.borderSubtle,
              }]} />
            ))}
          </View>
          <Text style={[styles.caption, { color: colors.muted }]}>{done}/{sessions.length}</Text>
        </View>
      </View>
      {sessions.map((s, i) => (
        <SessionCard key={i} session={s} onPress={() => onSessionPress(s)} colors={colors} />
      ))}
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const [realHistory, setRealHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const { loadWorkoutHistory } = require("./workout/workoutHistory");
      if (typeof loadWorkoutHistory === "function") {
        loadWorkoutHistory()
          .then((h: any[]) => setRealHistory(h ?? []))
          .catch(() => setRealHistory([]));
      }
    } catch { setRealHistory([]); }
  }, []);

  const mergedData   = useMemo(() => mergeRealHistory(realHistory), [realHistory]);
  const activeMonths = useMemo(
    () => Object.keys(mergedData).filter(k => Object.keys(mergedData[k].weeks).length > 0),
    [mergedData],
  );

  const [activeMonth, setActiveMonth] = useState<string>(
    () => activeMonths[activeMonths.length - 1] ?? "",
  );

  useEffect(() => {
    if (!activeMonths.includes(activeMonth) && activeMonths.length > 0) {
      setActiveMonth(activeMonths[activeMonths.length - 1]);
    }
  }, [activeMonths]);

  const monthData   = mergedData[activeMonth];
  const weekKeys    = monthData ? Object.keys(monthData.weeks) : [];
  const allSessions = weekKeys.flatMap(w => monthData?.weeks[w] ?? []);

  async function handleSessionPress(session: Session) {
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    const summary = {
      workoutTitle: session.type,
      durationSec: 2700,
      status: session.complete ? "completed" : "partial",
      totals: { completedSets: session.complete ? 12 : 7, totalSets: 12, completedExercises: session.complete ? 4 : 3, totalExercises: 4, totalVolume: 4200, trackedStrengthVolume: 4200 },
      insights: { completionRate: session.complete ? 1 : 0.58, prCount: session.prs.length, missingLoadCount: 0, strengthSetCount: 12, avgTrackedLoad: 85, improvedExerciseCount: session.prs.length > 0 ? session.prs.length : 1, matchedExerciseCount: 1, previousSessionFound: true },
      prs: session.prs.map((pr, i) => ({ exerciseId: `ex-${i}`, exerciseName: pr.split(" ").slice(0, 2).join(" "), weight: pr.match(/[\d.]+kg/)?.[0]?.replace("kg", "") ?? "0", reps: pr.match(/×(\d+)/)?.[1] ?? "3", type: "weight" })),
      wins: [],
      exercises: [{ id: "ex-1", name: session.type.includes("Upper") ? "Bench Press" : "Back Squat", completedSets: session.complete ? 4 : 3, totalSetsPlanned: 4, unitLabel: "KG", sessionVolume: 1200, comparedToLast: { result: session.prs.length > 0 ? "better" : "same" }, sets: Array.from({ length: session.complete ? 4 : 3 }, (_, i) => ({ set: i + 1, weight: String(80 + i * 2.5), reps: "5", rest: "2:00", done: true })) }],
    };
    await AsyncStorage.setItem("aa_fit_finish_summary", JSON.stringify(summary));
    router.push("/workout/finish");
  }

  const soft = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>

      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: Spacing.md }]}>
        <Pressable onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: soft, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.backBtnText, { color: colors.text }]}>‹</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[styles.micro, { color: colors.muted, marginBottom: 4 }]}>WORKOUT HISTORY</Text>
          <Text style={[styles.title1, { color: colors.text }]}>All Sessions</Text>
        </View>
        {allSessions.length > 0 && (
          <Text style={[styles.caption, { color: colors.muted }]}>{allSessions.length} sessions</Text>
        )}
      </View>

      {/* Month tabs — only months with data */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 14, gap: 8 }}
        style={{ flexGrow: 0 }}
      >
        {activeMonths.map(key => {
          const sel = key === activeMonth;
          return (
            <Pressable key={key} onPress={() => setActiveMonth(key)}
              style={[styles.monthTab, {
                backgroundColor: sel ? colors.premium + "18" : colors.card,
                borderColor:     sel ? colors.premium          : colors.borderSubtle,
              }]}>
              <Text style={[styles.subhead, {
                color:      sel ? colors.premium : colors.muted,
                fontWeight: sel ? FontWeight.heavy : FontWeight.medium,
                fontSize:   13,
              }]}>
                {mergedData[key].label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Session list */}
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {monthData && weekKeys.length > 0 && (
          <MonthlySummary weeks={monthData.weeks} colors={colors} isDark={isDark} />
        )}

        {weekKeys.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.title3, { color: colors.text, marginBottom: 8 }]}>No sessions this month</Text>
            <Text style={[styles.body, { color: colors.muted, textAlign: "center" }]}>
              Keep training — they'll appear here.
            </Text>
          </View>
        ) : weekKeys.map(wk => (
          <WeekSection
            key={wk}
            weekLabel={wk}
            sessions={monthData.weeks[wk]}
            onSessionPress={handleSessionPress}
            colors={colors}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header:       { flexDirection: "row", alignItems: "center", paddingTop: 8, paddingBottom: 14 },
  backBtn:      { width: 38, height: 38, borderRadius: 19, borderWidth: BorderWidth.default, alignItems: "center", justifyContent: "center" },
  backBtnText:  { fontSize: 22, fontWeight: "300", lineHeight: 26, marginTop: -1 },

  monthTab:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: BorderWidth.default },

  summaryCard:  { flexDirection: "row", borderRadius: 14, borderWidth: BorderWidth.default, marginBottom: 20, overflow: "hidden" },
  summaryTile:  { flex: 1, paddingVertical: 14, paddingHorizontal: 8, alignItems: "center" },
  summaryValue: { fontSize: 20, fontWeight: FontWeight.black, letterSpacing: -0.3, marginBottom: 4 },

  weekHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 10 },
  pip:          { width: 6, height: 6, borderRadius: 3 },

  sessionCard:  { borderRadius: 14, borderWidth: BorderWidth.default, padding: 14, marginBottom: 9 },
  prBadge:      { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
  prBadgeText:  { fontSize: 10, fontWeight: FontWeight.black, color: "#111111", letterSpacing: 0.4 },
  sessionTop:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 },
  pill:         { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 0, flexShrink: 0 },
  pillText:     { fontSize: 13, fontWeight: FontWeight.heavy },
  viewHint:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },

  empty:        { alignItems: "center", paddingTop: 60, paddingHorizontal: Spacing.lg },

  // Typography
  micro:   { ...Typography.micro },
  caption: { ...Typography.caption },
  subhead: { ...Typography.subhead },
  headline:{ ...Typography.headline },
  body:    { ...Typography.body },
  title1:  { ...Typography.title1 },
  title3:  { ...Typography.title3 },
});
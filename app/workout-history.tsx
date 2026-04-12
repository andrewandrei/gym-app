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

import { getWorkoutHistory } from "@/features/workout/workoutHistory";

import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";
import { FontWeight, Typography } from "@/styles/typography";
import { useAppTheme } from "../providers/theme";

import Svg, { Path } from "react-native-svg";

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

const ALL_DATA: Record<string, MonthData> = {
  jan25: {
    label: "Jan 25",
    weeks: {
      "W1 · Intro": [
        { type: "Upper A", date: "Jan 6", complete: true, prs: [] },
        { type: "Lower A", date: "Jan 7", complete: true, prs: [] },
        { type: "Upper B", date: "Jan 9", complete: true, prs: [] },
        { type: "Lower B", date: "Jan 10", complete: false, prs: [] },
      ],
      "W2 · Build": [
        { type: "Upper A", date: "Jan 13", complete: true, prs: [] },
        { type: "Lower A", date: "Jan 14", complete: true, prs: [] },
        { type: "Upper B", date: "Jan 16", complete: true, prs: [] },
        { type: "Lower B", date: "Jan 17", complete: true, prs: [] },
      ],
    },
  },
  feb25: {
    label: "Feb 25",
    weeks: {
      "W3 · Build": [
        { type: "Upper A", date: "Feb 17", complete: true, prs: [] },
        { type: "Lower A", date: "Feb 18", complete: true, prs: [] },
        { type: "Upper B", date: "Feb 19", complete: false, prs: [] },
        { type: "Lower B", date: "Feb 20", complete: true, prs: [] },
        { type: "Upper A", date: "Feb 21", complete: true, prs: [] },
      ],
      "W4 · Deload": [
        { type: "Upper", date: "Feb 24", complete: true, prs: [] },
        { type: "Lower", date: "Feb 25", complete: true, prs: [] },
        { type: "Full", date: "Feb 26", complete: true, prs: [] },
      ],
    },
  },
  mar25: {
    label: "Mar 25",
    weeks: {
      "W5 · Strength": [
        { type: "Upper A", date: "Mar 3", complete: true, prs: [] },
        { type: "Lower A", date: "Mar 4", complete: true, prs: [] },
        { type: "Upper B", date: "Mar 6", complete: false, prs: [] },
        { type: "Lower B", date: "Mar 7", complete: true, prs: [] },
      ],
      "W6 · Strength": [
        {
          type: "Upper A",
          date: "Mar 10",
          complete: true,
          prs: ["Bench Press 72.5kg×3"],
        },
        {
          type: "Lower A",
          date: "Mar 11",
          complete: true,
          prs: ["Back Squat 95kg×3", "Romanian DL 82.5kg×3"],
        },
        { type: "Upper B", date: "Mar 13", complete: false, prs: [] },
        {
          type: "Lower B",
          date: "Mar 14",
          complete: true,
          prs: ["Deadlift 122.5kg×3"],
        },
      ],
    },
  },
};

function mergeRealHistory(real: any[]): Record<string, MonthData> {
  if (!real?.length) return ALL_DATA;

  const merged: Record<string, MonthData> = { ...ALL_DATA };

  real.forEach((entry) => {
    const d = new Date(entry.completedAt);
    const key = `${d
      .toLocaleString("en-US", { month: "short" })
      .toLowerCase()}${String(d.getFullYear()).slice(2)}`;
    const label = `${d.toLocaleString("en-US", {
      month: "short",
    })} ${String(d.getFullYear()).slice(2)}`;
    const date = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const prs: string[] =
      entry.exercises
        ?.flatMap(
          (ex: any) =>
            ex.sets
              ?.filter(
                (s: any) => s.comparison?.isWeightPR || s.comparison?.isRepPR,
              )
              .map(() => ex.name) ?? [],
        )
        .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i) ?? [];

    if (!merged[key]) merged[key] = { label, weeks: {} };

    const wk = "Logged sessions";
    if (!merged[key].weeks[wk]) merged[key].weeks[wk] = [];

    merged[key].weeks[wk].unshift({
      type: entry.workoutTitle ?? "Workout",
      date,
      complete: entry.status === "completed",
      prs,
    });
  });

  return merged;
}

function getSoft(isDark: boolean) {
  return isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
}

function getStatusStyle(
  complete: boolean,
  colors: any,
  isDark: boolean,
): { bg: string; border: string; text: string; label: string } {
  if (complete) {
    return {
      bg: isDark ? "rgba(34,197,94,0.16)" : "rgba(34,197,94,0.12)",
      border: "transparent",
      text: "#22C55E",
      label: "Completed",
    };
  }

  return {
    bg: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.12)",
    border: "transparent",
    text: "#F59E0B",
    label: "Partial",
  };
}

function PRBadge({
  color,
  backgroundColor,
  borderColor,
}: {
  color: string;
  backgroundColor: string;
  borderColor: string;
}) {
  return (
    <View
      style={{
        minHeight: 24,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: BorderWidth.default,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor,
        borderColor,
      }}
    >
      <Svg width={10} height={10} viewBox="0 0 18 18">
        <Path
          d="M9 2L10.8 7H16L11.6 10.1L13.4 15L9 11.9L4.6 15L6.4 10.1L2 7H7.2L9 2Z"
          fill={color}
        />
      </Svg>

      <Text
        style={{
          fontSize: 10,
          fontWeight: "900",
          letterSpacing: 0.3,
          textTransform: "uppercase",
          color,
        }}
      >
        PR
      </Text>
    </View>
  );
}

function MonthlySummary({
  weeks,
  colors,
  isDark,
}: {
  weeks: Record<string, Session[]>;
  colors: any;
  isDark: boolean;
}) {
  const all = Object.values(weeks).flat();
  const total = all.length;
  const completed = all.filter((s) => s.complete).length;
  const prSessions = all.filter((s) => s.prs.length > 0).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pctColor =
    pct >= 80 ? "#22C55E" : pct >= 60 ? colors.premium : "#EF4444";
  const soft = getSoft(isDark);

  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      <Text style={[styles.summaryEyebrow, { color: colors.muted }]}>
        Month summary
      </Text>

      <View
        style={[
          styles.summaryGrid,
          {
            borderTopColor: colors.borderSubtle,
          },
        ]}
      >
        {[
          { label: "Sessions", value: `${completed}/${total}`, color: colors.text },
          {
            label: "With PRs",
            value: String(prSessions),
            color: prSessions > 0 ? colors.premium : colors.text,
          },
          { label: "Consistency", value: `${pct}%`, color: pctColor },
        ].map((s, i, arr) => (
          <View
            key={i}
            style={[
              styles.summaryTile,
              i < arr.length - 1 && {
                borderRightWidth: BorderWidth.default,
                borderRightColor: colors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.summaryValue, { color: s.color }]}>
              {s.value}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.summaryTrack,
          { backgroundColor: soft, marginTop: 14 },
        ]}
      >
        <View
          style={[
            styles.summaryFill,
            {
              width: `${pct}%`,
              backgroundColor: colors.premium,
            },
          ]}
        />
      </View>
    </View>
  );
}

function SessionCard({
  session,
  onPress,
  colors,
  isDark,
}: {
  session: Session;
  onPress: () => void;
  colors: any;
  isDark: boolean;
}) {
  const hasPR = session.prs.length > 0;
  const status = getStatusStyle(session.complete, colors, isDark);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sessionCard,
        {
          backgroundColor: colors.card,
          borderColor: hasPR ? colors.premium + "34" : colors.borderSubtle,
          opacity: pressed ? 0.84 : 1,
        },
      ]}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionHeaderLeft}>
          <View style={styles.sessionTitleRow}>
            <Text
              style={[styles.sessionTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {session.type}
            </Text>

            {hasPR ? (
            <PRBadge
              color={colors.premium}
              backgroundColor={colors.premium + "16"}
              borderColor={colors.premium + "28"}
            />
          ) : null}
          </View>

          <Text style={[styles.sessionMeta, { color: colors.muted }]}>
            {session.date}
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: status.bg,
              borderColor: status.border,
            },
          ]}
        >
          <Text style={[styles.statusPillText, { color: status.text }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: colors.borderSubtle, marginTop: 12, marginBottom: 10 },
        ]}
      />

      {hasPR ? (
        <View style={{ gap: 8 }}>
          {session.prs.map((pr, i) => (
            <View
              key={i}
              style={[
                styles.prRow,
                i > 0 && {
                  borderTopWidth: BorderWidth.default,
                  borderTopColor: colors.borderSubtle,
                  paddingTop: 8,
                },
              ]}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: colors.premium,
                  marginTop: 5,
                }}
              />
              <Text style={[styles.prText, { color: colors.premium }]}>
                {pr}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyPrText, { color: colors.muted }]}>
          No PRs this session
        </Text>
      )}

      <View
        style={[
          styles.divider,
          { backgroundColor: colors.borderSubtle, marginTop: 12, marginBottom: 10 },
        ]}
      />

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.muted }]}>
          View session details
        </Text>
        <Text style={[styles.footerText, { color: colors.muted }]}>›</Text>
      </View>
    </Pressable>
  );
}

function WeekSection({
  weekLabel,
  sessions,
  onSessionPress,
  colors,
  isDark,
}: {
  weekLabel: string;
  sessions: Session[];
  onSessionPress: (s: Session) => void;
  colors: any;
  isDark: boolean;
}) {
  const done = sessions.filter((s) => s.complete).length;

  return (
    <View style={styles.weekSection}>
      <View style={styles.weekHeader}>
        <View>
          <Text style={[styles.weekEyebrow, { color: colors.muted }]}>Block</Text>
          <Text style={[styles.weekTitle, { color: colors.text }]}>
            {weekLabel}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", gap: 7 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {sessions.map((s, i) => (
              <View
                key={i}
                style={[
                  styles.pip,
                  {
                    backgroundColor: s.complete
                      ? colors.premium
                      : colors.borderSubtle,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.weekCount, { color: colors.muted }]}>
            {done}/{sessions.length}
          </Text>
        </View>
      </View>

      {sessions.map((s, i) => (
        <SessionCard
          key={i}
          session={s}
          onPress={() => onSessionPress(s)}
          colors={colors}
          isDark={isDark}
        />
      ))}
    </View>
  );
}

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const [realHistory, setRealHistory] = useState<any[]>([]);

    useEffect(() => {
    getWorkoutHistory()
      .then((h: any[]) => setRealHistory(h ?? []))
      .catch(() => setRealHistory([]));
  }, []);

  const mergedData = useMemo(() => mergeRealHistory(realHistory), [realHistory]);

  const activeMonths = useMemo(
    () =>
      Object.keys(mergedData).filter(
        (k) => Object.keys(mergedData[k].weeks).length > 0,
      ),
    [mergedData],
  );

  const [activeMonth, setActiveMonth] = useState<string>(
    () => activeMonths[activeMonths.length - 1] ?? "",
  );

  useEffect(() => {
    if (!activeMonths.includes(activeMonth) && activeMonths.length > 0) {
      setActiveMonth(activeMonths[activeMonths.length - 1]);
    }
  }, [activeMonths, activeMonth]);

  const monthData = mergedData[activeMonth];
  const weekKeys = monthData ? Object.keys(monthData.weeks) : [];
  const allSessions = weekKeys.flatMap((w) => monthData?.weeks[w] ?? []);

  async function handleSessionPress(session: Session) {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;

    const summary = {
      workoutTitle: session.type,
      durationSec: 2700,
      status: session.complete ? "completed" : "partial",
      totals: {
        completedSets: session.complete ? 12 : 7,
        totalSets: 12,
        completedExercises: session.complete ? 4 : 3,
        totalExercises: 4,
        totalVolume: 4200,
        trackedStrengthVolume: 4200,
      },
      insights: {
        completionRate: session.complete ? 1 : 0.58,
        prCount: session.prs.length,
        missingLoadCount: 0,
        strengthSetCount: 12,
        avgTrackedLoad: 85,
        improvedExerciseCount: session.prs.length > 0 ? session.prs.length : 1,
        matchedExerciseCount: 1,
        previousSessionFound: true,
      },
      prs: session.prs.map((pr, i) => ({
        exerciseId: `ex-${i}`,
        exerciseName: pr.split(" ").slice(0, 2).join(" "),
        weight: pr.match(/[\d.]+kg/)?.[0]?.replace("kg", "") ?? "0",
        reps: pr.match(/×(\d+)/)?.[1] ?? "3",
        type: "weight",
      })),
      wins: [],
      exercises: [
        {
          id: "ex-1",
          name: session.type.includes("Upper") ? "Bench Press" : "Back Squat",
          completedSets: session.complete ? 4 : 3,
          totalSetsPlanned: 4,
          unitLabel: "KG",
          sessionVolume: 1200,
          comparedToLast: {
            result: session.prs.length > 0 ? "better" : "same",
          },
          sets: Array.from({ length: session.complete ? 4 : 3 }, (_, i) => ({
            set: i + 1,
            weight: String(80 + i * 2.5),
            reps: "5",
            rest: "2:00",
            done: true,
          })),
        },
      ],
    };

    await AsyncStorage.setItem("aa_fit_finish_summary", JSON.stringify(summary));
    router.push("/workout/finish");
  }

  const soft = getSoft(isDark);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { paddingHorizontal: Spacing.md }]}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.backBtn,
            {
              backgroundColor: soft,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Text style={[styles.backBtnText, { color: colors.text }]}>‹</Text>
        </Pressable>

        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[styles.headerEyebrow, { color: colors.muted }]}>
            Workout history
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            All Sessions
          </Text>
        </View>

        {allSessions.length > 0 ? (
          <Text style={[styles.headerCount, { color: colors.muted }]}>
            {allSessions.length} sessions
          </Text>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Spacing.md,
          paddingBottom: 14,
          gap: 8,
        }}
        style={{ flexGrow: 0 }}
      >
        {activeMonths.map((key) => {
          const sel = key === activeMonth;

          return (
            <Pressable
              key={key}
              onPress={() => setActiveMonth(key)}
              style={[
                styles.monthTab,
                {
                  backgroundColor: sel ? colors.premium + "16" : colors.card,
                  borderColor: sel ? colors.premium : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.monthTabText,
                  {
                    color: sel ? colors.premium : colors.muted,
                  },
                ]}
              >
                {mergedData[key].label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: Spacing.md,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        {monthData && weekKeys.length > 0 ? (
          <MonthlySummary
            weeks={monthData.weeks}
            colors={colors}
            isDark={isDark}
          />
        ) : null}

        {weekKeys.length === 0 ? (
          <View style={styles.empty}>
            <Text
              style={[
                styles.emptyTitle,
                { color: colors.text, marginBottom: 8 },
              ]}
            >
              No sessions this month
            </Text>
            <Text
              style={[
                styles.emptyBody,
                { color: colors.muted },
              ]}
            >
              Keep training — they’ll appear here.
            </Text>
          </View>
        ) : (
          weekKeys.map((wk) => (
            <WeekSection
              key={wk}
              weekLabel={wk}
              sessions={monthData.weeks[wk]}
              onSessionPress={handleSessionPress}
              colors={colors}
              isDark={isDark}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 14,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: BorderWidth.default,
    alignItems: "center",
    justifyContent: "center",
  },

  backBtnText: {
    fontSize: 22,
    fontWeight: "300",
    lineHeight: 26,
    marginTop: -1,
  },

  headerEyebrow: {
    ...Typography.micro,
    marginBottom: 4,
  },

  headerTitle: {
    ...Typography.title2,
  },

  headerCount: {
    ...Typography.caption,
    fontWeight: FontWeight.bold,
  },

  monthTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: BorderWidth.default,
  },

  monthTabText: {
    ...Typography.subhead,
    fontSize: 13,
    fontWeight: FontWeight.heavy,
  },

  summaryCard: {
    borderRadius: 20,
    borderWidth: BorderWidth.default,
    padding: 16,
    marginBottom: 20,
  },

  summaryEyebrow: {
    ...Typography.micro,
    marginBottom: 12,
  },

  summaryGrid: {
    flexDirection: "row",
    borderTopWidth: BorderWidth.default,
    paddingTop: 2,
  },

  summaryTile: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: FontWeight.black,
    letterSpacing: -0.25,
    marginBottom: 4,
  },

  summaryLabel: {
    ...Typography.caption,
    fontWeight: FontWeight.bold,
  },

  summaryTrack: {
    height: 3,
    borderRadius: 999,
    overflow: "hidden",
  },

  summaryFill: {
    height: "100%",
    borderRadius: 999,
  },

  weekSection: {
    marginTop: 18,
  },

  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },

  weekEyebrow: {
    ...Typography.micro,
    marginBottom: 4,
  },

  weekTitle: {
    ...Typography.title3,
  },

  weekCount: {
    ...Typography.caption,
    fontWeight: FontWeight.bold,
  },

  pip: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  sessionCard: {
    borderRadius: 20,
    borderWidth: BorderWidth.default,
    padding: 16,
    marginBottom: 10,
  },

  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },

  sessionHeaderLeft: {
    flex: 1,
  },

  sessionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  sessionTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.15,
    flexShrink: 1,
  },

  sessionMeta: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  statusPill: {
    minWidth: 84,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: BorderWidth.default,
    alignItems: "center",
    justifyContent: "center",
  },

  statusPillText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  prMiniBadge: {
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: BorderWidth.default,
    alignItems: "center",
    justifyContent: "center",
  },

  prMiniBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  divider: {
    height: BorderWidth.default,
    width: "100%",
  },

  prRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  prText: {
    ...Typography.caption,
    fontWeight: FontWeight.heavy,
    lineHeight: 18,
    flex: 1,
  },

  emptyPrText: {
    ...Typography.caption,
    fontWeight: FontWeight.bold,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerText: {
    ...Typography.caption,
    fontWeight: FontWeight.bold,
  },

  empty: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
  },

  emptyTitle: {
    ...Typography.title3,
    textAlign: "center",
  },

  emptyBody: {
    ...Typography.body,
    textAlign: "center",
  },
});
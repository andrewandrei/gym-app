// app/(tabs)/progress.tsx
import { ArrowDown, ArrowUp, ChevronRight, Minus } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/styles/colors";
import { GlobalStyles } from "@/styles/global";

import { styles } from "./progress.styles";

type RecentSession = {
  id: string;
  title: string;
  meta: string;
  dateLabel: string;
};

type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

type DayItem = {
  key: DayKey;
  label: string;
  isToday?: boolean;
  isCompleted?: boolean;
};

type DayWorkout = {
  day: DayKey;
  title: string;
  meta: string;
  note?: string;
  state?: "planned" | "completed" | "rest";
};

type Trend = "down" | "up" | "flat";

/* ───────────────────────── Animated helpers ───────────────────────── */

function AnimatedProgressBar({ value }: { value: number }) {
  const w = useSharedValue(0);

  useEffect(() => {
    const to = Math.max(0, Math.min(1, value));
    w.value = withTiming(to, {
      duration: 720,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, w]);

  const fillStyle = useAnimatedStyle(() => {
    return { width: `${w.value * 100}%` };
  });

  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, fillStyle]} />
    </View>
  );
}

function useAnimatedNumber(target: number, duration = 680) {
  const v = useSharedValue(target);
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    v.value = withTiming(target, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [target, v, duration]);

  useDerivedValue(() => {
    runOnJS(setDisplay)(Math.round(v.value));
  });

  return display;
}

function usePulseOnChange(deps: any[]) {
  const t = useSharedValue(1);

  useEffect(() => {
    t.value = 1;
    t.value = withSequence(
      withTiming(1.02, { duration: 160, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const pulseStyle = useAnimatedStyle(() => {
    const lift = interpolate(t.value, [1, 1.02], [0, -2], Extrapolate.CLAMP);
    return {
      transform: [{ translateY: lift }, { scale: t.value }],
    };
  });

  return pulseStyle;
}

/* ───────────────────────── UI bits ───────────────────────── */

function RecentRow({ item }: { item: RecentSession }) {
  return (
    <View style={styles.recentRow}>
      <View style={styles.recentLeft}>
        <Text style={styles.recentTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.recentMeta} numberOfLines={1}>
          {item.meta}
        </Text>
      </View>
      <Text style={styles.recentDate}>{item.dateLabel}</Text>
    </View>
  );
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "down") return <ArrowDown size={14} color={Colors.text} />;
  if (trend === "up") return <ArrowUp size={14} color={Colors.muted} />;
  return <Minus size={14} color={Colors.muted} />;
}

function TrendPill({ trend, label }: { trend: Trend; label: string }) {
  const pillStyle =
    trend === "down"
      ? styles.trendPillGood
      : trend === "up"
        ? styles.trendPillUp
        : styles.trendPillNeutral;

  const textStyle =
    trend === "down"
      ? styles.trendTextGood
      : trend === "up"
        ? styles.trendTextUp
        : styles.trendTextNeutral;

  return (
    <View style={[styles.trendPillBase, pillStyle]}>
      <TrendIcon trend={trend} />
      <Text style={[styles.trendTextBase, textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function WeekStrip({
  days,
  selected,
  onSelect,
}: {
  days: DayItem[];
  selected: DayKey;
  onSelect: (k: DayKey) => void;
}) {
  return (
    <View style={styles.weekStrip}>
      {days.map((d) => {
        const isSelected = d.key === selected;

        const dotStyle = [
          styles.weekDot,
          d.isCompleted ? styles.weekDotCompleted : null,
          d.isToday ? styles.weekDotToday : null,
          isSelected ? styles.weekDotSelected : null,
        ];

        const labelStyle = [
          styles.weekLabel,
          d.isToday ? styles.weekLabelToday : null,
          d.isCompleted ? styles.weekLabelCompleted : null,
          isSelected ? styles.weekLabelSelected : null,
        ];

        return (
          <Pressable
            key={d.key}
            onPress={() => onSelect(d.key)}
            style={({ pressed }) => [
              styles.weekItem,
              isSelected ? styles.weekItemSelected : null,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Select ${d.key}`}
          >
            <View style={dotStyle} />
            <Text style={labelStyle}>{d.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function ProgressScreen() {
  /* ─────────────── Demo state (swap with real data later) ─────────────── */
  const weeklyDone = 2;
  const weeklyTotal = 3;

  const streakDays = 3;

  const programCompleted = 3;
  const programTotal = 21;

  const bestLift = {
    title: "Bench Press",
    value: "100 kg × 5",
    hint: "Personal best this month",
  };

  const metrics = {
    weight: {
      value: "83.4 kg",
      trend: "down" as Trend,
      trendLabel: "↓ 0.6 kg (7d)",
    },
    waist: {
      value: "82 cm",
      trend: "flat" as Trend,
      trendLabel: "Stable (14d)",
    },
    lastCheckIn: "2 days ago",
  };

  const recent = useMemo<RecentSession[]>(
    () => [
      {
        id: "s1",
        title: "Hypertrophy Focus",
        meta: "Upper • 42 min",
        dateLabel: "Today",
      },
      {
        id: "s2",
        title: "Lower Body Power",
        meta: "Strength • 38 min",
        dateLabel: "Yesterday",
      },
      {
        id: "s3",
        title: "Intervals + Finisher",
        meta: "Conditioning • 28 min",
        dateLabel: "Mon",
      },
      {
        id: "s4",
        title: "Mobility Reset",
        meta: "Recovery • 12 min",
        dateLabel: "Sat",
      },
    ],
    [],
  );

  const days = useMemo<DayItem[]>(
    () => [
      { key: "Mon", label: "M", isCompleted: true },
      { key: "Tue", label: "T", isCompleted: true, isToday: true },
      { key: "Wed", label: "W" },
      { key: "Thu", label: "T" },
      { key: "Fri", label: "F" },
      { key: "Sat", label: "S" },
      { key: "Sun", label: "S" },
    ],
    [],
  );

  const dayWorkouts = useMemo<DayWorkout[]>(
    () => [
      {
        day: "Mon",
        title: "Intervals + Finisher",
        meta: "Conditioning • 28 min",
        state: "completed",
      },
      {
        day: "Tue",
        title: "Hypertrophy Focus",
        meta: "Upper • 42 min",
        note: "Focus: hypertrophy",
        state: "planned",
      },
      {
        day: "Wed",
        title: "Lower Body Power",
        meta: "Strength • 38 min",
        note: "Focus: strength",
        state: "planned",
      },
      {
        day: "Thu",
        title: "Mobility Reset",
        meta: "Recovery • 12 min",
        state: "rest",
      },
      {
        day: "Fri",
        title: "Pull + Arms",
        meta: "Upper • 36 min",
        state: "planned",
      },
      {
        day: "Sat",
        title: "Zone 2 Cardio",
        meta: "Cardio • 30 min",
        state: "planned",
      },
      {
        day: "Sun",
        title: "Off",
        meta: "Recovery • Optional walk",
        state: "rest",
      },
    ],
    [],
  );

  const [selectedDay, setSelectedDay] = useState<DayKey>("Tue");
  const selected = useMemo(
    () => dayWorkouts.find((d) => d.day === selectedDay) ?? dayWorkouts[0],
    [dayWorkouts, selectedDay],
  );

  /* ─────────────── Derived values ─────────────── */
  const weekProgress = weeklyTotal > 0 ? weeklyDone / weeklyTotal : 0;
  const programProgress =
    programTotal > 0 ? programCompleted / programTotal : 0;
  const programPct = Math.round(programProgress * 100);

  const animatedStreak = useAnimatedNumber(streakDays, 680);
  const prPulseStyle = usePulseOnChange([bestLift.value]);

  // Day card micro-animate on selection (spring lift + fade)
  const dayT = useSharedValue(1);
  useEffect(() => {
    dayT.value = 0;
    dayT.value = withDelay(
      10,
      withSpring(1, {
        damping: 18,
        stiffness: 220,
        mass: 0.7,
      }),
    );
  }, [selectedDay, dayT]);

  const dayCardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      dayT.value,
      [0, 1],
      [0.4, 1],
      Extrapolate.CLAMP,
    );
    const translateY = interpolate(
      dayT.value,
      [0, 1],
      [5, 0],
      Extrapolate.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  const selectedStateLabel =
    selected.state === "completed"
      ? "Completed"
      : selected.state === "rest"
        ? "Recovery"
        : "Planned";

  return (
    <SafeAreaView style={[GlobalStyles.safe, styles.safe]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.kicker}>Momentum</Text>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>
            Consistency, PRs, and body metrics — at a glance.
          </Text>
        </View>

        {/* This week */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This week</Text>
            <Text style={styles.sectionRight}>
              {weeklyDone}/{weeklyTotal}
            </Text>
          </View>

          <AnimatedProgressBar value={weekProgress} />

          <View style={styles.weekHintRow}>
            <Text style={styles.weekHint}>Keep it simple.</Text>
            <Text style={styles.weekHintStrong}>
              {Math.max(0, weeklyTotal - weeklyDone)} left
            </Text>
          </View>

          <WeekStrip
            days={days}
            selected={selectedDay}
            onSelect={setSelectedDay}
          />

          {/* Day workout preview */}
          <Animated.View style={[styles.dayCard, dayCardStyle]}>
            <View style={styles.dayCardTop}>
              <Text style={styles.dayCardKicker}>{selectedDay}</Text>
              <View style={styles.dayChip}>
                <Text style={styles.dayChipText}>{selectedStateLabel}</Text>
              </View>
            </View>

            <Text style={styles.dayCardTitle} numberOfLines={1}>
              {selected.title}
            </Text>
            <Text style={styles.dayCardMeta} numberOfLines={1}>
              {selected.meta}
            </Text>

            {!!selected.note && (
              <Text style={styles.dayCardNote} numberOfLines={1}>
                {selected.note}
              </Text>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.dayCardCta,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.dayCardCtaText}>View workout</Text>
              <ChevronRight size={18} color={Colors.muted} />
            </Pressable>
          </Animated.View>
        </View>

        {/* Stats */}
        <View style={styles.grid}>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>Streak</Text>
            <Text style={styles.tileValue}>{animatedStreak} days</Text>
            <Text style={styles.tileHint}>Daily momentum</Text>
          </View>

          <View style={styles.tile}>
            <Text style={styles.tileLabel}>Active plan</Text>
            <Text style={styles.tileValue}>{programPct}%</Text>
            <Text style={styles.tileHint}>
              {programCompleted}/{programTotal} complete
            </Text>
          </View>
        </View>

        {/* PR */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal best</Text>
            <Pressable
              style={({ pressed }) => [styles.link, pressed && styles.pressed]}
            >
              <Text style={styles.linkText}>Details</Text>
              <ChevronRight size={16} color={Colors.muted} />
            </Pressable>
          </View>

          <Animated.View style={[styles.cardHighlight, prPulseStyle]}>
            <Text style={styles.smallLabelHighlight} numberOfLines={1}>
              {bestLift.title}
            </Text>
            <Text style={styles.bigValueHighlight}>{bestLift.value}</Text>
            <Text style={styles.smallHintHighlight}>{bestLift.hint}</Text>
          </Animated.View>
        </View>

        {/* Body metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Body metrics</Text>
            <Pressable
              style={({ pressed }) => [styles.link, pressed && styles.pressed]}
            >
              <Text style={styles.linkText}>Update</Text>
              <ChevronRight size={16} color={Colors.muted} />
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.metricRow}>
              <View style={styles.metricLeft}>
                <Text style={styles.metricLabel}>Weight</Text>
                <View style={styles.metricTrendRow}>
                  <TrendPill
                    trend={metrics.weight.trend}
                    label={metrics.weight.trendLabel}
                  />
                </View>
              </View>
              <Text style={styles.metricValue}>{metrics.weight.value}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricRow}>
              <View style={styles.metricLeft}>
                <Text style={styles.metricLabel}>Waist</Text>
                <View style={styles.metricTrendRow}>
                  <TrendPill
                    trend={metrics.waist.trend}
                    label={metrics.waist.trendLabel}
                  />
                </View>
              </View>
              <Text style={styles.metricValue}>{metrics.waist.value}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricFooter}>
              <Text style={styles.metricFooterText}>Last check-in</Text>
              <Text style={styles.metricFooterStrong}>
                {metrics.lastCheckIn}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent sessions</Text>
            <Pressable
              style={({ pressed }) => [styles.link, pressed && styles.pressed]}
            >
              <Text style={styles.linkText}>View all</Text>
              <ChevronRight size={16} color={Colors.muted} />
            </Pressable>
          </View>

          <View style={styles.card}>
            {recent.map((item, idx) => (
              <View key={item.id}>
                <RecentRow item={item} />
                {idx !== recent.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

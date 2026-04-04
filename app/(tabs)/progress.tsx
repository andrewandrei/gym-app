// app/(tabs)/progress.tsx
//
// All data comes from useProgressData().
// This file only handles UI.

import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  PanResponder,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { buildMonthData } from "../../lib/progress/bodySelectors";
import { PERFORMANCE_DEMO_CARDS } from "../../lib/progress/performanceDemoData";
import { loadProgressViewState, saveProgressViewState } from "../../lib/progress/progressViewState";
import type { CheckIn, WeekEntry, WeekSession } from "../../lib/progress/types";
import { useProgressData } from "../../lib/progress/useProgressData";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";
import { FontSize, FontWeight, Typography } from "@/styles/typography";
import { useAppTheme } from "../../providers/theme";

import { Share2 } from "lucide-react-native";

type TabKey = "program" | "performance" | "body";
type ProgramView = "week" | "month";

const MEAS_FIELDS = [
  { key: "waist" as const, label: "Waist", good: "down" as const },
  { key: "chest" as const, label: "Chest", good: "up" as const },
  { key: "arm" as const, label: "Arm", good: "up" as const },
];

function getSoft(isDark: boolean) {
  return isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
}

function getSoftStrong(isDark: boolean) {
  return isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
}

function getNegativeColor(colors: any, isDark: boolean) {
  return isDark ? "#FF8A7A" : "#B42318";
}

function getNegativeSoft(isDark: boolean) {
  return isDark ? "rgba(255,107,94,0.16)" : "rgba(217,45,32,0.10)";
}

function getNegativeBorder(isDark: boolean) {
  return isDark ? "rgba(255,107,94,0.30)" : "rgba(180,35,24,0.18)";
}

function getStatusStyle(
  session: WeekSession,
  colors: any,
  isDark: boolean,
): { bg: string; border: string; text: string; label: string } {
  if (session.planned) {
    return {
      bg: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
      border: colors.borderSubtle,
      text: colors.muted,
      label: "Planned",
    };
  }

  if (session.complete) {
    return {
      bg: colors.successSoft,
      border: colors.successBorder,
      text: colors.successText,
      label: "Completed",
    };
  }

  return {
    bg: colors.warningSoft,
    border: colors.warningBorder,
    text: colors.warningText,
    label: "Partial",
  };
}

function Spark({
  data,
  color,
  width,
  height,
  strokeWidth = 1.8,
}: {
  data: number[];
  color: string;
  width: number;
  height: number;
  strokeWidth?: number;
}) {
  if (!data || data.length < 2) return <View style={{ width, height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.5;
  const p = 3;
  const pts = data.map((v, i) => ({
    x: p + (i / (data.length - 1)) * (width - p * 2),
    y: height - p - ((v - min) / range) * (height - p * 2),
  }));
  const line = pts
    .map(
      (pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`,
    )
    .join(" ");
  const last = pts[pts.length - 1];

  return (
    <Svg width={width} height={height} style={{ overflow: "visible" }}>
      <Path
        d={line}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={last.x} cy={last.y} r={3.5} fill={color} />
    </Svg>
  );
}

function PRIcon({ color }: { color: string }) {
  return (
    <Svg width={11} height={11} viewBox="0 0 18 18">
      <Path
        d="M9 2L10.8 7H16L11.6 10.1L13.4 15L9 11.9L4.6 15L6.4 10.1L2 7H7.2L9 2Z"
        fill={color}
      />
    </Svg>
  );
}

function PRToast({
  name,
  gain,
  onDone,
}: {
  name: string;
  gain: string;
  onDone: () => void;
}) {
  const { colors } = useAppTheme();
  const ty = useRef(new Animated.Value(-80)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(ty, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.back(1.3)),
        useNativeDriver: true,
      }),
      Animated.timing(op, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(ty, {
          toValue: -80,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(op, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start(() => onDone());
    }, 4200);

    return () => clearTimeout(t);
  }, [op, ty, onDone]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        S.toast,
        {
          backgroundColor: colors.card,
          borderColor: colors.premiumBorder,
          transform: [{ translateY: ty }],
          opacity: op,
        },
      ]}
    >
      <View
        style={[
          S.toastIcon,
          {
            backgroundColor: colors.premiumSoft,
            borderColor: colors.premiumBorder,
          },
        ]}
      >
        <PRIcon color={colors.premiumText} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[S.toastTitle, { color: colors.text }]}>
          New personal record
        </Text>
        <Text style={[S.toastSub, { color: colors.muted }]}>
          {name} —{" "}
          <Text style={{ color: colors.successText, fontWeight: FontWeight.heavy }}>
            +{gain} kg
          </Text>
        </Text>
      </View>
    </Animated.View>
  );
}

function PRBadge({ colors }: { colors: any }) {
  return (
    <View
      style={[
        S.prMiniBadge,
        {
          backgroundColor: colors.premiumSoft,
          borderColor: colors.premiumBorder,
        },
      ]}
    >
      <PRIcon color={colors.premiumText} />
      <Text style={[S.prMiniBadgeText, { color: colors.premiumText }]}>PR</Text>
    </View>
  );
}

function WeekDetailPanel({
  week,
  colors,
  isDark,
  onSessionPress,
}: {
  week: WeekEntry;
  colors: any;
  isDark: boolean;
  onSessionPress: (s: WeekSession) => void;
}) {
  const done = week.sessions.filter((s) => !s.planned && s.complete).length;
  const total = week.sessions.length;
  const statusLabel = week.upcoming
    ? "PLANNED"
    : week.current
      ? "IN PROGRESS"
      : "COMPLETED";
  const statusColor = week.upcoming ? colors.muted : colors.premiumText;

  

  return (
    <View
      style={{
        paddingTop: 16,
        borderTopWidth: BorderWidth.default,
        borderTopColor: colors.borderSubtle,
        marginTop: 6,
      }}
    >
      <View style={[S.row, { marginBottom: 14, alignItems: "flex-start" }]}>
        <View>
          <Text style={[S.eyebrow, { color: statusColor, marginBottom: 3 }]}>
            {statusLabel}
          </Text>
          <Text style={[S.title3, { color: colors.text }]}>
            Week {week.n} — {week.label}
          </Text>
          <Text style={[S.caption, { color: colors.muted, marginTop: 2 }]}>
            {week.dates}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={[S.caption, { color: colors.muted }]}>Sessions</Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: FontWeight.black,
              color: statusColor,
              letterSpacing: -0.2,
            }}
          >
            {week.upcoming ? total : done}
            {!week.upcoming && (
              <Text style={[S.caption, { color: colors.muted }]}>/{total}</Text>
            )}
          </Text>
        </View>
      </View>

      {week.sessions.map((s, i) => {
        const prs = s.lifts.filter((l) => l.includes("🏆"));
        const hasPR = prs.length > 0;
        const pill = getStatusStyle(s, colors, isDark);

        return (
          <Pressable
            key={i}
            onPress={() => !s.planned && onSessionPress(s)}
            style={({ pressed }) => [
              S.finishLikeCard,
              {
                backgroundColor: colors.card,
                borderColor: hasPR ? colors.premiumBorder : colors.borderSubtle,
                opacity: s.planned ? 0.64 : pressed ? 0.84 : 1,
                marginBottom: 10,
              },
            ]}
          >
            <View style={[S.row, { alignItems: "flex-start" }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <Text
                    style={[
                      S.finishLikeTitle,
                      { color: s.planned ? colors.muted : colors.text },
                    ]}
                  >
                    {s.type}
                  </Text>
                  {hasPR ? <PRBadge colors={colors} /> : null}
                </View>

                <Text style={[S.finishLikeMeta, { color: colors.muted, marginTop: 4 }]}>
                  {s.date}
                  {!s.planned ? " · tap to view" : ""}
                </Text>
              </View>

              <View
                style={[
                  S.statusPill,
                  {
                    backgroundColor: pill.bg,
                    borderColor: pill.border,
                  },
                ]}
              >
                <Text style={[S.statusPillText, { color: pill.text }]}>
                  {pill.label}
                </Text>
              </View>
            </View>

            <View
              style={[
                S.divider,
                { backgroundColor: colors.borderSubtle, marginTop: 12, marginBottom: 10 },
              ]}
            />

            {s.planned ? (
              <View style={{ gap: 6 }}>
                {s.lifts.map((l, j) => (
                  <Text key={j} style={[S.caption, { color: colors.muted }]}>
                    {l}
                  </Text>
                ))}
              </View>
            ) : hasPR ? (
              <View style={{ gap: 6 }}>
                {prs.map((l, j) => (
                  <View
                    key={j}
                    style={[
                      S.prRow,
                      j > 0 && {
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
                    <Text style={[S.prText, { color: colors.premiumText }]}>
                      {l.replace("🏆", "").trim()}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[S.emptyPrText, { color: colors.muted }]}>No PRs</Text>
            )}

            <View
              style={[
                S.divider,
                { backgroundColor: colors.borderSubtle, marginTop: 12, marginBottom: 10 },
              ]}
            />

            <Text style={[S.caption, { color: colors.muted, fontWeight: FontWeight.bold }]}>
              {s.planned
                ? "Upcoming session in this block"
                : s.complete
                  ? "Completed session"
                  : "Partially logged session"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function buildSelectedWeekDays(week: WeekEntry, currentWeek: number) {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const isCurrentWeek = week.n === currentWeek;

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  const schedule: Array<WeekSession | null> = [
    week.sessions[0] ?? null,
    week.sessions[1] ?? null,
    null,
    week.sessions[2] ?? null,
    week.sessions[3] ?? null,
    null,
    null,
  ];

  return dayLabels.map((d, i) => {
    const session = schedule[i];

    if (!session) {
      return {
        d,
        type: "Rest",
        status: "rest" as const,
      };
    }

    const shortType = session.type.includes("Upper")
      ? "Upper"
      : session.type.includes("Lower")
        ? "Lower"
        : session.type.includes("Full")
          ? "Full"
          : session.type.includes("Test")
            ? "Test"
            : session.type;

    let status: "done" | "today" | "planned" | "rest" = "planned";

    if (session.complete) {
      status = "done";
    } else if (isCurrentWeek && i === dayOfWeek && !week.upcoming) {
      status = "today";
    } else {
      status = "planned";
    }

    return {
      d,
      type: shortType,
      status,
    };
  });
}

function buildMonthDayDetails(
  dayNum: number | null,
  monthData: ReturnType<typeof useProgressData>["monthData"],
  colors: any,
) {
  if (!dayNum) return null;

  const cell = monthData.days.find((d) => d.dayNum === dayNum);
  if (!cell) return null;

  let title = `Day ${dayNum}`;
  let subtitle = "No session logged";
  let status: "trained" | "today" | "rest" | "future" = "rest";

  if (cell.future) {
    status = "future";
    subtitle = "Upcoming day";
  } else if (cell.trained) {
    status = "trained";
    title = cell.type === "U" ? "Upper session" : cell.type === "L" ? "Lower session" : "Session";
    subtitle = "Training day logged";
  } else if (cell.isToday) {
    status = "today";
    subtitle = "Today";
  }

  return {
    dayNum,
    title,
    subtitle,
    status,
    accentColor:
      status === "trained"
        ? colors.premiumText
        : status === "today"
          ? colors.premiumText
          : colors.muted,
  };
}

function monthKeyFromDate(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${y}-${m}`;
}

function dateFromMonthKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, 1);
}

function ProgramTab({
  router,
  colors,
  isDark,
  data,
  programId,
}: {
  router: any;
  colors: any;
  isDark: boolean;
  data: ReturnType<typeof useProgressData>;
  programId: string;
}) {
  const [view, setView] = useState<ProgramView>("week");
const [selWeek, setSelWeek] = useState<number>(data.currentWeek);
const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
const [selectedMonthDay, setSelectedMonthDay] = useState<number | null>(null);

const soft = getSoft(isDark);

const { currentWeek, totalWeeks, weekHistory, rawHistory } = data;
const monthData = buildMonthData(rawHistory, visibleMonth);

 

  useEffect(() => {
    let mounted = true;

    (async () => {
      const saved = await loadProgressViewState(programId);
      if (!mounted) return;

      if (saved?.selectedWeek) {
        setSelWeek(saved.selectedWeek);
      } else {
        setSelWeek(data.currentWeek);
      }

      if (saved?.visibleMonthKey) {
        setVisibleMonth(dateFromMonthKey(saved.visibleMonthKey));
      }

      if (saved?.selectedMonthDay !== undefined) {
        setSelectedMonthDay(saved.selectedMonthDay ?? null);
      } else {
        const now = new Date();
        const sameMonth =
          now.getFullYear() === visibleMonth.getFullYear() &&
          now.getMonth() === visibleMonth.getMonth();

        setSelectedMonthDay(sameMonth ? now.getDate() : 1);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [data.currentWeek, programId]);

  useEffect(() => {
    if (selectedMonthDay == null) {
      const now = new Date();
      const sameMonth =
        now.getFullYear() === visibleMonth.getFullYear() &&
        now.getMonth() === visibleMonth.getMonth();

      setSelectedMonthDay(sameMonth ? now.getDate() : 1);
    }
  }, [visibleMonth, selectedMonthDay]);

  const selectedWeek =
    weekHistory.find((w) => w.n === selWeek) ??
    weekHistory.find((w) => w.n === currentWeek) ??
    weekHistory[0];

  const selectedWeekDays = buildSelectedWeekDays(selectedWeek, currentWeek);
  const selectedWeekDone = selectedWeek.sessions.filter(
    (s) => !s.planned && s.complete,
  ).length;
  const selectedWeekTotal = selectedWeek.sessions.length;
  const selectedIsCurrent = selectedWeek.n === currentWeek;

  const selectedMonthDayDetails = buildMonthDayDetails(
    selectedMonthDay,
    monthData,
    colors,
  );

  const railScrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    const dotWidth = 58;
    const x = Math.max(0, (selWeek - 1) * dotWidth - 120);
    const t = setTimeout(() => {
      railScrollRef.current?.scrollTo({ x, animated: true });
    }, 60);

    return () => clearTimeout(t);
  }, [selWeek]);

  const goToWeek = async (nextWeek: number) => {
    const clamped = Math.max(1, Math.min(totalWeeks, nextWeek));
    setSelWeek(clamped);

    await saveProgressViewState({
      programId,
      selectedWeek: clamped,
      visibleMonthKey: monthKeyFromDate(visibleMonth),
      selectedMonthDay,
    });
  };

  const goToMonth = async (direction: -1 | 1) => {
    const next = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + direction,
      1,
    );

    setVisibleMonth(next);

    const now = new Date();
    const nextSelectedDay =
      next.getFullYear() === now.getFullYear() &&
      next.getMonth() === now.getMonth()
        ? now.getDate()
        : 1;

    setSelectedMonthDay(nextSelectedDay);

    await saveProgressViewState({
      programId,
      selectedWeek: selWeek,
      visibleMonthKey: monthKeyFromDate(next),
      selectedMonthDay: nextSelectedDay,
    });
  };

  const weekSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 18 && Math.abs(gestureState.dy) < 12,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -40) {
            void goToWeek(selWeek + 1);
          } else if (gestureState.dx > 40) {
            void goToWeek(selWeek - 1);
          }
        },
      }),
    [selWeek, totalWeeks, visibleMonth, selectedMonthDay],
  );

  const monthSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 18 && Math.abs(gestureState.dy) < 12,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -40) {
            void goToMonth(1);
          } else if (gestureState.dx > 40) {
            void goToMonth(-1);
          }
        },
      }),
    [visibleMonth, selWeek, selectedMonthDay],
  );

  async function handleSessionPress(s: WeekSession) {
    if (s.planned) return;

    router.push({
      pathname: "/workout-history",
      params: { workoutTitle: s.type },
    });
  }

  return (
    <View>
      <View style={[S.row, { marginBottom: 18 }]}>
        <Text style={[S.subhead, { color: colors.text }]}>Attendance</Text>
        <View style={[S.toggle, { backgroundColor: soft }]}>
          {(["week", "month"] as const).map((v) => (
            <Pressable
              key={v}
              onPress={() => setView(v)}
              style={[
                S.togBtn,
                view === v && {
                  backgroundColor: colors.card,
                  borderWidth: BorderWidth.default,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  S.meta,
                  {
                    color: view === v ? colors.text : colors.muted,
                    fontWeight: view === v ? FontWeight.heavy : FontWeight.bold,
                  },
                ]}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {view === "week" && (
        <View>
          <View
            style={[
              S.programHeroCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.borderSubtle,
                marginBottom: 12,
              },
            ]}
          >
            <View style={[S.row, { marginBottom: 12 }]}>
              <Text style={[S.caption, { color: colors.muted }]}>Block progress</Text>
              <Text style={[S.eyebrow, { color: colors.muted }]}>Tap a week</Text>
            </View>

            <ScrollView
              ref={(ref) => {
                railScrollRef.current = ref;
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 2, paddingBottom: 4 }}
            >
              <View style={{ position: "relative", minWidth: totalWeeks * 58 }}>
                <View
                  style={[
                    S.dotTrackBg,
                    {
                      backgroundColor: colors.borderSubtle,
                      left: 18,
                      right: 18,
                      top: 6,
                    },
                  ]}
                />
                <View
                  style={[
                    S.dotTrackFg,
                    {
                      backgroundColor: colors.premium,
                      left: 18,
                      top: 6,
                      width: Math.max(12, (selWeek - 1) * 58 + 12),
                    },
                  ]}
                />

                <View style={{ flexDirection: "row" }}>
                  {weekHistory.map((w, i) => {
                    const done = w.n < currentWeek;
                    const current = w.n === currentWeek;
                    const selected = w.n === selWeek;
                    const upcoming = w.n > currentWeek;

                    return (
                      <Pressable
                        key={i}
                        onPress={() => {
                          void goToWeek(w.n);
                        }}
                        style={[S.dotCol, { width: 58, flex: undefined }]}
                      >
                        <View
                          style={[
                            S.dot,
                            {
                              width: current || selected ? 13 : 9,
                              height: current || selected ? 13 : 9,
                              borderRadius: 7,
                              backgroundColor: selected
                                ? colors.background
                                : done
                                  ? colors.premium
                                  : current
                                    ? colors.background
                                    : upcoming
                                      ? isDark
                                        ? "rgba(255,255,255,0.10)"
                                        : "rgba(0,0,0,0.08)"
                                      : colors.premium,
                              borderWidth: current || selected ? 2.2 : 0,
                              borderColor: colors.premium,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            S.dotLabel,
                            {
                              color:
                                selected || done || current
                                  ? colors.premiumText
                                  : colors.muted,
                              fontWeight:
                                selected || current
                                  ? FontWeight.black
                                  : FontWeight.bold,
                            },
                          ]}
                        >
                          W{w.n}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </View>

          <View
            {...weekSwipeResponder.panHandlers}
            style={[
              S.programHeroCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.borderSubtle,
                marginBottom: 20,
              },
            ]}
          >
            <View style={[S.row, { marginBottom: 12 }]}>
              <View>
                <Text style={[S.caption, { color: colors.muted }]}>
                  Week {selectedWeek.n} · {selectedWeek.label} phase
                </Text>
                <Text style={[S.title3, { color: colors.text, marginTop: 4 }]}>
                  {selectedWeekDone}/{selectedWeekTotal} sessions
                </Text>
                <Text style={[S.caption, { color: colors.muted, marginTop: 4 }]}>
                  Swipe left or right to browse weeks
                </Text>
              </View>

              <View
                style={[
                  S.prMiniBadge,
                  {
                    backgroundColor: colors.premiumSoft,
                    borderColor: colors.premiumBorder,
                  },
                ]}
              >
                <Text style={[S.prMiniBadgeText, { color: colors.premiumText }]}>
                  {selectedIsCurrent ? "Current" : `W${selectedWeek.n}`}
                </Text>
              </View>
            </View>

            <View style={[S.daysRow, { marginBottom: 16 }]}>
              {selectedWeekDays.map((s, i) => {
                const isRest = s.status === "rest";
                const isDone = s.status === "done";
                const isToday = s.status === "today";

                return (
                  <View key={i} style={S.dayCol}>
                    <Text
                      style={[
                        S.dayLetter,
                        {
                          color: isToday ? colors.premiumText : colors.muted,
                          fontWeight: isToday ? FontWeight.black : FontWeight.bold,
                        },
                      ]}
                    >
                      {s.d}
                    </Text>

                    <View
                      style={[
                        S.daySq,
                        {
                          backgroundColor: isRest
                            ? "transparent"
                            : isDone
                              ? colors.success
                              : isToday
                                ? colors.premiumSoft
                                : soft,
                          borderWidth: isRest || isDone ? 0 : 0.5,
                          borderColor: isToday
                            ? colors.premiumBorder
                            : colors.borderSubtle,
                        },
                      ]}
                    >
                      {isDone && (
                        <Svg width={11} height={11} viewBox="0 0 12 12">
                          <Path
                            d="M2 6L5 9L10 3"
                            stroke={isDark ? "#111111" : "#FFFFFF"}
                            strokeWidth={2.2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </Svg>
                      )}
                      {isToday && (
                        <View
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: colors.premium,
                          }}
                        />
                      )}
                      {s.status === "planned" && !isToday && (
                        <View
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: colors.muted,
                          }}
                        />
                      )}
                    </View>

                    <Text
                      style={[
                        S.dayType,
                        {
                          color: isRest
                            ? colors.muted
                            : isDone
                              ? colors.muted
                              : isToday
                                ? colors.premiumText
                                : colors.muted,
                        },
                      ]}
                    >
                      {isRest ? "–" : s.type}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <WeekDetailPanel
            week={selectedWeek}
            colors={colors}
            isDark={isDark}
            onSessionPress={handleSessionPress}
          />

          <Pressable
            onPress={() => router.push("/workout-history")}
            style={({ pressed }) => [
              S.linkRow,
              {
                borderTopColor: colors.borderSubtle,
                opacity: pressed ? 0.78 : 1,
                marginTop: 10,
              },
            ]}
          >
            <Text style={[S.body, { color: colors.muted }]}>
              View workout history
            </Text>
            <Svg width={7} height={12} viewBox="0 0 7 12">
              <Path
                d="M1 1L6 6L1 11"
                stroke={colors.muted}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Pressable>
        </View>
      )}

      {view === "month" && (
        <View>
          <View
            {...monthSwipeResponder.panHandlers}
            style={[
              S.programHeroCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.borderSubtle,
                marginBottom: 18,
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 20,
                paddingBottom: 16,
                borderBottomWidth: BorderWidth.default,
                borderBottomColor: colors.borderSubtle,
                marginBottom: 16,
              }}
            >
              {[
                {
                  label: "Sessions",
                  value: String(monthData.totalSessions),
                  color: colors.premiumText,
                },
                {
                  label: "This week",
                  value: `${monthData.thisWeekDone}/${monthData.thisWeekTotal}`,
                  color: colors.text,
                },
                {
                  label: "Consistency",
                  value: `${monthData.consistency}%`,
                  color: colors.successText,
                },
              ].map((s, i) => (
                <View key={i}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: FontWeight.black,
                      color: s.color,
                      letterSpacing: -0.25,
                    }}
                  >
                    {s.value}
                  </Text>
                  <Text style={[S.caption, { color: colors.muted, marginTop: 3 }]}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[S.row, { marginBottom: 12 }]}>
              <Pressable
                onPress={() => {
                  void goToMonth(-1);
                }}
                style={[
                  S.closeBtn,
                  { backgroundColor: soft, borderColor: colors.borderSubtle },
                ]}
              >
                <Text style={[S.body, { color: colors.text }]}>‹</Text>
              </Pressable>

              <Text style={[S.subhead, { color: colors.text }]}>{monthData.label}</Text>

              <Pressable
                onPress={() => {
                  void goToMonth(1);
                }}
                style={[
                  S.closeBtn,
                  { backgroundColor: soft, borderColor: colors.borderSubtle },
                ]}
              >
                <Text style={[S.body, { color: colors.text }]}>›</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <Text
                  key={i}
                  style={[
                    S.eyebrow,
                    { flex: 1, textAlign: "center", color: colors.muted },
                  ]}
                >
                  {d}
                </Text>
              ))}
            </View>

            {(() => {
              const { offset, daysInMonth } = monthData;
              const count = Math.ceil((daysInMonth + offset) / 7) * 7;
              const cells = Array.from({ length: count }, (_, i) => i - offset + 1);
              const rows: number[][] = [];
              for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

              return rows.map((row, ri) => (
                <View key={ri} style={{ flexDirection: "row", gap: 4, marginBottom: 4 }}>
                  {row.map((d, ci) => {
                    if (d < 1 || d > daysInMonth) return <View key={ci} style={S.calCircle} />;

                    const cell = monthData.days.find((c) => c.dayNum === d);
                    const tr = cell?.trained ?? false;
                    const isT = cell?.isToday ?? false;
                    const fut = cell?.future ?? false;
                    const isSelected = selectedMonthDay === d;

                    return (
                      <Pressable
                        key={ci}
                        onPress={() => {
                          setSelectedMonthDay(d);
                          void saveProgressViewState({
                            programId,
                            selectedWeek: selWeek,
                            visibleMonthKey: monthKeyFromDate(visibleMonth),
                            selectedMonthDay: d,
                          });
                        }}
                        style={[
                          S.calCircle,
                          {
                            backgroundColor: tr
                              ? colors.premium
                              : isT
                                ? colors.premiumSoft
                                : soft,
                            borderWidth: isSelected ? 1.6 : isT && !tr ? 0.5 : 0,
                            borderColor: isSelected
                              ? colors.premium
                              : colors.premiumBorder,
                            opacity: fut ? 0.3 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            S.calNum,
                            {
                              color: tr ? "#111111" : isT ? colors.premiumText : colors.muted,
                              fontWeight:
                                tr || isT || isSelected ? FontWeight.bold : FontWeight.medium,
                              fontSize: 9,
                            },
                          ]}
                        >
                          {d}
                        </Text>

                        {tr && cell?.type && (
                          <Text
                            style={{
                              fontSize: 5,
                              color: "#111111",
                              fontWeight: FontWeight.black,
                            }}
                          >
                            {cell.type}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ));
            })()}

            <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
              {[
                { color: colors.premium, label: "Trained" },
                { color: colors.premiumSoft, border: colors.premiumBorder, label: "Today" },
                { color: soft, label: "Rest" },
              ].map((l, i) => (
                <View
                  key={i}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: l.color,
                      borderWidth: l.border ? 0.5 : 0,
                      borderColor: l.border,
                    }}
                  />
                  <Text style={[S.caption, { color: colors.muted }]}>{l.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {selectedMonthDayDetails && (
            <View
              style={[
                S.finishLikeCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.borderSubtle,
                  marginBottom: 12,
                },
              ]}
            >
              <View style={[S.row, { alignItems: "flex-start" }]}>
                <View>
                  <Text style={[S.eyebrow, { color: colors.muted, marginBottom: 4 }]}>
                    SELECTED DAY
                  </Text>
                  <Text style={[S.title3, { color: colors.text }]}>
                    {monthData.label} {selectedMonthDayDetails.dayNum}
                  </Text>
                  <Text style={[S.caption, { color: colors.muted, marginTop: 4 }]}>
                    {selectedMonthDayDetails.subtitle}
                  </Text>
                </View>

                <View
                  style={[
                    S.prMiniBadge,
                    {
                      backgroundColor: colors.premiumSoft,
                      borderColor: colors.premiumBorder,
                    },
                  ]}
                >
                  <Text style={[S.prMiniBadgeText, { color: selectedMonthDayDetails.accentColor }]}>
                    {selectedMonthDayDetails.status === "trained"
                      ? "Logged"
                      : selectedMonthDayDetails.status === "today"
                        ? "Today"
                        : selectedMonthDayDetails.status === "future"
                          ? "Upcoming"
                          : "Rest"}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  S.divider,
                  { backgroundColor: colors.borderSubtle, marginTop: 12, marginBottom: 12 },
                ]}
              />

              <Text style={[S.body, { color: colors.text }]}>
                {selectedMonthDayDetails.title}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}


function PerformanceTab({
  exerciseCards,
  colors,
  isDark,
}: {
  exerciseCards: any[];
  colors: any;
  isDark: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const prCount = exerciseCards.filter((e) => (e.trend?.prCount ?? 0) > 0).length;
  const negativeColor = getNegativeColor(colors, isDark);

  return (
    <View>
      <View style={[S.row, { marginBottom: 6 }]}>
        <Text style={[S.subhead, { color: colors.text }]}>All Exercises</Text>
        <View
          style={[
            S.prMiniBadge,
            {
              backgroundColor: colors.premiumSoft,
              borderColor: colors.premiumBorder,
            },
          ]}
        >
          <PRIcon color={colors.premiumText} />
          <Text style={[S.prMiniBadgeText, { color: colors.premiumText }]}>
            {prCount}
          </Text>
        </View>
      </View>

      <Text style={[S.caption, { color: colors.muted, marginBottom: 8 }]}>
        Tap to expand
      </Text>

      {exerciseCards.length === 0 ? (
        <View
          style={[
            S.finishLikeCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderSubtle,
              padding: 22,
              alignItems: "center",
            },
          ]}
        >
          <Text style={[S.body, { color: colors.muted, textAlign: "center" }]}>
            Complete workouts to see your exercise progress here.
          </Text>
        </View>
      ) : (
        exerciseCards.map((ex, i) => {
          const open = openId === ex.exerciseId;
          const hasPR = (ex.trend?.prCount ?? 0) > 0;
          const gain = ex.recentDelta?.weight ?? 0;
          const gainPct =
            ex.bestWeight && gain
              ? Math.round((gain / (ex.bestWeight - gain)) * 100)
              : 0;
          const chart = ex.bestWeight
            ? [ex.bestWeight - gain * 2, ex.bestWeight - gain, ex.bestWeight]
            : [];

          return (
            <Pressable
              key={ex.exerciseId ?? i}
              onPress={() => setOpenId(open ? null : ex.exerciseId)}
              style={[
                S.finishLikeCard,
                {
                  backgroundColor: colors.card,
                  borderColor: hasPR ? colors.premiumBorder : colors.borderSubtle,
                  marginBottom: 10,
                },
              ]}
            >
              <View style={[S.row, { alignItems: "flex-start" }]}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Text style={[S.finishLikeTitle, { color: colors.text }]}>
                      {ex.exerciseName}
                    </Text>
                    {hasPR ? <PRBadge colors={colors} /> : null}
                  </View>

                  <Text style={[S.finishLikeMeta, { color: colors.muted, marginTop: 4 }]}>
                    {ex.sessionsLogged} sessions logged
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  {gain !== 0 ? (
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: FontWeight.heavy,
                        color: gain > 0 ? colors.successText : negativeColor,
                        letterSpacing: -0.1,
                      }}
                    >
                      {gain > 0 ? "+" : ""}
                      {gain.toFixed(1)} kg
                    </Text>
                  ) : null}
                  <Text style={[S.caption, { color: colors.muted }]}>
                    {open ? "Hide" : "View"}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  S.divider,
                  { backgroundColor: colors.borderSubtle, marginTop: 12, marginBottom: 12 },
                ]}
              />

              {!open && chart.length > 1 ? (
                <View style={[S.row, { alignItems: "center" }]}>
                  <Spark
                    data={chart}
                    color={colors.premium}
                    width={84}
                    height={28}
                    strokeWidth={1.6}
                  />
                  <Text style={[S.caption, { color: colors.muted }]}>
                    {gainPct !== 0
                      ? `${gainPct > 0 ? "+" : ""}${gainPct}% vs prior range`
                      : "No recent change"}
                  </Text>
                </View>
              ) : null}

              {open && (
                <>
                  {chart.length > 1 ? (
                    <>
                      <Spark
                        data={chart}
                        color={colors.premium}
                        width={310}
                        height={50}
                        strokeWidth={2}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: 6,
                          marginBottom: 14,
                        }}
                      >
                        {chart.map((v, j) => (
                          <View key={j} style={{ alignItems: "center" }}>
                            <Text
                              style={{
                                fontSize: 8,
                                color: j === chart.length - 1 ? colors.premiumText : colors.muted,
                              }}
                            >
                              W{ex.sessionsLogged - chart.length + j + 1}
                            </Text>
                            <Text
                              style={{
                                fontSize: 9,
                                color: j === chart.length - 1 ? colors.premiumText : colors.muted,
                                fontWeight:
                                  j === chart.length - 1 ? FontWeight.heavy : FontWeight.medium,
                                marginTop: 2,
                              }}
                            >
                              {v}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </>
                  ) : null}

                  <View
                    style={[
                      S.divider,
                      { backgroundColor: colors.borderSubtle, marginBottom: 12 },
                    ]}
                  />

                  <View style={{ gap: 8 }}>
                    {[
                      ex.bestWeight
                        ? { label: "Best weight", value: `${ex.bestWeight} kg` }
                        : null,
                      gain !== 0
                        ? {
                            label: "Gain",
                            value: `${gain > 0 ? "+" : ""}${gain.toFixed(1)} kg`,
                            color: gain > 0 ? colors.successText : negativeColor,
                          }
                        : null,
                      ex.latestSession
                        ? {
                            label: "Last session",
                            value: `${ex.latestSession.completedSets}/${ex.latestSession.totalSetsPlanned}`,
                          }
                        : null,
                    ]
                      .filter(Boolean)
                      .map((item: any, idx) => (
                        <View
                          key={idx}
                          style={[
                            S.row,
                            {
                              paddingTop: idx === 0 ? 0 : 8,
                              borderTopWidth: idx === 0 ? 0 : BorderWidth.default,
                              borderTopColor: colors.borderSubtle,
                            },
                          ]}
                        >
                          <Text style={[S.caption, { color: colors.muted }]}>
                            {item.label}
                          </Text>
                          <Text style={[S.subhead, { color: item.color ?? colors.text }]}>
                            {item.value}
                          </Text>
                        </View>
                      ))}
                  </View>
                </>
              )}
            </Pressable>
          );
        })
      )}
    </View>
  );
}
const DEMO_PROGRESS_PHOTOS = {
  Front: {
    before:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
    now:
      "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=900&q=80",
  },
  Side: {
    before:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    now:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
  },
  Back: {
    before:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
    now:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  },
} as const;

function BodyTab({
  checkins,
  onNewCheckin,
  colors,
  isDark,
}: {
  checkins: CheckIn[];
  onNewCheckin: () => void;
  colors: any;
  isDark: boolean;
}) {
  const [compareIdx, setCompareIdx] = useState<number | null>(null);
  const [angleIdx, setAngleIdx] = useState(0);
  const ANGLES = ["Front", "Side", "Back"];
  const soft = getSoft(isDark);
  const negativeColor = getNegativeColor(colors, isDark);
  const negativeSoft = getNegativeSoft(isDark);
  const negativeBorder = getNegativeBorder(isDark);

  const latest = checkins[checkins.length - 1];
  const currentAngle = ANGLES[angleIdx] as keyof typeof DEMO_PROGRESS_PHOTOS;
  const first = checkins[0];
  const wDelta = +(latest.weight - first.weight).toFixed(1);
  const wDown = wDelta < 0;

  return (
    <View style={{ gap: 12 }}>
      <View
        style={[
          S.finishLikeCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <Text style={[S.eyebrow, { color: colors.muted, marginBottom: 8 }]}>
          BODY WEIGHT
        </Text>

        <View style={[S.row, { marginBottom: 12, alignItems: "flex-end" }]}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 7 }}>
              <Text style={[S.weightBig, { color: colors.text }]}>
                {latest.weight}
              </Text>
              <Text style={[S.caption, { color: colors.muted }]}>kg</Text>

              <View
                style={[
                  S.prMiniBadge,
                  {
                    backgroundColor: wDown ? colors.successSoft : negativeSoft,
                    borderColor: wDown ? colors.successBorder : negativeBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    S.prMiniBadgeText,
                    { color: wDown ? colors.successText : negativeColor },
                  ]}
                >
                  {wDelta > 0 ? "+" : ""}
                  {wDelta} kg
                </Text>
              </View>
            </View>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={[S.caption, { color: colors.muted }]}>Block start</Text>
            <Text style={[S.subhead, { color: colors.muted, marginTop: 2 }]}>
              {first.weight} kg
            </Text>
          </View>
        </View>

        <Spark
          data={checkins.map((c) => c.weight)}
          color={colors.text}
          width={315}
          height={50}
          strokeWidth={2}
        />

        <View style={[S.row, { marginTop: 6 }]}>
          {checkins.map((c, i) => (
            <Text
              key={i}
              style={[
                S.caption,
                {
                  color: i === checkins.length - 1 ? colors.text : colors.muted,
                },
              ]}
            >
              {c.date}
            </Text>
          ))}
        </View>
      </View>

      <View
        style={[
          S.finishLikeCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <Text style={[S.subhead, { color: colors.text, marginBottom: 12 }]}>
          Measurements
        </Text>

        {MEAS_FIELDS.map((f, i) => {
          const vals = checkins.map((c) => c.meas[f.key]);
          const delta = +(vals[vals.length - 1] - vals[0]).toFixed(1);
          const good = delta === 0 ? null : f.good === "down" ? delta < 0 : delta > 0;
          const col =
            delta === 0 ? colors.muted : good ? colors.successText : negativeColor;

          return (
            <View
              key={f.key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingTop: i === 0 ? 0 : 10,
                paddingBottom: 10,
                borderTopWidth: i === 0 ? 0 : BorderWidth.default,
                borderTopColor: colors.borderSubtle,
                gap: 12,
              }}
            >
              <View style={{ width: 74 }}>
                <Text style={[S.caption, { color: colors.muted }]}>{f.label}</Text>
                <Text style={[S.headline, { color: colors.text, marginTop: 2 }]}>
                  {vals[vals.length - 1]}
                  <Text style={[S.caption, { color: colors.muted }]}> cm</Text>
                </Text>
              </View>

              <View style={{ flex: 1, alignItems: "center" }}>
                <Spark data={vals} color={colors.text} width={100} height={26} strokeWidth={1.6} />
              </View>

              <View style={{ width: 46, alignItems: "flex-end" }}>
                <Text
                  style={[
                    S.subhead,
                    {
                      color: col,
                      fontWeight: FontWeight.heavy,
                    },
                  ]}
                >
                  {delta > 0 ? "+" : ""}
                  {delta}
                </Text>
                <Text style={[S.caption, { color: colors.muted }]}>cm</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View
        style={[
          S.finishLikeCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={[S.row, { marginBottom: 14 }]}>
          <Text style={[S.subhead, { color: colors.text }]}>Progress Photos</Text>
          <Text style={[S.caption, { color: colors.muted }]}>
            {checkins.length} check-ins
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 16 }}>
          {ANGLES.map((a, i) => (
            <Pressable
              key={i}
              onPress={() => setAngleIdx(i)}
              style={[
                S.angleTab,
                {
                  backgroundColor: angleIdx === i ? soft : "transparent",
                  borderWidth: angleIdx === i ? BorderWidth.default : 0,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  S.caption,
                  {
                    color: angleIdx === i ? colors.text : colors.muted,
                    fontWeight: angleIdx === i ? FontWeight.heavy : FontWeight.bold,
                  },
                ]}
              >
                {a}
              </Text>
            </Pressable>
          ))}
        </View>

<View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
  {([
    {
      label: "BEFORE",
      accent: false,
      uri: DEMO_PROGRESS_PHOTOS[currentAngle].before,
      dateText: compareIdx !== null ? checkins[compareIdx]?.date ?? "" : "Demo",
    },
    {
      label: "NOW",
      accent: true,
      uri: DEMO_PROGRESS_PHOTOS[currentAngle].now,
      dateText: latest.date,
    },
  ] as const).map((slot, j) => (
    <View key={j} style={{ flex: 1 }}>
      <Text
        style={[
          S.eyebrow,
          {
            textAlign: "center",
            color: slot.accent ? colors.premiumText : colors.muted,
            marginBottom: 8,
          },
        ]}
      >
        {slot.label}
      </Text>

      <View
        style={[
          S.photoSlot,
          {
            backgroundColor: soft,
            borderColor:
              j === 0
                ? compareIdx !== null
                  ? colors.borderSubtle
                  : colors.premiumBorder
                : colors.premiumBorder,
          },
        ]}
      >
        <Image
          source={{ uri: slot.uri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: "rgba(0,0,0,0.16)",
            },
          ]}
        />

        <View
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            bottom: 8,
            paddingVertical: 6,
            paddingHorizontal: 8,
            borderRadius: 10,
            backgroundColor: "rgba(0,0,0,0.36)",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              color: "#FFFFFF",
              fontWeight: FontWeight.heavy,
              textAlign: "center",
            }}
          >
            {slot.dateText}
          </Text>
        </View>
      </View>
    </View>
  ))}
</View>

        <View style={[S.row, { marginBottom: 8 }]}>
          <Text style={[S.subhead, { fontSize: 13, color: colors.text }]}>
            Compare with
          </Text>
          {compareIdx !== null && (
            <Text style={[S.caption, { color: colors.muted }]}>
              {checkins[compareIdx]?.date} selected
            </Text>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
        >
          {checkins.slice(0, -1).map((c, i) => {
            const sel = compareIdx === i;

            return (
              <Pressable
                key={i}
                onPress={() => setCompareIdx(sel ? null : i)}
                style={[
                  S.prMiniBadge,
                  {
                    backgroundColor: sel
                      ? colors.premiumSoft
                      : isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.04)",
                    borderColor: sel ? colors.premiumBorder : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: sel ? FontWeight.heavy : FontWeight.bold,
                    color: sel ? colors.premiumText : colors.muted,
                  }}
                >
                  {c.date}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {compareIdx !== null &&
          (() => {
            const c = checkins[compareIdx];
            const delta = +(latest.weight - c.weight).toFixed(1);
            const isDown = delta < 0;

            return (
              <View
                style={[
                  S.compareCard,
                  {
                    backgroundColor: colors.premiumSoft,
                    borderColor: colors.premiumBorder,
                    marginTop: 12,
                  },
                ]}
              >
                <View style={S.row}>
                  <View>
                    <Text style={[S.subhead, { color: colors.premiumText, fontSize: 13 }]}>
                      {c.date}
                    </Text>
                    <Text style={[S.caption, { color: colors.muted, marginTop: 2 }]}>
                      Week {compareIdx + 1} · {c.weight} kg
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={[
                        S.subhead,
                        {
                          color: isDown ? colors.successText : negativeColor,
                          fontWeight: FontWeight.heavy,
                        },
                      ]}
                    >
                      {delta > 0 ? "+" : ""}
                      {delta} kg
                    </Text>
                    <Text style={[S.caption, { color: colors.muted }]}>
                      since then
                    </Text>
                  </View>
                </View>
              </View>
            );
          })()}

        <Text
          style={[
            S.caption,
            {
              textAlign: "center",
              marginTop: 10,
              fontSize: 10,
              color: colors.muted,
            },
          ]}
        >
          Swipe photos left/right to change angle
        </Text>

        <Pressable
          onPress={onNewCheckin}
          style={[
            S.checkinBtn,
            {
              backgroundColor: colors.premiumSoft,
              borderColor: colors.premiumBorder,
              marginTop: 12,
            },
          ]}
        >
          <Text style={[S.subhead, { color: colors.premiumText }]}>
            + New Check-in
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function CheckInSheet({
  visible,
  onClose,
  onSubmit,
  last,
  colors,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (c: Omit<CheckIn, "id">) => void;
  last: CheckIn;
  colors: any;
  isDark: boolean;
}) {
  const [step, setStep] = useState(0);
  const [weight, setWeight] = useState("");
  const [meas, setMeas] = useState({ waist: "", chest: "", arm: "" });
  const soft = getSoft(isDark);
  const negativeColor = getNegativeColor(colors, isDark);

  const now = new Date();
  const isoDate = now.toISOString().split("T")[0];
  const dateLabel = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  function submit() {
    onSubmit({
      date: dateLabel,
      isoDate,
      weight: parseFloat(weight) || last.weight,
      meas: {
        waist: parseFloat(meas.waist) || last.meas.waist,
        chest: parseFloat(meas.chest) || last.meas.chest,
        arm: parseFloat(meas.arm) || last.meas.arm,
      },
    });
    setStep(3);
  }

  function reset() {
    setStep(0);
    setWeight("");
    setMeas({ waist: "", chest: "", arm: "" });
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={reset}
    >
      <Pressable style={S.modalBg} onPress={reset} />
      <View
        style={[
          S.sheet,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View
          style={[
            S.handle,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.15)"
                : "rgba(0,0,0,0.12)",
            },
          ]}
        />

        {step < 3 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
            <View style={S.row}>
              <View>
                <Text style={[S.eyebrow, { color: colors.muted, marginBottom: 4 }]}>
                  WEEKLY CHECK-IN
                </Text>
                <Text style={[S.title2, { color: colors.text }]}>
                  {["Weight", "Measurements", "Photos"][step]}
                </Text>
              </View>
              <Pressable
                onPress={reset}
                style={[
                  S.closeBtn,
                  { backgroundColor: soft, borderColor: colors.borderSubtle },
                ]}
              >
                <Text style={[S.body, { color: colors.muted, fontSize: 18 }]}>×</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", gap: 5, marginTop: 12 }}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[
                    S.progBar,
                    { backgroundColor: i <= step ? colors.premium : soft },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {step === 0 && (
          <View style={S.sheetBody}>
            <Text style={[S.caption, { color: colors.muted, marginBottom: 18 }]}>
              Last:{" "}
              <Text style={{ color: colors.text, fontWeight: FontWeight.heavy }}>
                {last.weight} kg
              </Text>
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder={String(last.weight)}
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                style={[
                  S.bigInput,
                  {
                    backgroundColor: soft,
                    borderColor: colors.borderSubtle,
                    color: colors.text,
                  },
                ]}
              />
              <Text style={[S.body, { color: colors.muted }]}>kg</Text>
            </View>
            <Pressable onPress={() => setStep(1)} style={[S.primaryBtn, { backgroundColor: colors.text }]}>
              <Text style={[S.btnText, { color: colors.surface }]}>Continue</Text>
            </Pressable>
          </View>
        )}

        {step === 1 && (
          <View style={S.sheetBody}>
            <Text style={[S.caption, { color: colors.muted, marginBottom: 14 }]}>
              All optional
            </Text>
            <View style={{ gap: 10, marginBottom: 22 }}>
              {MEAS_FIELDS.map((f) => {
                const cur = parseFloat(meas[f.key]);
                const lastV = last.meas[f.key];
                const delta = cur ? +(cur - lastV).toFixed(1) : null;
                const good = delta
                  ? f.good === "down"
                    ? delta < 0
                    : delta > 0
                  : null;

                return (
                  <View
                    key={f.key}
                    style={[
                      S.measInputRow,
                      {
                        backgroundColor: soft,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <View>
                      <Text style={[S.subhead, { color: colors.muted }]}>
                        {f.label}
                      </Text>
                      <Text style={[S.caption, { color: colors.muted }]}>
                        Last: {lastV} cm
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      {delta !== null && (
                        <Text
                          style={[
                            S.caption,
                            {
                              color: good ? colors.successText : negativeColor,
                              fontWeight: FontWeight.heavy,
                            },
                          ]}
                        >
                          {delta > 0 ? "+" : ""}
                          {delta}
                        </Text>
                      )}

                      <View
                        style={[
                          S.measWrap,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.borderSubtle,
                          },
                        ]}
                      >
                        <TextInput
                          value={meas[f.key as keyof typeof meas]}
                          onChangeText={(t) =>
                            setMeas((m) => ({ ...m, [f.key]: t }))
                          }
                          placeholder={String(lastV)}
                          placeholderTextColor={colors.muted}
                          keyboardType="numeric"
                          style={[S.measInput, { color: colors.text }]}
                        />
                        <Text style={[S.caption, { color: colors.muted, paddingRight: 10 }]}>
                          cm
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setStep(0)}
                style={[S.ghostBtn, { flex: 1, borderColor: colors.borderSubtle }]}
              >
                <Text style={[S.btnText, { color: colors.muted }]}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => setStep(2)}
                style={[S.primaryBtn, { flex: 2, backgroundColor: colors.text }]}
              >
                <Text style={[S.btnText, { color: colors.surface }]}>Continue</Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={S.sheetBody}>
            <Text style={[S.caption, { color: colors.muted, marginBottom: 14 }]}>
              Private — visible only to you and your coach
            </Text>

            <View
              style={[
                S.photoPlaceholder,
                {
                  backgroundColor: soft,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Text style={{ fontSize: 26, color: colors.muted, marginBottom: 8 }}>
                📷
              </Text>
              <Text style={[S.subhead, { color: colors.text }]}>Photo upload</Text>
              <Text
                style={[
                  S.caption,
                  { color: colors.muted, textAlign: "center", marginTop: 4 },
                ]}
              >
                Run: npx expo install expo-image-picker
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
              <Pressable
                onPress={() => setStep(1)}
                style={[S.ghostBtn, { flex: 1, borderColor: colors.borderSubtle }]}
              >
                <Text style={[S.btnText, { color: colors.muted }]}>Back</Text>
              </Pressable>
              <Pressable
                onPress={submit}
                style={[S.primaryBtn, { flex: 2, backgroundColor: colors.text }]}
              >
                <Text style={[S.btnText, { color: colors.surface }]}>Save check-in</Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={[S.sheetBody, { alignItems: "center", paddingVertical: 30 }]}>
            <View
              style={[
                S.doneCircle,
                {
                  backgroundColor: colors.successSoft,
                  borderColor: colors.successBorder,
                },
              ]}
            >
              <Text style={{ fontSize: 20, color: colors.successText }}>✓</Text>
            </View>
            <Text style={[S.title2, { color: colors.text, marginBottom: 6 }]}>
              Check-in saved
            </Text>
            <Text style={[S.body, { color: colors.muted, marginBottom: 24 }]}>
              Your coach will review shortly
            </Text>
            <Pressable onPress={reset} style={[S.primaryBtn, { backgroundColor: colors.text, width: "100%" }]}>
              <Text style={[S.btnText, { color: colors.surface }]}>Done</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

function ShareModal({
  visible,
  onClose,
  data,
  colors,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  data: ReturnType<typeof useProgressData>;
  colors: any;
  isDark: boolean;
}) {
  const [mode, setMode] = useState<"social" | "coach">("social");
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");
  const soft = getSoft(isDark);
  const negativeColor = getNegativeColor(colors, isDark);

  const { checkins, weekHistory, programTitle, programSubtitle } = data;
  const first = checkins[0];
  const latest = checkins[checkins.length - 1];
  const wDelta = +(latest.weight - first.weight).toFixed(1);
  const wDown = wDelta < 0;

  const allSessions = weekHistory.flatMap((w) => w.sessions.filter((s) => !s.planned));
  const doneS = allSessions.filter((s) => s.complete).length;
  const totalS = allSessions.length;
  const pct = Math.round((doneS / totalS) * 100);
  const topPRs = weekHistory
    .flatMap((w) =>
      w.sessions.flatMap((s) =>
        s.lifts.filter((l) => l.includes("🏆")).map((l) => l.replace("🏆", "").trim()),
      ),
    )
    .slice(0, 3);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <Pressable style={S.modalBg} onPress={onClose} />
      <View
        style={[
          S.sheet,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View
          style={[
            S.handle,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.15)"
                : "rgba(0,0,0,0.12)",
            },
          ]}
        />
        <View style={[S.row, { paddingHorizontal: 20, paddingTop: 14 }]}>
          <Text style={[S.title2, { color: colors.text }]}>Share Progress</Text>
          <Pressable
            onPress={onClose}
            style={[
              S.closeBtn,
              { backgroundColor: soft, borderColor: colors.borderSubtle },
            ]}
          >
            <Text style={[S.body, { color: colors.muted, fontSize: 18 }]}>×</Text>
          </Pressable>
        </View>

        <View style={[S.modeToggle, { backgroundColor: soft, margin: 16 }]}>
          {(["social", "coach"] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[
                S.modeBtn,
                {
                  backgroundColor: mode === m ? colors.card : "transparent",
                  borderColor: mode === m ? colors.borderSubtle : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  S.caption,
                  {
                    color: mode === m ? colors.text : colors.muted,
                    fontWeight: mode === m ? FontWeight.heavy : FontWeight.bold,
                    fontSize: FontSize.subhead,
                  },
                ]}
              >
                {m === "social" ? "Share Card" : "Send to Coach"}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          {mode === "social" ? (
            <>
              <View
                style={[
                  S.shareCard,
                  {
                    backgroundColor: isDark ? colors.card : "#1A1A1A",
                    borderColor: colors.premiumBorder,
                  },
                ]}
              >
                <View style={S.row}>
                  <Text style={[S.eyebrow, { color: "rgba(255,255,255,0.4)" }]}>
                    PROGRESS REPORT
                  </Text>
                  <Text style={[S.eyebrow, { color: colors.premiumText }]}>
                    GYM APP
                  </Text>
                </View>

                <Text style={[S.title2, { color: "#FFFFFF", marginTop: 14 }]}>
                  {programTitle}
                </Text>
                <Text
                  style={[
                    S.caption,
                    {
                      color: "rgba(255,255,255,0.45)",
                      marginTop: 4,
                      marginBottom: 18,
                    },
                  ]}
                >
                  {programSubtitle}
                </Text>

                <View style={{ flexDirection: "row", gap: 8, marginBottom: topPRs.length ? 16 : 0 }}>
                  {[
                    {
                      label: "Body weight",
                      value: `${wDelta > 0 ? "+" : ""}${wDelta} kg`,
                      color: wDown ? colors.successText : negativeColor,
                    },
                    {
                      label: "Sessions",
                      value: `${doneS}/${totalS}`,
                      color: colors.premiumText,
                    },
                    {
                      label: "PRs hit",
                      value: `${topPRs.length}+`,
                      color: colors.premiumText,
                    },
                  ].map((s, i) => (
                    <View
                      key={i}
                      style={[
                        S.shareStatTile,
                        { backgroundColor: "rgba(255,255,255,0.07)" },
                      ]}
                    >
                      <Text style={[S.title3, { color: s.color, textAlign: "center" }]}>
                        {s.value}
                      </Text>
                      <Text
                        style={{
                          fontSize: 9,
                          color: "rgba(255,255,255,0.4)",
                          textAlign: "center",
                          marginTop: 3,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {s.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {topPRs.map((pr, i) => (
                  <View
                    key={i}
                    style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}
                  >
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: colors.premium,
                      }}
                    />
                    <Text style={{ fontSize: 11, color: "#EDEAE2" }}>{pr}</Text>
                  </View>
                ))}

                <View
                  style={[
                    S.shareConsistency,
                    { borderTopColor: "rgba(255,255,255,0.08)" },
                  ]}
                >
                  <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                    Consistency
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: 2,
                      backgroundColor: "rgba(255,255,255,0.12)",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        backgroundColor: colors.premium,
                        borderRadius: 1,
                      }}
                    />
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: FontWeight.heavy, color: colors.premiumText }}>
                    {pct}%
                  </Text>
                </View>
              </View>

              <Text style={[S.caption, { color: colors.muted, textAlign: "center", marginVertical: 14 }]}>
                Screenshot this card to share on Instagram or WhatsApp
              </Text>

              <Pressable style={[S.primaryBtn, { backgroundColor: colors.text }]}>
                <Text style={[S.btnText, { color: colors.surface }]}>Share ↑</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View
                style={[
                  S.coachSummary,
                  {
                    backgroundColor: soft,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Text style={[S.eyebrow, { color: colors.muted, marginBottom: 12 }]}>
                  SUMMARY FOR COACH
                </Text>
                {[
                  {
                    key: "Body weight",
                    val: `${latest.weight} kg`,
                    delta: `${wDelta > 0 ? "+" : ""}${wDelta}`,
                    good: wDown,
                  },
                  ...MEAS_FIELDS.map((f) => {
                    const d = +(latest.meas[f.key] - first.meas[f.key]).toFixed(1);
                    return {
                      key: f.label,
                      val: `${latest.meas[f.key]} cm`,
                      delta: `${d > 0 ? "+" : ""}${d}`,
                      good: f.good === "down" ? d < 0 : d > 0,
                    };
                  }),
                  {
                    key: "Attendance",
                    val: `${doneS}/${totalS}`,
                    delta: `${pct}%`,
                    good: pct >= 80,
                  },
                ].map((r, i, arr) => (
                  <View
                    key={i}
                    style={[
                      S.coachRow,
                      {
                        borderBottomColor: colors.borderSubtle,
                        borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
                      },
                    ]}
                  >
                    <Text style={[S.body, { color: colors.muted, flex: 1 }]}>
                      {r.key}
                    </Text>
                    <Text style={[S.subhead, { color: colors.text }]}>{r.val}</Text>
                    <Text
                      style={[
                        S.subhead,
                        {
                          color: r.good ? colors.successText : negativeColor,
                          marginLeft: 10,
                          minWidth: 44,
                          textAlign: "right",
                          fontWeight: FontWeight.heavy,
                        },
                      ]}
                    >
                      {r.delta}
                    </Text>
                  </View>
                ))}
              </View>

              <TextInput
                value={note}
                onChangeText={setNote}
                multiline
                placeholder="Add a note for your coach... (optional)"
                placeholderTextColor={colors.muted}
                style={[
                  S.noteInput,
                  {
                    backgroundColor: soft,
                    borderColor: colors.borderSubtle,
                    color: colors.text,
                  },
                ]}
              />

              {sent ? (
                <View
                  style={[
                    S.primaryBtn,
                    {
                      backgroundColor: colors.successSoft,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: colors.successBorder,
                    },
                  ]}
                >
                  <Text style={[S.btnText, { color: colors.successText }]}>
                    ✓ Sent to your coach
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    setSent(true);
                    setTimeout(() => {
                      setSent(false);
                      onClose();
                    }, 2200);
                  }}
                  style={[S.primaryBtn, { backgroundColor: colors.text }]}
                >
                  <Text style={[S.btnText, { color: colors.surface }]}>
                    Send to Coach ›
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ProgressScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const [tab, setTab] = useState<TabKey>("program");
  const [showCheckin, setShowCheckin] = useState(false);
  const [showShare, setShowShare] = useState(false);


  const programId = "strength-foundations";
  const data = useProgressData(programId);
  const { checkins, addCheckin, loading, refresh, programTitle, programSubtitle } = data;

  const performanceCards =
  data.exerciseCards && data.exerciseCards.length >= 3
    ? data.exerciseCards
    : PERFORMANCE_DEMO_CARDS;


  const TABS: Array<{ key: TabKey; label: string }> = [
    { key: "program", label: "Program" },
    { key: "performance", label: "Performance" },
    { key: "body", label: "Body" },
  ];

  return (
    <SafeAreaView style={[S.safe, { backgroundColor: colors.background }]} edges={["top"]}>
     

      <CheckInSheet
        visible={showCheckin}
        onClose={() => setShowCheckin(false)}
        onSubmit={(c) => {
          addCheckin(c);
          setShowCheckin(false);
        }}
        last={checkins[checkins.length - 1]}
        colors={colors}
        isDark={isDark}
      />

      <ShareModal
        visible={showShare}
        onClose={() => setShowShare(false)}
        data={data}
        colors={colors}
        isDark={isDark}
      />

     <View
          style={{
             flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: Spacing.md,
              paddingBottom: 6,
              gap: 12,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <ScreenHeader title={programTitle} subtitle={programSubtitle} />
          </View>

          <Pressable
            onPress={() => setShowShare(true)}
            style={[
              S.shareBtn,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                borderColor: colors.borderSubtle,
                
              },
            ]}
          >
            <Share2 size={16} color={colors.muted} strokeWidth={2} />
          </Pressable>
        </View>

      <View
        style={[
          S.tabBar,
          {
            borderBottomColor: colors.borderSubtle,
            paddingHorizontal: Spacing.md,
          },
        ]}
      >
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[S.tabItem, tab === t.key && { borderBottomColor: colors.text }]}
          >
            <Text
              style={[
                S.tabText,
                {
                  color: tab === t.key ? colors.text : colors.muted,
                  fontWeight: tab === t.key ? FontWeight.heavy : FontWeight.medium,
                },
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.muted}
          />
        }
      >
        {tab === "program" && (
          <ProgramTab
            router={router}
            colors={colors}
            isDark={isDark}
            data={data}
            programId={programId}
          />
        )}
        {tab === "performance" && (
         <PerformanceTab exerciseCards={performanceCards} colors={colors} isDark={isDark} />
        )}
        {tab === "body" && (
          <BodyTab
            checkins={checkins}
            onNewCheckin={() => setShowCheckin(true)}
            colors={colors}
            isDark={isDark}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe: { flex: 1 },

  tabBar: {
    flexDirection: "row",
    borderBottomWidth: BorderWidth.default,
    marginBottom: 0,
  },

  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  tabText: { ...Typography.subhead },

  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: BorderWidth.default,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  toast: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    zIndex: 200,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: 16,
    borderWidth: BorderWidth.default,
  },

  toastIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: BorderWidth.default,
    alignItems: "center",
    justifyContent: "center",
  },

  toastTitle: { ...Typography.subhead, fontWeight: FontWeight.heavy },
  toastSub: { ...Typography.caption, marginTop: 1 },

  toggle: {
    flexDirection: "row",
    borderRadius: 9,
    padding: 3,
    gap: 3,
  },

  togBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 7,
  },

  finishLikeCard: {
    borderRadius: 20,
    borderWidth: BorderWidth.default,
    padding: 16,
    overflow: "hidden",
  },

  finishLikeTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: FontWeight.black,
    letterSpacing: -0.15,
  },

  finishLikeMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: FontWeight.bold,
  },

  prMiniBadge: {
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: BorderWidth.default,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },

  prMiniBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.25,
    textTransform: "uppercase",
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
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.2,
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

  programHeroCard: {
    borderRadius: 20,
    borderWidth: BorderWidth.default,
    padding: 16,
  },

  daysRow: {
    flexDirection: "row",
    gap: 7,
  },

  dayCol: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },

  dayLetter: { fontSize: 10 },

  daySq: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  dayType: {
    fontSize: 8,
    textAlign: "center",
  },

  dotTrackBg: {
    position: "absolute",
    top: 6,
    left: "3%",
    right: "3%",
    height: 0.5,
  },

  dotTrackFg: {
    position: "absolute",
    top: 6,
    left: "3%",
    height: 0.5,
  },

  dotCol: {
    flex: 1,
    alignItems: "center",
    gap: 7,
  },

  dot: { zIndex: 1 },

  dotLabel: { fontSize: 9 },

  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 4,
    borderTopWidth: BorderWidth.default,
  },

  calCircle: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  calNum: { ...Typography.caption },

  weightBig: {
    fontSize: 28,
    fontWeight: FontWeight.black,
    letterSpacing: -0.4,
  },

  angleTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },

  photoSlot: {
    aspectRatio: 0.75,
    borderRadius: 14,
    borderWidth: BorderWidth.default,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    overflow: "hidden",
    position: "relative",
  },

  compareCard: {
    borderRadius: 14,
    borderWidth: BorderWidth.default,
    padding: 12,
  },

  checkinBtn: {
    borderRadius: 999,
    borderWidth: BorderWidth.default,
    padding: 13,
    alignItems: "center",
  },

  modalBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: BorderWidth.default,
    borderLeftWidth: BorderWidth.default,
    borderRightWidth: BorderWidth.default,
    maxHeight: "88%",
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },

  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: BorderWidth.default,
    alignItems: "center",
    justifyContent: "center",
  },

  progBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },

  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },

  bigInput: {
    borderRadius: 14,
    borderWidth: BorderWidth.default,
    padding: 14,
    fontSize: 34,
    fontWeight: FontWeight.black,
    width: 160,
    textAlign: "center",
  },

  primaryBtn: {
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
  },

  ghostBtn: {
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
    borderWidth: BorderWidth.default,
  },

  btnText: { ...Typography.button },

  measInputRow: {
    borderRadius: 14,
    borderWidth: BorderWidth.default,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  measWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: BorderWidth.default,
  },

  measInput: {
    width: 64,
    padding: 10,
    fontSize: FontSize.headline,
    fontWeight: FontWeight.heavy,
    textAlign: "right",
  },

  photoPlaceholder: {
    borderRadius: 14,
    borderWidth: BorderWidth.default,
    padding: 28,
    alignItems: "center",
  },

  doneCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: BorderWidth.default,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  modeToggle: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },

  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: "center",
  },

  shareCard: {
    borderRadius: 16,
    borderWidth: BorderWidth.default,
    padding: 20,
  },

  shareStatTile: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },

  shareConsistency: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  coachSummary: {
    borderRadius: 14,
    borderWidth: BorderWidth.default,
    padding: 14,
    marginBottom: 14,
  },

  coachRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
  },

  noteInput: {
    borderRadius: 14,
    borderWidth: BorderWidth.default,
    padding: 14,
    fontSize: FontSize.body,
    height: 88,
    textAlignVertical: "top",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  eyebrow: { ...Typography.micro },
  caption: { ...Typography.caption },
  meta: { ...Typography.meta },
  subhead: { ...Typography.subhead },
  headline: { ...Typography.headline },
  body: { ...Typography.body },
  title2: { ...Typography.title2 },
  title3: { ...Typography.title3 },
});
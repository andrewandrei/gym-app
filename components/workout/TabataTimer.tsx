// components/workout/TabataTimer.tsx

import * as Haptics from "expo-haptics";
import { Pause, Play, SkipForward } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppState, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";

type Phase = "work" | "rest";

type Props = {
  title?: string;
  workSeconds?: number;
  restSeconds?: number;
  intervals?: number;
  exercises: { id: string; name: string; image?: string }[];
  rotation?: "sequence" | "alternate";
  onComplete?: () => void;

  // Optional: persist/restore
  initial?: {
    intervalIndex?: number;   // 0-based
    phase?: Phase;
    secondsLeft?: number;
    isRunning?: boolean;
  };
};

export function TabataTimer({
  title = "Tabata",
  workSeconds = 20,
  restSeconds = 10,
  intervals = 8,
  exercises,
  rotation = "sequence",
  onComplete,
  initial,
}: Props) {
  const [isRunning, setIsRunning] = useState<boolean>(initial?.isRunning ?? false);
  const [phase, setPhase] = useState<Phase>(initial?.phase ?? "work");
  const [intervalIndex, setIntervalIndex] = useState<number>(initial?.intervalIndex ?? 0); // 0..intervals-1
  const [secondsLeft, setSecondsLeft] = useState<number>(
    initial?.secondsLeft ?? (initial?.phase === "rest" ? restSeconds : workSeconds),
  );

  const tickingRef = useRef<NodeJS.Timeout | null>(null);

  const totalSecondsThisPhase = phase === "work" ? workSeconds : restSeconds;

  // Choose which exercise is “active” for this interval
  const activeExercise = useMemo(() => {
    if (!exercises?.length) return null;
    if (rotation === "alternate" && exercises.length >= 2) {
      return exercises[intervalIndex % 2];
    }
    return exercises[intervalIndex % exercises.length];
  }, [exercises, intervalIndex, rotation]);

  const label = useMemo(() => {
    const prettyTitle = title?.trim() ? title : "Tabata";
    return `${prettyTitle} • ${workSeconds}s/${restSeconds}s • ${intervals} intervals`;
  }, [title, workSeconds, restSeconds, intervals]);

  const progressPct = useMemo(() => {
    const clamped = Math.max(0, Math.min(totalSecondsThisPhase, secondsLeft));
    return totalSecondsThisPhase === 0 ? 0 : (clamped / totalSecondsThisPhase) * 100;
  }, [secondsLeft, totalSecondsThisPhase]);

  const overallPct = useMemo(() => {
    const phasesDone = intervalIndex; // completed intervals
    const phaseProgress = phase === "work"
      ? (workSeconds - secondsLeft) / Math.max(1, workSeconds)
      : 1; // consider rest as “post-work” in the same interval
    const denom = Math.max(1, intervals);
    return Math.round(((phasesDone + phaseProgress) / denom) * 100);
  }, [intervalIndex, phase, secondsLeft, workSeconds, intervals]);

  const clearTick = () => {
    if (tickingRef.current) {
      clearInterval(tickingRef.current);
      tickingRef.current = null;
    }
  };

  const hapticTick = async (s: number) => {
    if (Platform.OS === "web") return;
    if (s <= 3 && s > 0) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const hapticSwitch = async () => {
    if (Platform.OS === "web") return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const goNextPhase = async () => {
    // Phase transitions:
    // work -> rest (same interval)
    // rest -> work (next interval)
    if (phase === "work") {
      setPhase("rest");
      setSecondsLeft(restSeconds);
      await hapticSwitch();
      return;
    }

    // rest -> next interval
    const nextIndex = intervalIndex + 1;
    if (nextIndex >= intervals) {
      setIsRunning(false);
      clearTick();
      onComplete?.();
      await hapticSwitch();
      return;
    }

    setIntervalIndex(nextIndex);
    setPhase("work");
    setSecondsLeft(workSeconds);
    await hapticSwitch();
  };

  useEffect(() => {
    // stop timers on background (prevents weirdness)
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        setIsRunning(false);
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    clearTick();
    if (!isRunning) return;

    tickingRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        // fire haptic ticks for 3..2..1
        hapticTick(next).catch(() => {});
        if (next <= 0) {
          // schedule transition on next frame (avoid setState inside setState chaos)
          setTimeout(() => {
            goNextPhase().catch(() => {});
          }, 0);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearTick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase, intervalIndex, workSeconds, restSeconds, intervals]);

  const toggle = async () => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    setIsRunning((p) => !p);
  };

  const reset = async () => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    setPhase("work");
    setIntervalIndex(0);
    setSecondsLeft(workSeconds);
  };

  const skip = async () => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    await goNextPhase();
  };

  return (
    <View style={S.wrap}>
      <Text allowFontScaling={false} style={S.kicker}>
        {label}
      </Text>

      <View style={S.topRow}>
        <View style={S.phasePill}>
          <Text allowFontScaling={false} style={[S.phaseText, phase === "work" ? S.phaseWork : S.phaseRest]}>
            {phase === "work" ? "WORK" : "REST"}
          </Text>
        </View>

        <Text allowFontScaling={false} style={S.intervalText}>
          Interval {Math.min(intervalIndex + 1, intervals)} / {intervals}
        </Text>
      </View>

      <View style={S.timerRow}>
        <Text allowFontScaling={false} style={S.timerText}>
          {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
        </Text>

        <View style={S.controls}>
          <Pressable onPress={toggle} style={S.ctrlBtn}>
            {isRunning ? <Pause size={18} color={Colors.surface} /> : <Play size={18} color={Colors.surface} />}
          </Pressable>

          <Pressable onPress={skip} style={[S.ctrlBtn, S.ctrlBtnGhost]}>
            <SkipForward size={18} color={Colors.text} />
          </Pressable>

          <Pressable onPress={reset} style={[S.ctrlBtn, S.ctrlBtnGhost]}>
            <Text allowFontScaling={false} style={S.ctrlTextGhost}>Reset</Text>
          </Pressable>
        </View>
      </View>

      <View style={S.progressTrack}>
        <View style={[S.progressFill, { width: `${progressPct}%` }]} />
      </View>

      {activeExercise ? (
        <View style={S.exerciseRow}>
          {activeExercise.image ? (
            <Image source={{ uri: activeExercise.image }} style={S.thumb} />
          ) : (
            <View style={[S.thumb, S.thumbFallback]} />
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text allowFontScaling={false} style={S.nextLabel}>Current</Text>
            <Text allowFontScaling={false} numberOfLines={1} style={S.exerciseName}>
              {activeExercise.name}
            </Text>
          </View>

          <View style={S.overallPill}>
            <Text allowFontScaling={false} style={S.overallText}>{overallPct}%</Text>
          </View>
        </View>
      ) : (
        <Text allowFontScaling={false} style={S.emptyText}>
          Add at least 1 exercise to this Tabata block.
        </Text>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.muted,
    letterSpacing: 0.2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.xs,
  },
  phasePill: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  phaseText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  phaseWork: { color: Colors.text },
  phaseRest: { color: Colors.muted },
  intervalText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.muted,
  },
  timerRow: {
    marginTop: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  timerText: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.6,
    color: Colors.text,
  },
  controls: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  ctrlBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  ctrlBtnGhost: {
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  ctrlTextGhost: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.text,
  },
  progressTrack: {
    marginTop: Spacing.sm,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: (Colors as any).premium ?? "#F4C84A",
  },
  exerciseRow: {
    marginTop: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  thumbFallback: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  nextLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  exerciseName: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  overallPill: {
    minWidth: 54,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  overallText: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.text,
  },
  emptyText: {
    marginTop: Spacing.md,
    color: Colors.muted,
    fontWeight: "700",
  },
});
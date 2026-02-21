import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Image, ImageBackground, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/ui/PressableScale";
import { styles } from "../programDetail.styles";

type Week = { id: string; label: string };

type Workout = {
  id: string;
  title: string;
  meta: string;
  duration: string;
  image: string;
  status?: "New" | "Done";
};

const FREE_WORKOUTS_PER_PROGRAM = 3;

export default function ProgramDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Demo only — replace later with entitlements
  const isPro = false;

  const program = useMemo(() => {
    const isHybrid = id === "p2";
    const weeksCount = isHybrid ? 12 : 8;

    return {
      id: id ?? "p1",
      title: isHybrid ? "Hybrid Athlete" : "Strength Foundations",
      coach: "Andrei Andrei",
      meta: isHybrid ? "Advanced · 12 weeks · Full gym" : "Intermediate · 8 weeks · Gym",
      goalLine: isHybrid ? "Strength + engine" : "Lean muscle + performance",
      hero: isHybrid
        ? "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/6784fa945db9e2462bde508b_675b0276e2206c6b6a37ff0c_Hybrid%20Athlete%20(1)-p-800.jpg"
        : "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/690f510381f5fead2d6257b8_c7d8a728-2fde-4254-a1a7-a505e1a4cf3e-p-2000.jpeg",
      weeks: Array.from({ length: weeksCount }).map((_, i) => ({
        id: `week-${i + 1}`,
        label: `Week ${i + 1}`,
      })) as Week[],
    };
  }, [id]);

  const workoutsByWeek: Workout[][] = useMemo(() => {
    return program.weeks.map((w, weekIdx) => {
      const firstWeek = weekIdx === 0;

      return [
        {
          id: `${w.id}-1`,
          title: "Strength & Conditioning",
          meta: "Strength · Full Gym",
          duration: "45–60 min",
          image:
            "https://images.unsplash.com/photo-1517964603305-11c0f6f66012?auto=format&fit=crop&w=1400&q=70",
          status: firstWeek ? "Done" : "New",
        },
        {
          id: `${w.id}-2`,
          title: "Upper Body",
          meta: "Upper · Dumbbells",
          duration: "25 min",
          image:
            "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/690f510381f5fead2d6257b8_c7d8a728-2fde-4254-a1a7-a505e1a4cf3e-p-2000.jpeg",
          status: "New",
        },
        {
          id: `${w.id}-3`,
          title: "Engine Builder",
          meta: "Conditioning · Running",
          duration: "18 min",
          image: "https://i.ytimg.com/vi/y3fAQLFi5Iw/maxresdefault.jpg",
          status: "New",
        },
      ];
    });
  }, [program.weeks]);

  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const activeWeek = program.weeks[activeWeekIndex];
  const workouts = workoutsByWeek[activeWeekIndex] ?? [];

  // Demo progress
  const completed = 3;
  const total = program.weeks.length * 3;
  const progressPct = Math.round((completed / Math.max(1, total)) * 100);

  const onPressWorkout = (weekIdx: number, workoutIdx: number) => {
    const globalIndex = weekIdx * 3 + workoutIdx; // 0-based
    const isFreePreview = globalIndex < FREE_WORKOUTS_PER_PROGRAM;

    if (!isPro && !isFreePreview) {
      router.push("/paywall");
      return;
    }
    router.push({ pathname: "/workout" });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <ImageBackground source={{ uri: program.hero }} style={styles.hero} resizeMode="cover">
          {/* Premium gradient: legibility without “dark wash” */}
          <LinearGradient
            colors={["rgba(0,0,0,0.10)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.72)"]}
            locations={[0, 0.45, 1]}
            style={styles.heroGradient}
          />

          {/* top bar */}
          <View style={[styles.heroTopBar, { paddingTop: Math.max(insets.top, 10) }]}>
            <PressableScale
              onPress={() => router.back()}
              style={styles.heroIconBtn}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <ChevronLeft size={22} color="#FFFFFF" />
            </PressableScale>

            {!isPro ? (
              <PressableScale
                onPress={() => router.push("/paywall")}
                style={styles.heroUpgradePill}
                accessibilityRole="button"
                accessibilityLabel="Upgrade"
              >
                <Sparkles size={16} color="#111111" />
                <Text style={styles.heroUpgradeText}>Upgrade</Text>
              </PressableScale>
            ) : (
              <View style={styles.heroProChip}>
                <Text style={styles.heroProChipText}>Elite</Text>
              </View>
            )}
          </View>

          {/* header content */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{program.title}</Text>
            <Text style={styles.heroSubtitle}>with {program.coach}</Text>
            <Text style={styles.heroMeta}>{program.meta}</Text>

            <View style={styles.heroProgressTrack}>
              <View style={[styles.heroProgressFill, { width: `${progressPct}%` }]} />
            </View>

            {/* Stats: keep minimal, no pill overload */}
            <View style={styles.heroStatsRow}>
              <Text style={styles.heroStatText}>3 sessions / week</Text>
              <View style={styles.heroStatDot} />
              <Text style={styles.heroStatText}>{program.goalLine}</Text>
              <View style={styles.heroStatDot} />
              <Text style={styles.heroStatText}>{progressPct}% complete</Text>
            </View>
          </View>
        </ImageBackground>

        {/* CONTENT */}
        <View style={styles.content}>
          {/* WEEKS STRIP (underline rail) */}
          <View style={styles.weeksWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weeksRail}
            >
              {program.weeks.map((w, i) => {
                const active = i === activeWeekIndex;
                return (
                  <PressableScale
                    key={w.id}
                    onPress={() => setActiveWeekIndex(i)}
                    style={styles.weekItem}
                    scaleTo={0.985}
                    opacityTo={0.9}
                  >
                    <Text style={[styles.weekItemText, active && styles.weekItemTextActive]}>
                      {w.label}
                    </Text>
                    <View style={[styles.weekUnderline, active && styles.weekUnderlineActive]} />
                  </PressableScale>
                );
              })}
            </ScrollView>
          </View>

          {/* WEEK HEADER */}
          <View style={styles.weekHeader}>
            <View>
              <Text style={styles.weekTitle}>{activeWeek?.label}</Text>
              <Text style={styles.weekSub}>{workouts.length} workouts</Text>
            </View>

            <View style={styles.weekMeta}>
              <Text style={styles.weekMetaText}>Week plan</Text>
            </View>
          </View>

          {/* WORKOUT GROUP (single surface, inset dividers) */}
          <View style={styles.workoutGroup}>
            {workouts.map((w, idx) => {
              const isLast = idx === workouts.length - 1;

              return (
                <PressableScale
                  key={w.id}
                  onPress={() => onPressWorkout(activeWeekIndex, idx)}
                  style={styles.workoutRow}
                  scaleTo={0.99}
                  opacityTo={0.94}
                >
                  <Image source={{ uri: w.image }} style={styles.workoutThumb} />

                  <View style={styles.workoutMid}>
                    <Text style={styles.workoutTitle} numberOfLines={1}>
                      {w.title}
                    </Text>
                    <Text style={styles.workoutMeta} numberOfLines={1}>
                      {w.meta} · {w.duration}
                    </Text>
                  </View>

                  <View style={styles.workoutRight}>
                    {w.status === "Done" ? (
                      <View style={styles.statusPillDone}>
                        <Check size={14} color="#111111" />
                        <Text style={styles.statusPillText}>Done</Text>
                      </View>
                    ) : (
                      <View style={styles.statusPillNew}>
                        <Text style={styles.statusPillText}>New</Text>
                      </View>
                    )}

                    <ChevronRight size={18} color="rgba(0,0,0,0.28)" />
                  </View>

                  {!isLast && <View style={styles.rowDivider} />}
                </PressableScale>
              );
            })}
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

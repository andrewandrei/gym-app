// gym-app/app/(tabs)/index.tsx

import { useFocusEffect, useRouter } from "expo-router";
import { ChevronRight, Moon } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EditorialCard } from "@/components/ui/EditorialCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Colors } from "@/styles/colors";
import { GlobalStyles } from "@/styles/global";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";

import {
  clearWorkoutDraft,
  loadWorkoutDraft,
  type WorkoutDraft,
} from "../workout/workoutDraft";

type CtaState = "start" | "resume";

type PrepCard = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge?: string;
};

export default function HomeScreen() {
  const router = useRouter();

  const [workoutDraft, setWorkoutDraft] = useState<WorkoutDraft | null>(null);

  /* ───────────── DEMO DATA (replace with real program state later) ───────────── */

  const weeklyDone = 0;
  const weeklyTotal = 3;

  const programTitle = "Strength Foundations";
  const programMeta = "Intermediate · Gym";

  const workoutLabel = "Workout 4";
  const workoutName = "Hypertrophy Focus";

  const programCompleted = 3;
  const programTotal = 21;

  const streakDays = 3;

  const prepCards = useMemo<PrepCard[]>(
    () => [
      {
        id: "warmup-sequence",
        title: "Upper Body Warm-up Sequence",
        subtitle: "Mobility · Activation · 8 min",
        imageUrl: "https://i.ytimg.com/vi/M8M0AgQ8nD8/maxresdefault.jpg",
        badge: "Warm-up",
      },
      {
        id: "cooldown-sequence",
        title: "Cooldown & Recovery Flow",
        subtitle: "Breathing · Stretching · 6 min",
        imageUrl: "https://i.ytimg.com/vi/2ZgCRBLg2Zs/maxresdefault.jpg",
        badge: "Cool-down",
      },
    ],
    [],
  );

  /* ───────────── LOAD DRAFT ───────────── */

  useFocusEffect(
    React.useCallback(() => {
      const run = async () => {
        try {
          const draft = await loadWorkoutDraft();
          setWorkoutDraft(draft);
        } catch {
          setWorkoutDraft(null);
        }
      };

      run();
    }, []),
  );

  /* ───────────── DRAFT PROGRESS ───────────── */

  const draftProgress = useMemo(() => {
    if (!workoutDraft) return null;

    const totalSets = workoutDraft.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    const completedSets = workoutDraft.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.done).length,
      0,
    );

    return { totalSets, completedSets };
  }, [workoutDraft]);

  const ctaState: CtaState = workoutDraft ? "resume" : "start";

  /* ───────────── DERIVED VALUES ───────────── */

  const weeklyProgress = weeklyTotal > 0 ? weeklyDone / weeklyTotal : 0;
  const programProgress = programTotal > 0 ? programCompleted / programTotal : 0;

  const greetingTitle =
    ctaState === "resume" ? "Continue where you left off." : "Ready to train.";

  const greetingSub =
    ctaState === "resume" && draftProgress
      ? `${draftProgress.completedSets} of ${draftProgress.totalSets} sets completed`
      : `${weeklyDone} of ${weeklyTotal} workouts completed this week`;

  const weeklyLeft = Math.max(0, weeklyTotal - weeklyDone);

  /* ───────────── ACTIONS ───────────── */

  const startWorkout = () => {
    if (ctaState === "resume") {
      router.push({
        pathname: "/workout",
        params: { resumeDraft: "1" },
      });
      return;
    }

    router.push("/workout");
  };

  const discardWorkout = async () => {
    await clearWorkoutDraft();
    setWorkoutDraft(null);
  };

  const openPlanOverview = () => {
    router.push({
      pathname: "/program/[id]",
      params: { id: "strength-foundations" },
    });
  };

  const openPrograms = () => {
    router.push("/programs");
  };

   const openPrepCard = (id: string) => {
      router.push({
        pathname: "/workout",
        params: { workoutId: id },
      });
    };

  const openAllPrep = () => {
  router.push("/workouts");
};

  /* ───────────── UI ───────────── */

  return (
    <SafeAreaView style={GlobalStyles.screen} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          variant="hero"
          title={greetingTitle}
          subtitle={greetingSub}
          right={
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.85}>
              <Moon size={18} color={Colors.text} />
            </TouchableOpacity>
          }
        />

        <View style={styles.weekMetaRow}>
          <Text style={styles.weekMetaLeft}>This week</Text>
          <Text style={styles.weekMetaRight}>
            {weeklyLeft === 0 ? "Complete" : `${weeklyLeft} left`}
          </Text>
        </View>

        <View style={styles.weekProgressBg}>
          <View
            style={[
              styles.weekProgressFill,
              { width: `${Math.max(0, Math.min(1, weeklyProgress)) * 100}%` },
            ]}
          />
        </View>

        <View style={styles.todayRow}>
          <Text style={styles.todayTitle}>Today</Text>

          <TouchableOpacity
            style={styles.planLink}
            activeOpacity={0.8}
            onPress={openPlanOverview}
          >
            <Text style={styles.planLinkText}>Plan overview</Text>
            <ChevronRight size={16} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.todaySub}>Your current plan</Text>

        <View style={styles.heroCard}>
          <ImageBackground
            source={{
              uri: "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/685bf886d23017768f4614b5_img%20(1).png",
            }}
            style={styles.heroImage}
            imageStyle={styles.heroImageRadius}
          >
            <View style={styles.heroOverlay} />

            <View style={styles.heroTop}>
              <View style={styles.leftChips}>
                <View style={styles.chipLight}>
                  <Text style={styles.chipLightText}>
                    {programCompleted}/{programTotal} complete
                  </Text>
                </View>
              </View>

              <View style={styles.chipOutline}>
                <Text style={styles.chipOutlineText}>{streakDays}-day streak</Text>
              </View>
            </View>

            <View style={styles.heroBottom}>
              <Text style={styles.heroEyebrow}>{workoutLabel}</Text>

              <Text style={styles.heroTitle}>{workoutName}</Text>

              <Text style={styles.heroMeta}>
                {programTitle} · {programMeta}
              </Text>

              <View style={styles.heroProgressBg}>
                <View
                  style={[
                    styles.heroProgressFill,
                    { width: `${Math.max(0, Math.min(1, programProgress)) * 100}%` },
                  ]}
                />
              </View>

              <View style={styles.metricsRow}>
                {draftProgress ? (
                  <View style={styles.metricPill}>
                    <Text style={styles.metricPillText}>
                      {draftProgress.completedSets}/{draftProgress.totalSets} sets logged
                    </Text>
                  </View>
                ) : (
                  <View style={styles.metricPill}>
                    <Text style={styles.metricPillText}>Today’s main session</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.heroCta}
                onPress={startWorkout}
                activeOpacity={0.9}
              >
                <Text style={styles.heroCtaIcon}>▶</Text>
                <Text style={styles.heroCtaText}>
                  {ctaState === "resume"
                    ? `Resume workout: ${workoutLabel}`
                    : `Start workout: ${workoutLabel}`}
                </Text>
              </TouchableOpacity>

              {ctaState === "resume" && (
                <TouchableOpacity
                  onPress={discardWorkout}
                  style={styles.discardButton}
                  activeOpacity={0.75}
                >
                  <Text style={styles.discardText}>Discard workout</Text>
                </TouchableOpacity>
              )}
            </View>
          </ImageBackground>
        </View>

       

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Prep for today</Text>
          <TouchableOpacity style={styles.sectionLink} activeOpacity={0.8} onPress={openAllPrep}>
            <Text style={styles.sectionLinkText}>See all</Text>
            <ChevronRight size={16} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prepRail}
        >
          {prepCards.map((card, index) => (
            <View
              key={card.id}
              style={index !== prepCards.length - 1 ? styles.prepCardGap : undefined}
            >
              <EditorialCard
                title={card.title}
                metaBold={card.subtitle}
                imageUrl={card.imageUrl}
                badgeLabel={card.badge}
                onPress={() => openPrepCard(card.id)}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const BORDER = Colors.borderSubtle ?? Colors.border ?? "rgba(0,0,0,0.10)";

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },

  container: {
    paddingTop: 4,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: BorderWidth.default,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },

  weekMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weekMetaLeft: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.muted,
    letterSpacing: -0.1,
  },

  weekMetaRight: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.1,
  },

  weekProgressBg: {
    marginTop: 10,
    height: 8,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 999,
    overflow: "hidden",
  },

  weekProgressFill: {
    height: 8,
    backgroundColor: "#000",
    borderRadius: 999,
  },

  todayRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  todayTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.25,
  },

  planLink: {
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  planLinkText: {
    fontSize: 14,
    color: Colors.muted,
    fontWeight: "800",
    letterSpacing: -0.1,
  },

  todaySub: {
    fontSize: 15,
    color: Colors.muted,
    marginTop: 8,
    marginBottom: 14,
    fontWeight: "700",
    letterSpacing: -0.1,
  },

  heroCard: {
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: BorderWidth.default,
    borderColor: "rgba(0,0,0,0.06)",
  },

  heroImage: {
    width: "100%",
    height: 470,
    justifyContent: "space-between",
  },

  heroImageRadius: {
    borderRadius: 28,
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.30)",
  },

  heroTop: {
    marginTop: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  leftChips: {
    gap: 10,
  },

  chipLight: {
    backgroundColor: "rgba(255,255,255,0.84)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },

  chipLightText: {
    color: "#111",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: -0.05,
  },

  chipOutline: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: BorderWidth.default,
    borderColor: "rgba(255,255,255,0.32)",
    backgroundColor: "rgba(0,0,0,0.22)",
  },

  chipOutlineText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: -0.05,
  },

  heroBottom: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },

  heroEyebrow: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  heroTitle: {
    marginTop: 8,
    color: "#FFF",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  heroMeta: {
    marginTop: 6,
    color: "rgba(255,255,255,0.88)",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },

  heroProgressBg: {
    marginTop: 14,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    overflow: "hidden",
  },

  heroProgressFill: {
    height: 10,
    backgroundColor: "#FFF",
    borderRadius: 999,
  },

  metricsRow: {
    marginTop: 10,
    minHeight: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  metricPill: {
    backgroundColor: "rgba(0,0,0,0.42)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: BorderWidth.default,
    borderColor: "rgba(255,255,255,0.18)",
  },

  metricPillText: {
    color: "rgba(255,255,255,0.94)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: -0.05,
  },

  heroCta: {
    marginTop: 12,
    backgroundColor: "#FFF",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  heroCtaIcon: {
    fontSize: 16,
    color: "#000",
    fontWeight: "900",
  },

  heroCtaText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.15,
  },

  discardButton: {
    alignSelf: "center",
    marginTop: 10,
  },

  discardText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.62)",
  },

  switchProgram: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 28,
  },

  switchText: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.15,
  },

  sectionHeaderRow: {
    marginTop: 70,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.25,
  },

  sectionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  sectionLinkText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.muted,
    letterSpacing: -0.1,
  },

  prepRail: {
    paddingBottom: 6,
  },

  prepCardGap: {
    marginRight: Spacing.md,
  },

  bottomSpacer: {
    height: 32,
  },
});
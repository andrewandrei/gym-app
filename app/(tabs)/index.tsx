// app/(tabs)/index.tsx

import { useFocusEffect, useRouter } from "expo-router";
import { ChevronRight, Moon, Sun } from "lucide-react-native";
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
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";

import { useAppTheme } from "../_providers/theme";
import { getProgram } from "../program/program.data";
import {
  getProgramWorkoutTemplate,
  parseProgramWorkoutId,
} from "../program/programWorkouts";
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

const HERO_PROGRAM_ID = "strength-foundations";
const HERO_WORKOUT_ID = "strength-foundations-week-2-workout-1";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useAppTheme();

  const [workoutDraft, setWorkoutDraft] = useState<WorkoutDraft | null>(null);

  const weeklyDone = 0;
  const weeklyTotal = 3;

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

  const activeProgram = useMemo(() => getProgram(HERO_PROGRAM_ID), []);

  const heroWorkoutParsed = useMemo(
    () => parseProgramWorkoutId(HERO_WORKOUT_ID),
    [],
  );

  const heroWorkoutTemplate = useMemo(() => {
    if (!heroWorkoutParsed) return null;
    return getProgramWorkoutTemplate(heroWorkoutParsed.workoutIndex);
  }, [heroWorkoutParsed]);

  const programTitle = activeProgram.title;
  const programMeta = activeProgram.meta;
  const heroImage = activeProgram.hero;

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

  const defaultWorkoutLabel = heroWorkoutParsed
    ? `Workout ${((heroWorkoutParsed.weekNumber - 1) * 3) + heroWorkoutParsed.workoutNumber}`
    : "Workout 4";

  const defaultWorkoutName = heroWorkoutTemplate?.title ?? "Hypertrophy Focus";

  const workoutLabel =
    ctaState === "resume" ? "Unfinished workout" : defaultWorkoutLabel;

  const workoutName =
    ctaState === "resume" && workoutDraft?.workoutTitle
      ? workoutDraft.workoutTitle
      : defaultWorkoutName;

  const weeklyProgress = weeklyTotal > 0 ? weeklyDone / weeklyTotal : 0;
  const programProgress = programTotal > 0 ? programCompleted / programTotal : 0;

  const greetingTitle =
    ctaState === "resume" ? "Continue where you left off." : "Ready to train.";

  const greetingSub =
    ctaState === "resume" && draftProgress
      ? `${draftProgress.completedSets} of ${draftProgress.totalSets} sets completed`
      : `${weeklyDone} of ${weeklyTotal} workouts completed this week`;

  const weeklyLeft = Math.max(0, weeklyTotal - weeklyDone);

  const startWorkout = () => {
    if (ctaState === "resume" && workoutDraft) {
      router.push({
        pathname: "/workout",
        params: {
          resumeDraft: "1",
          workoutId: workoutDraft.workoutId,
          source: "home",
        },
      });
      return;
    }

    router.push({
      pathname: "/workout",
      params: {
        workoutId: HERO_WORKOUT_ID,
        programId: HERO_PROGRAM_ID,
        source: "home",
      },
    });
  };

  const discardWorkout = async () => {
    await clearWorkoutDraft();
    setWorkoutDraft(null);
  };

  const openPlanOverview = () => {
    router.push({
      pathname: "/program/[id]",
      params: { id: HERO_PROGRAM_ID },
    });
  };

  const openAllPrep = () => {
    router.push("/workouts");
  };

  const openPrepCard = (id: string) => {
    router.push({
      pathname: "/workout",
      params: {
        workoutId: id,
        source: "home",
      },
    });
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
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
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.85}
              onPress={toggleTheme}
            >
              {isDark ? (
                <Sun size={18} color={colors.text} />
              ) : (
                <Moon size={18} color={colors.text} />
              )}
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
            <ChevronRight size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.todaySub}>Your current plan</Text>

        <View style={styles.heroCard}>
          <ImageBackground
            source={{ uri: heroImage }}
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
                    ? "Resume workout"
                    : `Start workout: ${defaultWorkoutLabel}`}
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
            <ChevronRight size={16} color={colors.muted} />
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

function createStyles(colors: {
  background: string;
  surface: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  borderSubtle: string;
  premium: string;
}) {
  const BORDER = colors.borderSubtle ?? colors.border ?? "rgba(0,0,0,0.10)";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scroll: {
      flex: 1,
      backgroundColor: colors.background,
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
      backgroundColor: colors.card,
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
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
      letterSpacing: -0.05,
    },

    weekMetaRight: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.05,
    },

    weekProgressBg: {
      marginTop: 10,
      height: 8,
      backgroundColor: isDarkLike(colors.background)
        ? "rgba(255,255,255,0.12)"
        : "rgba(0,0,0,0.08)",
      borderRadius: 999,
      overflow: "hidden",
    },

    weekProgressFill: {
      height: 8,
      backgroundColor: colors.text,
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
      color: colors.text,
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
      color: colors.muted,
      fontWeight: "800",
      letterSpacing: -0.1,
    },

    todaySub: {
      fontSize: 15,
      color: colors.muted,
      marginTop: 8,
      marginBottom: 14,
      fontWeight: "700",
      letterSpacing: -0.1,
    },

    heroCard: {
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: colors.card,
      borderWidth: BorderWidth.default,
      borderColor: isDarkLike(colors.background)
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.06)",
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
      fontSize: 28,
      lineHeight: 31,
      fontWeight: "900",
      letterSpacing: -0.35,
    },

    heroMeta: {
      marginTop: 6,
      color: "rgba(255,255,255,0.88)",
      fontSize: 15,
      fontWeight: "700",
      letterSpacing: -0.1,
    },

   

    metricsRow: {
        marginTop: 14,
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

    sectionHeaderRow: {
      marginTop: 55,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.2,
    },

    sectionLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    sectionLinkText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.muted,
      letterSpacing: -0.1,
    },

    prepRail: {
        paddingBottom: 8,
        paddingRight: Spacing.md,
    },

    prepCardGap: {
      marginRight: Spacing.md,
    },

    bottomSpacer: {
      height: 32,
    },
  });
}

function isDarkLike(background: string) {
  return background === "#0B0B0C" || background === "#111214";
}
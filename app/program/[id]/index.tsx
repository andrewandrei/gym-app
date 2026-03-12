import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Lock,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/app/_providers/theme";
import { PressableScale } from "@/components/ui/PressableScale";
import { getProgram } from "../program.data";
import { createProgramDetailStyles } from "../programDetail.styles";
import {
  WORKOUTS_PER_WEEK,
  buildProgramWorkoutId,
  getProgramWorkoutTemplate,
} from "../programWorkouts";

type WorkoutStatus = "next" | "done" | "available" | "locked";

type Workout = {
  id: string;
  label: string;
  title: string;
  meta: string;
  duration: string;
  image: string;
  status: WorkoutStatus;
};

const FREE_WORKOUTS_PER_PROGRAM = 4;
const WEEK_PILL_WIDTH = 104;
const WEEK_PILL_GAP = 10;
const WEEK_RAIL_SIDE_PADDING = 16;

export default function ProgramDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createProgramDetailStyles(colors, isDark), [colors, isDark]);

  const { id } = useLocalSearchParams<{ id: string }>();
  const program = useMemo(() => getProgram(id), [id]);

  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoMounted, setInfoMounted] = useState(false);
  const [nextWorkoutY, setNextWorkoutY] = useState<number | null>(null);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const blurOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(42)).current;
  const sheetScale = useRef(new Animated.Value(0.985)).current;

  const verticalScrollRef = useRef<ScrollView | null>(null);
  const weeksScrollRef = useRef<ScrollView | null>(null);
  const didInitialAutoFocus = useRef(false);

  const isPro = false;
  const completedCount = 3;

  const workoutsByWeek: Workout[][] = useMemo(() => {
    return program.weeks.map((_, weekIdx) => {
      return Array.from({ length: WORKOUTS_PER_WEEK }).map((__, workoutIdx) => {
        const template = getProgramWorkoutTemplate(workoutIdx);

        const globalIndex = weekIdx * WORKOUTS_PER_WEEK + workoutIdx;
        const workoutNumber = globalIndex + 1;

        let status: WorkoutStatus = "available";

        if (globalIndex < completedCount) {
          status = "done";
        } else if (globalIndex === completedCount) {
          status = "next";
        } else {
          const isUnlockedPreview = isPro || globalIndex < FREE_WORKOUTS_PER_PROGRAM;
          status = isUnlockedPreview ? "available" : "locked";
        }

        return {
          id: buildProgramWorkoutId(program.id, weekIdx, workoutIdx),
          label: `Workout ${workoutNumber}`,
          title: template.title,
          meta: template.meta,
          duration: template.duration,
          image: template.image,
          status,
        };
      });
    });
  }, [completedCount, isPro, program.id, program.weeks]);

  const nextWorkout = useMemo(() => {
    for (let weekIdx = 0; weekIdx < workoutsByWeek.length; weekIdx += 1) {
      const workoutIdx = workoutsByWeek[weekIdx].findIndex((w) => w.status === "next");

      if (workoutIdx !== -1) {
        return {
          weekIdx,
          workoutIdx,
          workout: workoutsByWeek[weekIdx][workoutIdx],
          globalIndex: weekIdx * WORKOUTS_PER_WEEK + workoutIdx,
        };
      }
    }

    return null;
  }, [workoutsByWeek]);

  useEffect(() => {
    if (nextWorkout) {
      setActiveWeekIndex(nextWorkout.weekIdx);
    }
  }, [nextWorkout]);

  useEffect(() => {
    setNextWorkoutY(null);
  }, [activeWeekIndex]);

  const activeWeek = program.weeks[activeWeekIndex];
  const workouts = workoutsByWeek[activeWeekIndex] ?? [];

  const completed = completedCount;
  const total = program.weeks.length * WORKOUTS_PER_WEEK;
  const progressPct = Math.round((completed / Math.max(1, total)) * 100);

  const weekNumber = activeWeekIndex + 1;
  const totalWeeks = program.weeks.length;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const openInfoModal = () => {
    setInfoMounted(true);
    setInfoVisible(true);
  };

  const closeInfoModal = () => {
    setInfoVisible(false);
  };

  useEffect(() => {
    if (infoVisible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(blurOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          damping: 18,
          mass: 0.85,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.spring(sheetScale, {
          toValue: 1,
          damping: 18,
          mass: 0.9,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    if (infoMounted) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(blurOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 28,
          duration: 180,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetScale, {
          toValue: 0.992,
          duration: 180,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setInfoMounted(false);
        }
      });
    }
  }, [
    backdropOpacity,
    blurOpacity,
    infoMounted,
    infoVisible,
    sheetScale,
    sheetTranslateY,
  ]);

  useEffect(() => {
    if (!nextWorkout) return;

    const x =
      WEEK_RAIL_SIDE_PADDING +
      activeWeekIndex * (WEEK_PILL_WIDTH + WEEK_PILL_GAP) -
      24;

    const timer = setTimeout(() => {
      weeksScrollRef.current?.scrollTo({
        x: Math.max(0, x),
        animated: true,
      });
    }, 80);

    return () => clearTimeout(timer);
  }, [activeWeekIndex, nextWorkout]);

  useEffect(() => {
    if (!nextWorkout) return;
    if (nextWorkoutY == null) return;
    if (activeWeekIndex !== nextWorkout.weekIdx) return;

    const timer = setTimeout(() => {
      verticalScrollRef.current?.scrollTo({
        y: Math.max(0, nextWorkoutY - 140),
        animated: didInitialAutoFocus.current,
      });
      didInitialAutoFocus.current = true;
    }, 120);

    return () => clearTimeout(timer);
  }, [activeWeekIndex, nextWorkout, nextWorkoutY]);

  const onPressWorkout = (weekIdx: number, workoutIdx: number) => {
    const workout = workoutsByWeek[weekIdx]?.[workoutIdx];
    if (!workout) return;

    if (workout.status === "locked") {
      router.push("/paywall");
      return;
    }

    router.push({
      pathname: "/workout",
      params: {
        workoutId: workout.id,
        programId: String(id ?? "strength-foundations"),
        source: "program",
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        <ScrollView
          ref={verticalScrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground source={{ uri: program.hero }} style={styles.hero} resizeMode="cover">
            <LinearGradient
              colors={[
                "rgba(0,0,0,0.12)",
                "rgba(0,0,0,0.30)",
                "rgba(0,0,0,0.64)",
              ]}
              locations={[0, 0.45, 1]}
              style={styles.heroGradient}
            />

            <View style={[styles.heroTopBar, { paddingTop: Math.max(insets.top, 10) }]}>
              <PressableScale
                onPress={handleBack}
                style={styles.heroIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <ChevronLeft size={22} color="#FFFFFF" />
              </PressableScale>

              <PressableScale
                onPress={openInfoModal}
                style={styles.heroInfoBtn}
                accessibilityRole="button"
                accessibilityLabel="Program information"
              >
                <Info size={18} color="#FFFFFF" />
              </PressableScale>
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{program.title}</Text>
              <Text style={styles.heroSubtitle}>{program.subtitle}</Text>
              <Text style={styles.heroMeta}>
                with {program.coach} · {program.meta}
              </Text>

              <View style={styles.heroProgressTrack}>
                <View style={[styles.heroProgressFill, { width: `${progressPct}%` }]} />
              </View>

              <View style={styles.heroStatsRow}>
                <Text style={styles.heroStatText}>
                  {completed}/{total} workouts
                </Text>
                <View style={styles.heroStatDot} />
                <Text style={styles.heroStatText}>
                  Week {Math.min(weekNumber, totalWeeks)} of {totalWeeks}
                </Text>
                <View style={styles.heroStatDot} />
                <Text style={styles.heroStatText}>3-day streak</Text>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Weeks</Text>
            </View>

            <ScrollView
              ref={weeksScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weeksRail}
              style={styles.weeksScroll}
            >
              {program.weeks.map((w, i) => {
                const active = i === activeWeekIndex;

                return (
                  <PressableScale
                    key={w.id}
                    onPress={() => setActiveWeekIndex(i)}
                    style={[styles.weekPill, active && styles.weekPillActive]}
                    scaleTo={0.985}
                    opacityTo={0.92}
                  >
                    <Text style={[styles.weekPillText, active && styles.weekPillTextActive]}>
                      {w.label}
                    </Text>
                  </PressableScale>
                );
              })}
            </ScrollView>

            <View style={styles.activeWeekHeader}>
              <View>
                <Text style={styles.activeWeekTitle}>{activeWeek?.label}</Text>
                <Text style={styles.activeWeekSub}>{workouts.length} workouts</Text>
              </View>

              <View style={styles.activeWeekMetaChip}>
                <Text style={styles.activeWeekMetaText}>
                  {weekNumber}/{totalWeeks}
                </Text>
              </View>
            </View>

            <View style={styles.workoutsInline}>
              {workouts.map((w, idx) => {
                const isLast = idx === workouts.length - 1;
                const isNext = w.status === "next";

                return (
                  <View
                    key={w.id}
                    onLayout={isNext ? (event) => setNextWorkoutY(event.nativeEvent.layout.y) : undefined}
                    style={isNext ? styles.nextWorkoutWrap : undefined}
                  >
                    <PressableScale
                      onPress={() => onPressWorkout(activeWeekIndex, idx)}
                      style={[styles.workoutRow, isNext && styles.workoutRowNext]}
                      scaleTo={0.99}
                      opacityTo={0.95}
                    >
                      {isNext && <View style={styles.nextWorkoutAccent} />}

                      <Image source={{ uri: w.image }} style={styles.workoutThumb} />

                      <View style={styles.workoutContent}>
                        <Text style={styles.workoutLabel}>{w.label}</Text>

                        <Text
                          style={[
                            styles.workoutTitle,
                            w.status === "locked" && styles.workoutTitleLocked,
                          ]}
                          numberOfLines={2}
                        >
                          {w.title}
                        </Text>

                        <Text
                          style={[
                            styles.workoutMeta,
                            w.status === "locked" && styles.workoutMetaLocked,
                          ]}
                          numberOfLines={1}
                        >
                          {w.meta} · {w.duration}
                        </Text>
                      </View>

                      <View style={styles.workoutRight}>
                        {w.status === "done" ? (
                          <View style={styles.statusDone}>
                            <Check size={13} color="#111111" />
                            <Text style={styles.statusDoneText}>Done</Text>
                          </View>
                        ) : w.status === "next" ? (
                          <View style={styles.statusNext}>
                            <Text style={styles.statusNextText}>Next</Text>
                          </View>
                        ) : w.status === "available" ? (
                          <View style={styles.statusAvailable}>
                            <Text style={styles.statusAvailableText}>Available</Text>
                          </View>
                        ) : (
                          <View style={styles.statusLocked}>
                            <Lock size={13} color={isDark ? "rgba(255,255,255,0.42)" : "rgba(17,17,17,0.38)"} />
                          </View>
                        )}

                        <ChevronRight
                          size={18}
                          color={
                            w.status === "locked"
                              ? isDark
                                ? "rgba(255,255,255,0.22)"
                                : "rgba(17,17,17,0.18)"
                              : isDark
                                ? "rgba(255,255,255,0.38)"
                                : "rgba(17,17,17,0.28)"
                          }
                        />
                      </View>
                    </PressableScale>

                    {!isLast && !isNext && <View style={styles.inlineDivider} />}
                  </View>
                );
              })}
            </View>

            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>

        <Modal
          visible={infoMounted}
          animationType="none"
          transparent
          statusBarTranslucent
          onRequestClose={closeInfoModal}
        >
          <View style={styles.modalRoot}>
            <Animated.View style={[styles.modalDim, { opacity: backdropOpacity }]} />

            <Animated.View style={[styles.modalBlurWrap, { opacity: blurOpacity }]}>
              <BlurView intensity={26} tint={isDark ? "dark" : "light"} style={styles.modalBlur} />
            </Animated.View>

            <Pressable style={styles.modalBackdropTouch} onPress={closeInfoModal} />

            <Animated.View
              style={[
                styles.infoModalOuter,
                {
                  paddingBottom: Math.max(insets.bottom, 18),
                  transform: [{ translateY: sheetTranslateY }, { scale: sheetScale }],
                },
              ]}
            >
              <View style={styles.infoGrabber} />

              <View style={styles.infoModalTop}>
                <View style={styles.infoModalTitleWrap}>
                  <Text style={styles.infoModalEyebrow}>Program overview</Text>
                  <Text style={styles.infoModalTitle}>{program.title}</Text>
                </View>

                <PressableScale
                  onPress={closeInfoModal}
                  style={styles.infoCloseBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Close program information"
                >
                  <X size={18} color={colors.text} />
                </PressableScale>
              </View>

              <Text style={styles.infoModalBody}>{program.description}</Text>

              <View style={styles.infoBulletsCard}>
                {program.bullets.map((item, index) => {
                  const isLast = index === program.bullets.length - 1;

                  return (
                    <View
                      key={item}
                      style={[styles.infoBulletRow, !isLast && styles.infoBulletRowSpaced]}
                    >
                      <View style={styles.infoBulletDotWrap}>
                        <View style={styles.infoBulletDot} />
                      </View>

                      <View style={styles.infoBulletTextWrap}>
                        <Text style={styles.infoBulletText}>{item}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.infoMetaRow}>
                <Text style={styles.infoMetaText}>{program.meta}</Text>
              </View>

              <PressableScale
                onPress={closeInfoModal}
                style={styles.infoModalButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.infoModalButtonText}>Got it</Text>
              </PressableScale>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
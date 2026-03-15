import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Check, ChevronLeft, Lock, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/app/_providers/theme";
import { PressableScale } from "@/components/ui/PressableScale";

import { getProgram } from "../program.data";
import { createProgramDetailStyles } from "../programDetail.styles";
import {
  buildProgramWorkoutId,
  getProgramWorkoutTemplate,
  getWorkoutCountForWeek,
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

export default function ProgramDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createProgramDetailStyles(colors, isDark), [colors, isDark]);

  const { id } = useLocalSearchParams<{ id: string }>();
  const program = useMemo(() => getProgram(id), [id]);

  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [infoMounted, setInfoMounted] = useState(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const blurOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(42)).current;
  const sheetScale = useRef(new Animated.Value(0.985)).current;

  const verticalScrollRef = useRef<Animated.ScrollView | null>(null);
  const weeksScrollRef = useRef<ScrollView | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const isPro = false;
  const completedCount = 3;

  const heroHeight = Math.max(360, Math.round(screenHeight * 0.405));

  const workoutsByWeek: Workout[][] = useMemo(() => {
    return program.weeks.map((_, weekIdx) => {
      const count = getWorkoutCountForWeek(weekIdx);

      return Array.from({ length: count }).map((__, workoutIdx) => {
        const template = getProgramWorkoutTemplate(workoutIdx);

        const globalIndexBeforeThisWeek = program.weeks
          .slice(0, weekIdx)
          .reduce((sum, _week, idx) => sum + getWorkoutCountForWeek(idx), 0);

        const globalIndex = globalIndexBeforeThisWeek + workoutIdx;
        const workoutNumber = globalIndex + 1;

        let status: WorkoutStatus = "available";

        if (globalIndex < completedCount) {
          status = "done";
        } else if (globalIndex === completedCount) {
          status = "next";
        } else {
          const isUnlockedPreview = isPro || globalIndex < 4;
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
        return { weekIdx, workoutIdx, workout: workoutsByWeek[weekIdx][workoutIdx] };
      }
    }
    return null;
  }, [workoutsByWeek]);

  useEffect(() => {
    if (nextWorkout) setActiveWeekIndex(nextWorkout.weekIdx);
  }, [nextWorkout]);

  useEffect(() => {
    const x = activeWeekIndex * 136;
    const timer = setTimeout(() => {
      weeksScrollRef.current?.scrollTo({
        x: Math.max(0, x - 18),
        animated: true,
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [activeWeekIndex]);

  useEffect(() => {
    if (infoMounted) {
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
    }
  }, [backdropOpacity, blurOpacity, infoMounted, sheetScale, sheetTranslateY]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  const closeInfoModal = () => {
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
      if (finished) setInfoMounted(false);
    });
  };

  const onPressWorkout = (workout: Workout) => {
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

  const totalWorkouts = workoutsByWeek.reduce((sum, week) => sum + week.length, 0);

  const heroTranslateY = scrollY.interpolate({
    inputRange: [-heroHeight, 0, heroHeight],
    outputRange: [-heroHeight * 0.12, 0, -heroHeight * 0.1],
    extrapolate: "clamp",
  });

  const heroScale = scrollY.interpolate({
    inputRange: [-heroHeight, 0],
    outputRange: [1.14, 1],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  const floatingHeaderOpacity = scrollY.interpolate({
    inputRange: [heroHeight * 0.52, heroHeight * 0.74],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const floatingHeaderTranslateY = scrollY.interpolate({
    inputRange: [heroHeight * 0.52, heroHeight * 0.74],
    outputRange: [-8, 0],
    extrapolate: "clamp",
  });

  const heroInfoOpacity = scrollY.interpolate({
    inputRange: [0, heroHeight * 0.46],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const contentTranslateY = scrollY.interpolate({
    inputRange: [-140, 0, 140],
    outputRange: [-18, 0, 0],
    extrapolate: "clamp",
  });

  const activeWeekWorkouts = workoutsByWeek[activeWeekIndex] ?? [];
  const weekCountForActive = getWorkoutCountForWeek(activeWeekIndex);

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <View style={styles.screen}>
        <View pointerEvents="none" style={[styles.heroBackdrop, { height: heroHeight + 190 }]}>
          <Animated.Image
            source={{ uri: program.hero }}
            style={[
              styles.heroBackdropImage,
              {
                transform: [{ translateY: heroTranslateY }, { scale: heroScale }],
              },
            ]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.03)",
              "rgba(0,0,0,0.12)",
              "rgba(0,0,0,0.30)",
            ]}
            locations={[0, 0.52, 1]}
            style={styles.heroBackdropGradient}
          />
        </View>

        <Animated.ScrollView
          ref={verticalScrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 28 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          bounces
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
        >
          <View style={[styles.heroSpace, { height: heroHeight }]}>
            <View style={styles.overlayActions}>
              <PressableScale
                onPress={handleBack}
                style={styles.heroIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <ChevronLeft size={22} color="#FFFFFF" />
              </PressableScale>

              <View style={styles.heroIconSpacer} />
            </View>

            <Animated.View
              pointerEvents="none"
              style={[styles.heroOverlayContent, { opacity: heroInfoOpacity }]}
            >
              <Text style={styles.heroTitle}>Strength Foundations</Text>

              <Text style={styles.heroSubtitle}>
                Build strength and lean muscle with structured progression
              </Text>

              <Text style={styles.heroMeta}>
                with Andrei Andrei · Intermediate · Gym · 8 weeks
              </Text>

              <View style={styles.heroProgressTrack}>
                <View
                  style={[
                    styles.heroProgressFill,
                    {
                      width: `${Math.round(
                        (completedCount / Math.max(1, totalWorkouts)) * 100,
                      )}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.heroStatsRow}>
                <Text style={styles.heroStatText}>{completedCount}/{totalWorkouts} workouts</Text>
                <View style={styles.heroStatDot} />
                <Text style={styles.heroStatText}>
                  Week {activeWeekIndex + 1} of {program.weeks.length}
                </Text>
                <View style={styles.heroStatDot} />
                <Text style={styles.heroStatText}>3-day streak</Text>
              </View>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.content,
              {
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            <ScrollView
              ref={weeksScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weeksRail}
              style={styles.weeksScroll}
            >
              {program.weeks.map((week, index) => {
                const active = index === activeWeekIndex;

                return (
                  <PressableScale
                    key={week.id}
                    onPress={() => setActiveWeekIndex(index)}
                    style={[styles.weekPill, active && styles.weekPillActive]}
                    scaleTo={0.985}
                    opacityTo={0.92}
                  >
                    <Text style={[styles.weekPillText, active && styles.weekPillTextActive]}>
                      {week.label}
                    </Text>
                  </PressableScale>
                );
              })}
            </ScrollView>

            <View style={styles.activeWeekHeader}>
              <View>
                <Text style={styles.activeWeekTitle}>{program.weeks[activeWeekIndex]?.label}</Text>
                <Text style={styles.activeWeekSub}>{weekCountForActive} workouts</Text>
              </View>

              <View style={styles.activeWeekMetaChip}>
                <Text style={styles.activeWeekMetaText}>
                  {activeWeekIndex + 1}/{program.weeks.length}
                </Text>
              </View>
            </View>

            <View style={styles.workoutsInline}>
              {activeWeekWorkouts.map((workout, index) => {
                const isLast = index === activeWeekWorkouts.length - 1;
                const isNext = workout.status === "next";
                const isDone = workout.status === "done";
                const isLocked = workout.status === "locked";

                return (
                  <View key={workout.id}>
                    <PressableScale
                      onPress={() => onPressWorkout(workout)}
                      style={[styles.workoutRow, isNext && styles.workoutRowNext]}
                      scaleTo={0.99}
                      opacityTo={0.95}
                    >
                      {isNext && <View style={styles.nextWorkoutAccent} />}

                      <Image source={{ uri: workout.image }} style={styles.workoutThumb} />

                      <View style={styles.workoutContent}>
                        <Text style={styles.workoutLabel}>{workout.label}</Text>
                        <Text
                          style={[styles.workoutTitle, isLocked && styles.workoutTitleLocked]}
                          numberOfLines={2}
                        >
                          {workout.title}
                        </Text>
                        <Text
                          style={[styles.workoutMeta, isLocked && styles.workoutMetaLocked]}
                          numberOfLines={1}
                        >
                          {workout.meta} · {workout.duration}
                        </Text>
                      </View>

                      <View style={styles.workoutRight}>
                        {isNext ? (
                          <View style={styles.statusNext}>
                            <Text style={styles.statusNextText}>Next</Text>
                          </View>
                        ) : isDone ? (
                          <View style={styles.statusDone}>
                            <Check size={13} color="#111111" />
                            <Text style={styles.statusDoneText}>Done</Text>
                          </View>
                        ) : isLocked ? (
                          <View style={styles.statusLocked}>
                            <Lock
                              size={14}
                              color={isDark ? "rgba(255,255,255,0.46)" : "rgba(17,17,17,0.40)"}
                            />
                          </View>
                        ) : (
                          <View style={styles.statusLockedGhost} />
                        )}
                      </View>
                    </PressableScale>

                    {!isLast && <View style={styles.inlineDivider} />}
                  </View>
                );
              })}
            </View>

            <View style={styles.descriptionBlock}>
              <Text style={styles.descriptionEyebrow}>Program overview</Text>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{program.description}</Text>
            </View>

            <View style={styles.bulletsBlock}>
              {program.bullets.map((item, index) => (
                <View
                  key={item}
                  style={[
                    styles.bulletRow,
                    index !== program.bullets.length - 1 && styles.bulletRowGap,
                  ]}
                >
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </Animated.ScrollView>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.floatingHeader,
            {
              opacity: floatingHeaderOpacity,
              transform: [{ translateY: floatingHeaderTranslateY }],
              paddingTop: Math.max(insets.top, 10),
            },
          ]}
        >
          <BlurView
            intensity={22}
            tint={isDark ? "dark" : "light"}
            style={styles.floatingHeaderBlur}
          >
            <View style={styles.floatingHeaderContent}>
              <Text style={styles.floatingHeaderTitle} numberOfLines={1}>
                Strength Foundations
              </Text>

              <View style={styles.floatingHeaderMetaRow}>
                <Text style={styles.floatingHeaderMetaText}>
                  {completedCount}/{totalWorkouts} workouts
                </Text>
                <View style={styles.floatingHeaderDot} />
                <Text style={styles.floatingHeaderMetaText}>
                  Week {activeWeekIndex + 1} of {program.weeks.length}
                </Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>

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
                {program.bullets.map((item, index) => (
                  <View
                    key={item}
                    style={[
                      styles.infoBulletRow,
                      index !== program.bullets.length - 1 && styles.infoBulletRowSpaced,
                    ]}
                  >
                    <View style={styles.infoBulletDotWrap}>
                      <View style={styles.infoBulletDot} />
                    </View>
                    <View style={styles.infoBulletTextWrap}>
                      <Text style={styles.infoBulletText}>{item}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.infoMetaRow}>
                <Text style={styles.infoMetaText}>
                  {completedCount}/{totalWorkouts} workouts completed
                </Text>
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
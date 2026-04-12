import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Check, ChevronLeft, Info, Lock, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/ui/PressableScale";
import { getProgram } from "@/features/programs/program.data";
import {
  buildProgramWorkoutId,
  getProgramWorkoutTemplate,
  getWorkoutCountForWeek,
} from "@/features/programs/programWorkouts";
import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height: screenHeight } = useWindowDimensions();
  const { colors, isDark } = useAppTheme();

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const program = useMemo(() => getProgram(id), [id]);

  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [infoMounted, setInfoMounted] = useState(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(42)).current;
  const sheetScale = useRef(new Animated.Value(0.985)).current;

  const weeksScrollRef = useRef<ScrollView | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const isPro = false;
  const completedCount = 3;

  const heroHeight = Math.max(300, Math.round(screenHeight * 0.34));

  const overscroll = scrollY.interpolate({
    inputRange: [-220, 0],
    outputRange: [220, 0],
    extrapolate: "clamp",
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, heroHeight],
    outputRange: [0, -heroHeight * 0.08],
    extrapolate: "clamp",
  });

  const heroMediaHeight = Animated.add(overscroll, heroHeight);

  const backButtonOpacity = scrollY.interpolate({
    inputRange: [0, heroHeight * 0.45, heroHeight * 0.65],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });

  const backButtonTranslateY = scrollY.interpolate({
    inputRange: [0, heroHeight * 0.65],
    outputRange: [0, -12],
    extrapolate: "clamp",
  });

  const floatingHeaderOpacity = scrollY.interpolate({
    inputRange: [heroHeight * 0.5, heroHeight * 0.72],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const floatingHeaderTranslateY = scrollY.interpolate({
    inputRange: [heroHeight * 0.5, heroHeight * 0.72],
    outputRange: [-8, 0],
    extrapolate: "clamp",
  });

  const isDarkSoft = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
  const isDarkSoftStronger = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

  const workoutsByWeek: Workout[][] = useMemo(() => {
    if (!program) return [];

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
  }, [completedCount, isPro, program]);

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
    if (!infoMounted) return;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
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
  }, [backdropOpacity, infoMounted, sheetScale, sheetTranslateY]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  const openInfoModal = () => {
    setInfoMounted(true);
  };

  const closeInfoModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
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
    if (!program) return;

    if (workout.status === "locked") {
      router.push("/paywall");
      return;
    }

    router.push({
      pathname: "/workout",
      params: {
        workoutId: workout.id,
        programId: program.id,
        source: "program",
      },
    });
  };

  if (!program) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Program not found</Text>
          <PressableScale onPress={handleBack} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Go back</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  const totalWorkouts = workoutsByWeek.reduce((sum, week) => sum + week.length, 0);
  const progressPct = Math.round((completedCount / Math.max(1, totalWorkouts)) * 100);

  const activeWeekWorkouts = workoutsByWeek[activeWeekIndex] ?? [];
  const weekCountForActive = getWorkoutCountForWeek(activeWeekIndex);

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <View style={styles.screen}>
        <View style={styles.heroContainer} pointerEvents="none">
          <Animated.View
            style={[
              styles.heroMediaWrap,
              {
                height: heroMediaHeight,
                transform: [{ translateY: imageTranslateY }],
              },
            ]}
          >
            <Animated.Image
              source={{ uri: program.hero }}
              style={[
                styles.heroImage,
                {
                  height: heroMediaHeight,
                },
              ]}
              resizeMode="cover"
            />

            <Animated.View style={{ height: heroMediaHeight }}>
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.06)",
                  "rgba(0,0,0,0.16)",
                  "rgba(0,0,0,0.34)",
                  "rgba(0,0,0,0.66)",
                ]}
                locations={[0, 0.34, 0.68, 1]}
                style={styles.heroGradient}
              />
            </Animated.View>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.topActions,
            {
              top: Math.max(insets.top, 12),
              opacity: backButtonOpacity,
              transform: [{ translateY: backButtonTranslateY }],
            },
          ]}
        >
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
            style={styles.heroIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Program information"
          >
            <Info size={18} color="#FFFFFF" />
          </PressableScale>
        </Animated.View>

        <Animated.ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 24) + 28,
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          bounces
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
        >
          <View style={[styles.heroSpacer, { height: heroHeight }]} />

          <View style={styles.contentShell}>
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>{program.title}</Text>

              <Text style={styles.heroMeta}>
                with Andrei Andrei · {program.meta}
              </Text>

              <View style={styles.heroProgressTrack}>
                <View
                  style={[
                    styles.heroProgressFill,
                    {
                      width: `${progressPct}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.heroStatsRow}>
                <Text style={styles.heroStatText}>
                  {completedCount}/{totalWorkouts} workouts
                </Text>
                <View style={styles.heroStatDot} />
                <Text style={styles.heroStatText}>
                  Week {activeWeekIndex + 1} of {program.weeks.length}
                </Text>
                <View style={styles.heroStatDot} />
                <Text style={styles.heroStatText}>3-day streak</Text>
              </View>
            </View>

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
                    style={[
                      styles.weekPill,
                      {
                        backgroundColor: active ? colors.text : colors.card,
                        borderColor: active ? colors.text : colors.borderSubtle,
                      },
                    ]}
                    scaleTo={0.985}
                    opacityTo={0.92}
                  >
                    <Text
                      style={[
                        styles.weekPillText,
                        { color: active ? colors.surface : colors.muted },
                      ]}
                    >
                      {week.label}
                    </Text>
                  </PressableScale>
                );
              })}
            </ScrollView>

            <View style={styles.activeWeekHeader}>
              <View>
                <Text style={styles.activeWeekEyebrow}>Current block</Text>
                <Text style={styles.activeWeekTitle}>{program.weeks[activeWeekIndex]?.label}</Text>
                <Text style={styles.activeWeekSub}>{weekCountForActive} workouts</Text>
              </View>

              <View style={styles.activeWeekMetaChip}>
                <Text style={styles.activeWeekMetaText}>
                  {activeWeekIndex + 1}/{program.weeks.length}
                </Text>
              </View>
            </View>

            <View style={styles.workoutsCard}>
              {activeWeekWorkouts.map((workout, index) => {
                const isLast = index === activeWeekWorkouts.length - 1;
                const isNext = workout.status === "next";
                const isDone = workout.status === "done";
                const isLocked = workout.status === "locked";

                return (
                  <View key={workout.id}>
                    <PressableScale
                      onPress={() => onPressWorkout(workout)}
                      style={[
                        styles.workoutRow,
                        {
                          backgroundColor: isNext ? isDarkSoft : "transparent",
                        },
                      ]}
                      scaleTo={0.99}
                      opacityTo={0.95}
                    >
                      {isNext ? <View style={styles.nextWorkoutAccent} /> : <View style={styles.rowInset} />}

                      <Image source={{ uri: workout.image }} style={styles.workoutThumb} />

                      <View style={styles.workoutContent}>
                        <Text style={styles.workoutLabel}>{workout.label}</Text>
                        <Text
                          style={[
                            styles.workoutTitle,
                            isLocked && { color: colors.muted },
                          ]}
                          numberOfLines={2}
                        >
                          {workout.title}
                        </Text>
                        <Text
                          style={[
                            styles.workoutMeta,
                            isLocked && { color: colors.subtle },
                          ]}
                          numberOfLines={1}
                        >
                          {workout.meta} · {workout.duration}
                        </Text>
                      </View>

                      <View style={styles.workoutRight}>
                        {isNext ? (
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: colors.premiumSoft,
                                borderColor: colors.premiumBorder,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                { color: colors.premiumText },
                              ]}
                            >
                              Next
                            </Text>
                          </View>
                        ) : isDone ? (
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: colors.successSoft,
                                borderColor: colors.successBorder,
                                flexDirection: "row",
                                gap: 5,
                              },
                            ]}
                          >
                            <Check size={13} color={colors.successText} />
                            <Text
                              style={[
                                styles.statusPillText,
                                { color: colors.successText },
                              ]}
                            >
                              Done
                            </Text>
                          </View>
                        ) : isLocked ? (
                          <View
                            style={[
                              styles.lockPill,
                              {
                                backgroundColor: isDarkSoft,
                                borderColor: colors.borderSubtle,
                              },
                            ]}
                          >
                            <Lock
                              size={14}
                              color={isDark ? "rgba(255,255,255,0.48)" : "rgba(17,17,17,0.42)"}
                            />
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.availableDot,
                              {
                                backgroundColor: isDarkSoftStronger,
                                borderColor: colors.borderSubtle,
                              },
                            ]}
                          />
                        )}
                      </View>
                    </PressableScale>

                    {!isLast ? (
                      <View
                        style={[
                          styles.inlineDivider,
                          { backgroundColor: colors.borderSubtle },
                        ]}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>

            <View style={styles.bulletsCard}>
              <Text style={styles.bulletsEyebrow}>Program overview</Text>

              {program.bullets.map((item, index) => (
                <View
                  key={item}
                  style={[
                    styles.bulletRow,
                    index !== program.bullets.length - 1 && [
                      styles.bulletRowGap,
                      { borderBottomColor: colors.borderSubtle },
                    ],
                  ]}
                >
                  <View
                    style={[
                      styles.bulletDot,
                      { backgroundColor: colors.premium },
                    ]}
                  />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.ScrollView>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.floatingHeader,
            {
              opacity: floatingHeaderOpacity,
              transform: [{ translateY: floatingHeaderTranslateY }],
            },
          ]}
        >
          <View
            style={[
              styles.floatingHeaderTopFill,
              { height: insets.top, backgroundColor: colors.background },
            ]}
          />
          <View style={styles.floatingHeaderBar}>
            <View style={styles.floatingHeaderContent}>
              <Text style={styles.floatingHeaderTitle} numberOfLines={1}>
                {program.title}
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
          </View>
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

function createStyles(
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    muted: string;
    subtle: string;
    border: string;
    borderSubtle: string;
    premium: string;
    premiumSoft: string;
    premiumBorder: string;
    premiumText: string;
    successSoft: string;
    successBorder: string;
    successText: string;
    fillAlt: string;
  },
  isDark: boolean,
) {
  const soft = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const softStrong = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    heroContainer: {
      ...StyleSheet.absoluteFillObject,
      bottom: undefined,
      backgroundColor: isDark ? "#161719" : "#E6E6E9",
    },

    heroMediaWrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      overflow: "hidden",
    },

    heroImage: {
      width: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    },

    heroGradient: {
      ...StyleSheet.absoluteFillObject,
    },

    topActions: {
      position: "absolute",
      left: 16,
      right: 16,
      zIndex: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    heroIconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.28)",
      borderWidth: BorderWidth.default,
      borderColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },

    scroll: {
      flex: 1,
    },

    heroSpacer: {
      position: "relative",
    },

    contentShell: {
      marginTop: -22,
      backgroundColor: colors.background,
      paddingTop: 18,
      paddingHorizontal: Spacing.md,
      minHeight: 500,
    },

    heroCard: {
      backgroundColor: colors.background,
      paddingBottom: 10,
    },

    heroTitle: {
      fontSize: 30,
      lineHeight: 34,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.45,
    },

    heroMeta: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.08,
    },

    heroProgressTrack: {
      marginTop: 16,
      height: 4,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: softStrong,
    },

    heroProgressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.premium,
    },

    heroStatsRow: {
      marginTop: 12,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8,
    },

    heroStatText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.muted,
      letterSpacing: -0.05,
    },

    heroStatDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderSubtle,
    },

    weeksScroll: {
      marginTop: 18,
      flexGrow: 0,
    },

    weeksRail: {
      paddingBottom: 8,
      gap: 8,
      flexDirection: "row",
      alignItems: "center",
    },

    weekPill: {
      minHeight: 40,
      paddingHorizontal: 16,
      borderRadius: 999,
      borderWidth: BorderWidth.default,
      alignItems: "center",
      justifyContent: "center",
    },

    weekPillText: {
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: -0.05,
    },

    activeWeekHeader: {
      marginTop: 16,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16,
    },

    activeWeekEyebrow: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.55,
      textTransform: "uppercase",
      marginBottom: 6,
    },

    activeWeekTitle: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.3,
    },

    activeWeekSub: {
      marginTop: 5,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
    },

    activeWeekMetaChip: {
      minWidth: 54,
      height: 34,
      borderRadius: 999,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: soft,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
    },

    activeWeekMetaText: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.05,
    },

    workoutsCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
      overflow: "hidden",
    },

    workoutRow: {
      minHeight: 92,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingRight: 14,
    },

    rowInset: {
      width: 4,
      height: "100%",
      marginRight: 10,
    },

    nextWorkoutAccent: {
      width: 4,
      alignSelf: "stretch",
      borderRadius: 999,
      backgroundColor: colors.premium,
      marginRight: 10,
    },

    workoutThumb: {
      width: 62,
      height: 62,
      borderRadius: 16,
      backgroundColor: soft,
    },

    workoutContent: {
      flex: 1,
      marginLeft: 12,
      paddingRight: 10,
    },

    workoutLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.55,
      textTransform: "uppercase",
      marginBottom: 4,
    },

    workoutTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.18,
    },

    workoutMeta: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
      letterSpacing: -0.05,
    },

    workoutRight: {
      alignItems: "flex-end",
      justifyContent: "center",
    },

    statusPill: {
      minHeight: 32,
      paddingHorizontal: 11,
      borderRadius: 999,
      borderWidth: BorderWidth.default,
      alignItems: "center",
      justifyContent: "center",
    },

    statusPillText: {
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.15,
    },

    lockPill: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: BorderWidth.default,
      alignItems: "center",
      justifyContent: "center",
    },

    availableDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: BorderWidth.default,
    },

    inlineDivider: {
      height: BorderWidth.default,
      marginLeft: 26,
      marginRight: 14,
    },

    bulletsCard: {
      marginTop: 18,
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
      padding: 18,
    },

    bulletsEyebrow: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.55,
      textTransform: "uppercase",
      marginBottom: 12,
    },

    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      paddingVertical: 10,
    },

    bulletRowGap: {
      borderBottomWidth: BorderWidth.default,
    },

    bulletDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      marginTop: 7,
      flexShrink: 0,
    },

    bulletText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: colors.text,
      letterSpacing: -0.06,
    },

    floatingHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 30,
    },

    floatingHeaderTopFill: {},

    floatingHeaderBar: {
      backgroundColor: colors.background,
      borderBottomWidth: BorderWidth.default,
      borderBottomColor: colors.borderSubtle,
    },

    floatingHeaderContent: {
      paddingHorizontal: Spacing.md,
      paddingTop: 12,
      paddingBottom: 12,
    },

    floatingHeaderTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.18,
    },

    floatingHeaderMetaRow: {
      marginTop: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    floatingHeaderMetaText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
    },

    floatingHeaderDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderSubtle,
    },

    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },

    modalDim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.34)",
    },

    modalBackdropTouch: {
      ...StyleSheet.absoluteFillObject,
    },

    infoModalOuter: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 18,
      paddingTop: 10,
    },

    infoGrabber: {
      alignSelf: "center",
      width: 42,
      height: 5,
      borderRadius: 999,
      backgroundColor: colors.borderSubtle,
      marginBottom: 16,
    },

    infoModalTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
    },

    infoModalTitleWrap: {
      flex: 1,
    },

    infoModalEyebrow: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.55,
      textTransform: "uppercase",
      marginBottom: 6,
    },

    infoModalTitle: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.3,
    },

    infoCloseBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: soft,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
    },

    infoModalBody: {
      marginTop: 14,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: colors.muted,
    },

    infoBulletsCard: {
      marginTop: 18,
      backgroundColor: colors.card,
      borderRadius: 22,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
      padding: 16,
    },

    infoBulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },

    infoBulletRowSpaced: {
      marginBottom: 14,
    },

    infoBulletDotWrap: {
      width: 12,
      alignItems: "center",
      paddingTop: 6,
    },

    infoBulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.premium,
    },

    infoBulletTextWrap: {
      flex: 1,
    },

    infoBulletText: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: colors.text,
    },

    infoMetaRow: {
      marginTop: 16,
      alignItems: "center",
    },

    infoMetaText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.muted,
      letterSpacing: -0.05,
    },

    infoModalButton: {
      marginTop: 18,
      height: 54,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    infoModalButtonText: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.surface,
      letterSpacing: -0.1,
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      backgroundColor: colors.background,
    },

    emptyTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 16,
    },

    emptyButton: {
      height: 48,
      paddingHorizontal: 22,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyButtonText: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.surface,
    },
  });
}
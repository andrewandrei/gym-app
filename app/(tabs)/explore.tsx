import { router } from "expo-router";
import { ChevronRight, Info, Lock } from "lucide-react-native";
import React, { useMemo } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";

import { EditorialCard } from "@/components/ui/EditorialCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  getLatestIndividualWorkouts,
  type IndividualWorkout,
} from "@/features/workouts/individualWorkouts.data";
import { Spacing } from "@/styles/spacing";

import { useEntitlements } from "../../providers/entitlements";
import { useAppTheme } from "../../providers/theme";
import { createExploreStyles } from "../../styles/screens/explore.styles";

const RAIL_GAP = Spacing.md;

type Level = "Beginner" | "Intermediate" | "Advanced";

type Program = {
  id: string;
  title: string;
  duration: string;
  tag: string;
  workoutsPerWeek: number;
  level: Level;
  imageUrl: string;
  description: string;
  isActive?: boolean;
  isFeatured?: boolean;
};

type Recipe = {
  id: string;
  title: string;
  metaBold: string;
  metaMuted: string;
  imageUrl: string;
};

type Rail<T> = {
  id: string;
  title: string;
  subtitle?: string;
  kind: "program" | "workout" | "recipe";
  items: T[];
};

function RailHeader({
  title,
  onPressAll,
  mutedColor,
  styles,
}: {
  title: string;
  onPressAll?: () => void;
  mutedColor: string;
  styles: ReturnType<typeof createExploreStyles>;
}) {
  return (
    <View style={styles.railHeaderRow}>
      <Text style={styles.railTitle}>{title}</Text>

      {!!onPressAll && (
        <Pressable onPress={onPressAll} style={styles.railAll} hitSlop={10}>
          <Text style={styles.railAllText}>See all</Text>
          <ChevronRight size={16} color={mutedColor} />
        </Pressable>
      )}
    </View>
  );
}

function Badge({
  label,
  variant = "light",
  styles,
}: {
  label: string;
  variant?: "light" | "gold";
  styles: ReturnType<typeof createExploreStyles>;
}) {
  return (
    <View style={[styles.badge, variant === "gold" && styles.badgeGold]}>
      <Text style={[styles.badgeText, variant === "gold" && styles.badgeTextGold]}>
        {label}
      </Text>
    </View>
  );
}

function LevelChip({
  level,
  styles,
}: {
  level: Level;
  styles: ReturnType<typeof createExploreStyles>;
}) {
  return (
    <Text style={styles.levelText} allowFontScaling={false}>
      {level}
    </Text>
  );
}

function LockedChip({ isDark }: { isDark: boolean }) {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.28)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      <Lock
        size={14}
        color={isDark ? "rgba(255,255,255,0.46)" : "rgba(17,17,17,0.40)"}
      />
    </View>
  );
}

function ProgramCard({
  program,
  onPress,
  onPressInfo,
  styles,
}: {
  program: Program;
  onPress: (id: string) => void;
  onPressInfo: (program: Program) => void;
  styles: ReturnType<typeof createExploreStyles>;
}) {
  return (
    <Pressable
      onPress={() => onPress(program.id)}
      style={({ pressed }) => [styles.programCardWrap, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${program.title}`}
    >
      <View style={styles.programTile}>
        <Image
          source={{ uri: program.imageUrl }}
          style={styles.programTileImage}
          resizeMode="cover"
        />

        <LinearGradient
          colors={[
            "rgba(0,0,0,0)",
            "rgba(0,0,0,0.18)",
            "rgba(0,0,0,0.45)",
            "rgba(0,0,0,0.75)",
          ]}
          locations={[0, 0.35, 0.65, 1]}
          style={styles.programBottomScrim}
          pointerEvents="none"
        />

        <View style={styles.programTopLeft}>
          {program.isActive ? (
            <Badge label="Active" styles={styles} />
          ) : program.isFeatured ? (
            <Badge label="Featured" variant="gold" styles={styles} />
          ) : null}
        </View>

        <Pressable
          onPress={() => onPressInfo(program)}
          style={({ pressed }) => [styles.infoChip, pressed && { opacity: 0.85 }]}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Program info: ${program.title}`}
        >
          <Info size={18} color="#FFFFFF" />
        </Pressable>

        <View style={styles.programBottomRight}>
          <LevelChip level={program.level} styles={styles} />
        </View>

        <View style={styles.programTextOverlay}>
          <Text style={styles.programTitleOnImage} numberOfLines={2}>
            {program.title}
          </Text>
          <Text style={styles.programDurationOnImage}>{program.duration}</Text>
        </View>
      </View>

      <Text style={styles.programBelowPrimary} numberOfLines={1}>
        {program.workoutsPerWeek} workouts per week
      </Text>
      <Text style={styles.programBelowSecondary} numberOfLines={1}>
        {program.tag}
      </Text>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { isPro } = useEntitlements();
  const styles = useMemo(() => createExploreStyles(colors, isDark), [colors, isDark]);

  const openInfo = (p: Program) => {
    router.push({
      pathname: "/program-info",
      params: { id: p.id },
    });
  };

  const ACTIVE_PROGRAM_IMAGE =
    "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/685bf886d23017768f4614b5_img%20(1).png";

  const PROGRAM_IMAGES = [
    "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/690f57910b105d3dea2f1eb9_Strength%20%26%20Symmetry.jpg",
    "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/690f510381f5fead2d6257b8_c7d8a728-2fde-4254-a1a7-a505e1a4cf3e.jpeg",
    "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/6784fa945db9e2462bde508b_675b0276e2206c6b6a37ff0c_Hybrid%20Athlete%20(1)-p-800.jpg",
  ];

  const programs = useMemo<Program[]>(
    () => [
      {
        id: "strength-foundations",
        title: "Strength Foundations",
        duration: "12 weeks",
        tag: "Gym",
        workoutsPerWeek: 3,
        level: "Intermediate",
        imageUrl: ACTIVE_PROGRAM_IMAGE,
        description:
          "Build a strong base with progressive overload, clean technique, and repeatable weekly structure. Perfect if you want strength + shape without chaos.",
        isActive: true,
      },
      {
        id: "strength-symmetry",
        title: "Strength & Symmetry",
        duration: "10 weeks",
        tag: "Gym",
        workoutsPerWeek: 4,
        level: "Intermediate",
        imageUrl: PROGRAM_IMAGES[0],
        description:
          "Hypertrophy-forward training that targets proportion, weak points, and control. Built for visible physique changes and cleaner execution.",
        isFeatured: true,
      },
      {
        id: "hypertrophy-block",
        title: "Hypertrophy Block",
        duration: "8 weeks",
        tag: "Gym",
        workoutsPerWeek: 5,
        level: "Advanced",
        imageUrl: PROGRAM_IMAGES[1],
        description:
          "High-quality volume with intelligent progression. For experienced lifters who want measurable growth and better weekly performance.",
      },
      {
        id: "hybrid-athlete",
        title: "Hybrid Athlete",
        duration: "12 weeks",
        tag: "Hybrid",
        workoutsPerWeek: 3,
        level: "Beginner",
        imageUrl: PROGRAM_IMAGES[2],
        description:
          "Strength + conditioning with simple structure. Great if you want to feel athletic, lean out, and still build muscle — without burning out.",
        isFeatured: true,
      },
    ],
    [ACTIVE_PROGRAM_IMAGE, PROGRAM_IMAGES],
  );

  const workouts = useMemo<IndividualWorkout[]>(
      () => getLatestIndividualWorkouts(4),
      [],
    );

  const recipes = useMemo<Recipe[]>(
    () => [
      {
        id: "r-001",
        title: "Low Carb Lemon Pepper Chicken with Tzatziki",
        metaBold: "Main course ~35 min",
        metaMuted: "High Protein · Vegetables",
        imageUrl:
          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: "r-002",
        title: "Greek Yogurt + Berries",
        metaBold: "Breakfast ~10 min",
        metaMuted: "Snack · Fruit",
        imageUrl:
          "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: "r-003",
        title: "Salmon + Greens",
        metaBold: "Main course ~18 min",
        metaMuted: "Omega-3 · Lean",
        imageUrl:
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    [],
  );

  const rails = useMemo<Array<Rail<Program> | Rail<IndividualWorkout> | Rail<Recipe>>>(() => {
    return [
      { id: "programs", title: "Programs", kind: "program", items: programs },
      { id: "workouts", title: "Individual workouts", kind: "workout", items: workouts },
      { id: "recipes", title: "Recipes", kind: "recipe", items: recipes },
    ];
  }, [programs, workouts, recipes]);

  const onPressProgram = (id: string) => router.push(`/program/${id}`);

  const onPressWorkout = (workout: IndividualWorkout) => {
    const isLocked = workout.access === "premium" && !isPro;

    if (isLocked) {
      router.push("/paywall");
      return;
    }

    router.push({
      pathname: "/workout",
      params: {
        workoutId: workout.id,
        source: "explore",
      },
    });
  };

  const onPressRecipe = (_id: string) => router.push("/recipes");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Spacing.lg + (insets.bottom || 0) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.pad}>
          <ScreenHeader title="Discover" subtitle="Programs, workouts, and recipes" />
        </View>

        <View style={styles.rails}>
          {rails.map((rail, index) => (
            <View
              key={rail.id}
              style={[styles.rail, index !== 0 && { marginTop: Spacing.xl }]}
            >
              <View style={styles.pad}>
                <RailHeader
                  title={rail.title}
                  mutedColor={colors.muted}
                  styles={styles}
                  onPressAll={() => {
                    if (rail.kind === "program") router.push("/programs");
                    if (rail.kind === "workout") router.push("/workouts");
                    if (rail.kind === "recipe") router.push("/recipes");
                  }}
                />
              </View>

              <FlatList
                data={rail.items as any[]}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={styles.railListContent}
                ItemSeparatorComponent={() => <View style={{ width: RAIL_GAP }} />}
                decelerationRate={0.998}
                scrollEventThrottle={16}
                bounces
                alwaysBounceHorizontal={false}
                snapToAlignment="start"
                renderItem={({ item }: any) => {
                  if (rail.kind === "program") {
                    return (
                      <ProgramCard
                        program={item as Program}
                        onPress={onPressProgram}
                        onPressInfo={openInfo}
                        styles={styles}
                      />
                    );
                  }

                  if (rail.kind === "workout") {
                    const w = item as IndividualWorkout;
                    const isLocked = w.access === "premium" && !isPro;

                    return (
                      <EditorialCard
                        title={w.title}
                        metaBold={`${w.type} ~${w.durationMin} min`}
                        metaMuted={w.meta}
                        imageUrl={w.imageUrl}
                        active={!!w.isActive}
                        topRightAccessory={
                          isLocked ? <LockedChip isDark={isDark} /> : undefined
                        }
                        onPress={() => onPressWorkout(w)}
                      />
                    );
                  }

                  const r = item as Recipe;
                  return (
                    <EditorialCard
                      title={r.title}
                      metaBold={r.metaBold}
                      metaMuted={r.metaMuted}
                      imageUrl={r.imageUrl}
                      width={210}
                      mediaHeight={210}
                      onPress={() => onPressRecipe(r.id)}
                    />
                  );
                }}
              />
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
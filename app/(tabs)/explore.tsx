import { router } from "expo-router";
import { ChevronRight, Info, Lock } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";

import { EditorialCard } from "@/components/ui/EditorialCard";
import BarbataContentLoading from "@/components/BarbataContentLoading";
import {
  getPublishedPrograms,
  type SupabaseProgramSummary,
} from "@/features/programs/programs.supabase";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  getLatestIndividualWorkouts,
  type IndividualWorkout,
} from "@/features/workouts/individualWorkouts.supabase";

import {
  getFeaturedRecipes,
  type RecipeItem,
} from "@/features/recipes/recipes.supabase";

import { Spacing } from "@/styles/spacing";

import { useEntitlements } from "../../providers/entitlements";
import { useAppTheme } from "../../providers/theme";
import { createExploreStyles } from "../../styles/screens/explore.styles";

const RAIL_GAP = Spacing.md;

type Program = {
  id: string;
  slug: string;
  title: string;
  duration: string;
  tag: string;
  workoutsPerWeek: number;
  level: string;
  imageUrl: string;
  description: string;
  isActive?: boolean;
  isFeatured?: boolean;
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
  level: string;
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
  onPress: (program: Program) => void;
  onPressInfo: (program: Program) => void;
  styles: ReturnType<typeof createExploreStyles>;
}) {
  return (
    <Pressable
      onPress={() => onPress(program)}
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
      params: { id: p.slug },
    });
  };

  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsLoaded, setProgramsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    function mapProgram(program: SupabaseProgramSummary): Program {
      return {
        id: program.id,
        slug: program.slug,
        title: program.title,
        duration: program.durationWeeks ? `${program.durationWeeks} weeks` : "Program",
        tag: program.equipment || program.goal || program.subtitle || "Program",
        workoutsPerWeek: program.workoutsPerWeek ?? 0,
        level: program.level || "All levels",
        imageUrl: program.cardImageUrl || program.heroImageUrl,
        description: program.description || program.subtitle,
        isActive: program.isActive,
        isFeatured: program.isFeatured,
      };
    }

    async function loadPrograms() {
      try {
        const nextPrograms = await getPublishedPrograms(4);

        if (mounted) {
          setPrograms(nextPrograms.map(mapProgram));
        }
      } catch {
        if (mounted) {
          setPrograms([]);
        }
      } finally {
        if (mounted) {
          setProgramsLoaded(true);
        }
      }
    }

    loadPrograms();

    return () => {
      mounted = false;
    };
  }, []);

  const [workouts, setWorkouts] = useState<IndividualWorkout[]>([]);
  const [workoutsLoaded, setWorkoutsLoaded] = useState(false);

    useEffect(() => {
      let mounted = true;

      async function loadLatestWorkouts() {
        try {
          const latest = await getLatestIndividualWorkouts(4);

          if (mounted) {
            setWorkouts(latest);
          }
        } catch {
          if (mounted) {
            setWorkouts([]);
          }
        } finally {
          if (mounted) {
            setWorkoutsLoaded(true);
          }
        }
      }

      loadLatestWorkouts();

      return () => {
        mounted = false;
      };
    }, []);

  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [recipesLoaded, setRecipesLoaded] = useState(false);

useEffect(() => {
  let mounted = true;

  async function loadFeaturedRecipes() {
    try {
      const featured = await getFeaturedRecipes(4);

      if (mounted) {
        setRecipes(featured);
      }
    } catch {
      if (mounted) {
        setRecipes([]);
      }
    } finally {
      if (mounted) {
        setRecipesLoaded(true);
      }
    }
  }

  loadFeaturedRecipes();

  return () => {
    mounted = false;
  };
}, []);

  const rails = useMemo<Array<Rail<Program> | Rail<IndividualWorkout> | Rail<RecipeItem>>>(() => {
    return [
      { id: "programs", title: "Programs", kind: "program", items: programs },
      { id: "workouts", title: "Individual workouts", kind: "workout", items: workouts },
      { id: "recipes", title: "Recipes", kind: "recipe", items: recipes },
    ];
  }, [programs, workouts, recipes]);

  const onPressProgram = (program: Program) => router.push(`/program/${program.slug}`);

  const onPressWorkout = (workout: IndividualWorkout) => {
    const isLocked = workout.access === "premium" && !isPro;

    if (isLocked) {
      router.push("/paywall");
      return;
    }

   router.push({
  pathname: "/workout",
  params: {
    workoutId: workout.slug,
    supabaseWorkoutId: workout.id,
    supabaseWorkoutOwnerType: "individual_workout",
    source: "explore",
  },
});
  };

  const onPressRecipe = (slug: string) => {
  router.push({
    pathname: "/recipes/[id]",
    params: { id: slug },
  });
};

  if (!programsLoaded || !workoutsLoaded || !recipesLoaded) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BarbataContentLoading
          title="Loading Explore"
          subtitle="Programs, workouts, and recipes are coming in."
          variant="feed"
        />
      </SafeAreaView>
    );
  }

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
                        theme={colors}
                        topRightAccessory={
                          isLocked ? <LockedChip isDark={isDark} /> : undefined
                        }
                        onPress={() => onPressWorkout(w)}
                      />
                    );
                  }

                 const r = item as RecipeItem;
                  const isLocked = r.access === "premium" && !isPro;

                  return (
                    <EditorialCard
                      title={r.title}
                      metaBold={`${r.category || "Recipe"} ~${r.prepTimeMin ?? 0} min`}
                      metaMuted={
                        r.calories
                          ? `${r.calories} kcal · ${r.proteinG ?? 0}g protein`
                          : r.tags.slice(0, 2).join(" · ")
                      }
                      imageUrl={r.imageUrl}
                      width={210}
                      mediaHeight={210}
                      theme={colors}
                      topRightAccessory={
                        isLocked ? <LockedChip isDark={isDark} /> : undefined
                      }
                      onPress={() => {
                        if (isLocked) {
                          router.push("/paywall");
                          return;
                        }

                        onPressRecipe(r.slug);
                      }}
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

import SubpageHeader from "@/components/SubpageHeader";
import { EditorialCard } from "@/components/ui/EditorialCard";
import {
  getWorkoutsForCategory,
  type IndividualWorkout,
  type WorkoutCategory,
} from "@/features/workouts/individualWorkouts.supabase";
import { useEntitlements } from "@/providers/entitlements";
import { useAppTheme } from "@/providers/theme";
import { createExploreStyles } from "@/styles/screens/explore.styles";
import { Spacing } from "@/styles/spacing";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Lock } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORY_TITLES: Record<WorkoutCategory, string> = {
  upper: "Upper body",
  lower: "Lower body",
  bodyweight: "Bodyweight",
  dumbbells: "Dumbbells",
  conditioning: "Conditioning",
  core: "Core",
  full_body: "Full body",
  at_home: "At home",
  gym: "Gym",
  mobility: "Mobility",
};

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

function isWorkoutCategory(value: string): value is WorkoutCategory {
  return value in CATEGORY_TITLES;
}

export default function WorkoutCategoryScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { isPro } = useEntitlements();
  const { width } = useWindowDimensions();
  const styles = useMemo(
    () => createExploreStyles(colors, isDark),
    [colors, isDark],
  );
  const params = useLocalSearchParams<{ category?: string; title?: string }>();
  const rawCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const rawTitle = Array.isArray(params.title) ? params.title[0] : params.title;
  const category = rawCategory && isWorkoutCategory(rawCategory) ? rawCategory : null;
  const title = rawTitle || (category ? CATEGORY_TITLES[category] : "Category");
  const gridWidth = useMemo(() => {
    const viewport = width - Spacing.md * 2;
    if (Platform.OS === "web") {
      return Math.min(viewport, 820);
    }

    return viewport;
  }, [width]);
  const cardWidth = useMemo(() => {
    const gap = 12;
    return Math.floor((gridWidth - gap) / 2);
  }, [gridWidth]);

  const [workouts, setWorkouts] = useState<IndividualWorkout[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadWorkouts() {
      if (!category) {
        if (mounted) {
          setWorkouts([]);
        }
        return;
      }

      const next = await getWorkoutsForCategory(category);

      if (mounted) {
        setWorkouts(next);
      }
    }

    void loadWorkouts();

    return () => {
      mounted = false;
    };
  }, [category]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/workouts");
  };

  const handleOpenWorkout = (item: IndividualWorkout) => {
    const isLocked = item.access === "premium" && !isPro;

    if (isLocked) {
      router.push("/paywall");
      return;
    }

    router.push({
      pathname: "/workout",
      params: {
        workoutId: item.slug ?? item.id,
        supabaseWorkoutId: item.id,
        supabaseWorkoutOwnerType: "individual_workout",
        source: "workouts",
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SubpageHeader
        title={title}
        subtitle="All workouts in this category"
        onBack={handleBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
      >
        {workouts.length > 0 ? (
          <View
            style={{
              width: "100%",
              maxWidth: gridWidth,
              alignSelf: "center",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              rowGap: 18,
            }}
          >
            {workouts.map((item) => {
              const isLocked = item.access === "premium" && !isPro;

              return (
                <View
                  key={item.id}
                  style={{
                    width: cardWidth,
                  }}
                >
                  <EditorialCard
                    title={item.title}
                    metaBold={`${item.type} ~${item.durationMin} min`}
                    metaMuted={item.meta}
                    imageUrl={item.imageUrl}
                    active={!!item.isActive}
                    mediaBorderless
                    metaTopSpacing={10}
                    mediaHeight={cardWidth}
                    width={cardWidth}
                    topRightAccessory={
                      isLocked ? <LockedChip isDark={isDark} /> : undefined
                    }
                    onPress={() => handleOpenWorkout(item)}
                    theme={colors}
                  />
                </View>
              );
            })}
          </View>
        ) : (
          <View
            style={{
              marginTop: 8,
              padding: 20,
              borderRadius: 22,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                lineHeight: 22,
                fontWeight: "900",
                color: colors.text,
                letterSpacing: -0.2,
              }}
            >
              No workouts here yet
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                lineHeight: 20,
                fontWeight: "600",
                color: colors.muted,
              }}
            >
              As soon as workouts are tagged for this category in the admin,
              they’ll show up here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

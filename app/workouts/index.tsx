import { useRouter } from "expo-router";
import { ChevronRight, Lock } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SubpageHeader from "@/components/SubpageHeader";
import { EditorialCard } from "@/components/ui/EditorialCard";
import {
  getWorkoutsForCategory,
  type IndividualWorkout,
} from "@/features/workouts/individualWorkouts.data";
import { useEntitlements } from "@/providers/entitlements";
import { useAppTheme } from "@/providers/theme";
import { createExploreStyles } from "@/styles/screens/explore.styles";
import { Spacing } from "@/styles/spacing";

const RAIL_GAP = Spacing.md;

type WorkoutRail = {
  id: "upper" | "lower" | "bodyweight" | "dumbbells" | "conditioning";
  title: string;
  items: IndividualWorkout[];
};

function RailHeader({
  title,
  mutedColor,
  styles,
  showAll,
  onPressAll,
}: {
  title: string;
  mutedColor: string;
  styles: ReturnType<typeof createExploreStyles>;
  showAll: boolean;
  onPressAll?: () => void;
}) {
  return (
    <View style={styles.railHeaderRow}>
      <Text style={styles.railTitle}>{title}</Text>

      {showAll && !!onPressAll && (
        <Pressable onPress={onPressAll} style={styles.railAll} hitSlop={10}>
          <Text style={styles.railAllText}>See all</Text>
          <ChevronRight size={16} color={mutedColor} />
        </Pressable>
      )}
    </View>
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

export default function WorkoutsIndexScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { isPro } = useEntitlements();
  const styles = useMemo(() => createExploreStyles(colors, isDark), [colors, isDark]);

  const rails = useMemo<WorkoutRail[]>(
    () => [
      {
        id: "upper",
        title: "Upper body",
        items: getWorkoutsForCategory("upper"),
      },
      {
        id: "lower",
        title: "Lower body",
        items: getWorkoutsForCategory("lower"),
      },
      {
        id: "bodyweight",
        title: "Bodyweight",
        items: getWorkoutsForCategory("bodyweight"),
      },
      {
        id: "dumbbells",
        title: "Dumbbells",
        items: getWorkoutsForCategory("dumbbells"),
      },
      {
        id: "conditioning",
        title: "Conditioning",
        items: getWorkoutsForCategory("conditioning"),
      },
    ],
    [],
  );

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/explore");
  };

  const handleOpenWorkout = (item: IndividualWorkout) => {
    const isLocked = item.access === "premium" && !isPro;

    if (isLocked) {
      router.push("/paywall");
      return;
    }

    router.push({
      pathname: "/workout",
      params: { workoutId: item.id, source: "workouts" },
    });
  };

  const handleSeeAll = (rail: WorkoutRail) => {
    router.push({
      pathname: "/workouts/category",
      params: { category: rail.id, title: rail.title },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SubpageHeader
        title="Workouts"
        subtitle="Browse by equipment, split, or muscle group"
        onBack={handleBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
      >
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
                  showAll={rail.items.length > 4}
                  onPressAll={() => handleSeeAll(rail)}
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.railListContent}
                decelerationRate={0.998}
                scrollEventThrottle={16}
                bounces
                alwaysBounceHorizontal={false}
              >
                {rail.items.map((item, idx) => {
                  const isLocked = item.access === "premium" && !isPro;

                  return (
                    <View
                      key={`${rail.id}_${item.id}`}
                      style={idx !== rail.items.length - 1 ? { marginRight: RAIL_GAP } : undefined}
                    >
                      <EditorialCard
                        title={item.title}
                        metaBold={`${item.type} ~${item.durationMin} min`}
                        metaMuted={item.meta}
                        imageUrl={item.imageUrl}
                        active={!!item.isActive}
                        metaTopSpacing={10}
                        topRightAccessory={
                          isLocked ? <LockedChip isDark={isDark} /> : undefined
                        }
                        onPress={() => handleOpenWorkout(item)}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
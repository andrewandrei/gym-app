import { useAppTheme } from "@/app/_providers/theme";
import { PressableScale } from "@/components/ui/PressableScale";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createWorkoutStyles } from "./workout.styles";

/* ───────────────────────── Types (shared) ───────────────────────── */

export type SetRow = {
  id: string;
  weight?: string;
  reps?: string;
  rest?: string;
  done?: boolean;
  note?: string;
};

export type Exercise = {
  id: string;
  name: string;
  tempo: string;
  image: string;
  unitLabel: "LBS" | "KG" | "REPS";
  sets: SetRow[];
  videoUrl?: string;
  description?: string;
  tutorial?: string[];
  musclesWorked?: string[];
};

export type StrengthBlock = {
  id: string;
  type: "single" | "superset" | "giant" | "circuit";
  title?: string;
  rounds?: number;
  exerciseIds: string[];
};

type Props = {
  workoutTitle: string;
  exercises: Exercise[];
  blocks: StrengthBlock[];
  exerciseById: Record<string, Exercise>;
  estimatedTime: number;
  totalSets: number;
  onStartWorkout: () => void;
  onBack: () => void;
};

export function WorkoutPreview({
  workoutTitle,
  exercises,
  blocks,
  exerciseById,
  estimatedTime,
  totalSets,
  onStartWorkout,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { colors, isDark } = useAppTheme();
  const S = useMemo(() => createWorkoutStyles(colors, isDark), [colors, isDark]);

  const heroHeight = Math.max(160, Math.round(screenHeight * 0.31));
  const sessionMeta = `${exercises.length} exercises • ~${estimatedTime} min • ${totalSets} sets`;

  const heroImage = useMemo(() => {
    for (const block of blocks) {
      const firstId = block.exerciseIds[0];
      const firstExercise = exerciseById[firstId];
      if (firstExercise?.image) return firstExercise.image;
    }
    return (
      exercises[0]?.image ??
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop"
    );
  }, [blocks, exerciseById, exercises]);

  const blockKickerFor = (block: StrengthBlock) => {
    if (block.type === "superset") return "SUPERSET";
    if (block.type === "giant") return "GIANT SET";
    if (block.type === "circuit") return "CIRCUIT";
    return "SINGLE";
  };

  const blockMetaFor = (block: StrengthBlock) => {
    const count = block.exerciseIds.length;

    if (block.type === "circuit") {
      return `${count} exercises • ${block.rounds ?? 3} rounds • Move across`;
    }

    if (block.type === "superset" || block.type === "giant") {
      return `${count} exercises • Move across`;
    }

    return `${count} exercise`;
  };

  const letter = (i: number) => String.fromCharCode("A".charCodeAt(0) + i);

  const tagFor = (block: StrengthBlock, idx: number) => {
    if (block.type === "superset" || block.type === "giant") return letter(idx);
    if (block.type === "circuit") return String(idx + 1);
    return undefined;
  };

  const groupAccentStyle = (block: StrengthBlock) => {
    if (block.type === "superset") return S.groupRailSuperset;
    if (block.type === "giant") return S.groupRailGiant;
    if (block.type === "circuit") return S.groupRailCircuit;
    return null;
  };

  return (
    <View style={S.previewPage}>
      <View pointerEvents="none" style={[S.previewHeroBackdrop, { height: heroHeight + 120 }]}>
        <Image source={{ uri: heroImage }} style={S.previewHeroBackdropImage} resizeMode="cover" />
         {/* 🔼 TOP VIGNETTE (NEW) */}
  <LinearGradient
    colors={[
      "rgba(0,0,0,0.35)",
      "rgba(0,0,0,0.15)",
      "rgba(0,0,0,0)",
    ]}
    locations={[0, 0.4, 1]}
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "35%",
    }}
  />
         
         
         <LinearGradient
            colors={[
              "rgba(0,0,0,0)",
              "rgba(0,0,0,0.25)",
              "rgba(0,0,0,0.55)",
            ]}
            locations={[0.4, 0.7, 1]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "55%",
            }}
          />
      </View>

      <ScrollView
        style={S.scroll}
        contentContainerStyle={[
          S.previewContent,
          { paddingBottom: Math.max(insets.bottom, 18) + 132 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
      >
        <View style={[S.previewHeroSpace, { height: heroHeight }]}>
          <View style={S.previewOverlayActions}>
            <PressableScale
              onPress={onBack}
              style={S.previewHeroBackBtn}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <ChevronLeft size={22} color="#FFFFFF" />
            </PressableScale>

            <View style={S.previewHeroSpacer} />
          </View>

          <View style={S.previewHeroContent}>
            <Text style={S.previewHeroTitle}>{workoutTitle}</Text>

            <Text style={S.previewHeroSubtitle}>
              Preview the full session before you begin.
            </Text>

            <Text style={S.previewHeroMeta}>{sessionMeta}</Text>
          </View>
        </View>

        <View style={S.previewBody}>
          <View style={S.previewList}>
            {blocks.map((block, blockIndex) => {
              const isLastBlock = blockIndex === blocks.length - 1;

              return (
                <View key={block.id} style={S.previewGroupWrap}>
                  <View style={[S.previewGroupRail, groupAccentStyle(block)]} />

                  <View style={S.previewBlockHeader}>
                    <Text style={S.previewBlockKicker}>{blockKickerFor(block)}</Text>
                    <Text style={S.previewBlockTitle}>
                      {block.title ?? blockKickerFor(block)}
                    </Text>
                    <Text style={S.previewBlockMeta}>{blockMetaFor(block)}</Text>
                  </View>

                  <View style={S.previewRows}>
                    {block.exerciseIds.map((exId, idx) => {
                      const ex = exerciseById[exId];
                      if (!ex) return null;

                      const blockTag = tagFor(block, idx);
                      const isLastExerciseInBlock =
                        idx === block.exerciseIds.length - 1;

                      return (
                        <View key={ex.id}>
                          <Pressable
                            style={({ pressed }) => [
                              S.previewRow,
                              pressed && S.previewRowPressed,
                            ]}
                          >
                            <View style={S.previewRowLeft}>
                              {blockTag ? (
                                <View style={S.previewBlockTag}>
                                  <Text style={S.previewBlockTagText}>{blockTag}</Text>
                                </View>
                              ) : (
                                <View style={S.previewNumber}>
                                  <Text style={S.previewNumberText}>{idx + 1}</Text>
                                </View>
                              )}

                              <Image source={{ uri: ex.image }} style={S.previewImage} />
                            </View>

                            <View style={S.previewCardRight}>
                              <Text style={S.previewExName} numberOfLines={2}>
                                {ex.name}
                              </Text>
                              <Text style={S.previewExMeta}>
                                {ex.sets.length} sets • {ex.sets[0]?.reps || "—"} reps •{" "}
                                {ex.sets[0]?.rest || "—"} rest
                              </Text>
                            </View>
                          </Pressable>

                          {!isLastExerciseInBlock ? (
                            <View style={S.previewInlineDivider} />
                          ) : null}
                        </View>
                      );
                    })}
                  </View>

                  {!isLastBlock ? <View style={S.previewBlockSpacer} /> : null}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={S.previewBottomWrap}>
        

        <View style={[S.previewBottom, { paddingBottom: Math.max(insets.bottom, 18) }]}>
          <View style={S.previewBottomCard}>
            <Text style={S.previewBottomHelper}>Everything is ready</Text>

            <PressableScale onPress={onStartWorkout} style={S.startBtn}>
              <Text style={S.startBtnText}>Start Workout</Text>
            </PressableScale>
          </View>
        </View>
      </View>
    </View>
  );
}
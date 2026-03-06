// app/workout/WorkoutPreview.tsx

import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { Colors } from "@/styles/colors";
import { S } from "./workout.styles";

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
  const blockKickerFor = (block: StrengthBlock) => {
    if (block.type === "superset") return "SUPERSET";
    if (block.type === "giant") return "GIANT SET";
    if (block.type === "circuit") return "CIRCUIT";
    return "SINGLE";
  };

  const blockMetaFor = (block: StrengthBlock) => {
    const count = block.exerciseIds.length;
    if (block.type === "circuit") return `${count} exercises • ${block.rounds ?? 3} rounds • Move across`;
    if (block.type === "superset" || block.type === "giant") return `${count} exercises • Move across`;
    return `${count} exercise`;
  };

  const letter = (i: number) => String.fromCharCode("A".charCodeAt(0) + i);

  const tagFor = (block: StrengthBlock, idx: number) => {
    if (block.type === "superset" || block.type === "giant") return letter(idx);
    if (block.type === "circuit") return String(idx + 1);
    return undefined;
  };

  const groupAccentStyle = (block: StrengthBlock) => {
    // These styles already exist in workout.styles.ts per your file.
    if (block.type === "superset") return S.groupRailSuperset;
    if (block.type === "giant") return S.groupRailGiant;
    if (block.type === "circuit") return S.groupRailCircuit;
    return null;
  };

  return (
    <View style={S.previewPage}>
      <ScrollView style={S.scroll} contentContainerStyle={S.previewContent} showsVerticalScrollIndicator={false}>
        {/* Header (keep minimal & premium) */}
        <View style={{ paddingTop: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable
              onPress={onBack}
              hitSlop={12}
              style={({ pressed }) => [{ paddingVertical: 6, paddingHorizontal: 8, borderRadius: 10 }, pressed && { opacity: 0.7 }]}
            >
              <Text style={{ fontSize: 13, fontWeight: "900", color: Colors.text }}>Back</Text>
            </Pressable>

            <View style={{ flex: 1 }} />

            <Text style={{ fontSize: 12, fontWeight: "800", color: Colors.muted }}>
              {exercises.length} exercises • ~{estimatedTime} min • {totalSets} sets
            </Text>
          </View>

          <Text style={{ marginTop: 10, fontSize: 24, fontWeight: "900", color: Colors.text, letterSpacing: -0.6 }}>
            {workoutTitle}
          </Text>
        </View>

        {/* List */}
        <View style={S.previewList}>
          {blocks.map((block, blockIndex) => (
            <View key={block.id} style={S.previewGroupWrap}>
              <View style={[S.previewGroupRail, groupAccentStyle(block)]} />

              <View style={S.previewBlockHeader}>
                <Text style={S.previewBlockKicker}>{blockKickerFor(block)}</Text>
                <Text style={S.previewBlockTitle}>{block.title ?? blockKickerFor(block)}</Text>
                <Text style={S.previewBlockMeta}>{blockMetaFor(block)}</Text>
              </View>

              {block.exerciseIds.map((exId, idx) => {
                const ex = exerciseById[exId];
                if (!ex) return null;

                const blockTag = tagFor(block, idx);
                const isLastExerciseInBlock = idx === block.exerciseIds.length - 1;
                const isLastBlock = blockIndex === blocks.length - 1;

                return (
                  <View key={ex.id}>
                    <View style={S.previewCard}>
                      <View style={S.previewCardLeft}>
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
                          {ex.sets.length} sets • {ex.sets[0]?.reps || "—"} reps • {ex.sets[0]?.rest || "—"} rest
                        </Text>
                      </View>
                    </View>

                    {!isLastExerciseInBlock ? <View style={S.previewSeparator} /> : null}
                    {isLastExerciseInBlock && !isLastBlock ? <View style={S.previewBlockSpacer} /> : null}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom Start Button (IMPORTANT: calls onStartWorkout) */}
      <View style={S.previewBottom}>
        <Pressable onPress={onStartWorkout} style={S.startBtn}>
          <Text style={S.startBtnText}>Start Workout</Text>
        </Pressable>
      </View>
    </View>
  );
}
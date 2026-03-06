// app/workout/WorkoutPlayer.tsx

import { MoreVertical, Share2 } from "lucide-react-native";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { Colors } from "@/styles/colors";
import { SetRowItem, SetRow as SetRowLocal } from "./SetRowItem";
import { S } from "./workout.styles";
import type { Exercise, StrengthBlock } from "./WorkoutPreview";

type Props = {
  workoutTitle: string;

  exercises: Exercise[];
  blocks: StrengthBlock[];
  exerciseById: Record<string, Exercise>;

  estimatedTime: number;
  totalSets: number;
  completedSets: number;
  pct: number;

  kbVisible: boolean;
  restTimer: { seconds: number; total: number } | null;

  scrollRef: any;
  exerciseRefs: React.MutableRefObject<Record<string, View | null>>;
  swipeRefs: React.MutableRefObject<Record<string, any>>;

  celebratingBlock: string | null;
  activeSetKey: string | null;

  iosAccessoryProps: { inputAccessoryViewID: string } | {};

  formatDuration: (sec: number) => string;

  shareWorkout: () => void;
  openMenu: (exId: string) => void;
  openHistory: (exId: string) => void;
  addSet: (exId: string) => void;
  openFinish: () => void;
  setCustomTimeOpen: (v: boolean) => void;

  updateSet: (exId: string, setId: string, patch: Partial<SetRowLocal>) => void;
  deleteSet: (exId: string, setId: string) => void;
  openNoteModal: (exId: string, setId: string) => void;
  toggleSetDone: (exId: string, setId: string) => void;
  setActiveSetKey: (k: string) => void;

  closeAllSwipesExcept: (keepKey: string) => void;

  groupAccentStyle: (b: StrengthBlock) => any;
  blockKickerFor: (b: StrengthBlock) => string;
  blockMetaFor: (b: StrengthBlock) => string;
  tagFor: (b: StrengthBlock, idx: number) => string | undefined;

  workoutDuration: number;

  onPressThumbnail: (exId: string) => void;
};

export function WorkoutPlayer({
  workoutTitle,
  blocks,
  exerciseById,
  estimatedTime,
  totalSets,
  completedSets,
  pct,
  kbVisible,
  restTimer,
  scrollRef,
  exerciseRefs,
  swipeRefs,
  celebratingBlock,
  activeSetKey,
  iosAccessoryProps,
  formatDuration,
  shareWorkout,
  openMenu,
  openHistory,
  addSet,
  openFinish,
  setCustomTimeOpen,
  updateSet,
  deleteSet,
  openNoteModal,
  toggleSetDone,
  setActiveSetKey,
  closeAllSwipesExcept,
  groupAccentStyle,
  blockKickerFor,
  blockMetaFor,
  tagFor,
  workoutDuration,
  onPressThumbnail,
}: Props) {
  return (
    <View style={S.page}>
      {/* TOP BAR */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: Colors.background,
          paddingTop: 12,
          paddingHorizontal: 18,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(0,0,0,0.08)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: Colors.text, letterSpacing: -0.5 }}>
            {workoutTitle}
          </Text>
          {!kbVisible ? (
            <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.muted }}>{formatDuration(workoutDuration)}</Text>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: Colors.text, minWidth: 80 }}>
            {completedSets}/{totalSets} sets
          </Text>

          <View style={{ flex: 1, height: 8, backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden" }}>
            <View
              style={{
                width: `${pct}%`,
                height: "100%",
                backgroundColor: (Colors as any).premium ?? "#F4C84A",
                borderRadius: 4,
              }}
            />
          </View>

          {!kbVisible ? (
            <Pressable
              onPress={() => setCustomTimeOpen(true)}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: restTimer ? "rgba(244, 200, 74, 0.2)" : "rgba(0,0,0,0.06)",
                  borderRadius: 8,
                  borderWidth: restTimer ? 2 : 0,
                  borderColor: (Colors as any).premium ?? "#F4C84A",
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={{ fontSize: 13, fontWeight: "900", color: Colors.text }}>{restTimer ? "⏱️" : "Timer"}</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={shareWorkout}
            style={({ pressed }) => [
              { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 8 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Share2 size={16} color={Colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef as any}
        style={S.scroll}
        contentContainerStyle={[S.scrollContent, { paddingTop: 120 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        <View style={S.exerciseList}>
          {blocks.map((block) => (
            <View key={block.id} style={S.groupWrap}>
              <View style={[S.groupRail, groupAccentStyle(block), celebratingBlock === block.id && { opacity: 0.3 }]} />
              <View
                style={[
                  S.groupSurface,
                  celebratingBlock === block.id && {
                    backgroundColor: "rgba(244, 200, 74, 0.2)",
                  },
                ]}
              />

              <View style={S.blockHeader}>
                <Text style={S.blockKicker}>{blockKickerFor(block)}</Text>
                <View style={S.blockTitleRow}>
                  <Text style={S.blockTitle}>{block.title ?? blockKickerFor(block)}</Text>
                  <Text style={S.blockMeta}>{blockMetaFor(block)}</Text>
                </View>
              </View>

              {block.exerciseIds.map((exId, idx) => {
                const ex = exerciseById[exId];
                if (!ex) return null;

                const blockTag = tagFor(block, idx);

                return (
                  <View
                    key={ex.id}
                    ref={(ref) => {
                      exerciseRefs.current[ex.id] = ref;
                    }}
                  >
                    <View style={S.card}>
                      <View style={S.exerciseHeader}>
                        <Pressable onPress={() => onPressThumbnail(ex.id)} style={{ borderRadius: 12, overflow: "hidden" }}>
                          <Image source={{ uri: ex.image }} style={S.thumb} />
                        </Pressable>

                        <View style={S.exerciseText}>
                          <View style={S.titleRow}>
                            {blockTag ? (
                              <View style={S.blockTag}>
                                <Text style={S.blockTagText}>{blockTag}</Text>
                              </View>
                            ) : null}
                            <Text style={S.exerciseTitle} numberOfLines={2}>
                              {ex.name}
                            </Text>
                          </View>
                          <Text style={S.exerciseSub}>Tempo: {ex.tempo}</Text>
                        </View>

                        <Pressable style={S.menuBtn} onPress={() => openMenu(ex.id)}>
                          <MoreVertical size={18} color={Colors.text} />
                        </Pressable>
                      </View>

                      <View style={[S.cols, { paddingVertical: 12 }]}>
                        <Text style={[S.colLabel, { width: 44 }]}>SET</Text>
                        <Text style={S.colLabel}>{ex.unitLabel}</Text>
                        <Text style={S.colLabel}>REPS</Text>
                        <Text style={S.colLabel}>REST</Text>
                        <Text style={[S.colLabel, { width: 54 }]}>DONE</Text>
                      </View>

                      {ex.sets.map((s, i) => (
                        <SetRowItem
                          key={s.id}
                          set={s}
                          exId={ex.id}
                          index={i}
                          isActive={activeSetKey === `${ex.id}:${i}`}
                          iosAccessoryProps={iosAccessoryProps as any}
                          onUpdate={updateSet}
                          onDelete={deleteSet}
                          onNote={openNoteModal}
                          onToggle={toggleSetDone}
                          onFocus={setActiveSetKey}
                          swipeRef={(ref) => {
                            swipeRefs.current[`${ex.id}:${s.id}`] = ref;
                          }}
                          closeOthers={closeAllSwipesExcept}
                        />
                      ))}

                      <View style={[S.cardActions, { marginTop: 16 }]}>
                        <Pressable onPress={() => openHistory(ex.id)} style={[S.ghostBtn, { height: 50 }]}>
                          <Text style={S.ghostText}>Exercise History</Text>
                        </Pressable>
                        <Pressable onPress={() => addSet(ex.id)} style={[S.ghostBtn, { height: 50 }]}>
                          <Text style={S.ghostText}>Add Set</Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={S.exerciseSeparator} />
                    <View style={S.exerciseGap} />
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={S.finishSectionWrap}>
          <View style={S.finishSection}>
            <Pressable onPress={openFinish} style={[S.finishBtn, { height: 60 }]}>
              <Text style={[S.finishBtnText, { fontSize: 17 }]}>Complete Workout</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
// app/workout/WorkoutPlayer.tsx

import { MoreVertical, Share2 } from "lucide-react-native";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { useAppTheme } from "@/app/_providers/theme";
import { BorderWidth } from "@/styles/hairline";
import { useMemo } from "react";
import { SetRowItem, SetRow as SetRowLocal } from "./SetRowItem";
import { createWorkoutStyles } from "./workout.styles";
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
  const { colors, isDark } = useAppTheme();
  const S = useMemo(() => createWorkoutStyles(colors, isDark), [colors, isDark]);
  const premium = colors.premium;

  

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
          backgroundColor: colors.background,
          paddingTop: 12,
          paddingHorizontal: 18,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(0,0,0,0.06)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1, paddingRight: 6 }}>
            <Text
              style={{
                fontSize: 24,
                lineHeight: 29,
                fontWeight: "900",
                color: colors.text,
                letterSpacing: -0.7,
              }}
            >
              {workoutTitle}
            </Text>

            {!kbVisible ? (
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.muted,
                  letterSpacing: -0.1,
                }}
              >
                {formatDuration(workoutDuration)}
              </Text>
            ) : null}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {!kbVisible ? (
              <Pressable
                onPress={() => setCustomTimeOpen(true)}
                style={({ pressed }) => [
                  {
                    minWidth: 64,
                    height: 38,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                   backgroundColor: restTimer
                      ? "rgba(244,200,74,0.18)"
                      : colors.surface,
                    borderWidth: BorderWidth.default,
                    borderColor: restTimer
                      ? premium
                      : colors.borderSubtle,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  pressed && { opacity: 0.72 },
                ]}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "900",
                    color: colors.text,
                    letterSpacing: -0.1,
                  }}
                >
                  Timer
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={shareWorkout}
              style={({ pressed }) => [
                {
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  backgroundColor: colors.surface,
                  borderWidth: BorderWidth.default,
                  borderColor: colors.borderSubtle,
                  alignItems: "center",
                  justifyContent: "center",
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Share2 size={16} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Text
            style={{
              minWidth: 78,
              fontSize: 14,
              fontWeight: "800",
              color: colors.text,
              letterSpacing: -0.15,
            }}
          >
            {completedSets}/{totalSets} sets
          </Text>

          <View
            style={{
              flex: 1,
              height: 6,
              backgroundColor: "rgba(0,0,0,0.06)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${pct}%`,
                height: "100%",
                backgroundColor: premium,
                borderRadius: 999,
              }}
            />
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef as any}
        style={S.scroll}
        contentContainerStyle={[S.scrollContent, { paddingTop: 112 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        <View style={S.exerciseList}>
          {blocks.map((block) => (
            <View key={block.id} style={S.groupWrap}>
              <View
                style={[
                  S.groupRail,
                  groupAccentStyle(block),
                  celebratingBlock === block.id && { opacity: 0.3 },
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
                        <Pressable
                          onPress={() => onPressThumbnail(ex.id)}
                          style={{ borderRadius: 12, overflow: "hidden" }}
                        >
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
                          <MoreVertical size={18} color={colors.text} />
                        </Pressable>
                      </View>

                      <View style={[S.cols, { paddingVertical: 12 }]}>
                        <View style={S.colSetWrap}>
                          <Text style={S.colLabel}>SET</Text>
                        </View>

                        <View style={S.colValueWrap}>
                          <Text style={S.colLabel}>{ex.unitLabel}</Text>
                        </View>

                        <View style={S.colValueWrap}>
                          <Text style={S.colLabel}>REPS</Text>
                        </View>

                        <View style={S.colValueWrap}>
                          <Text style={S.colLabel}>REST</Text>
                        </View>

                        <View style={S.colDoneWrap}>
                          <Text style={S.colLabel}>DONE</Text>
                        </View>
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
                        <Pressable
                          onPress={() => openHistory(ex.id)}
                          style={S.ghostBtn}
                        >
                          <Text style={S.ghostText}>Exercise History</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => addSet(ex.id)}
                          style={S.ghostBtn}
                        >
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
            <Pressable onPress={openFinish} style={S.finishBtn}>
              <Text style={[S.finishBtnText, { fontSize: 17 }]}>Complete Workout</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
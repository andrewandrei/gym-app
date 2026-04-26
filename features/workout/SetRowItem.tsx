import { Check, MessageSquare } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  Swipeable,
} from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";

import { useAppTheme } from "@/providers/theme";
import { formatStoredWeightStringForDisplay } from "../../lib/weightUnits";
import { createWorkoutStyles } from "./workout.styles";
import {
  formatSecondsToClock,
  getTrackingModeConfig,
  normalizeTimeInput,
  parseClockToSeconds,
  sanitizeNumericInput,
  type TrackingMode,
} from "./workout.types";

export type SetRow = {
  id: string;
  weight?: string;
  reps?: string;
  rest?: string;
  done?: boolean;
  note?: string;
};

type Props = {
  set: SetRow;
  exId: string;
  index: number;
  isActive: boolean;

  iosAccessoryProps?: { inputAccessoryViewID: string };

  onUpdate: (exId: string, setId: string, patch: Partial<SetRow>) => void;
  onDelete: (exId: string, setId: string) => void;
  onNote: (exId: string, setId: string) => void;
  onToggle: (exId: string, setId: string) => void;
  onFocus: (key: string) => void;

  swipeRef: (ref: Swipeable | null) => void;
  closeOthers: (keepKey: string) => void;

  weightUnit: "kg" | "lbs";
  isWeightBased: boolean;
  trackingMode?: TrackingMode;
};

const DELETE_REVEAL_WIDTH = 92;
const DELETE_ACTION_WIDTH = 80;
const OPEN_THRESHOLD = 34;

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

export function SetRowItem({
  set,
  exId,
  index,
  isActive,
  iosAccessoryProps,
  onUpdate,
  onDelete,
  onNote,
  onToggle,
  onFocus,
  swipeRef,
  closeOthers,
  weightUnit,
  isWeightBased,
  trackingMode = "weight_reps",
}: Props) {
  const { colors, isDark } = useAppTheme();
  const S = useMemo(() => createWorkoutStyles(colors, isDark), [colors, isDark]);
  const modeConfig = useMemo(() => getTrackingModeConfig(trackingMode), [trackingMode]);

  const primaryInputRef = useRef<TextInput | null>(null);
  const secondaryInputRef = useRef<TextInput | null>(null);
  const thirdInputRef = useRef<TextInput | null>(null);

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const [primarySelection, setPrimarySelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);
  const [secondarySelection, setSecondarySelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);
  const [thirdSelection, setThirdSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  const rowKey = useMemo(() => `${exId}:${set.id}`, [exId, set.id]);
  const setKey = useMemo(() => `${exId}:${index}`, [exId, index]);

  const closeSwipe = useCallback(() => {
    translateX.value = withSpring(0, {
      damping: 24,
      stiffness: 280,
      mass: 0.8,
    });
  }, [translateX]);

  useEffect(() => {
    const api = {
      close: closeSwipe,
    } as unknown as Swipeable;

    swipeRef(api);

    return () => {
      swipeRef(null);
    };
  }, [closeSwipe, swipeRef]);

  const cellStyle = (done: boolean, active: boolean) => ({
    height: 56,
    borderWidth: 1.5,
    borderColor: done
      ? colors.successBorder
      : active
        ? colors.premiumBorder
        : colors.borderSubtle,
    backgroundColor: done
      ? colors.successSoft
      : active
        ? colors.premiumSoft
        : colors.surface,
  });

  const inputTextStyle = (done: boolean) => ({
    fontSize: 16,
    fontWeight: "800" as const,
    color: done ? colors.successText : colors.text,
  });

  const placeholderColor = isDark ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.25)";
  const mutedIndexColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const noteIconColor = isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.4)";

  const displayWeight = useMemo(() => {
    if (!isWeightBased) return set.weight ?? "";
    if (!(set.weight ?? "").trim()) return "";
    return formatStoredWeightStringForDisplay({
      storedWeight: set.weight ?? "",
      unit: weightUnit,
    });
  }, [isWeightBased, set.weight, weightUnit]);

  const primaryValue = useMemo(() => {
    if (trackingMode === "time") return formatSecondsToClock(set.weight);
    if (trackingMode === "reps_only") return set.reps ?? "";
    if (trackingMode === "calories") return set.weight ?? "";
    return displayWeight;
  }, [trackingMode, set.weight, set.reps, displayWeight]);

  const secondaryValue = useMemo(() => {
    if (trackingMode === "time" || trackingMode === "reps_only" || trackingMode === "calories") {
      return set.rest ?? "";
    }
    return set.reps ?? "";
  }, [trackingMode, set.reps, set.rest]);

  const thirdValue = useMemo(() => {
    if (modeConfig.hideThirdField) return "";
    return set.rest ?? "";
  }, [modeConfig.hideThirdField, set.rest]);

  const [primary, setPrimary] = useState(primaryValue);
  const [secondary, setSecondary] = useState(secondaryValue);
  const [third, setThird] = useState(thirdValue);

  useEffect(() => {
    setPrimary(primaryValue);
  }, [primaryValue]);

  useEffect(() => {
    setSecondary(secondaryValue);
  }, [secondaryValue]);

  useEffect(() => {
    setThird(thirdValue);
  }, [thirdValue]);

  const handleFocus = useCallback(
    (field: "primary" | "secondary" | "third", value: string) => {
      closeOthers(rowKey);
      closeSwipe();
      onFocus(setKey);

      const nextSelection = {
        start: value.length,
        end: value.length,
      };

      if (field === "primary") setPrimarySelection(nextSelection);
      if (field === "secondary") setSecondarySelection(nextSelection);
      if (field === "third") setThirdSelection(nextSelection);
    },
    [closeOthers, closeSwipe, rowKey, onFocus, setKey],
  );

  const commit = useCallback(() => {
    if (set.done) return;

    const patch: Partial<SetRow> = {};

    if (trackingMode === "time") {
      const nextSeconds = parseClockToSeconds(primary);
      if ((set.weight ?? "") !== nextSeconds) patch.weight = nextSeconds;
      if ((set.rest ?? "") !== secondary) patch.rest = secondary;
    } else if (trackingMode === "reps_only") {
      const cleanReps = sanitizeNumericInput(primary);
      if ((set.reps ?? "") !== cleanReps) patch.reps = cleanReps;
      if ((set.rest ?? "") !== secondary) patch.rest = secondary;
    } else if (trackingMode === "calories") {
      const cleanCalories = sanitizeNumericInput(primary);
      if ((set.weight ?? "") !== cleanCalories) patch.weight = cleanCalories;
      if ((set.rest ?? "") !== secondary) patch.rest = secondary;
    } else {
      const cleanPrimary = sanitizeNumericInput(primary);
      const cleanSecondary = sanitizeNumericInput(secondary);
      const cleanThird = third;

      const currentDisplayWeight = isWeightBased
        ? formatStoredWeightStringForDisplay({
            storedWeight: set.weight ?? "",
            unit: weightUnit,
          })
        : set.weight ?? "";

      if (currentDisplayWeight !== cleanPrimary) patch.weight = cleanPrimary;
      if ((set.reps ?? "") !== cleanSecondary) patch.reps = cleanSecondary;
      if ((set.rest ?? "") !== cleanThird) patch.rest = cleanThird;
    }

    if (Object.keys(patch).length) onUpdate(exId, set.id, patch);
  }, [
    exId,
    isWeightBased,
    onUpdate,
    primary,
    secondary,
    set.done,
    set.id,
    set.reps,
    set.rest,
    set.weight,
    third,
    trackingMode,
    weightUnit,
  ]);

  const handleDelete = useCallback(() => {
    closeSwipe();
    onDelete(exId, set.id);
  }, [closeSwipe, exId, onDelete, set.id]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-8, 8])
        .failOffsetY([-12, 12])
        .onBegin(() => {
          startX.value = translateX.value;
        })
        .onUpdate((event) => {
          const next = startX.value + event.translationX;

          /**
           * Critical fix:
           * The row is clamped between 0 and -DELETE_REVEAL_WIDTH.
           * It cannot travel farther left than the delete button reveal.
           */
          translateX.value = clamp(next, -DELETE_REVEAL_WIDTH, 0);
        })
        .onEnd((event) => {
          const shouldOpen =
            translateX.value < -OPEN_THRESHOLD || event.velocityX < -500;

          if (shouldOpen) {
            translateX.value = withSpring(-DELETE_REVEAL_WIDTH, {
              damping: 24,
              stiffness: 280,
              mass: 0.8,
            });
          } else {
            translateX.value = withSpring(0, {
              damping: 24,
              stiffness: 280,
              mass: 0.8,
            });
          }
        }),
    [startX, translateX],
  );

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedDeleteStyle = useAnimatedStyle(() => {
  return {
    opacity: interpolate(
      translateX.value,
      [-DELETE_REVEAL_WIDTH, -8, 0],
      [1, 0, 0],
      "clamp",
    ),
  };
});

  const isDone = !!set.done;
  const hideThirdField = modeConfig.hideThirdField;

  return (
    <View style={localStyles.swipeClip}>
      <Animated.View style={[S.swipeBg, localStyles.deleteLayer, animatedDeleteStyle]}>
  <Pressable
    onPress={handleDelete}
    style={[S.deletePill, localStyles.deletePill]}
    accessibilityRole="button"
    accessibilityLabel="Delete set"
  >
    <Text style={S.deleteText}>Delete</Text>
  </Pressable>
</Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            localStyles.rowCover,
            { backgroundColor: colors.surface, width: "100%" },
            animatedRowStyle,
          ]}
        >
          <View
            style={[
              S.row,
              S.rowBottomBorder,
              {
                height: 76,
                paddingVertical: 10,
                backgroundColor: isDone
                  ? colors.successSoft
                  : isActive
                    ? colors.premiumSoft
                    : colors.surface,
              },
            ]}
          >
            {isActive ? (
              <View style={[S.rowActiveBar, { backgroundColor: colors.premium }]} />
            ) : null}

            <Pressable
              onLongPress={() => onNote(exId, set.id)}
              delayLongPress={400}
              style={{ width: 44, alignItems: "center" }}
            >
              <Text
                style={[
                  S.setIndex,
                  {
                    color: isDone
                      ? colors.successText
                      : isActive
                        ? colors.text
                        : mutedIndexColor,
                    fontWeight: "900",
                  },
                ]}
              >
                {index + 1}
              </Text>

              {set.note ? (
                <View
                  style={{
                    marginTop: 4,
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  }}
                >
                  <MessageSquare size={10} color={noteIconColor} />
                </View>
              ) : null}
            </Pressable>

            <View style={{ flex: 1, marginHorizontal: 6 }}>
              <View style={[S.cell, cellStyle(isDone, isActive)]}>
                <TextInput
                  ref={primaryInputRef}
                  {...(iosAccessoryProps ?? {})}
                  value={primary}
                  onChangeText={(t) => {
                    if (trackingMode === "time") {
                      setPrimary(normalizeTimeInput(t));
                      return;
                    }
                    setPrimary(sanitizeNumericInput(t));
                  }}
                  onFocus={() => handleFocus("primary", primary)}
                  selection={primarySelection}
                  onSelectionChange={(e) => setPrimarySelection(e.nativeEvent.selection)}
                  onBlur={commit}
                  keyboardType="numeric"
                  inputMode="numeric"
                  style={[S.input, inputTextStyle(isDone)]}
                  placeholder={modeConfig.primaryPlaceholder ?? "—"}
                  placeholderTextColor={placeholderColor}
                  editable={!isDone}
                  autoCorrect={false}
                  autoComplete="off"
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
              </View>
            </View>

            <View style={{ flex: 1, marginHorizontal: 6 }}>
              <View style={[S.cell, cellStyle(isDone, isActive)]}>
                <TextInput
                  ref={secondaryInputRef}
                  {...(iosAccessoryProps ?? {})}
                  value={secondary}
                  onChangeText={(t) => {
                    if (trackingMode === "time") {
                      setSecondary(t);
                      return;
                    }
                    if (trackingMode === "reps_only" || trackingMode === "calories") {
                      setSecondary(t);
                      return;
                    }
                    setSecondary(sanitizeNumericInput(t));
                  }}
                  onFocus={() => handleFocus("secondary", secondary)}
                  selection={secondarySelection}
                  onSelectionChange={(e) => setSecondarySelection(e.nativeEvent.selection)}
                  onBlur={commit}
                  keyboardType={
                    trackingMode === "time" || trackingMode === "reps_only" || trackingMode === "calories"
                      ? "default"
                      : "numeric"
                  }
                  inputMode={
                    trackingMode === "time" || trackingMode === "reps_only" || trackingMode === "calories"
                      ? "text"
                      : "numeric"
                  }
                  style={[S.input, inputTextStyle(isDone)]}
                  placeholder={modeConfig.secondaryPlaceholder ?? "—"}
                  placeholderTextColor={placeholderColor}
                  editable={!isDone}
                  autoCorrect={false}
                  autoComplete="off"
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
              </View>
            </View>

            <View style={{ flex: 1, marginHorizontal: 6 }}>
              <View
                style={[
                  S.cell,
                  cellStyle(isDone, isActive),
                  hideThirdField && { opacity: 0.35 },
                ]}
              >
                <TextInput
                  ref={thirdInputRef}
                  {...(iosAccessoryProps ?? {})}
                  value={hideThirdField ? "" : third}
                  onChangeText={setThird}
                  onFocus={() => handleFocus("third", third)}
                  selection={thirdSelection}
                  onSelectionChange={(e) => setThirdSelection(e.nativeEvent.selection)}
                  onBlur={commit}
                  keyboardType="default"
                  style={[S.input, inputTextStyle(isDone)]}
                  placeholder={hideThirdField ? "" : modeConfig.thirdPlaceholder ?? "—"}
                  placeholderTextColor={placeholderColor}
                  editable={!isDone && !hideThirdField}
                  autoCorrect={false}
                  autoComplete="off"
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
              </View>
            </View>

            <Pressable
              onPress={() => onToggle(exId, set.id)}
              style={[
                S.checkBtn,
                {
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  borderWidth: 1.5,
                  borderColor: isDone ? colors.success : colors.borderSubtle,
                  backgroundColor: isDone ? colors.success : colors.surface,
                },
              ]}
            >
              {isDone ? <Check size={20} color="#FFF" strokeWidth={3} /> : null}
            </Pressable>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const localStyles = StyleSheet.create({
  swipeClip: {
    position: "relative",
    overflow: "hidden",
  },

  deleteLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: DELETE_REVEAL_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  deletePill: {
    width: DELETE_ACTION_WIDTH,
  },
});

export default SetRowItem;
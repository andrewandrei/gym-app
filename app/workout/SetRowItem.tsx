// app/workout/SetRowItem.tsx

import { Check, MessageSquare } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, Pressable, Text, TextInput, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { useAppTheme } from "@/app/_providers/theme";
import { formatStoredWeightStringForDisplay } from "@/app/lib/weightUnits";
import { createWorkoutStyles } from "./workout.styles";

export type SetRow = {
  id: string;
  weight?: string;
  reps?: string;
  rest?: string;
  done?: boolean;
  note?: string;
};

export type UnitLabel = "LBS" | "KG" | "REPS";

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
};

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
}: Props) {
  const { colors, isDark } = useAppTheme();
  const S = useMemo(() => createWorkoutStyles(colors, isDark), [colors, isDark]);

  const cellStyle = (done: boolean, active: boolean) => ({
    height: 52,
    borderWidth: 1.5,
    borderColor: done
      ? "rgba(34, 197, 94, 0.26)"
      : active
        ? "rgba(244, 200, 74, 0.70)"
        : colors.borderSubtle,
    backgroundColor: done
      ? "rgba(34, 197, 94, 0.05)"
      : active
        ? "rgba(244, 200, 74, 0.10)"
        : colors.surface,
  });

  const inputTextStyle = (done: boolean) => ({
    fontSize: 16,
    fontWeight: "800" as const,
    color: done ? "rgba(34, 197, 94, 0.92)" : colors.text,
  });

  const placeholderColor = isDark ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.25)";
  const mutedIndexColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const noteIconColor = isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.4)";

  const rowKey = useMemo(() => `${exId}:${set.id}`, [exId, set.id]);
  const setKey = useMemo(() => `${exId}:${index}`, [exId, index]);

  const displayWeight = useMemo(() => {
    if (!isWeightBased) return set.weight ?? "";

    return formatStoredWeightStringForDisplay({
      storedWeight: set.weight ?? "",
      unit: weightUnit,
    });
  }, [isWeightBased, set.weight, weightUnit]);

  const [w, setW] = useState(displayWeight);
  const [r, setR] = useState(set.reps ?? "");
  const [rest, setRest] = useState(set.rest ?? "");

  useEffect(() => {
    setW(displayWeight);
  }, [displayWeight]);

  useEffect(() => {
    setR(set.reps ?? "");
    setRest(set.rest ?? "");
  }, [set.reps, set.rest]);

  const handleFocus = useCallback(() => {
    closeOthers(rowKey);
    onFocus(setKey);
  }, [closeOthers, rowKey, onFocus, setKey]);

  const commit = useCallback(() => {
    if (set.done) return;

    const patch: Partial<SetRow> = {};
    const nextW = w.replace(/[^\d.]/g, "");
    const nextR = r.replace(/[^\d.]/g, "");
    const nextRest = rest;

    const currentDisplayWeight = isWeightBased
      ? formatStoredWeightStringForDisplay({
          storedWeight: set.weight ?? "",
          unit: weightUnit,
        })
      : (set.weight ?? "");

    if (currentDisplayWeight !== nextW) patch.weight = nextW;
    if ((set.reps ?? "") !== nextR) patch.reps = nextR;
    if ((set.rest ?? "") !== nextRest) patch.rest = nextRest;

    if (Object.keys(patch).length) onUpdate(exId, set.id, patch);
  }, [
    set.done,
    set.weight,
    set.reps,
    set.rest,
    w,
    r,
    rest,
    isWeightBased,
    weightUnit,
    onUpdate,
    exId,
    set.id,
  ]);

  const isDone = !!set.done;

  return (
    <Swipeable
      ref={swipeRef}
      overshootRight={false}
      rightThreshold={36}
      friction={2.2}
      containerStyle={{ backgroundColor: "transparent", overflow: "visible" }}
      childrenContainerStyle={{ overflow: "visible" }}
      renderRightActions={(_progress, dragX) => {
        const translate = dragX.interpolate({
          inputRange: [-140, 0],
          outputRange: [0, 92],
          extrapolate: "clamp",
        });

        const opacity = dragX.interpolate({
          inputRange: [-90, -10],
          outputRange: [1, 0],
          extrapolate: "clamp",
        });

        return (
          <View style={[S.swipeBg, { width: 110, paddingRight: 12 }]}>
            <Animated.View
              style={{
                transform: [{ translateX: translate }],
                opacity,
              }}
            >
              <Pressable onPress={() => onDelete(exId, set.id)} style={S.deletePill}>
                <Text style={S.deleteText}>Delete</Text>
              </Pressable>
            </Animated.View>
          </View>
        );
      }}
    >
      <View
        style={[
          S.row,
          S.rowBottomBorder,
          {
            height: 76,
            paddingVertical: 10,
            backgroundColor: isDone
              ? "rgba(34, 197, 94, 0.08)"
              : isActive
                ? "rgba(244, 200, 74, 0.12)"
                : colors.surface,
          },
        ]}
      >
        {isActive ? <View style={S.rowActiveBar} /> : null}

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
                  ? "rgba(34, 197, 94, 0.80)"
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
              {...(iosAccessoryProps ?? {})}
              value={w}
              onChangeText={(t) => setW(t.replace(/[^\d.]/g, ""))}
              onFocus={handleFocus}
              onPressIn={handleFocus}
              onBlur={commit}
              keyboardType="numeric"
              inputMode="numeric"
              style={[S.input, inputTextStyle(isDone)]}
              placeholder="—"
              placeholderTextColor={placeholderColor}
              editable={!isDone}
              selectTextOnFocus
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
              {...(iosAccessoryProps ?? {})}
              value={r}
              onChangeText={(t) => setR(t.replace(/[^\d.]/g, ""))}
              onFocus={handleFocus}
              onPressIn={handleFocus}
              onBlur={commit}
              keyboardType="numeric"
              inputMode="numeric"
              style={[S.input, inputTextStyle(isDone)]}
              placeholder="—"
              placeholderTextColor={placeholderColor}
              editable={!isDone}
              selectTextOnFocus
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
              {...(iosAccessoryProps ?? {})}
              value={rest}
              onChangeText={setRest}
              onFocus={handleFocus}
              onPressIn={handleFocus}
              onBlur={commit}
              keyboardType="default"
              style={[S.input, inputTextStyle(isDone)]}
              placeholder="—"
              placeholderTextColor={placeholderColor}
              editable={!isDone}
              selectTextOnFocus
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
              borderColor: isDone ? "rgb(34, 197, 94)" : colors.borderSubtle,
              backgroundColor: isDone ? "rgb(34, 197, 94)" : colors.surface,
            },
          ]}
        >
          {isDone ? <Check size={20} color="#FFF" strokeWidth={3} /> : null}
        </Pressable>
      </View>
    </Swipeable>
  );
}
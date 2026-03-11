// app/workout/SetRowItem.tsx

import { Check, MessageSquare } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, Pressable, Text, TextInput, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { Colors } from "@/styles/colors";
import { S } from "./workout.styles";

export type SetRow = {
  id: string;
  weight?: string;
  reps?: string;
  rest?: string;
  done?: boolean;
  note?: string;
};

export type UnitLabel = "LBS" | "KG" | "REPS";

const cellStyle = (done: boolean, isActive: boolean) => ({
  height: 56,
  borderWidth: 2,
  borderColor: done
    ? "rgba(34, 197, 94, 0.30)"
    : isActive
      ? "rgba(244, 200, 74, 0.60)"
      : "rgba(0,0,0,0.12)",
  backgroundColor: done
    ? "rgba(34, 197, 94, 0.04)"
    : isActive
      ? "rgba(244, 200, 74, 0.08)"
      : Colors.surface,
});

const inputTextStyle = (done: boolean) => ({
  fontSize: 17,
  fontWeight: "800" as const,
  color: done ? "rgba(34, 197, 94, 0.90)" : Colors.text,
});

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
}: Props) {
  const rowKey = useMemo(() => `${exId}:${set.id}`, [exId, set.id]);
  const setKey = useMemo(() => `${exId}:${index}`, [exId, index]);

  const [w, setW] = useState(set.weight ?? "");
  const [r, setR] = useState(set.reps ?? "");
  const [rest, setRest] = useState(set.rest ?? "");

  useEffect(() => {
    setW(set.weight ?? "");
    setR(set.reps ?? "");
    setRest(set.rest ?? "");
  }, [set.weight, set.reps, set.rest]);

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

    if ((set.weight ?? "") !== nextW) patch.weight = nextW;
    if ((set.reps ?? "") !== nextR) patch.reps = nextR;
    if ((set.rest ?? "") !== nextRest) patch.rest = nextRest;

    if (Object.keys(patch).length) onUpdate(exId, set.id, patch);
  }, [set.done, set.weight, set.reps, set.rest, w, r, rest, onUpdate, exId, set.id]);

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
                : Colors.surface,
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
                    ? Colors.text
                    : "rgba(0,0,0,0.45)",
                fontWeight: "900",
              },
            ]}
          >
            {index + 1}
          </Text>

          {set.note ? (
            <MessageSquare size={12} color="rgba(0,0,0,0.4)" style={{ marginTop: 2 }} />
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
              placeholderTextColor="rgba(0,0,0,0.25)"
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
              placeholderTextColor="rgba(0,0,0,0.25)"
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
              placeholderTextColor="rgba(0,0,0,0.25)"
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
              width: 50,
              height: 50,
              borderRadius: 25,
              borderWidth: 2.5,
              borderColor: isDone ? "rgb(34, 197, 94)" : "rgba(0,0,0,0.15)",
              backgroundColor: isDone ? "rgb(34, 197, 94)" : Colors.surface,
            },
          ]}
        >
          {isDone ? <Check size={24} color="#FFF" strokeWidth={3} /> : null}
        </Pressable>
      </View>
    </Swipeable>
  );
}
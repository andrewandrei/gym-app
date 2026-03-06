// app/workout/finish.tsx

import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import React, { useMemo } from "react";
import { Platform, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

import { Colors } from "@/styles/colors";

type FinishSummary = {
  workoutTitle: string;
  durationSec: number;
  totals: {
    completedSets: number;
  };
  exercises: Array<{
    id: string;
    name: string;
    completedSets: number;
    sets: Array<{
      set: number;
      weight: string;
      reps: string;
      rest: string;
      done: boolean;
    }>;
  }>;
};

function shortDuration(seconds: number) {
  const mins = Math.max(0, Math.round(seconds / 60));
  return `${mins} min`;
}

export default function FinishScreen() {
  const params = useLocalSearchParams<{ summary?: string }>();

  const summary = useMemo<FinishSummary | null>(() => {
    if (!params.summary) return null;
    try {
      const json = decodeURIComponent(String(params.summary));
      return JSON.parse(json) as FinishSummary;
    } catch {
      return null;
    }
  }, [params.summary]);

  const onBack = async () => {
    if (Platform.OS !== "web") await Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const onSaveAndFinish = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.replace("/");
  };

  const onResumeLater = async () => {
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
    if (router.canGoBack()) router.back();
    else router.replace("/workout");
  };

  if (!summary) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <Text style={{ fontSize: 22, fontWeight: "900", color: Colors.text, letterSpacing: -0.4 }}>
            Workout finished
          </Text>
          <Text style={{ marginTop: 6, fontSize: 13, fontWeight: "700", color: Colors.muted }}>
            Missing summary payload.
          </Text>

          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              {
                marginTop: 16,
                height: 56,
                borderRadius: 999,
                backgroundColor: Colors.text,
                alignItems: "center",
                justifyContent: "center",
              },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={{ color: Colors.surface, fontWeight: "900", fontSize: 16, letterSpacing: -0.2 }}>
              Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const completedExercises = summary.exercises.filter((ex) => ex.sets.length > 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.surface }}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 22, fontWeight: "900", color: Colors.text, letterSpacing: -0.4 }}>
          Workout finished
        </Text>
        <Text style={{ marginTop: 6, fontSize: 13, fontWeight: "700", color: Colors.muted }}>
          Progress beats perfection.
        </Text>

        <View
          style={{
            marginTop: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.08)",
            backgroundColor: "rgba(0,0,0,0.02)",
            paddingVertical: 14,
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 12, fontWeight: "800", color: "rgba(0,0,0,0.45)" }}>
              Sets Completed
            </Text>
            <Text style={{ marginTop: 6, fontSize: 16, fontWeight: "900", color: Colors.text }}>
              {summary.totals.completedSets}
            </Text>
          </View>

          <View style={{ width: 1, height: 34, backgroundColor: "rgba(0,0,0,0.08)" }} />

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 12, fontWeight: "800", color: "rgba(0,0,0,0.45)" }}>
              Duration
            </Text>
            <Text style={{ marginTop: 6, fontSize: 16, fontWeight: "900", color: Colors.text }}>
              {shortDuration(summary.durationSec)}
            </Text>
          </View>
        </View>

        <Text style={{ marginTop: 18, fontSize: 13, fontWeight: "900", color: Colors.text }}>
          Completed Exercises
        </Text>

        <View style={{ marginTop: 10, gap: 12 }}>
          {completedExercises.length ? (
            completedExercises.map((ex) => (
              <View
                key={ex.id}
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.08)",
                  backgroundColor: Colors.surface,
                  padding: 14,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <Text
                    style={{ flex: 1, fontSize: 15, fontWeight: "900", color: Colors.text }}
                    numberOfLines={2}
                  >
                    {ex.name}
                  </Text>

                  <Text style={{ fontSize: 12, fontWeight: "800", color: "rgba(0,0,0,0.45)" }}>
                    {ex.completedSets} set{ex.completedSets === 1 ? "" : "s"}
                  </Text>
                </View>

                <View style={{ marginTop: 10, gap: 10 }}>
                  {ex.sets.map((s) => {
                    const weight = s.weight?.trim() ? s.weight : "0";
                    const reps = s.reps?.trim() ? s.reps : "0";

                    return (
                      <View
                        key={`${ex.id}-${s.set}`}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: "800", color: "rgba(0,0,0,0.55)" }}>
                          Set {s.set}
                        </Text>

                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                          <View
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 9,
                              backgroundColor: "rgb(34,197,94)",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Check size={12} color="#fff" strokeWidth={3} />
                          </View>

                          <Text style={{ fontSize: 13, fontWeight: "900", color: Colors.text }}>
                            {weight} lbs × {reps}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          ) : (
            <Text style={{ marginTop: 4, fontSize: 13, fontWeight: "700", color: Colors.muted }}>
              No completed sets yet.
            </Text>
          )}
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 18,
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.08)",
        }}
      >
        <Pressable
          onPress={onSaveAndFinish}
          style={({ pressed }) => [
            {
              height: 58,
              borderRadius: 999,
              backgroundColor: Colors.text,
              alignItems: "center",
              justifyContent: "center",
            },
            pressed && { opacity: 0.92 },
          ]}
        >
          <Text style={{ color: Colors.surface, fontWeight: "900", fontSize: 16, letterSpacing: -0.2 }}>
            Save & Finish
          </Text>
        </Pressable>

        <Pressable
          onPress={onResumeLater}
          style={({ pressed }) => [
            { marginTop: 10, height: 44, alignItems: "center", justifyContent: "center" },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={{ fontSize: 13, fontWeight: "800", color: "rgba(0,0,0,0.55)" }}>
            Resume workout another day
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
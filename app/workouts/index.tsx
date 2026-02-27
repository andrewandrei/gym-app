import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ScreenHeader from "@/components/ui/ScreenHeader";
import { Colors } from "@/styles/colors";
import { GlobalStyles } from "@/styles/global";
import { Spacing } from "@/styles/spacing";

type WorkoutStatus = "New" | "Done" | undefined;

type WorkoutItem = {
  id: string;
  title: string;
  programTitle?: string;
  durationMin?: number;
  level?: string; // "Beginner" | "Intermediate" | ...
  weeks?: number; // e.g. 12
  image: string;
  status?: WorkoutStatus;
  // later: tags, equipment, calories, etc.
};

function formatMeta(w: WorkoutItem) {
  const parts: string[] = [];
  if (typeof w.durationMin === "number") parts.push(`${w.durationMin} min`);
  if (w.level) parts.push(w.level);
  if (typeof w.weeks === "number") parts.push(`${w.weeks} weeks`);
  return parts.join(" • ");
}

function WorkoutCard({
  item,
  onPress,
}: {
  item: WorkoutItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={S.card}>
      <ImageBackground
        source={{ uri: item.image }}
        style={S.cardImage}
        imageStyle={S.cardImageRadius}
      >
        {/* Subtle dark gradient substitute (no libs): bottom overlay */}
        <View style={S.cardBottomFade} />

        <View style={S.cardContent}>
          <View style={S.cardTopRow}>
            {item.status ? (
              <View
                style={[
                  S.statusPill,
                  item.status === "Done" ? S.statusPillDone : S.statusPillNew,
                ]}
              >
                <Text allowFontScaling={false} style={S.statusPillText}>
                  {item.status}
                </Text>
              </View>
            ) : (
              <View />
            )}

            {/* quiet right-side micro label (optional) */}
            {item.programTitle ? (
              <Text
                allowFontScaling={false}
                style={S.programLabel}
                numberOfLines={1}
              >
                {item.programTitle}
              </Text>
            ) : null}
          </View>

          <View style={S.cardBottomBlock}>
            <Text
              allowFontScaling={false}
              style={S.cardTitle}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <Text
              allowFontScaling={false}
              style={S.cardMeta}
              numberOfLines={1}
            >
              {formatMeta(item)}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default function WorkoutsIndexScreen() {
  const router = useRouter();

  // Demo data — replace with real query later (Supabase / local cache)
  const workouts = useMemo<WorkoutItem[]>(
    () => [
      {
        id: "w1",
        title: "Upper Body Strength A",
        programTitle: "Hypertrophy Foundations",
        durationMin: 52,
        level: "Intermediate",
        weeks: 12,
        status: "New",
        image:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1800&q=80",
      },
      {
        id: "w2",
        title: "Lower Body Strength A",
        programTitle: "Hypertrophy Foundations",
        durationMin: 55,
        level: "Intermediate",
        weeks: 12,
        status: undefined,
        image:
          "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=1800&q=80",
      },
      {
        id: "w3",
        title: "Full Body Density",
        programTitle: "Busy Athlete",
        durationMin: 38,
        level: "Intermediate",
        weeks: 8,
        status: "Done",
        image:
          "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1800&q=80",
      },
      {
        id: "w4",
        title: "Shoulders & Arms Pump",
        programTitle: "Aesthetics Block",
        durationMin: 44,
        level: "Beginner",
        weeks: 6,
        status: undefined,
        image:
          "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1800&q=80",
      },
    ],
    []
  );

  const handleOpenWorkout = (workoutId: string) => {
    // Adjust if your workout screen expects different params.
    // This routes to: app/workout/index.tsx
    router.push({ pathname: "/workout", params: { id: workoutId } });
  };

  return (
    <SafeAreaView style={GlobalStyles.screen} edges={["top"]}>
      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          variant="page"
          title="Workouts"
          subtitle="Pick a session and start logging"
        />

        <View style={S.section}>
          <Text allowFontScaling={false} style={S.sectionTitle}>
            All workouts
          </Text>

          <View style={S.list}>
            {workouts.map((w, idx) => (
              <View key={w.id} style={idx !== 0 ? S.listGap : undefined}>
                <WorkoutCard item={w} onPress={() => handleOpenWorkout(w.id)} />
              </View>
            ))}
          </View>
        </View>

        {/* Future (quiet, premium): filters row, “Recently logged”, etc. */}
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_H = 190;

const S = StyleSheet.create({
  scroll: { backgroundColor: Colors.surface },

  content: {
    paddingTop: 4,
    paddingHorizontal: Spacing.md, // 18 gutter (LOCKED)
    paddingBottom: Spacing.xl,
  },

  section: {
    marginTop: Spacing.lg,
  },

  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.text,
    fontWeight: "600",
    letterSpacing: -0.2,
    marginBottom: Spacing.sm,
  },

  list: {},
  listGap: { marginTop: Spacing.md },

  card: {
    height: CARD_H,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },

  cardImage: {
    flex: 1,
    justifyContent: "flex-end",
  },

  cardImageRadius: {
    borderRadius: 18,
  },

  cardBottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  cardContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },

  statusPillNew: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.22)",
  },

  statusPillDone: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.18)",
  },

  statusPillText: {
    fontSize: 12,
    lineHeight: 14,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  programLabel: {
    flex: 1,
    textAlign: "right",
    fontSize: 12,
    lineHeight: 14,
    color: "rgba(255,255,255,0.88)",
    fontWeight: "600",
    letterSpacing: -0.15,
  },

  cardBottomBlock: {
    gap: 6,
  },

  cardTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: "#fff",
    fontWeight: "800",
    letterSpacing: -0.4,
  },

  cardMeta: {
    fontSize: 13,
    lineHeight: 16,
    color: "rgba(255,255,255,0.86)",
    fontWeight: "600",
    letterSpacing: -0.15,
  },
});
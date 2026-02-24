// app/(tabs)/explore.tsx
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronRight, Info } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { FlatList, Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Colors } from "@/styles/colors";
import { GlobalStyles } from "@/styles/global";
import { Spacing } from "@/styles/spacing";
import { styles } from "./explore.styles";

type Level = "Beginner" | "Intermediate" | "Advanced";

type Program = {
  id: string;
  title: string;
  duration: string;
  tag: string;
  workoutsPerWeek: number;
  level: Level;
  imageUrl: string;
  description: string;
  isActive?: boolean;
  isFeatured?: boolean;
};

type Workout = {
  id: string;
  title: string;
  type: string;
  durationMin: number;
  imageUrl: string;
  meta: string;
  isActive?: boolean;
};

type Recipe = {
  id: string;
  title: string;
  metaBold: string;
  metaMuted: string;
  imageUrl: string;
};

type Rail<T> = {
  id: string;
  title: string;
  subtitle?: string;
  kind: "program" | "workout" | "recipe";
  items: T[];
};

function RailHeader({
  title,
  subtitle,
  onPressAll,
}: {
  title: string;
  subtitle?: string;
  onPressAll?: () => void;
}) {
  return (
    <View style={styles.railHeader}>
      <View style={styles.railHeaderText}>
        <Text style={styles.railTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.railSubtitle}>{subtitle}</Text>}
      </View>

      {!!onPressAll && (
        <Pressable onPress={onPressAll} style={styles.railAll} hitSlop={10}>
          <Text style={styles.railAllText}>See all</Text>
          <ChevronRight size={16} color={Colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

function Badge({ label, variant = "light" }: { label: string; variant?: "light" | "gold" }) {
  return (
    <View style={[styles.badge, variant === "gold" && styles.badgeGold]}>
      <Text style={[styles.badgeText, variant === "gold" && styles.badgeTextGold]}>{label}</Text>
    </View>
  );
}

function LevelChip({ level }: { level: Level }) {
  return (
    <View style={styles.levelChip}>
      <View style={[styles.levelIconWrap, styles.levelIconAccent]} />
      <Text style={styles.levelChipText} allowFontScaling={false}>
        {level}
      </Text>
    </View>
  );
}

function ProgramCard({
  program,
  onPress,
  onPressInfo,
}: {
  program: Program;
  onPress: (id: string) => void;
  onPressInfo: (program: Program) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(program.id)}
      style={({ pressed }) => [styles.programCardWrap, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${program.title}`}
    >
      <View style={styles.programTile}>
        <Image source={{ uri: program.imageUrl }} style={styles.programTileImage} resizeMode="cover" />

        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.18)", "rgba(0,0,0,0.45)", "rgba(0,0,0,0.75)"]}
          locations={[0, 0.35, 0.65, 1]}
          style={styles.programBottomScrim}
          pointerEvents="none"
        />

        <View style={styles.programTopLeft}>
          {program.isActive ? (
            <Badge label="Active" />
          ) : program.isFeatured ? (
            <Badge label="Featured" variant="gold" />
          ) : null}
        </View>

        <Pressable
          onPress={() => onPressInfo(program)}
          style={({ pressed }) => [styles.infoChip, pressed && { opacity: 0.85 }]}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Program info: ${program.title}`}
        >
          <Info size={14} color="rgba(255,255,255,0.92)" />
        </Pressable>

        {/* ✅ FIXED: use program.level (not item.level) */}
        <View style={styles.programBottomRight}>
          <LevelChip level={program.level} />
        </View>

        <View style={styles.programTextOverlay}>
          <Text style={styles.programTitleOnImage} numberOfLines={2}>
            {program.title}
          </Text>
          <Text style={styles.programDurationOnImage} numberOfLines={1}>
            {program.duration}
          </Text>
        </View>
      </View>

      <Text style={styles.programBelowPrimary} numberOfLines={1}>
        {program.workoutsPerWeek} workouts per week
      </Text>
      <Text style={styles.programBelowSecondary} numberOfLines={1}>
        {program.tag}
      </Text>
    </Pressable>
  );
}

function EditorialCard({
  title,
  metaBold,
  metaMuted,
  imageUrl,
  active,
  variant = "workout",
  onPress,
}: {
  title: string;
  metaBold: string;
  metaMuted: string;
  imageUrl: string;
  active?: boolean;
  variant?: "workout" | "recipe";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        variant === "workout" ? styles.workoutCard : styles.recipeCard,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={variant === "workout" ? styles.workoutMedia : styles.recipeMedia}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

        <LinearGradient
          colors={["rgba(0,0,0,0.00)", "rgba(0,0,0,0.00)", "rgba(0,0,0,0.32)", "rgba(0,0,0,0.54)"]}
          locations={[0, 0.55, 0.8, 1]}
          style={styles.editorialBottomScrim}
          pointerEvents="none"
        />

        {active ? (
          <View style={styles.editorialBadgeWrap}>
            <Badge label="Active" />
          </View>
        ) : null}

        <View style={styles.titleOverlay}>
          <Text style={styles.titleOnImage} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </View>

      <View style={styles.below}>
        <Text style={styles.belowBold} numberOfLines={1}>
          {metaBold}
        </Text>
        <Text style={styles.belowMuted} numberOfLines={1}>
          {metaMuted}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();

  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const openInfo = (p: Program) => {
    setSelectedProgram(p);
    setInfoOpen(true);
  };

  const closeInfo = () => {
    setInfoOpen(false);
    setSelectedProgram(null);
  };

  const ACTIVE_PROGRAM_IMAGE =
    "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/685bf886d23017768f4614b5_img%20(1).png";

  const PROGRAM_IMAGES = [
    "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/690f57910b105d3dea2f1eb9_Strength%20%26%20Symmetry.jpg",
    "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/690f510381f5fead2d6257b8_c7d8a728-2fde-4254-a1a7-a505e1a4cf3e.jpeg",
    "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/6784fa945db9e2462bde508b_675b0276e2206c6b6a37ff0c_Hybrid%20Athlete%20(1)-p-800.jpg",
  ];

  const WORKOUT_IMAGES = [
    "https://i.ytimg.com/vi/w0zPgPkx8yI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCB-fSirLZ7-OC0R2z5r58bt-aUvQ",
    "https://i.ytimg.com/vi/6O8SRDEK5F4/maxresdefault.jpg",
    "https://i.ytimg.com/vi/2ZgCRBLg2Zs/maxresdefault.jpg",
    "https://i.ytimg.com/vi/M8M0AgQ8nD8/maxresdefault.jpg",
  ];

  const programs = useMemo<Program[]>(
    () => [
      {
        id: "strength-foundations",
        title: "Strength Foundations",
        duration: "12 weeks",
        tag: "Gym",
        workoutsPerWeek: 3,
        level: "Intermediate",
        imageUrl: ACTIVE_PROGRAM_IMAGE,
        description:
          "Build a strong base with progressive overload, clean technique, and repeatable weekly structure. Perfect if you want strength + shape without chaos.",
        isActive: true,
      },
      {
        id: "strength-symmetry",
        title: "Strength & Symmetry",
        duration: "10 weeks",
        tag: "Gym",
        workoutsPerWeek: 4,
        level: "Intermediate",
        imageUrl: PROGRAM_IMAGES[0],
        description:
          "Hypertrophy-forward training that targets proportion, weak points, and control. Built for visible physique changes and cleaner execution.",
        isFeatured: true,
      },
      {
        id: "hypertrophy-block",
        title: "Hypertrophy Block",
        duration: "8 weeks",
        tag: "Gym",
        workoutsPerWeek: 5,
        level: "Advanced",
        imageUrl: PROGRAM_IMAGES[1],
        description:
          "High-quality volume with intelligent progression. For experienced lifters who want measurable growth and better weekly performance.",
      },
      {
        id: "hybrid-athlete",
        title: "Hybrid Athlete",
        duration: "12 weeks",
        tag: "Hybrid",
        workoutsPerWeek: 3,
        level: "Beginner",
        imageUrl: PROGRAM_IMAGES[2],
        description:
          "Strength + conditioning with simple structure. Great if you want to feel athletic, lean out, and still build muscle — without burning out.",
        isFeatured: true,
      },
    ],
    [ACTIVE_PROGRAM_IMAGE, PROGRAM_IMAGES],
  );

  const workouts = useMemo<Workout[]>(
    () => [
      { id: "w-001", title: "Arms & Shoulders Minimum Equipment", type: "HIIT", durationMin: 30, meta: "Arms · Shoulders", imageUrl: WORKOUT_IMAGES[0], isActive: true },
      { id: "w-002", title: "Legs Strength Session", type: "Strength", durationMin: 42, meta: "Legs · Glutes", imageUrl: WORKOUT_IMAGES[1] },
      { id: "w-003", title: "Upper Body Hypertrophy", type: "Hypertrophy", durationMin: 45, meta: "Chest · Back", imageUrl: WORKOUT_IMAGES[2] },
      { id: "w-004", title: "Conditioning Finisher", type: "Conditioning", durationMin: 25, meta: "Full body", imageUrl: WORKOUT_IMAGES[3] },
    ],
    [WORKOUT_IMAGES],
  );

  const recipes = useMemo<Recipe[]>(
    () => [
      {
        id: "r-001",
        title: "Low Carb Lemon Pepper Chicken with Tzatziki",
        metaBold: "Main course ~35 min",
        metaMuted: "High Protein · Vegetables",
        imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: "r-002",
        title: "Greek Yogurt + Berries",
        metaBold: "Breakfast ~10 min",
        metaMuted: "Snack · Fruit",
        imageUrl: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: "r-003",
        title: "Salmon + Greens",
        metaBold: "Main course ~18 min",
        metaMuted: "Omega-3 · Lean",
        imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    [],
  );

  const rails = useMemo<Array<Rail<Program> | Rail<Workout> | Rail<Recipe>>>(() => {
    return [
      { id: "programs", title: "Programs", subtitle: "Structured plans", kind: "program", items: programs },
      { id: "workouts", title: "Individual workouts", subtitle: "Single sessions", kind: "workout", items: workouts },
      { id: "recipes", title: "Recipes", subtitle: "Macro-friendly meals", kind: "recipe", items: recipes },
    ];
  }, [programs, workouts, recipes]);

  const onPressProgram = (id: string) => router.push(`/program/${id}`);
  const onPressWorkout = (_id: string) => router.push("/workouts");
  const onPressRecipe = (_id: string) => router.push("/recipes");

  return (
    <SafeAreaView style={[GlobalStyles.safe, styles.safe]} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: 4, paddingBottom: Spacing.xl + (insets.bottom || 0) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* DEBUG TOP LINE */}
        <View style={{ height: 1, backgroundColor: "red" }} />

        {/* ✅ CONSISTENT HEADER */}
        <ScreenHeader title="Discover" subtitle="Programs, workouts, and recipes" />

        <View style={styles.rails}>
          {rails.map((rail) => (
            <View key={rail.id} style={styles.rail}>
              <RailHeader
                title={rail.title}
                subtitle={rail.subtitle}
                onPressAll={() => {
                  if (rail.kind === "program") router.push("/programs");
                  if (rail.kind === "workout") router.push("/workouts");
                  if (rail.kind === "recipe") router.push("/recipes");
                }}
              />

              <FlatList
                data={rail.items as any[]}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={styles.railListContent}
                renderItem={({ item }: any) => {
                  if (rail.kind === "program") {
                    return <ProgramCard program={item as Program} onPress={onPressProgram} onPressInfo={openInfo} />;
                  }

                  if (rail.kind === "workout") {
                    const w = item as Workout;
                    return (
                      <EditorialCard
                        variant="workout"
                        title={w.title}
                        metaBold={`${w.type} ~${w.durationMin} min`}
                        metaMuted={w.meta}
                        imageUrl={w.imageUrl}
                        active={!!w.isActive}
                        onPress={() => onPressWorkout(w.id)}
                      />
                    );
                  }

                  const r = item as Recipe;
                  return (
                    <EditorialCard
                      variant="recipe"
                      title={r.title}
                      metaBold={r.metaBold}
                      metaMuted={r.metaMuted}
                      imageUrl={r.imageUrl}
                      onPress={() => onPressRecipe(r.id)}
                    />
                  );
                }}
              />
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal visible={infoOpen} transparent animationType="fade" onRequestClose={closeInfo}>
        <Pressable style={styles.modalOverlay} onPress={closeInfo} />
        <View style={styles.modalSheet}>
          <View style={styles.modalTopRow}>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {selectedProgram?.title ?? ""}
            </Text>
            <Pressable onPress={closeInfo} style={styles.modalClose} hitSlop={10}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>

          <Text style={styles.modalMeta}>
            {selectedProgram
              ? `${selectedProgram.duration} · ${selectedProgram.workoutsPerWeek} / week · ${selectedProgram.tag} · ${selectedProgram.level}`
              : ""}
          </Text>

          <Text style={styles.modalBody}>{selectedProgram?.description ?? ""}</Text>

          <View style={styles.modalActionsRow}>
            <Pressable
              onPress={() => {
                const id = selectedProgram?.id;
                closeInfo();
                if (id) onPressProgram(id);
              }}
              style={styles.modalPrimary}
            >
              <Text style={styles.modalPrimaryText}>View program</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
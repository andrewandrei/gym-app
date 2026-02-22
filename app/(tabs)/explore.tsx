import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Colors } from "@/styles/colors";
import { GlobalStyles } from "@/styles/global";
import { Cards } from "@/styles/shadow";

import { styles } from "./explore.styles";

type Program = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tag: string;
  imageUrl: string;
  isActive?: boolean;
};

type Workout = {
  id: string;
  title: string;
  type: string;
  durationMin: number;
  imageUrl: string;
  isActive?: boolean;
};

type Recipe = {
  id: string;
  title: string;
  meta: string;
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
      <View style={styles.railHeaderLeft}>
        <Text style={styles.railTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.railSubtitle}>{subtitle}</Text>}
      </View>

      {!!onPressAll && (
        <Pressable
          onPress={onPressAll}
          style={({ pressed }) => [
            styles.railAll,
            pressed && styles.railAllPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
        >
          <Text style={styles.railAllText}>See all</Text>
          <ChevronRight size={16} color={Colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

function ActivePill() {
  return (
    <View style={styles.activePill}>
      <Text style={styles.activePillText}>Active</Text>
    </View>
  );
}

function ProgramCard({
  program,
  onPress,
}: {
  program: Program;
  onPress: (id: string) => void;
}) {
  const active = !!program.isActive;

  return (
    <Pressable
      onPress={() => onPress(program.id)}
      style={({ pressed }) => [
        styles.programCardWrap,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${program.title}`}
    >
      <View style={styles.programTile}>
        <Image
          source={{ uri: program.imageUrl }}
          style={styles.programTileImage}
        />
        <View style={styles.programTileFade} />

        <View style={styles.programTileTopRow}>
          {active ? <ActivePill /> : <View />}
          <View />
        </View>

        <View style={styles.programTileBottom}>
          <Text style={styles.programTileTitle} numberOfLines={2}>
            {program.title}
          </Text>
          <Text style={styles.programTileMeta} numberOfLines={1}>
            {program.subtitle} • {program.duration}
          </Text>
        </View>
      </View>

      <View style={styles.programBelow}>
        <Text style={styles.programBelowMeta} numberOfLines={1}>
          {program.tag} • {program.difficulty}
        </Text>
      </View>
    </Pressable>
  );
}

function MiniCard({
  title,
  meta,
  imageUrl,
  active,
  onPress,
}: {
  title: string;
  meta: string;
  imageUrl: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        Cards.base,
        Cards.workout,
        styles.miniCard,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.miniMedia}>
        <Image source={{ uri: imageUrl }} style={styles.miniImage} />
        <View style={styles.miniFade} />

        {active ? (
          <View style={styles.miniActivePillWrap}>
            <ActivePill />
          </View>
        ) : null}
      </View>

      <View style={styles.miniBody}>
        <Text style={styles.miniTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.miniMeta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const user = useMemo(() => ({ firstName: "Andrei" }), []);

  const ACTIVE_IMAGE_URL =
    "https://cdn.prod.website-files.com/6442b6aa142c4cb61a9a549d/685bf886d23017768f4614b5_img%20(1).png";

  const PROGRAM_FILLER_IMAGE_URL =
    "https://res.cloudinary.com/jerrick/image/upload/d_642250b563292b35f27461a7.png,f_jpg,fl_progressive,q_auto,w_1024/617d61714b4e9c001d913ee0.webp";

  const activeProgramId = "strength-foundations";
  const activeWorkoutId = "w-001";

  const programs = useMemo<Program[]>(
    () => [
      {
        id: "strength-foundations",
        title: "Strength Foundations",
        subtitle: "Andrei",
        duration: "12 weeks",
        difficulty: "Intermediate",
        tag: "Gym",
        imageUrl: ACTIVE_IMAGE_URL,
        isActive: true,
      },
      {
        id: "home-body-shred",
        title: "Home Body Shred",
        subtitle: "Mario",
        duration: "12 weeks",
        difficulty: "Advanced",
        tag: "Home",
        imageUrl: PROGRAM_FILLER_IMAGE_URL,
      },
      {
        id: "hyrox-beginner",
        title: "Hyrox Beginner",
        subtitle: "Alex",
        duration: "12 weeks",
        difficulty: "Beginner",
        tag: "Gym",
        imageUrl:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    [ACTIVE_IMAGE_URL],
  );

  const workouts = useMemo<Workout[]>(
    () => [
      {
        id: "w-001",
        title: "Hypertrophy Focus",
        type: "Upper Body",
        durationMin: 42,
        imageUrl: ACTIVE_IMAGE_URL,
        isActive: true,
      },
      {
        id: "w-002",
        title: "Lower Body Power",
        type: "Strength",
        durationMin: 38,
        imageUrl:
          "https://images.unsplash.com/photo-1517964603305-11c0f6f66012?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: "w-003",
        title: "Intervals + Finisher",
        type: "Conditioning",
        durationMin: 28,
        imageUrl:
          "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    [ACTIVE_IMAGE_URL],
  );

  const recipes = useMemo<Recipe[]>(
    () => [
      {
        id: "r-001",
        title: "High-Protein Chicken Bowl",
        meta: "High-protein • 12 min",
        imageUrl:
          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: "r-002",
        title: "Greek Yogurt + Berries",
        meta: "Lean snack • 5 min",
        imageUrl:
          "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1600&q=80",
      },
      {
        id: "r-003",
        title: "Salmon + Greens",
        meta: "Omega-3 • 18 min",
        imageUrl:
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1600&q=80",
      },
    ],
    [],
  );

  const rails = useMemo<
    Array<Rail<Program> | Rail<Workout> | Rail<Recipe>>
  >(() => {
    return [
      {
        id: "programs",
        title: "Programs",
        subtitle: "Structured plans",
        kind: "program",
        items: programs,
      },
      {
        id: "workouts",
        title: "Workouts",
        subtitle: "Individual sessions",
        kind: "workout",
        items: workouts,
      },
      {
        id: "recipes",
        title: "Recipes",
        subtitle: "Simple macro-friendly meals",
        kind: "recipe",
        items: recipes,
      },
    ];
  }, [programs, workouts, recipes]);

  const onPressProgram = (id: string) => router.push(`/program/${id}`);
  const onPressWorkout = (_id: string) => router.push("/workouts");
  const onPressRecipe = (_id: string) => router.push("/explore");

  return (
    <View style={[GlobalStyles.safe, styles.safe]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.kicker}>Good evening, {user.firstName}</Text>
              <Text style={styles.title}>Explore</Text>
            </View>
          </View>

          <Text style={styles.subtitle} numberOfLines={1}>
            Programs, workouts, and recipes — curated.
          </Text>
        </View>

        <View style={styles.rails}>
          {rails.map((rail) => (
            <View key={rail.id} style={styles.rail}>
              <RailHeader
                title={rail.title}
                subtitle={rail.subtitle}
                onPressAll={() => {
                  if (rail.kind === "program") router.push("/programs");
                  if (rail.kind === "workout") router.push("/workouts");
                  if (rail.kind === "recipe") router.push("/explore");
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
                    const p = item as Program;
                    return (
                      <ProgramCard
                        program={{
                          ...p,
                          isActive: p.id === activeProgramId || !!p.isActive,
                        }}
                        onPress={onPressProgram}
                      />
                    );
                  }

                  if (rail.kind === "workout") {
                    const w = item as Workout;
                    return (
                      <MiniCard
                        title={w.title}
                        meta={`${w.type} • ${w.durationMin} min`}
                        imageUrl={w.imageUrl}
                        active={w.id === activeWorkoutId || !!w.isActive}
                        onPress={() => onPressWorkout(w.id)}
                      />
                    );
                  }

                  const r = item as Recipe;
                  return (
                    <MiniCard
                      title={r.title}
                      meta={r.meta}
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
    </View>
  );
}

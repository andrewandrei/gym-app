import SubpageHeader from "@/components/SubpageHeader";
import { PressableScale } from "@/components/ui/PressableScale";
import {
  getPublishedPrograms,
  type SupabaseProgramSummary,
} from "@/features/programs/programs.supabase";
import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";
import { createExploreStyles } from "@/styles/screens/explore.styles";
import { Spacing } from "@/styles/spacing";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Info } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RAIL_GAP = Spacing.md;

type ProgramCardItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  durationWeeks: number | null;
  workoutsPerWeek: number | null;
  equipment: string;
  goal: string;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
};

type ProgramCategory = {
  id: string;
  label: string;
  match: (program: ProgramCardItem) => boolean;
};

type ProgramRail = {
  id: string;
  title: string;
  items: ProgramCardItem[];
};

type FilterOption = "All" | string;

function CategoryPills({
  active,
  onChange,
  colors,
  categories,
}: {
  active: FilterOption;
  onChange: (value: FilterOption) => void;
  colors: any;
  categories: string[];
}) {
  const options: FilterOption[] = ["All", ...categories];
  const BORDER = colors.borderSubtle ?? colors.border;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={pillStyles.rail}
      style={pillStyles.scroll}
    >
      {options.map((opt) => {
        const isActive = opt === active;

        return (
          <PressableScale
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              pillStyles.pill,
              {
                backgroundColor: isActive ? colors.text : colors.card,
                borderColor: isActive ? colors.text : BORDER,
              },
            ]}
            scaleTo={0.985}
            opacityTo={0.92}
          >
            <Text
              style={[
                pillStyles.pillText,
                {
                  color: isActive ? colors.surface : colors.muted,
                  fontWeight: isActive ? "800" : "700",
                },
              ]}
            >
              {opt}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const pillStyles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  rail: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 14,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    minWidth: 62,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: BorderWidth.default,
  },
  pillText: {
    fontSize: 13,
    letterSpacing: -0.05,
  },
});

function uniqueById(items: ProgramCardItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function normalizeToken(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function keywordMatch(program: ProgramCardItem, keyword: string) {
  const haystack = [
    program.title,
    program.subtitle,
    program.description,
    program.equipment,
    program.goal,
    program.level,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(keyword);
}

function formatDuration(durationWeeks: number | null) {
  return durationWeeks ? `${durationWeeks} weeks` : "Program";
}

function formatTag(program: ProgramCardItem) {
  return program.equipment || program.goal || program.subtitle || "Program";
}

function formatWorkoutsPerWeek(program: ProgramCardItem) {
  return program.workoutsPerWeek
    ? `${program.workoutsPerWeek} workouts per week`
    : "Structured weekly plan";
}

function buildCategories(programs: ProgramCardItem[]) {
  const baseCategories: ProgramCategory[] = [
    {
      id: "all",
      label: "All",
      match: () => true,
    },
    {
      id: "featured",
      label: "Featured",
      match: (program) => program.isFeatured,
    },
    {
      id: "active",
      label: "Active",
      match: (program) => program.isActive,
    },
    {
      id: "gym",
      label: "Gym",
      match: (program) => keywordMatch(program, "gym"),
    },
    {
      id: "home",
      label: "Home",
      match: (program) => keywordMatch(program, "home"),
    },
    {
      id: "beginner",
      label: "Beginner",
      match: (program) => keywordMatch(program, "beginner"),
    },
    {
      id: "hyrox",
      label: "Hyrox",
      match: (program) => keywordMatch(program, "hyrox"),
    },
  ];

  const discovered = new Map<string, ProgramCategory>();

  programs.forEach((program) => {
    [program.equipment, program.goal]
      .filter(Boolean)
      .forEach((value) => {
        const label = value.trim();
        const id = normalizeToken(label);

        if (!id || discovered.has(id)) return;

        discovered.set(id, {
          id,
          label,
          match: (candidate) => keywordMatch(candidate, label.toLowerCase()),
        });
      });
  });

  return [...baseCategories, ...Array.from(discovered.values())].filter(
    (category, index, items) =>
      items.findIndex((item) => item.id === category.id) === index &&
      programs.some(category.match),
  );
}

function buildRails(
  programs: ProgramCardItem[],
  selectedCategory: ProgramCategory | undefined,
) {
  const filtered = selectedCategory
    ? uniqueById(programs.filter(selectedCategory.match))
    : programs;
  const active = uniqueById(filtered.filter((program) => program.isActive));
  const featured = uniqueById(
    filtered.filter((program) => program.isFeatured && !program.isActive),
  );
  const beginner = uniqueById(
    filtered.filter((program) => keywordMatch(program, "beginner")),
  );
  const longerPlans = uniqueById(
    filtered.filter((program) => (program.durationWeeks ?? 0) >= 8),
  );

  const rails: ProgramRail[] = [];

  if (selectedCategory?.id === "all") {
    if (active.length > 0) {
      rails.push({
        id: "active",
        title: "Current focus",
        items: active,
      });
    }

    if (featured.length > 0) {
      rails.push({
        id: "featured",
        title: "Featured programs",
        items: featured,
      });
    }

    if (beginner.length > 0) {
      rails.push({
        id: "beginner",
        title: "Start here",
        items: beginner,
      });
    }

    rails.push({
      id: "all-programs",
      title: "All programs",
      items: filtered,
    });

    return rails;
  }

  if (active.length > 0) {
    rails.push({
      id: `${selectedCategory?.id ?? "filtered"}-active`,
      title: `${selectedCategory?.label ?? "Selected"} in progress`,
      items: active,
    });
  }

  if (featured.length > 0) {
    rails.push({
      id: `${selectedCategory?.id ?? "filtered"}-featured`,
      title: `${selectedCategory?.label ?? "Selected"} picks`,
      items: featured,
    });
  }

  if (longerPlans.length > 0 && selectedCategory?.id !== "featured") {
    rails.push({
      id: `${selectedCategory?.id ?? "filtered"}-longer`,
      title: `${selectedCategory?.label ?? "Selected"} longer builds`,
      items: longerPlans,
    });
  }

  rails.push({
    id: `${selectedCategory?.id ?? "filtered"}-all`,
    title: `${selectedCategory?.label ?? "Selected"} programs`,
    items: filtered,
  });

  return rails.filter((rail) => rail.items.length > 0);
}

function RailHeader({
  title,
  eyebrow,
  styles,
}: {
  title: string;
  eyebrow?: string;
  styles: ReturnType<typeof createExploreStyles>;
}) {
  return (
    <View style={styles.railHeaderRow}>
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <Text
            style={{
              marginBottom: 4,
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "rgba(17,17,17,0.42)",
            }}
          >
            {eyebrow}
          </Text>
        ) : null}
        <Text style={styles.railTitle}>{title}</Text>
      </View>
    </View>
  );
}

function ProgramBadge({
  label,
  variant = "light",
  styles,
}: {
  label: string;
  variant?: "light" | "gold";
  styles: ReturnType<typeof createExploreStyles>;
}) {
  return (
    <View style={[styles.badge, variant === "gold" && styles.badgeGold]}>
      <Text
        style={[
          styles.badgeText,
          variant === "gold" && styles.badgeTextGold,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function ProgramCard({
  program,
  styles,
  onPress,
  onPressInfo,
}: {
  program: ProgramCardItem;
  styles: ReturnType<typeof createExploreStyles>;
  onPress: (program: ProgramCardItem) => void;
  onPressInfo: (program: ProgramCardItem) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(program)}
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
          resizeMode="cover"
        />

        <LinearGradient
          colors={[
            "rgba(0,0,0,0)",
            "rgba(0,0,0,0.18)",
            "rgba(0,0,0,0.45)",
            "rgba(0,0,0,0.75)",
          ]}
          locations={[0, 0.35, 0.65, 1]}
          style={styles.programBottomScrim}
          pointerEvents="none"
        />

        <View style={styles.programTopLeft}>
          {program.isActive ? (
            <ProgramBadge label="Active" styles={styles} />
          ) : program.isFeatured ? (
            <ProgramBadge label="Featured" variant="gold" styles={styles} />
          ) : null}
        </View>

        <Pressable
          onPress={() => onPressInfo(program)}
          style={({ pressed }) => [
            styles.infoChip,
            pressed && { opacity: 0.84 },
          ]}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Program info: ${program.title}`}
        >
          <Info size={18} color="#FFFFFF" />
        </Pressable>

        <View style={styles.programBottomRight}>
          <Text style={styles.levelText} allowFontScaling={false}>
            {program.level}
          </Text>
        </View>

        <View style={styles.programTextOverlay}>
          <Text style={styles.programTitleOnImage} numberOfLines={2}>
            {program.title}
          </Text>
          <Text style={styles.programDurationOnImage}>
            {formatDuration(program.durationWeeks)}
          </Text>
        </View>
      </View>

      <Text style={styles.programBelowPrimary} numberOfLines={1}>
        {formatWorkoutsPerWeek(program)}
      </Text>
      <Text style={styles.programBelowSecondary} numberOfLines={1}>
        {formatTag(program)}
      </Text>
    </Pressable>
  );
}

export default function AllProgramsScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(
    () => createExploreStyles(colors, isDark),
    [colors, isDark],
  );
  const [programs, setPrograms] = useState<ProgramCardItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  useEffect(() => {
    let mounted = true;

    function mapProgram(program: SupabaseProgramSummary): ProgramCardItem {
      return {
        id: program.id,
        slug: program.slug,
        title: program.title,
        subtitle: program.subtitle || "Program",
        description:
          program.description || program.subtitle || "Training program",
        level: program.level || "All levels",
        durationWeeks: program.durationWeeks,
        workoutsPerWeek: program.workoutsPerWeek,
        equipment: program.equipment || "",
        goal: program.goal || "",
        imageUrl: program.cardImageUrl || program.heroImageUrl,
        isActive: program.isActive,
        isFeatured: program.isFeatured,
      };
    }

    async function loadPrograms() {
      const nextPrograms = await getPublishedPrograms();

      if (mounted) {
        setPrograms(nextPrograms.map(mapProgram));
      }
    }

    void loadPrograms();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => buildCategories(programs), [programs]);

  useEffect(() => {
    if (!categories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0]?.id ?? "all");
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = useMemo(
    () =>
      categories.find((category) => category.id === selectedCategoryId) ??
      categories[0],
    [categories, selectedCategoryId],
  );

  const rails = useMemo(
    () => buildRails(programs, selectedCategory),
    [programs, selectedCategory],
  );

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/explore");
  };

  const handleOpenProgram = (program: ProgramCardItem) => {
    router.push(`/program/${program.slug}`);
  };

  const handleOpenProgramInfo = (program: ProgramCardItem) => {
    router.push({
      pathname: "/program-info",
      params: { id: program.slug },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SubpageHeader
        title="Programs"
        subtitle="Browse plans by category, goal, and training setup"
        onBack={handleBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
      >
        <CategoryPills
          active={selectedCategory?.label ?? "All"}
          onChange={(value) => {
            const next =
              categories.find((category) => category.label === value) ??
              categories[0];

            if (next) {
              setSelectedCategoryId(next.id);
            }
          }}
          colors={colors}
          categories={categories
            .filter((category) => category.id !== "all")
            .map((category) => category.label)}
        />

        <View style={styles.rails}>
          {rails.map((rail, index) => (
            <View
              key={rail.id}
              style={[styles.rail, index !== 0 && { marginTop: Spacing.xl }]}
            >
              <View style={styles.pad}>
                <RailHeader
                  title={rail.title}
                  eyebrow={selectedCategory?.id === "all" ? undefined : selectedCategory?.label}
                  styles={styles}
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.railListContent}
                decelerationRate={0.998}
                scrollEventThrottle={16}
                bounces
                alwaysBounceHorizontal={false}
              >
                {rail.items.map((program, idx) => (
                  <View
                    key={`${rail.id}_${program.id}`}
                    style={
                      idx !== rail.items.length - 1
                        ? { marginRight: RAIL_GAP }
                        : undefined
                    }
                  >
                    <ProgramCard
                      program={program}
                      styles={styles}
                      onPress={handleOpenProgram}
                      onPressInfo={handleOpenProgramInfo}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

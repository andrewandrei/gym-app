// app/recipes/index.tsx

import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PressableScale } from "@/components/ui/PressableScale";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";

import {
  getAllRecipes,
  RECIPE_CATEGORIES,
  type Recipe,
  type RecipeCategory,
} from "../../features/programs/recipe.data";

// ─── Category pill ───────────────────────────────────────────────────────────

type FilterOption = "All" | RecipeCategory;

function CategoryPills({
  active,
  onChange,
  colors,
  isDark,
}: {
  active: FilterOption;
  onChange: (f: FilterOption) => void;
  colors: any;
  isDark: boolean;
}) {
  const options: FilterOption[] = ["All", ...RECIPE_CATEGORIES];
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

// ─── Recipe card ─────────────────────────────────────────────────────────────

function RecipeCard({
  recipe,
  onPress,
  colors,
}: {
  recipe: Recipe;
  onPress: () => void;
  colors: any;
}) {
  const BORDER = colors.borderSubtle ?? colors.border;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        cardStyles.card,
        {
          backgroundColor: colors.card,
          borderColor: BORDER,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <Image
        source={{ uri: recipe.imageUrl }}
        style={cardStyles.image}
        resizeMode="cover"
      />
      <View style={cardStyles.body}>
        <View style={cardStyles.tagsRow}>
          <View
            style={[
              cardStyles.categoryPill,
              { backgroundColor: colors.premium },
            ]}
          >
            <Text style={cardStyles.categoryPillText}>{recipe.category}</Text>
          </View>
          <Text style={[cardStyles.duration, { color: colors.muted }]}>
            ~{recipe.durationMin} min
          </Text>
        </View>

        <Text
          style={[cardStyles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {recipe.title}
        </Text>

        <Text
          style={[cardStyles.tagline, { color: colors.muted }]}
          numberOfLines={2}
        >
          {recipe.tagline}
        </Text>

        <View style={cardStyles.macrosRow}>
          <Text style={[cardStyles.macroText, { color: colors.muted }]}>
            {recipe.macrosPerServing.calories} kcal
          </Text>
          <Text style={[cardStyles.macroDot, { color: colors.muted }]}>·</Text>
          <Text style={[cardStyles.macroText, { color: colors.muted }]}>
            {recipe.macrosPerServing.protein}g protein
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: BorderWidth.default,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 200,
  },
  body: {
    padding: 16,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111111",
    letterSpacing: -0.05,
  },
  duration: {
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
    lineHeight: 23,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 10,
  },
  macrosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  macroText: {
    fontSize: 12,
    fontWeight: "700",
  },
  macroDot: {
    fontSize: 12,
    fontWeight: "700",
  },
});

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyCategory({
  category,
  colors,
}: {
  category: string;
  colors: any;
}) {
  return (
    <View style={emptyStyles.wrap}>
      <Text style={[emptyStyles.title, { color: colors.text }]}>
        No {category.toLowerCase()} recipes yet
      </Text>
      <Text style={[emptyStyles.body, { color: colors.muted }]}>
        New recipes will appear here as they're added.
      </Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function RecipesListScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");

  const allRecipes = useMemo(() => getAllRecipes(), []);

  const filteredRecipes = useMemo(() => {
    if (activeFilter === "All") return allRecipes;
    return allRecipes.filter((r) => r.category === activeFilter);
  }, [allRecipes, activeFilter]);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ScreenHeader title="Recipes" subtitle="Macro-focused meals" />
        </View>
      </View>

      {/* Category pills */}
      <CategoryPills
        active={activeFilter}
        onChange={setActiveFilter}
        colors={colors}
        isDark={isDark}
      />

      {/* Recipe list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filteredRecipes.length === 0 ? (
          <EmptyCategory
            category={activeFilter === "All" ? "recipe" : activeFilter}
            colors={colors}
          />
        ) : (
          filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              colors={colors}
              onPress={() =>
                router.push({
                  pathname: "/recipes/[id]",
                  params: { id: recipe.id },
                })
              }
            />
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    borderSubtle: string;
    premium: string;
  },
  isDark: boolean,
) {
  const SOFT = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.md,
      paddingTop: 8,
      paddingBottom: 8,
    },

    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
      backgroundColor: SOFT,
      alignItems: "center",
      justifyContent: "center",
    },

    scroll: {
      flex: 1,
    },

    content: {
      paddingHorizontal: Spacing.md,
      paddingTop: 4,
    },

    bottomSpacer: {
      height: 32,
    },
  });
}
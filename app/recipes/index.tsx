// app/recipes/index.tsx

import { useRouter } from "expo-router";
import { ChevronLeft, Lock } from "lucide-react-native";
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

import { PressableScale } from "@/components/ui/PressableScale";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  getAllRecipes,
  type RecipeItem,
} from "@/features/recipes/recipes.supabase";
import { useEntitlements } from "@/providers/entitlements";
import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";

// ─── Category pill ───────────────────────────────────────────────────────────

type FilterOption = "All" | string;

function CategoryPills({
  active,
  onChange,
  colors,
  categories,
}: {
  active: FilterOption;
  onChange: (f: FilterOption) => void;
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

// ─── Locked chip ─────────────────────────────────────────────────────────────

function LockedChip({ isDark }: { isDark: boolean }) {
  return (
    <View style={lockStyles.wrap}>
      <Lock
        size={14}
        color={isDark ? "rgba(255,255,255,0.46)" : "rgba(17,17,17,0.40)"}
      />
    </View>
  );
}

const lockStyles = StyleSheet.create({
  wrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});

// ─── Recipe card ─────────────────────────────────────────────────────────────

function RecipeCard({
  recipe,
  onPress,
  colors,
  isLocked,
  isDark,
}: {
  recipe: RecipeItem;
  onPress: () => void;
  colors: any;
  isLocked: boolean;
  isDark: boolean;
}) {
  const BORDER = colors.borderSubtle ?? colors.border;

  const metaMuted = recipe.calories
    ? `${recipe.calories} kcal · ${recipe.proteinG ?? 0}g protein`
    : recipe.tags.slice(0, 2).join(" · ");

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
      <View>
        <Image
          source={{ uri: recipe.imageUrl }}
          style={cardStyles.image}
          resizeMode="cover"
        />

        {isLocked ? (
          <View style={cardStyles.lockWrap}>
            <LockedChip isDark={isDark} />
          </View>
        ) : null}
      </View>

      <View style={cardStyles.body}>
        <View style={cardStyles.tagsRow}>
          <View
            style={[
              cardStyles.categoryPill,
              { backgroundColor: colors.premium },
            ]}
          >
            <Text
              style={[cardStyles.categoryPillText, { color: colors.onPremium }]}
            >
              {recipe.category || "Recipe"}
            </Text>
          </View>

          <Text style={[cardStyles.duration, { color: colors.muted }]}>
            ~{recipe.prepTimeMin ?? 0} min
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
          {recipe.tags.length > 0 ? recipe.tags.join(" · ") : recipe.category}
        </Text>

        <View style={cardStyles.macrosRow}>
          <Text style={[cardStyles.macroText, { color: colors.muted }]}>
            {metaMuted}
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
  lockWrap: {
    position: "absolute",
    top: 12,
    right: 12,
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
        New recipes will appear here as they&apos;re added.
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
  const { isPro } = useEntitlements();

  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
  const [allRecipes, setAllRecipes] = useState<RecipeItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadRecipes() {
      const recipes = await getAllRecipes();

      if (mounted) {
        setAllRecipes(recipes);
      }
    }

    loadRecipes();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = new Set<string>();

    allRecipes.forEach((recipe) => {
      if (recipe.category) unique.add(recipe.category);
    });

    return Array.from(unique);
  }, [allRecipes]);

  const filteredRecipes = useMemo(() => {
    if (activeFilter === "All") return allRecipes;
    return allRecipes.filter((r) => r.category === activeFilter);
  }, [allRecipes, activeFilter]);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
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

      <CategoryPills
        active={activeFilter}
        onChange={setActiveFilter}
        colors={colors}
        categories={categories}
      />

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
          filteredRecipes.map((recipe) => {
            const isLocked = recipe.access === "premium" && !isPro;

            return (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                colors={colors}
                isDark={isDark}
                isLocked={isLocked}
                onPress={() => {
                  if (isLocked) {
                    router.push("/paywall");
                    return;
                  }

                  router.push({
                    pathname: "/recipes/[id]",
                    params: { id: recipe.slug },
                  });
                }}
              />
            );
          })
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

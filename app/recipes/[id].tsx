// app/recipes/[id].tsx

import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { ChevronLeft, Clock } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import BarbataContentLoading from "@/components/BarbataContentLoading";
import {
  getRecipeBySlug,
  type RecipeItem,
} from "@/features/recipes/recipes.supabase";
import { useEntitlements } from "@/providers/entitlements";
import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";

const HERO_HEIGHT = 400;

type Ingredient = {
  amount: string;
  name: string;
};

type Step = {
  number: number;
  text: string;
};

function buildTagline(recipe: RecipeItem) {
  if (recipe.tags.length > 0) return recipe.tags.join(" · ");

  if (recipe.calories && recipe.proteinG) {
    return `${recipe.calories} kcal · ${recipe.proteinG}g protein`;
  }

  return "Macro-focused meal designed for your plan.";
}

function buildFallbackIngredients(recipe: RecipeItem): Ingredient[] {
  return [
    {
      amount: "Coming soon",
      name: "Ingredients will be added from the admin panel.",
    },
  ];
}

function buildFallbackSteps(): Step[] {
  return [
    {
      number: 1,
      text: "Instructions will be added from the admin panel.",
    },
  ];
}

export default function RecipeDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { isPro } = useEntitlements();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height: screenHeight } = useWindowDimensions();

  const [recipe, setRecipe] = useState<RecipeItem | null>(null);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(
    () => createStyles(colors, isDark, screenHeight),
    [colors, isDark, screenHeight],
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  useEffect(() => {
    let mounted = true;

    async function loadRecipe() {
      if (!id) {
        if (mounted) setLoading(false);
        return;
      }

      const found = await getRecipeBySlug(id);

      if (!mounted) return;

      if (found?.access === "premium" && !isPro) {
        router.replace("/paywall");
        return;
      }

      setRecipe(found);
      setLoading(false);
    }

    loadRecipe();

    return () => {
      mounted = false;
    };
  }, [id, isPro, router]);

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-200, 0, HERO_HEIGHT],
    outputRange: [200, 0, -HERO_HEIGHT * 0.1],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [2, 1],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  const backButtonOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.45, HERO_HEIGHT * 0.65],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });

  const backButtonTranslateY = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.65],
    outputRange: [0, -12],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <BarbataContentLoading
          title="Loading recipe"
          subtitle="Getting the ingredients and steps ready."
          variant="detail"
        />
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Recipe not found</Text>

          <Pressable onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const tagline = buildTagline(recipe);
  const ingredients = buildFallbackIngredients(recipe);
  const steps = buildFallbackSteps();

  const calories = recipe.calories ?? 0;
  const protein = recipe.proteinG ?? 0;
  const carbs = recipe.carbsG ?? 0;
  const fat = recipe.fatG ?? 0;

  return (
    <View style={styles.safe}>
      <View style={styles.heroContainer} pointerEvents="none">
        <Animated.Image
          source={{ uri: recipe.imageUrl }}
          style={[
            styles.heroImage,
            {
              transform: [
                { translateY: imageTranslateY },
                { scale: imageScale },
              ],
            },
          ]}
          resizeMode="cover"
        />
      </View>

      <Animated.View
        style={[
          styles.backBtnWrap,
          {
            top: Math.max(insets.top, 20) + 4,
            opacity: backButtonOpacity,
            transform: [{ translateY: backButtonTranslateY }],
          },
        ]}
      >
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <ChevronLeft size={22} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 24,
        }}
        showsVerticalScrollIndicator={false}
        bounces
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        <View style={styles.heroSpacer} />

        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>

          <Text style={styles.tagline}>{tagline}</Text>

          <View style={styles.metaRow}>
            <Clock size={16} color={colors.muted} strokeWidth={2.2} />
            <Text style={styles.metaText}>
              {recipe.prepTimeMin ?? 0} minutes
            </Text>
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>
                {recipe.category || "Recipe"}
              </Text>
            </View>

            {recipe.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.macrosCard}>
            <Text style={styles.macrosCardTitle}>Per serving</Text>

            <View style={styles.macrosGrid}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{calories}</Text>
                <Text style={styles.macroLabel}>kcal</Text>
              </View>

              <View style={styles.macroDivider} />

              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{protein}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>

              <View style={styles.macroDivider} />

              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{carbs}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>

              <View style={styles.macroDivider} />

              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{fat}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Ingredients</Text>

          <View style={styles.ingredientsList}>
            {ingredients.map((ing, index) => (
              <View
                key={`${ing.name}-${index}`}
                style={[
                  styles.ingredientRow,
                  index < ingredients.length - 1 && styles.ingredientRowBorder,
                ]}
              >
                <Text style={styles.ingredientText}>
                  <Text style={styles.ingredientAmount}>{ing.amount}</Text>
                  {"  "}
                  {ing.name}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
            Instructions
          </Text>

          <View style={styles.stepsList}>
            {steps.map((step, index) => (
              <View
                key={step.number}
                style={[
                  styles.stepRow,
                  index < steps.length - 1 && styles.stepRowSpaced,
                ]}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>

                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
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
    onPremium: string;
  },
  isDark: boolean,
  screenHeight: number,
) {
  const BORDER = colors.borderSubtle ?? colors.border;
  const SOFT = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scroll: {
      flex: 1,
    },

    heroContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: HERO_HEIGHT,
      backgroundColor: isDark ? "#1a1a1a" : "#e5e5e5",
    },

    heroImage: {
      width: "100%",
      height: HERO_HEIGHT,
    },

    heroSpacer: {
      height: HERO_HEIGHT,
      position: "relative",
    },

    backBtnWrap: {
      position: "absolute",
      left: 16,
      zIndex: 10,
    },

    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.30)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.20)",
      alignItems: "center",
      justifyContent: "center",
    },

    content: {
      backgroundColor: colors.background,
      paddingHorizontal: Spacing.md,
      paddingTop: 24,
      marginTop: -20,
      minHeight: screenHeight,
    },

    title: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.4,
    },

    tagline: {
      marginTop: 12,
      fontSize: 16,
      lineHeight: 23,
      fontWeight: "600",
      color: colors.muted,
    },

    metaRow: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    metaText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -0.1,
    },

    tagsRow: {
      marginTop: 14,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    categoryTag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.premium,
    },

    categoryTagText: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.onPremium,
      letterSpacing: -0.05,
    },

    tag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: SOFT,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
    },

    tagText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.muted,
      letterSpacing: -0.05,
    },

    macrosCard: {
      marginTop: 24,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: BorderWidth.default,
      borderColor: BORDER,
      padding: 16,
    },

    macrosCardTitle: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 14,
    },

    macrosGrid: {
      flexDirection: "row",
      alignItems: "center",
    },

    macroItem: {
      flex: 1,
      alignItems: "center",
    },

    macroValue: {
      fontSize: 20,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.3,
    },

    macroLabel: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
    },

    macroDivider: {
      width: StyleSheet.hairlineWidth,
      height: 32,
      backgroundColor: BORDER,
    },

    sectionTitle: {
      marginTop: 28,
      marginBottom: 14,
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.25,
    },

    sectionTitleSpaced: {
      marginTop: 32,
    },

    ingredientsList: {},

    ingredientRow: {
      paddingVertical: 14,
    },

    ingredientRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: BORDER,
    },

    ingredientText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      lineHeight: 22,
    },

    ingredientAmount: {
      fontWeight: "800",
      color: colors.text,
    },

    stepsList: {},

    stepRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
    },

    stepRowSpaced: {
      marginBottom: 20,
    },

    stepNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },

    stepNumberText: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.surface,
    },

    stepText: {
      flex: 1,
      fontSize: 16,
      lineHeight: 23,
      fontWeight: "600",
      color: colors.text,
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },

    emptyTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 16,
    },

    backButton: {
      height: 48,
      paddingHorizontal: 24,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    backButtonText: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.surface,
    },
  });
}

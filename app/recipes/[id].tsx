// app/recipes/[id].tsx

import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { ChevronLeft, Clock } from "lucide-react-native";
import React, { useMemo, useRef } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/app/_providers/theme";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";

import { getRecipe } from "./recipe.data";

const HERO_HEIGHT = 400;

export default function RecipeDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height: screenHeight } = useWindowDimensions();

  const recipe = useMemo(() => getRecipe(id), [id]);
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

  const macros = recipe.macrosPerServing;

  // ── Parallax interpolations ────────────────────────────────
  //
  // Pull-down (scrollY < 0):
  //   - translateY moves the image down 1:1 with overscroll
  //     so the bottom edge stays glued to the content top.
  //   - scale grows the image proportionally so the top edge
  //     doesn't drop below y=0 (stays pinned to screen top).
  //
  // Scroll-up (scrollY > 0):
  //   - subtle upward drift for parallax feel.
  //
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

  // Back button fades out as content scrolls over it
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

  return (
    <View style={styles.safe}>
      {/* ── Parallax hero image (pinned behind scroll) ────────── */}
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

      {/* ── Back button (fades out on scroll) ────────────────── */}
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

      {/* ── Scrollable content ───────────────────────────────── */}
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 24 }}
        showsVerticalScrollIndicator={false}
        bounces
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        {/* Spacer — lets the image show through */}
        <View style={styles.heroSpacer} />

        {/* ── Content (solid bg, slides over image) ──────────── */}
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>

          <Text style={styles.tagline}>{recipe.tagline}</Text>

          <View style={styles.metaRow}>
            <Clock size={16} color={colors.muted} strokeWidth={2.2} />
            <Text style={styles.metaText}>
              {recipe.durationMin} minutes / {recipe.servings}{" "}
              {recipe.servings === 1 ? "serving" : "servings"}
            </Text>
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{recipe.category}</Text>
            </View>
            {recipe.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* ── Macros strip ───────────────────────────────── */}
          <View style={styles.macrosCard}>
            <Text style={styles.macrosCardTitle}>Per serving</Text>
            <View style={styles.macrosGrid}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{macros.calories}</Text>
                <Text style={styles.macroLabel}>kcal</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{macros.protein}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{macros.carbs}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{macros.fat}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
          </View>

          {/* ── Ingredients ────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Ingredients</Text>

          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ing, index) => (
              <View
                key={`${ing.name}-${index}`}
                style={[
                  styles.ingredientRow,
                  index < recipe.ingredients.length - 1 && styles.ingredientRowBorder,
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

          {/* ── Instructions ───────────────────────────────── */}
          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
            Instructions
          </Text>

          <View style={styles.stepsList}>
            {recipe.steps.map((step, index) => (
              <View
                key={step.number}
                style={[
                  styles.stepRow,
                  index < recipe.steps.length - 1 && styles.stepRowSpaced,
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

// ─── Styles ──────────────────────────────────────────────────────────────────

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

    // ── Hero (parallax, pinned) ──────────────────────────────

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

    // ── Back button ──────────────────────────────────────────

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

    // ── Content ──────────────────────────────────────────────

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
      color: "#111111",
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

    // ── Macros ───────────────────────────────────────────────

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

    // ── Sections ─────────────────────────────────────────────

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

    // ── Ingredients ──────────────────────────────────────────

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

    // ── Steps ────────────────────────────────────────────────

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

    // ── Empty state ──────────────────────────────────────────

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
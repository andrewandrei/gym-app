import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/providers/theme";
import type { AppColors } from "@/styles/colors";

const MOTION_OPTIONS = [
  { id: "quiet", label: "Quiet" },
  { id: "capsules", label: "Capsules" },
  { id: "sets", label: "Sets" },
  { id: "wordmark", label: "Wordmark" },
  { id: "cards", label: "Cards" },
] as const;

type MotionId = (typeof MOTION_OPTIONS)[number]["id"];

function PreviewLoader({
  colors,
  isDark,
  mode,
}: {
  colors: AppColors;
  isDark: boolean;
  mode: MotionId;
}) {
  const opacity = useRef(new Animated.Value(0.82)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const wordmarkScale = useRef(new Animated.Value(1)).current;
  const cardY = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const stackValues = useRef([
    new Animated.Value(0.34),
    new Animated.Value(0.34),
    new Animated.Value(0.34),
  ]).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];

    if (mode === "quiet" || mode === "wordmark" || mode === "cards") {
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(floatY, {
              toValue: -4,
              duration: mode === "cards" ? 1400 : 1800,
              useNativeDriver: false,
            }),
            Animated.timing(floatY, {
              toValue: 0,
              duration: mode === "cards" ? 1400 : 1800,
              useNativeDriver: false,
            }),
          ]),
        ),
      );
    } else {
      floatY.setValue(0);
    }

    if (mode === "wordmark" || mode === "cards") {
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 900,
              useNativeDriver: false,
            }),
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 900,
              useNativeDriver: false,
            }),
          ]),
        ),
      );
    } else {
      opacity.setValue(0.96);
    }

    if (mode === "capsules" || mode === "sets") {
      animations.push(
        Animated.loop(
          Animated.stagger(
            mode === "sets" ? 150 : 210,
            stackValues.map((value) =>
              Animated.sequence([
                Animated.timing(value, {
                  toValue: mode === "sets" ? 1 : 0.88,
                  duration: mode === "sets" ? 420 : 560,
                  useNativeDriver: false,
                }),
                Animated.timing(value, {
                  toValue: 0.34,
                  duration: mode === "sets" ? 540 : 760,
                  useNativeDriver: false,
                }),
              ]),
            ),
          ),
        ),
      );
    } else {
      stackValues.forEach((value) => value.setValue(0.52));
    }

    if (mode === "wordmark") {
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(wordmarkScale, {
              toValue: 1.035,
              duration: 1100,
              useNativeDriver: false,
            }),
            Animated.timing(wordmarkScale, {
              toValue: 1,
              duration: 1100,
              useNativeDriver: false,
            }),
          ]),
        ),
      );
    } else {
      wordmarkScale.setValue(1);
    }

    if (mode === "cards") {
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(cardY, {
                toValue: -6,
                duration: 850,
                useNativeDriver: false,
              }),
              Animated.timing(cardScale, {
                toValue: 1.015,
                duration: 850,
                useNativeDriver: false,
              }),
            ]),
            Animated.parallel([
              Animated.timing(cardY, {
                toValue: 0,
                duration: 850,
                useNativeDriver: false,
              }),
              Animated.timing(cardScale, {
                toValue: 1,
                duration: 850,
                useNativeDriver: false,
              }),
            ]),
          ]),
        ),
      );
    } else {
      cardY.setValue(0);
      cardScale.setValue(1);
    }

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [cardScale, cardY, floatY, mode, opacity, stackValues, wordmarkScale]);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const shimmerBase = isDark ? "rgba(255,255,255,0.05)" : "rgba(17,17,17,0.045)";

  return (
    <View style={styles.previewShell}>
      <View style={styles.previewFrame}>
        <Animated.View
          style={[
            styles.lockup,
            {
              opacity,
              transform: [{ translateY: floatY }],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.wordmark,
              { color: colors.premium, transform: [{ scale: wordmarkScale }] },
            ]}
          >
            BARBATA
          </Animated.Text>
          <Text style={[styles.title, { color: colors.text }]}>Curating your feed</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Programs, workouts, and recipes are loading.
          </Text>
          {mode === "capsules" ? (
            <View style={styles.motifRow}>
              {stackValues.map((value, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.motifCapsule,
                    {
                      backgroundColor:
                        index === 1
                          ? colors.premium
                          : isDark
                            ? "rgba(255,255,255,0.14)"
                            : "rgba(17,17,17,0.12)",
                      opacity: value,
                      transform: [
                        {
                          translateY: value.interpolate({
                            inputRange: [0.34, 1],
                            outputRange: [0, -4],
                          }),
                        },
                        {
                          scale: value.interpolate({
                            inputRange: [0.34, 1],
                            outputRange: [0.96, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}

          {mode === "sets" ? (
            <View style={styles.setBarsRow}>
              {stackValues.map((value, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.setBar,
                    {
                      backgroundColor: index === 2 ? colors.premium : colors.text,
                      opacity: value,
                      transform: [
                        {
                          scaleY: value.interpolate({
                            inputRange: [0.34, 1],
                            outputRange: [0.42, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}

          {mode === "wordmark" ? (
            <View
              style={[
                styles.wordmarkUnderline,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(17,17,17,0.12)",
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.wordmarkUnderlineFill,
                  {
                    backgroundColor: colors.premium,
                    opacity,
                    transform: [{ scaleX: wordmarkScale }],
                  },
                ]}
              />
            </View>
          ) : null}
        </Animated.View>

        <View style={styles.cardsWrap}>
          <Animated.View
            style={[
              styles.heroPanel,
              {
                backgroundColor: shimmerBase,
                borderColor: colors.borderSubtle,
                transform: [{ translateY: cardY }, { scale: cardScale }],
              },
            ]}
          />
          <View style={styles.barRow}>
            <View
              style={[
                styles.infoBarWide,
                {
                  backgroundColor: shimmerBase,
                  borderColor: colors.borderSubtle,
                },
              ]}
            />
            <View
              style={[
                styles.infoBarShort,
                {
                  backgroundColor: shimmerBase,
                  borderColor: colors.borderSubtle,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function LoadingLabScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [selectedMode, setSelectedMode] = useState<MotionId>("capsules");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <Text style={styles.heroEyebrow}>Temporary Lab</Text>
          <Text style={styles.heroTitle}>Loading Motion Playground</Text>
          <Text style={styles.heroBody}>
            Let&apos;s shape the animation language here first, then move the winner into the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motion Direction</Text>
          <View style={styles.chipRow}>
            {MOTION_OPTIONS.map((option) => {
              const active = option.id === selectedMode;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSelectedMode(option.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <PreviewLoader colors={colors} isDark={isDark} mode={selectedMode} />

        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Current differences</Text>
          <Text style={styles.noteLine}>Quiet: almost still, just a gentle title breath</Text>
          <Text style={styles.noteLine}>Capsules: small pill rhythm from the Barbata UI language</Text>
          <Text style={styles.noteLine}>Sets: workout-inspired bars, like reps being completed</Text>
          <Text style={styles.noteLine}>Wordmark: brand-first, with the logo carrying the motion</Text>
          <Text style={styles.noteLine}>Cards: content placeholders subtly lift into place</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 48,
      gap: 18,
    },
    heroBlock: {
      gap: 8,
    },
    heroEyebrow: {
      color: colors.premium,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.8,
      textTransform: "uppercase",
    },
    heroTitle: {
      color: colors.text,
      fontSize: 34,
      lineHeight: 37,
      fontWeight: "900",
      letterSpacing: -1.1,
    },
    heroBody: {
      color: colors.muted,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      maxWidth: 460,
    },
    section: {
      gap: 10,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "800",
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: colors.fill,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
    },
    chipActive: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },
    chipText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "800",
    },
    chipTextActive: {
      color: colors.surface,
    },
    previewShell: {
      alignItems: "center",
      marginTop: 4,
    },
    previewFrame: {
      width: "100%",
      maxWidth: 420,
      minHeight: 560,
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: colors.background,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
      paddingHorizontal: 24,
      paddingVertical: 24,
      justifyContent: "center",
    },
    lockup: {
      alignItems: "center",
      zIndex: 2,
    },
    wordmark: {
      fontSize: 14,
      lineHeight: 14,
      fontWeight: "900",
      letterSpacing: 3.1,
    },
    title: {
      marginTop: 16,
      fontSize: 28,
      lineHeight: 31,
      fontWeight: "900",
      letterSpacing: -0.9,
      textAlign: "center",
    },
    subtitle: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      textAlign: "center",
      maxWidth: 300,
    },
    motifRow: {
      marginTop: 18,
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    motifCapsule: {
      width: 22,
      height: 6,
      borderRadius: 999,
    },
    setBarsRow: {
      marginTop: 18,
      height: 24,
      flexDirection: "row",
      gap: 7,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    setBar: {
      width: 8,
      height: 24,
      borderRadius: 999,
    },
    wordmarkUnderline: {
      marginTop: 18,
      width: 96,
      height: 3,
      borderRadius: 999,
      overflow: "hidden",
    },
    wordmarkUnderlineFill: {
      width: "100%",
      height: "100%",
      borderRadius: 999,
    },
    cardsWrap: {
      marginTop: 26,
      gap: 12,
      width: "100%",
      maxWidth: 320,
      alignSelf: "center",
    },
    heroPanel: {
      height: 168,
      borderRadius: 24,
      borderWidth: BorderWidth.default,
    },
    barRow: {
      flexDirection: "row",
      gap: 10,
    },
    infoBarWide: {
      flex: 1,
      height: 14,
      borderRadius: 999,
      borderWidth: BorderWidth.default,
    },
    infoBarShort: {
      width: 88,
      height: 14,
      borderRadius: 999,
      borderWidth: BorderWidth.default,
    },
    notes: {
      marginTop: 4,
      padding: 16,
      borderRadius: 22,
      backgroundColor: colors.card,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
      gap: 8,
    },
    notesTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "900",
    },
    noteLine: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600",
    },
  });
}

const BorderWidth = {
  default: StyleSheet.hairlineWidth,
};

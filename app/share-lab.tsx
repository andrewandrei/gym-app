import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/providers/theme";
import type { AppColors } from "@/styles/colors";

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80",
];

const TEMPLATE_OPTIONS = [
  { id: "corner", label: "Corner" },
  { id: "stacked", label: "Stacked" },
  { id: "hero", label: "Hero" },
  { id: "challenge", label: "Challenge" },
] as const;

type TemplateId = (typeof TEMPLATE_OPTIONS)[number]["id"];

function ShareWordmark({
  styles,
  inverted = false,
}: {
  styles: ReturnType<typeof createStyles>;
  inverted?: boolean;
}) {
  return <Text style={[styles.wordmark, inverted && styles.wordmarkInverted]}>BARBATA</Text>;
}

function PreviewCard({
  imageUri,
  template,
  workoutTitle,
  feeling,
  completion,
  duration,
  prExercise,
  prWeight,
  setsLogged,
  prsCount,
  styles,
}: {
  imageUri: string;
  template: TemplateId;
  workoutTitle: string;
  feeling: string;
  completion: number;
  duration: number;
  prExercise: string;
  prWeight: string;
  setsLogged: string;
  prsCount: number;
  styles: ReturnType<typeof createStyles>;
}) {
  const statPairs =
    template === "corner"
      ? [
          { label: "Complete", value: `${completion}%` },
          { label: "Time", value: `${duration}m` },
          { label: "Sets", value: setsLogged },
        ]
      : template === "stacked"
        ? [
            { label: "Complete", value: `${completion}%` },
            { label: "Time", value: `${duration}m` },
            ...(prsCount > 0 ? [{ label: "PRs", value: String(prsCount) }] : []),
          ]
        : template === "hero"
          ? [
            { label: "Time", value: `${duration}m` },
            { label: "Sets", value: setsLogged },
            ]
          : [
              { label: "Time", value: `${duration}m` },
              { label: "Sets", value: setsLogged },
            ];

  return (
    <View style={styles.previewWrap}>
      <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />

      <LinearGradient
        colors={["rgba(0,0,0,0.00)", "rgba(0,0,0,0.10)", "rgba(0,0,0,0.82)"]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {template === "corner" ? (
        <View style={styles.cornerLayout}>
          <Text style={styles.cornerKicker}>Workout Session</Text>
          <Text style={styles.cornerTitle}>{workoutTitle}</Text>
          <View style={styles.cornerStatsRow}>
            {statPairs.map((stat) => (
              <View key={stat.label} style={styles.cornerStat}>
                <Text style={styles.cornerStatLabel}>{stat.label}</Text>
                <Text style={styles.cornerStatValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.cornerBrandRow}>
            <Text style={styles.cornerFeeling}>{feeling}</Text>
            <ShareWordmark styles={styles} />
          </View>
        </View>
      ) : null}

      {template === "stacked" ? (
        <View style={styles.stackedLayout}>
          <View style={styles.stackedStats}>
            {statPairs.map((stat, index) => (
              <View key={stat.label} style={index > 0 ? styles.stackedStatGap : undefined}>
                <Text style={styles.stackedStatLabel}>{stat.label}</Text>
                <Text style={styles.stackedStatValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.stackedFooter}>
            <ShareWordmark styles={styles} />
            <Text style={styles.stackedWorkout}>{workoutTitle}</Text>
          </View>
        </View>
      ) : null}

      {template === "hero" ? (
        <View style={styles.heroLayout}>
          <View style={styles.heroContentBlock}>
            <Text style={styles.heroKicker}>New Personal Best</Text>
            <Text style={styles.heroNumber}>{prsCount} PR</Text>
            <Text style={styles.heroSubline}>
              PR on {prExercise}
              {prWeight ? ` · ${prWeight}` : ""}
            </Text>
            <View style={styles.heroStatsInline}>
              {statPairs.map((stat) => (
                <View key={stat.label} style={styles.heroInlineStat}>
                  <Text style={styles.heroInlineLabel}>{stat.label}</Text>
                  <Text style={styles.heroInlineValue}>{stat.value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.heroLogoWrap}>
              <ShareWordmark styles={styles} />
            </View>
            <Text style={styles.heroWorkout}>{workoutTitle}</Text>
            <Text style={styles.heroCaption}>Train with me on Barbata app</Text>
          </View>
        </View>
      ) : null}

      {template === "challenge" ? (
        <View style={styles.challengeLayout}>
          <Text style={styles.challengeKicker}>Today&apos;s Work</Text>
          <Text style={styles.challengeTitle}>{workoutTitle}</Text>
          <Text style={styles.challengeMeta}>
            {duration} min · {setsLogged} sets
          </Text>
          <Text style={styles.challengeFeeling}>{feeling || "Still showed up."}</Text>
          <View style={styles.challengeFooter}>
            <ShareWordmark styles={styles} />
            <Text style={styles.challengeCaption}>Train with me on Barbata</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function ShareLabScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("corner");
  const [selectedImage, setSelectedImage] = useState(0);
  const [workoutTitle, setWorkoutTitle] = useState("Upper Body Builder");
  const [feeling, setFeeling] = useState("Still showed up");
  const [prExercise, setPrExercise] = useState("Abs Crunches");
  const [prWeight, setPrWeight] = useState("60 kg");
  const [completion, setCompletion] = useState("60");
  const [duration, setDuration] = useState("18");
  const [setsLogged, setSetsLogged] = useState("6/9");
  const [prsCount, setPrsCount] = useState("1");

  const completionValue = Math.max(0, Math.min(100, Number(completion) || 0));
  const durationValue = Math.max(1, Number(duration) || 1);
  const prsValue = Math.max(0, Number(prsCount) || 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <Text style={styles.heroEyebrow}>Temporary Lab</Text>
          <Text style={styles.heroTitle}>Share Template Playground</Text>
          <Text style={styles.heroBody}>
            Exploring a simpler, Strava-like story direction: fewer elements, stronger photo, cleaner
            stats.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Template Mode</Text>
          <View style={styles.chipRow}>
            {TEMPLATE_OPTIONS.map((option) => {
              const active = option.id === selectedTemplate;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSelectedTemplate(option.id)}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Image Direction</Text>
          <View style={styles.imageThumbRow}>
            {DEMO_IMAGES.map((uri, index) => {
              const active = index === selectedImage;
              return (
                <Pressable
                  key={uri}
                  onPress={() => setSelectedImage(index)}
                  style={[styles.thumbWrap, active && styles.thumbWrapActive]}
                >
                  <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Copy</Text>
          <View style={styles.inputStack}>
            <TextInput
              value={workoutTitle}
              onChangeText={setWorkoutTitle}
              placeholder="Workout title"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <TextInput
              value={feeling}
              onChangeText={setFeeling}
              placeholder="Feeling"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <TextInput
              value={prExercise}
              onChangeText={setPrExercise}
              placeholder="PR exercise"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <TextInput
              value={prWeight}
              onChangeText={setPrWeight}
              placeholder="PR weight"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <View style={styles.inlineInputs}>
              <TextInput
                value={completion}
                onChangeText={setCompletion}
                placeholder="Completion"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                style={[styles.input, styles.inlineInput]}
              />
              <TextInput
                value={duration}
                onChangeText={setDuration}
                placeholder="Duration"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                style={[styles.input, styles.inlineInput]}
              />
            </View>
            <View style={styles.inlineInputs}>
              <TextInput
                value={setsLogged}
                onChangeText={setSetsLogged}
                placeholder="Sets"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.inlineInput]}
              />
              <TextInput
                value={prsCount}
                onChangeText={setPrsCount}
                placeholder="PRs"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                style={[styles.input, styles.inlineInput]}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focused Preview</Text>
          <View style={styles.singlePreviewRow}>
            <PreviewCard
              imageUri={DEMO_IMAGES[selectedImage]}
              template={selectedTemplate}
              workoutTitle={workoutTitle}
              feeling={feeling}
              completion={completionValue}
              duration={durationValue}
              prExercise={prExercise}
              prWeight={prWeight}
              setsLogged={setsLogged}
              prsCount={prsValue}
              styles={styles}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Template Examples</Text>
          <View style={styles.galleryRow}>
            <PreviewCard
              imageUri={DEMO_IMAGES[0]}
              template="corner"
              workoutTitle="Upper Body Builder"
              feeling="Still showed up"
              completion={100}
              duration={18}
              prExercise="Pull-Up"
              prWeight="20 kg"
              setsLogged="9/9"
              prsCount={1}
              styles={styles}
            />
            <PreviewCard
              imageUri={DEMO_IMAGES[1]}
              template="stacked"
              workoutTitle="Dumbbell Legs Burner"
              feeling="Still showed up"
              completion={62}
              duration={24}
              prExercise="Split Squat"
              prWeight="32 kg"
              setsLogged="6/9"
              prsCount={0}
              styles={styles}
            />
            <PreviewCard
              imageUri={DEMO_IMAGES[2]}
              template="hero"
              workoutTitle="Core & Conditioning"
              feeling="Felt strong today"
              completion={83}
              duration={20}
              prExercise="Crunches"
              prWeight="45 kg"
              setsLogged="8/10"
              prsCount={1}
              styles={styles}
            />
            <PreviewCard
              imageUri={DEMO_IMAGES[0]}
              template="challenge"
              workoutTitle="Upper Body Builder"
              feeling="You in?"
              completion={60}
              duration={18}
              prExercise="Pull-Up"
              prWeight="20 kg"
              setsLogged="6/9"
              prsCount={0}
              styles={styles}
            />
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Good Simple Template Rules</Text>
          <Text style={styles.noteLine}>1. Let the photo lead.</Text>
          <Text style={styles.noteLine}>2. Stats should feel like story text, not app cards.</Text>
          <Text style={styles.noteLine}>3. Two or three numbers max.</Text>
          <Text style={styles.noteLine}>4. Keep the Barbata wordmark simple.</Text>
          <Text style={styles.noteLine}>5. Build around the phone story format first.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 48,
      gap: 22,
    },
    heroBlock: {
      gap: 8,
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.premiumText,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    heroTitle: {
      fontSize: 30,
      lineHeight: 34,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.8,
    },
    heroBody: {
      maxWidth: 620,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600",
      color: colors.muted,
    },
    section: {
      gap: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.2,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    chip: {
      minHeight: 38,
      paddingHorizontal: 14,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.fillAlt,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    chipActive: {
      backgroundColor: colors.premiumSoft,
      borderColor: colors.premiumBorder,
    },
    chipText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.text,
    },
    chipTextActive: {
      color: colors.premiumText,
    },
    imageThumbRow: {
      flexDirection: "row",
      gap: 10,
    },
    thumbWrap: {
      width: 82,
      height: 120,
      borderRadius: 18,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "transparent",
    },
    thumbWrapActive: {
      borderColor: colors.premium,
    },
    thumbImage: {
      width: "100%",
      height: "100%",
    },
    inputStack: {
      gap: 10,
    },
    input: {
      minHeight: 48,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: colors.fillAlt,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      color: colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    inlineInputs: {
      flexDirection: "row",
      gap: 10,
    },
    inlineInput: {
      flex: 1,
    },
    singlePreviewRow: {
      alignItems: "center",
      justifyContent: "center",
    },
    galleryRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    previewWrap: {
      width: 243,
      height: 432,
      borderRadius: 0,
      overflow: "hidden",
      backgroundColor: colors.ink,
    },
    previewImage: {
      width: "100%",
      height: "100%",
    },
    cornerLayout: {
      position: "absolute",
      left: 18,
      right: 18,
      bottom: 18,
      gap: 0,
    },
    cornerKicker: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.premiumText,
      letterSpacing: 0.7,
      textTransform: "uppercase",
    },
    cornerTitle: {
      marginTop: 10,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.6,
    },
    cornerStatsRow: {
      marginTop: 18,
      flexDirection: "row",
      gap: 16,
    },
    cornerStat: {
      flex: 1,
    },
    cornerStatLabel: {
      fontSize: 9,
      fontWeight: "800",
      color: "rgba(255,255,255,0.62)",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    cornerStatValue: {
      marginTop: 6,
      fontSize: 16,
      lineHeight: 18,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.35,
    },
    cornerBrandRow: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    cornerFeeling: {
      flex: 1,
      marginRight: 12,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "700",
      color: "rgba(255,255,255,0.82)",
    },
    stackedLayout: {
      position: "absolute",
      left: 26,
      right: 26,
      top: 42,
      bottom: 34,
      alignItems: "center",
      justifyContent: "space-between",
    },
    stackedStats: {
      alignItems: "center",
    },
    stackedStatGap: {
      marginTop: 22,
    },
    stackedStatLabel: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.premiumText,
      letterSpacing: 0.4,
      textAlign: "center",
    },
    stackedStatValue: {
      marginTop: 7,
      fontSize: 27,
      lineHeight: 29,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.8,
      textAlign: "center",
    },
    stackedFooter: {
      alignItems: "center",
      gap: 12,
    },
    stackedWorkout: {
      fontSize: 17,
      lineHeight: 21,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.35,
      textAlign: "center",
    },
    heroLayout: {
      position: "absolute",
      left: 22,
      right: 22,
      top: 28,
      bottom: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    heroContentBlock: {
      width: "100%",
      maxWidth: 188,
      alignItems: "center",
    },
    heroKicker: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.premiumText,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      textAlign: "center",
    },
    heroNumber: {
      marginTop: 18,
      fontSize: 42,
      lineHeight: 42,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -1,
      textAlign: "center",
    },
    heroSubline: {
      marginTop: 12,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "800",
      color: "rgba(255,255,255,0.92)",
      textAlign: "center",
    },
    heroStatsInline: {
      flexDirection: "row",
      gap: 24,
      marginTop: 24,
      alignSelf: "stretch",
    },
    heroInlineStat: {
      flex: 1,
      alignItems: "center",
    },
    heroInlineLabel: {
      fontSize: 9,
      fontWeight: "800",
      color: colors.premiumText,
      textTransform: "uppercase",
      letterSpacing: 0.72,
      textAlign: "center",
    },
    heroInlineValue: {
      marginTop: 6,
      fontSize: 16,
      lineHeight: 18,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.35,
      textAlign: "center",
    },
    heroLogoWrap: {
      marginTop: 28,
      marginBottom: 18,
      paddingVertical: 8,
      paddingHorizontal: 14,
      alignItems: "center",
    },
    heroWorkout: {
      fontSize: 16,
      lineHeight: 19,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.3,
      textAlign: "center",
      maxWidth: 180,
    },
    heroCaption: {
      marginTop: 10,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "700",
      color: "rgba(255,255,255,0.82)",
      textAlign: "center",
      maxWidth: 164,
    },
    challengeLayout: {
      position: "absolute",
      left: 22,
      right: 22,
      bottom: 24,
      alignItems: "center",
    },
    challengeKicker: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.premiumText,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      textAlign: "center",
    },
    challengeTitle: {
      marginTop: 10,
      fontSize: 24,
      lineHeight: 27,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.7,
      textAlign: "center",
      maxWidth: 196,
    },
    challengeMeta: {
      marginTop: 10,
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "800",
      color: "rgba(255,255,255,0.88)",
      textAlign: "center",
    },
    challengeFeeling: {
      marginTop: 14,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: -0.4,
      textAlign: "center",
      maxWidth: 188,
    },
    challengeFooter: {
      marginTop: 24,
      alignItems: "center",
      gap: 10,
    },
    challengeCaption: {
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "700",
      color: "rgba(255,255,255,0.82)",
      textAlign: "center",
      maxWidth: 170,
    },
    noteCard: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      gap: 6,
    },
    noteTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
    },
    noteLine: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "800",
      color: colors.muted,
    },
    wordmark: {
      fontSize: 12,
      lineHeight: 12,
      fontWeight: "900",
      letterSpacing: 1.8,
      textAlign: "center",
      color: colors.premium,
    },
    wordmarkInverted: {
      color: "#FFFFFF",
    },
  });
}

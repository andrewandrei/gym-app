import SubpageHeader from "@/components/SubpageHeader";
import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";
import { Spacing } from "@/styles/spacing";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const programs = [
  {
    id: "p1",
    title: "Strength Foundations",
    meta: "Intermediate · 8 weeks",
    workouts: "21 workouts",
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07d",
  },
  {
    id: "p2",
    title: "Yoga Flow",
    meta: "Beginner · 4 weeks",
    workouts: "12 workouts",
    image: "https://images.unsplash.com/photo-1552058544-f2b08422138a",
  },
  {
    id: "p3",
    title: "Lean Muscle Build",
    meta: "Advanced · 10 weeks",
    workouts: "30 workouts",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
  },
  {
    id: "p4",
    title: "Mobility & Recovery",
    meta: "All Levels · 4 weeks",
    workouts: "10 workouts",
    image: "https://images.unsplash.com/photo-1540206276207-3af25c08d53e",
  },
];

export default function AllProgramsScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SubpageHeader
        title="All Programs"
        subtitle="Find the perfect program for your goals"
        onBack={handleBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {programs.map((program) => (
          <Pressable
            key={program.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <Image
              source={{ uri: program.image }}
              style={styles.image}
              resizeMode="cover"
            />

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{program.title}</Text>
              <Text style={styles.cardMeta}>{program.meta}</Text>
              <Text style={styles.cardSub}>{program.workouts}</Text>
            </View>
          </Pressable>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(
  colors: {
    background: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    borderSubtle: string;
  },
  isDark: boolean,
) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: Spacing.md,
      paddingTop: 4,
      paddingBottom: 40,
    },

    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      overflow: "hidden",
      marginBottom: 16,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
    },

    cardPressed: {
      opacity: 0.94,
    },

    image: {
      width: "100%",
      height: 200,
    },

    cardBody: {
      padding: 18,
    },

    cardTitle: {
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.25,
      marginBottom: 6,
    },

    cardMeta: {
      fontSize: 14,
      lineHeight: 18,
      color: colors.muted,
      fontWeight: "700",
      marginBottom: 4,
    },

    cardSub: {
      fontSize: 13,
      lineHeight: 17,
      color: colors.muted,
      fontWeight: "700",
    },

    bottomSpacer: {
      height: 16,
    },
  });
}
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/ui/PressableScale";
import { getProgram } from "@/features/programs/program.data";
import { useAppTheme } from "@/providers/theme";
import { BorderWidth } from "@/styles/hairline";

export default function ProgramInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useAppTheme();

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const program = useMemo(() => getProgram(id), [id]);

  if (!program) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Program not found</Text>
          <PressableScale onPress={() => router.back()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Close</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 8),
          },
        ]}
      >
        <View style={styles.headerTextWrap}>
          <Text style={styles.eyebrow}>Program overview</Text>
          <Text style={styles.title}>{program.title}</Text>
        </View>

        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={18} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 20) + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.body}>{program.description}</Text>

        <View style={styles.bulletsCard}>
          {program.bullets.map((item, index) => (
            <View
              key={item}
              style={[
                styles.bulletRow,
                index !== program.bullets.length - 1 && styles.bulletRowSpaced,
              ]}
            >
              <View style={styles.bulletDotWrap}>
                <View style={styles.bulletDot} />
              </View>
              <View style={styles.bulletTextWrap}>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{program.meta}</Text>
        </View>

        <PressableScale
          onPress={() => router.back()}
          style={styles.primaryButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text style={styles.primaryButtonText}>Got it</Text>
        </PressableScale>
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
  const soft = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    header: {
      paddingHorizontal: 18,
      paddingBottom: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      borderBottomWidth: BorderWidth.default,
      borderBottomColor: colors.borderSubtle,
      backgroundColor: colors.background,
    },

    headerTextWrap: {
      flex: 1,
      paddingRight: 8,
    },

    eyebrow: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.muted,
      letterSpacing: 0.55,
      textTransform: "uppercase",
      marginBottom: 6,
    },

    title: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.3,
    },

    closeBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: soft,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
    },

    scroll: {
      flex: 1,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 16,
    },

    body: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: colors.muted,
    },

    bulletsCard: {
      marginTop: 18,
      backgroundColor: colors.card,
      borderRadius: 22,
      borderWidth: BorderWidth.default,
      borderColor: colors.borderSubtle,
      padding: 16,
    },

    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },

    bulletRowSpaced: {
      marginBottom: 14,
    },

    bulletDotWrap: {
      width: 12,
      alignItems: "center",
      paddingTop: 6,
    },

    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.premium,
    },

    bulletTextWrap: {
      flex: 1,
    },

    bulletText: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: colors.text,
    },

    metaRow: {
      marginTop: 16,
      alignItems: "center",
    },

    metaText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.muted,
      letterSpacing: -0.05,
    },

    primaryButton: {
      marginTop: 18,
      height: 54,
      borderRadius: 999,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    primaryButtonText: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.surface,
      letterSpacing: -0.1,
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
  });
}
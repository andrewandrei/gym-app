//app/(tabs)/profile.tsx
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  Crown,
  ExternalLink,
  HelpCircle,
  LogOut,
  Moon,
  Ruler,
  Shield,
  Utensils,
} from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ui/ScreenHeader";

import { useAppSettings } from "../_providers/appSettings";
import { useAppTheme } from "../_providers/theme";
import { clearWorkoutDraft } from "../workout/workoutDraft";
import { clearWorkoutHistory } from "../workout/workoutHistory";
import { createProfileStyles } from "./profile.styles";

type RowIcon =
  | "crown"
  | "bell"
  | "moon"
  | "ruler"
  | "utensils"
  | "shield"
  | "help"
  | "logout"
  | "external";

type SettingsRow = {
  key: string;
  title: string;
  subtitle?: string;
  value?: string;
  icon: RowIcon;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
};

function IconDot({
  icon,
  color,
}: {
  icon: RowIcon;
  color: string;
}) {
  const size = 18;

  switch (icon) {
    case "crown":
      return <Crown size={size} color={color} />;
    case "bell":
      return <Bell size={size} color={color} />;
    case "moon":
      return <Moon size={size} color={color} />;
    case "ruler":
      return <Ruler size={size} color={color} />;
    case "utensils":
      return <Utensils size={size} color={color} />;
    case "shield":
      return <Shield size={size} color={color} />;
    case "help":
      return <HelpCircle size={size} color={color} />;
    case "logout":
      return <LogOut size={size} color={color} />;
    case "external":
      return <ExternalLink size={size} color={color} />;
    default:
      return null;
  }
}

function Section({
  title,
  rows,
  styles,
  mutedColor,
  textColor,
}: {
  title: string;
  rows: SettingsRow[];
  styles: ReturnType<typeof createProfileStyles>;
  mutedColor: string;
  textColor: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.group}>
        {rows.map((row, idx) => {
          const isLast = idx === rows.length - 1;

          return (
            <Pressable
              key={row.key}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.pressed,
                isLast ? styles.rowLast : null,
              ]}
              onPress={row.onPress}
              accessibilityRole="button"
              accessibilityLabel={row.title}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconWrap}>
                  <IconDot icon={row.icon} color={textColor} />
                </View>

                <View style={styles.rowText}>
                  <Text
                    style={[
                      styles.rowTitle,
                      row.destructive ? styles.rowTitleDestructive : null,
                    ]}
                    numberOfLines={1}
                  >
                    {row.title}
                  </Text>

                  {!!row.subtitle && (
                    <Text style={styles.rowSubtitle} numberOfLines={1}>
                      {row.subtitle}
                    </Text>
                  )}
                </View>
              </View>

              {row.value ? (
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: mutedColor,
                    marginRight: row.showChevron === false ? 0 : 8,
                  }}
                  numberOfLines={1}
                >
                  {row.value}
                </Text>
              ) : null}

              {row.showChevron === false ? null : (
                <ChevronRight size={18} color={mutedColor} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { settings, setAppearance, setWeightUnit, setNotificationsEnabled } =
    useAppSettings();

  const styles = useMemo(() => createProfileStyles(colors, isDark), [colors, isDark]);

  const name = "Andrei";
  const isPro = false;

  const planLabel = isPro ? "Elite" : "Free";
  const planHint = isPro ? "Active membership" : "Full access on the website";

  const onUpgrade = useCallback(() => {
    router.push("/paywall");
  }, [router]);

  const handleAppearancePress = useCallback(async () => {
    const next = settings.appearance === "light" ? "dark" : "light";
    await setAppearance(next);
  }, [settings.appearance, setAppearance]);

  const handleUnitsPress = useCallback(async () => {
    const next = settings.weightUnit === "kg" ? "lbs" : "kg";
    await setWeightUnit(next);
  }, [settings.weightUnit, setWeightUnit]);

  const handleNotificationsPress = useCallback(async () => {
    await setNotificationsEnabled(!settings.notificationsEnabled);
  }, [settings.notificationsEnabled, setNotificationsEnabled]);

  const handleHelpPress = useCallback(async () => {
    try {
      await Linking.openURL("https://www.andreiandreifit.com");
    } catch {
      Alert.alert("Help", "Support link is not available right now.");
    }
  }, []);

  const handlePrivacyPress = useCallback(async () => {
    try {
      await Linking.openURL("https://www.andreiandreifit.com");
    } catch {
      Alert.alert("Privacy", "Privacy page is not available right now.");
    }
  }, []);

  const handleTermsPress = useCallback(async () => {
    try {
      await Linking.openURL("https://www.andreiandreifit.com");
    } catch {
      Alert.alert("Terms & policies", "Website link is not available right now.");
    }
  }, []);

  const handleNutritionPress = useCallback(() => {
    Alert.alert(
      "Nutrition preferences",
      "This section will connect to your meal and macro preferences next.",
    );
  }, []);

  const handleLogoutPress = useCallback(() => {
    Alert.alert(
      "Log out",
      "This will clear your local workout draft and history on this device for now.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            await clearWorkoutDraft();
            await clearWorkoutHistory();
            Alert.alert("Logged out", "Local workout data was cleared on this device.");
          },
        },
      ],
    );
  }, []);

  const sections = useMemo(() => {
    const account: SettingsRow[] = [
      {
        key: "membership",
        title: isPro ? "Membership" : "Upgrade",
        subtitle: isPro ? "Manage plan" : "Unlock all programs",
        icon: "crown",
        onPress: onUpgrade,
        showChevron: true,
      },
      {
        key: "privacy",
        title: "Privacy",
        subtitle: "Data & permissions",
        icon: "shield",
        onPress: handlePrivacyPress,
        showChevron: true,
      },
    ];

    const preferences: SettingsRow[] = [
      {
        key: "notifications",
        title: "Notifications",
        subtitle: "Reminders & streaks",
        value: settings.notificationsEnabled ? "On" : "Off",
        icon: "bell",
        onPress: handleNotificationsPress,
        showChevron: false,
      },
      {
        key: "appearance",
        title: "Appearance",
        subtitle: "Light / Dark",
        value: settings.appearance === "dark" ? "Dark" : "Light",
        icon: "moon",
        onPress: handleAppearancePress,
        showChevron: false,
      },
      {
        key: "units",
        title: "Units",
        subtitle: "Workout measurements",
        value: settings.weightUnit.toUpperCase(),
        icon: "ruler",
        onPress: handleUnitsPress,
        showChevron: false,
      },
      {
        key: "nutrition",
        title: "Nutrition preferences",
        subtitle: "Macros & foods",
        icon: "utensils",
        onPress: handleNutritionPress,
        showChevron: true,
      },
    ];

    const support: SettingsRow[] = [
      {
        key: "help",
        title: "Help",
        subtitle: "FAQ & contact",
        icon: "help",
        onPress: handleHelpPress,
        showChevron: true,
      },
      {
        key: "terms",
        title: "Terms & policies",
        subtitle: "Read on the website",
        icon: "external",
        onPress: handleTermsPress,
        showChevron: true,
      },
      {
        key: "logout",
        title: "Log out",
        icon: "logout",
        destructive: true,
        onPress: handleLogoutPress,
        showChevron: true,
      },
    ];

    return { account, preferences, support };
  }, [
    handleAppearancePress,
    handleHelpPress,
    handleLogoutPress,
    handleNotificationsPress,
    handleNutritionPress,
    handlePrivacyPress,
    handleTermsPress,
    handleUnitsPress,
    isPro,
    onUpgrade,
    settings.appearance,
    settings.notificationsEnabled,
    settings.weightUnit,
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={name} subtitle="Keep it simple. Execute consistently." />

        <View style={styles.planCard}>
          <View style={styles.planLeft}>
            <Text style={styles.planLabel}>{planLabel}</Text>
            <Text style={styles.planHint}>{planHint}</Text>
          </View>

          {!isPro ? (
            <Pressable
              onPress={onUpgrade}
              style={({ pressed }) => [styles.upgradePill, pressed && styles.pressed]}
            >
              <Text style={styles.upgradePillText}>Upgrade</Text>
            </Pressable>
          ) : (
            <View style={styles.planChip}>
              <Text style={styles.planChipText}>Active</Text>
            </View>
          )}
        </View>

        <Section
          title="Account"
          rows={sections.account}
          styles={styles}
          mutedColor={colors.muted}
          textColor={colors.text}
        />

        <Section
          title="Preferences"
          rows={sections.preferences}
          styles={styles}
          mutedColor={colors.muted}
          textColor={colors.text}
        />

        <Section
          title="Support"
          rows={sections.support}
          styles={styles}
          mutedColor={colors.muted}
          textColor={colors.text}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>AndreiAndreiFit • v0.1</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
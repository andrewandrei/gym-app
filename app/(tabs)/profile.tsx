// app/(tabs)/profile.tsx
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
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Colors } from "@/styles/colors";
import { GlobalStyles } from "@/styles/global";
import { styles } from "./profile.styles";

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
  icon: RowIcon;
  onPress: () => void;
  destructive?: boolean;
};

function IconDot({ icon }: { icon: RowIcon }) {
  const size = 18;
  const color = Colors.text;

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

function Section({ title, rows }: { title: string; rows: SettingsRow[] }) {
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
                  <IconDot icon={row.icon} />
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

              <ChevronRight size={18} color={Colors.muted} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  const name = "Andrei";
  const isPro = false;

  const planLabel = isPro ? "Elite" : "Free";
  const planHint = isPro ? "Active membership" : "Full access on the website";

  const onUpgrade = () => router.push("/paywall");

  const sections = useMemo(() => {
    const account: SettingsRow[] = [
      {
        key: "membership",
        title: isPro ? "Membership" : "Upgrade",
        subtitle: isPro ? "Manage plan" : "Unlock all programs",
        icon: "crown",
        onPress: onUpgrade,
      },
      {
        key: "privacy",
        title: "Privacy",
        subtitle: "Data & permissions",
        icon: "shield",
        onPress: () => {},
      },
    ];

    const preferences: SettingsRow[] = [
      { key: "notifications", title: "Notifications", subtitle: "Reminders & streaks", icon: "bell", onPress: () => {} },
      { key: "appearance", title: "Appearance", subtitle: "Light / Dark", icon: "moon", onPress: () => {} },
      { key: "units", title: "Units", subtitle: "kg, cm", icon: "ruler", onPress: () => {} },
      { key: "nutrition", title: "Nutrition preferences", subtitle: "Macros & foods", icon: "utensils", onPress: () => {} },
    ];

    const support: SettingsRow[] = [
      { key: "help", title: "Help", subtitle: "FAQ & contact", icon: "help", onPress: () => {} },
      { key: "terms", title: "Terms & policies", subtitle: "Read on the website", icon: "external", onPress: () => {} },
      { key: "logout", title: "Log out", icon: "logout", destructive: true, onPress: () => {} },
    ];

    return { account, preferences, support };
  }, [isPro, onUpgrade]);

  return (
   <SafeAreaView style={GlobalStyles.screen} edges={["top"]}>
         <ScrollView 
         style={styles.scroll} 
         contentContainerStyle={styles.content} 
         showsVerticalScrollIndicator={false}>
        {/* DEBUG TOP LINE */}
        <View style={{ height: 1, backgroundColor: "red" }} />

        {/* ✅ CONSISTENT HEADER */}
        <ScreenHeader title={name} subtitle="Keep it simple. Execute consistently." />

        <View style={styles.planCard}>
          <View style={styles.planLeft}>
            <Text style={styles.planLabel}>{planLabel}</Text>
            <Text style={styles.planHint}>{planHint}</Text>
          </View>

          {!isPro ? (
            <Pressable onPress={onUpgrade} style={({ pressed }) => [styles.upgradePill, pressed && styles.pressed]}>
              <Text style={styles.upgradePillText}>Upgrade</Text>
            </Pressable>
          ) : (
            <View style={styles.planChip}>
              <Text style={styles.planChipText}>Active</Text>
            </View>
          )}
        </View>

        <Section title="Account" rows={sections.account} />
        <Section title="Preferences" rows={sections.preferences} />
        <Section title="Support" rows={sections.support} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>AndreiAndreiFit • v0.1</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
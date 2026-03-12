// gym-app/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { BarChart3, LayoutGrid, User } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "../_providers/theme";

/* ---------------------------------- */
/* LABEL MAP                          */
/* ---------------------------------- */
const LABELS: Record<string, string> = {
  index: "Home",
  explore: "Explore",
  progress: "Progress",
  profile: "Profile",
};

/* ---------------------------------- */
/* TAB CONTENT                        */
/* ---------------------------------- */
function TabContent({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const TAB_HEIGHT = 56;
  const BOTTOM_PADDING = insets.bottom;

  return (
    <View
      style={[
        styles.tabInner,
        {
          height: TAB_HEIGHT + BOTTOM_PADDING,
          paddingBottom: BOTTOM_PADDING,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;

        const iconColor = focused ? colors.text : colors.muted;
        const labelColor = focused ? colors.text : colors.muted;

        const onPress = () => navigation.navigate(route.name);

        let icon = null;

        if (route.name === "index") {
          icon = (
            <View
              style={[
                styles.homeDot,
                {
                  backgroundColor: focused ? colors.text : colors.muted,
                },
              ]}
            />
          );
        } else if (route.name === "explore") {
          icon = <LayoutGrid size={20} color={iconColor} />;
        } else if (route.name === "progress") {
          icon = <BarChart3 size={20} color={iconColor} />;
        } else {
          icon = <User size={20} color={iconColor} />;
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [styles.tabButton, pressed && styles.tabPressed]}
          >
            {icon}
            <Text
              style={[
                styles.tabLabel,
                {
                  color: labelColor,
                  opacity: focused ? 1 : 0.72,
                },
              ]}
            >
              {LABELS[route.name] ?? ""}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------------------------------- */
/* TABS LAYOUT                        */
/* ---------------------------------- */
export default function TabsLayout() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
      tabBar={({ state, navigation }) => (
        <View style={styles.tabBarShell}>
          <TabContent state={state} navigation={navigation} />
        </View>
      )}
    />
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
  return StyleSheet.create({
    tabBarShell: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    tabInner: {
      paddingTop: 6,
      flexDirection: "row",
      backgroundColor: colors.surface,
    },

    tabButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 4,
    },

    tabPressed: {
      opacity: 0.8,
    },

    homeDot: {
      width: 26,
      height: 26,
      borderRadius: 13,
    },

    tabLabel: {
      fontSize: 11,
      fontWeight: "500",
      letterSpacing: -0.05,
    },
  });
}
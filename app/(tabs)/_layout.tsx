// gym-app/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { BarChart3, LayoutGrid, User } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/styles/colors";

/* ---------------------------------- */
/* LABEL MAP                           */
/* ---------------------------------- */
const LABELS: Record<string, string> = {
  index: "Home",
  explore: "Explore",
  progress: "Progress",
  profile: "Profile",
};

/* ---------------------------------- */
/* TAB CONTENT                         */
/* ---------------------------------- */
function TabContent({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets();

  // ✅ Deterministic, Apple-like height
  // Visual bar height = 56 + safe-area bottom inset (home indicator area)
  const TAB_HEIGHT = 56;
  const BOTTOM_PADDING = insets.bottom;

  return (
    <View
      style={{
        height: TAB_HEIGHT + BOTTOM_PADDING,
        paddingBottom: BOTTOM_PADDING,
        paddingTop: 6,
        flexDirection: "row",
        backgroundColor: Colors.surface,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;

        const iconColor = focused ? "#000000" : "rgba(0,0,0,0.45)";
        const onPress = () => navigation.navigate(route.name);

        let icon = null;

        if (route.name === "index") {
          icon = (
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: focused ? "#000000" : "rgba(0,0,0,0.45)",
              }}
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
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 4,
            }}
          >
            {icon}
            <Text
              style={{
                fontSize: 11,
                color: "#000000",
                opacity: focused ? 1 : 0.55,
              }}
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
/* TABS LAYOUT                         */
/* ---------------------------------- */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // ✅ Keep RN tab bar styling neutral; we render a custom bar below
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
      }}
      tabBar={({ state, navigation }) => (
        <View
          style={{
            backgroundColor: Colors.surface,
            borderTopWidth: 0.5,
            borderTopColor: Colors.border,
          }}
        >
          <TabContent state={state} navigation={navigation} />
        </View>
      )}
    />
  );
}
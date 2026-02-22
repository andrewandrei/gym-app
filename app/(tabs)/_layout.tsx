import { Colors } from "@/styles/colors";
import { Tabs } from "expo-router";
import { BarChart3, LayoutGrid, User } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const TAB_HEIGHT = 50;
  const BOTTOM_PADDING = Math.max(8, insets.bottom);

  return (
    <View
      style={{
        height: TAB_HEIGHT + BOTTOM_PADDING,
        paddingBottom: BOTTOM_PADDING,
        paddingTop: 6,
        flexDirection: "row",
        backgroundColor: Colors.surface, // ✅ SOLID WHITE
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
        tabBarStyle: {
          backgroundColor: Colors.surface, // 👈 FORCE WHITE AT NATIVE LEVEL
        },
      }}
      tabBar={({ state, navigation }) => (
        <View
          style={{
            backgroundColor: Colors.surface, // 👈 FORCE WHITE AGAIN
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

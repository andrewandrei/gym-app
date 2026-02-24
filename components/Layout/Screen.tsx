import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React from "react";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean; // horizontal padding
  topSpace?: number; // optional extra top spacing under safe area
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  topSpace = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const horizontal = padded ? 16 : 0;

  const bottomPad = tabBarHeight + insets.bottom + 16; // consistent everywhere
  const topPad = topSpace; // keep safe area only, add deliberate spacing if wanted

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: horizontal,
            paddingTop: topPad,
            paddingBottom: bottomPad,
          }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior={Platform.OS === "ios" ? "never" : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            paddingHorizontal: horizontal,
            paddingTop: topPad,
            paddingBottom: bottomPad,
          }}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
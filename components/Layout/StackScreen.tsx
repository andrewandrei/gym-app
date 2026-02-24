import { Colors } from "@/styles/colors";
import React from "react";
import { Platform, ScrollView, View, ViewStyle } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  topSpace?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export function StackScreen({
  children,
  scroll = true,
  padded = true,
  topSpace = 0,
  style,
  contentStyle,
}: Props) {
  const insets = useSafeAreaInsets();
  const padX = padded ? 16 : 0;
  const padBottom = insets.bottom + 16;

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: Colors.surface }, style]} edges={["top"]}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior={Platform.OS === "ios" ? "never" : undefined}
          contentContainerStyle={[
            {
              paddingHorizontal: padX,
              paddingTop: topSpace,
              paddingBottom: padBottom,
            },
            contentStyle,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            {
              flex: 1,
              paddingHorizontal: padX,
              paddingTop: topSpace,
              paddingBottom: padBottom,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
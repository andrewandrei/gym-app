// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { EntitlementsProvider } from "./_providers/entitlements";
import { ThemeProvider, useAppTheme } from "./_providers/theme";

function RootNavigator() {
  const { colors } = useAppTheme();

  const StackTree = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <EntitlementsProvider>
          {Platform.OS === "web" ? (
            <View style={[webStyles.page, { backgroundColor: colors.background }]}>
              <View
                style={[
                  webStyles.phoneFrame,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {StackTree}
              </View>
            </View>
          ) : (
            StackTree
          )}
        </EntitlementsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

const webStyles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 16,
    paddingBottom: 16,
  },
  phoneFrame: {
    width: 420,
    height: "96vh",
    maxHeight: 920,
    minHeight: 720,
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: 1,
  },
});
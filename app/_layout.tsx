import { Stack } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Colors } from "@/styles/colors";
import { EntitlementsProvider } from "./_providers/entitlements";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <EntitlementsProvider>
          <View style={Platform.OS === "web" ? webStyles.page : styles.flex}>
            <View style={Platform.OS === "web" ? webStyles.phoneFrame : styles.flex}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="paywall"
                  options={{
                    presentation: "modal",
                    headerShown: false,
                  }}
                />
              </Stack>
            </View>
          </View>
        </EntitlementsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

const webStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.surface,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
});

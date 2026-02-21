import { Stack } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Colors } from "@/styles/colors";
import { EntitlementsProvider } from "./_providers/entitlements";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <EntitlementsProvider>
        <View style={Platform.OS === "web" ? webStyles.page : styles.flex}>
          <View style={Platform.OS === "web" ? webStyles.phoneFrame : styles.flex}>
            <Stack
              screenOptions={{
                headerShown: false,
                // Critical: allow transparentModal backdrop to be visible
                contentStyle: { backgroundColor: "transparent" },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              {/* Paywall modal */}
              <Stack.Screen
                name="paywall"
                options={{
                  presentation: "transparentModal",
                  animation: "fade",
                  headerShown: false,
                }}
              />
            </Stack>
          </View>
        </View>
      </EntitlementsProvider>
    </SafeAreaProvider>
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

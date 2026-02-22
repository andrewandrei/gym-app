import { Stack } from "expo-router";

export default function WorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,

        // critical: prevents iOS interactive pop from fighting with horizontal swipes
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}

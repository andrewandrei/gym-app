import { Stack } from "expo-router";

export default function WorkoutLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* index.tsx will render as /workout */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

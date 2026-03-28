// app/recipes/_layout.tsx
import { Stack } from "expo-router";

export default function RecipesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "card",
      }}
    />
  );
}
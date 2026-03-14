import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="screen1" />
      <Stack.Screen name="screen2" />
      <Stack.Screen name="screen3" />
    </Stack>
  );
}

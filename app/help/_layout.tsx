import { Stack } from "expo-router";

export default function HelpLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="shipping" />
      <Stack.Screen name="returns" />
      <Stack.Screen name="size-guide" />
      <Stack.Screen name="care" />
    </Stack>
  );
}

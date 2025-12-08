import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="products" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="coupons" />
      <Stack.Screen name="instagram" />
    </Stack>
  );
}

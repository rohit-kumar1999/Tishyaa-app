import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "card",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-otp" />
    </Stack>
  );
}

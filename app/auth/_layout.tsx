import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack, useSegments } from "expo-router";
import React from "react";

export default function AuthLayout() {
  const { isSignedIn } = useAuth();
  const segments = useSegments();
  const currentUrl = "/" + segments.join("/");

  // Allow password reset even when signed in
  if (isSignedIn && !currentUrl.includes("forgot-password")) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "card",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-otp" />
    </Stack>
  );
}

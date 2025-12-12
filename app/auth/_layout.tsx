import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack, useSegments } from "expo-router";
import React from "react";

export default function AuthLayout() {
  const { isSignedIn } = useAuth();
  const segments = useSegments();
  const currentUrl = "/" + segments.join("/");

  if (isSignedIn && !currentUrl.includes("forgot-password")) {
    return <Redirect href="/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "card",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, title: "" }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
    </Stack>
  );
}

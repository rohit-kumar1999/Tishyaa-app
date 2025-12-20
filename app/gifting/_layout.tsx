import { Stack } from "expo-router";
import React from "react";

export default function ProductDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "card",
      }}
    >
      <Stack.Screen name="gifting" />
    </Stack>
  );
}

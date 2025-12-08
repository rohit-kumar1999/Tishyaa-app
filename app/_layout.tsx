import { CartProvider } from "@/src/contexts";
import { Stack } from "expo-router";
import React from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="products" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="categories" options={{ headerShown: false }} />
          <Stack.Screen
            name="category/[slug]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
          <Stack.Screen
            name="order-confirmation"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="search" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="contact" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="more" options={{ headerShown: false }} />

          {/* Authentication */}
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/forgot-password"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/verify-otp"
            options={{ headerShown: false }}
          />

          {/* Admin */}
          <Stack.Screen name="admin" options={{ headerShown: false }} />

          {/* Help */}
          <Stack.Screen name="help" options={{ headerShown: false }} />

          {/* Profile */}
          <Stack.Screen
            name="profile/orders"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="profile/addresses"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="profile/preferences"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="profile/account"
            options={{ headerShown: false }}
          />
        </Stack>
      </CartProvider>
    </SafeAreaProvider>
  );
}

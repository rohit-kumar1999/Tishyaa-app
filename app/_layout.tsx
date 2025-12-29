import { AuthInitializer } from "@/components/AuthInitializer";
import { CartProvider, WishlistProvider } from "@/contexts";
import { ApiCartProvider } from "@/contexts/ApiCartContext";
import { queryClient } from "@/setup/api";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Get the publishable key
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

// Inner layout that requires auth to be loaded
function InnerLayout() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e11d48" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <WishlistProvider>
        <CartProvider>
          <ApiCartProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#ffffff" },
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="home" options={{ headerShown: false }} />
              <Stack.Screen name="products" options={{ headerShown: false }} />
              <Stack.Screen name="product" options={{ headerShown: false }} />
              <Stack.Screen
                name="categories"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="gifting" options={{ headerShown: false }} />
              <Stack.Screen name="cart" options={{ headerShown: false }} />
              <Stack.Screen name="checkout" options={{ headerShown: false }} />
              <Stack.Screen
                name="order-confirmation"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="search" options={{ headerShown: false }} />
              <Stack.Screen name="wishlist" options={{ headerShown: false }} />
              <Stack.Screen name="about" options={{ headerShown: false }} />
              <Stack.Screen name="contact" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="more" options={{ headerShown: false }} />

              {/* Authentication - nested routes handled by auth/_layout.tsx */}
              <Stack.Screen name="auth" options={{ headerShown: false }} />

              {/* Help */}
              <Stack.Screen name="help" options={{ headerShown: false }} />

              {/* Category */}
              <Stack.Screen name="category" options={{ headerShown: false }} />

              {/* Profile nested routes */}
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
                name="profile/account-settings"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="profile/update-password"
                options={{ headerShown: false }}
              />
            </Stack>
          </ApiCartProvider>
        </CartProvider>
      </WishlistProvider>
      <Toast />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer />
        <InnerLayout />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fdf2f8",
  },
});

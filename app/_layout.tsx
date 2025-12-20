import { AuthInitializer } from "@/src/components/AuthInitializer";
import { CartProvider, WishlistProvider } from "@/src/contexts";
import { ApiCartProvider } from "@/src/contexts/ApiCartContext";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer />
        <SafeAreaProvider>
          <WishlistProvider>
            <CartProvider>
              <ApiCartProvider>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="home" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="products"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="product"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="categories"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="gifting"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="cart" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="checkout"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="order-confirmation"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="search"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="wishlist"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="about" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="contact"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="profile"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="more" options={{ headerShown: false }} />

                  {/* Authentication */}
                  <Stack.Screen name="auth" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="auth/login"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="auth/register"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="auth/sign-in"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="auth/sign-up"
                    options={{ headerShown: false }}
                  />
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
      </QueryClientProvider>
    </ClerkProvider>
  );
}

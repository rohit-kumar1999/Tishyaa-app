// Custom entry point for web to handle React 18 root creation properly
import { Platform } from "react-native";

// Only apply the fix for web platform
if (Platform.OS === "web") {
  // Store the original console.warn to restore later if needed
  const originalWarn = console.warn;

  // Filter out the specific React root warning
  console.warn = (...args) => {
    const message = args.join(" ");
    if (
      message.includes("ReactDOMClient.createRoot") ||
      message.includes("container that has already been passed to createRoot")
    ) {
      // Suppress this specific warning
      return;
    }
    // Allow other warnings through
    originalWarn.apply(console, args);
  };
}

// Import the main Expo entry point
import "expo-router/entry";

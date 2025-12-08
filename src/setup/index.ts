// Main setup exports
export { api, queryClient } from "./api";

// Configuration constants
export const CONFIG = {
  API_BASE_URL: "http://localhost:3000",
  API_TIMEOUT: 10000,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  IMAGE_CACHE_SIZE: 100,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 16, // ~60fps
  PAGINATION_LIMIT: 20,
};

// Storage keys
export const STORAGE_KEYS = {
  CART: "@tishyaa_cart",
  CART_METADATA: "@tishyaa_cart_metadata",
  USER: "@tishyaa_user",
  WISHLIST: "@tishyaa_wishlist",
  SETTINGS: "@tishyaa_settings",
  SEARCH_HISTORY: "@tishyaa_search_history",
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  AUTH_REQUIRED: "Please sign in to continue.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
  CART_ERROR: "Failed to update cart.",
  PAYMENT_ERROR: "Payment processing failed.",
};

// API setup for React Native with environment detection
import { Platform } from "react-native";

interface ApiConfig {
  baseURL: string;
  timeout: number;
}

// Global auth state for API client
let globalGetToken: (() => Promise<string | null>) | null = null;
let globalGetUserId: (() => string | null) | null = null;

// Function to set the auth token getter
export const setAuthTokenGetter = (getToken: () => Promise<string | null>) => {
  globalGetToken = getToken;
};

// Function to set the user ID getter
export const setUserIdGetter = (getUserId: () => string | null) => {
  globalGetUserId = getUserId;
};

// Environment detection
const getBaseURL = (): string => {
  const isDev = __DEV__;

  if (!isDev) {
    // Production URL
    return "https://kaess-be.vercel.app";
  }

  // Development URL - Use local backend on port 3000
  if (Platform.OS === "web") {
    // Web can directly access localhost:3000
    return "http://localhost:3000";
  } else {
    // Mobile devices need to use the CORS proxy on port 3001
    // The proxy forwards requests to localhost:3000
    // Replace with your machine's IP address if needed
    return "https://kaess-be.vercel.app";
  }
};

class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  async request(url: string, options: RequestInit = {}): Promise<any> {
    const fullUrl = `${this.config.baseURL}${url}`;

    const defaultHeaders: Record<string, string> = {
      Accept: "application/json",
    };

    // Only add Content-Type for non-FormData requests
    const isFormData = options.body instanceof FormData;
    if (!isFormData) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    // Add Clerk authentication header if available
    if (globalGetToken) {
      try {
        const token = await globalGetToken();
        if (token) {
          defaultHeaders["Authorization"] = `Bearer ${token}`;
        }
      } catch {
        // Token fetch failed
      }
    }

    // Add user ID header if available
    if (globalGetUserId) {
      try {
        const userId = globalGetUserId();
        if (userId) {
          defaultHeaders["x-user-id"] = userId;
          defaultHeaders["x-user-role"] = "user"; // Default role, can be made configurable later
        }
      } catch {
        // User ID fetch failed
      }
    }

    try {
      // Create AbortController for timeout functionality
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `API Error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(
            `Request timeout: The request to ${this.config.baseURL} took longer than ${this.config.timeout}ms`
          );
        }
        if (
          error.message.includes("Network request failed") ||
          error.message.includes("Failed to fetch")
        ) {
          throw new Error(
            `Network Error: Unable to connect to ${this.config.baseURL}. Make sure your backend is running and accessible.`
          );
        }
      }

      throw error;
    }
  }

  get(url: string, options?: RequestInit) {
    return this.request(url, { ...options, method: "GET" });
  }

  post(url: string, data?: any, options?: RequestInit) {
    return this.request(url, {
      ...options,
      method: "POST",
      body:
        data instanceof FormData
          ? data
          : data
          ? JSON.stringify(data)
          : undefined,
    });
  }

  put(url: string, data?: any, options?: RequestInit) {
    return this.request(url, {
      ...options,
      method: "PUT",
      body:
        data instanceof FormData
          ? data
          : data
          ? JSON.stringify(data)
          : undefined,
    });
  }

  delete(url: string, options?: RequestInit) {
    return this.request(url, { ...options, method: "DELETE" });
  }
}

// Create API instance with environment-aware configuration
export const api = new ApiClient({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 seconds timeout for slower network/emulator connections
});

// Export the base URL for debugging
export const API_BASE_URL = getBaseURL();

// Utility function to test API connectivity
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Try health endpoint first, fallback to root
    const baseUrl = getBaseURL();
    let response;

    try {
      response = await fetch(`${baseUrl}/health`, {
        method: "GET",
        signal: controller.signal,
      });
    } catch {
      // If /health fails, try root endpoint
      response = await fetch(baseUrl, {
        method: "GET",
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

export default api;

// Re-export QueryClient from React Query
// The actual QueryClient instance is created in _layout.tsx and accessed via useQueryClient hook
import { QueryClient } from "@tanstack/react-query";

// Create a singleton QueryClient for use in mutations and invalidation
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

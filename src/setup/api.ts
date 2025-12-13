// API setup for React Native with environment detection
import { Platform } from "react-native";

interface ApiConfig {
  baseURL: string;
  timeout: number;
}

// Environment detection
const getBaseURL = (): string => {
  const isDev = __DEV__;

  if (!isDev) {
    // Production URL
    return "https://kaess-be.vercel.app";
  }

  // Development URL
  // Android Emulator maps localhost to 10.0.2.2
  if (Platform.OS === "android") {
    // Check if running in emulator by trying to detect the environment
    // In most cases, you'll want to use tunnel mode for Android
    return "http://localhost:3000";
  }

  // For iOS Simulator, web, and other platforms, localhost works fine
  return "http://localhost:3000";
};

class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  async request(url: string, options: RequestInit = {}): Promise<any> {
    const fullUrl = `${this.config.baseURL}${url}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    try {
      console.log(`🌐 API Request: ${options.method || "GET"} ${fullUrl}`);

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
      console.log(`✅ API Success: ${options.method || "GET"} ${fullUrl}`);
      return data;
    } catch (error) {
      console.error(
        `❌ API Failed: ${options.method || "GET"} ${fullUrl}`,
        error
      );

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
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put(url: string, data?: any, options?: RequestInit) {
    return this.request(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete(url: string, options?: RequestInit) {
    return this.request(url, { ...options, method: "DELETE" });
  }
}

// Create API instance with environment-aware configuration
export const api = new ApiClient({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 seconds timeout
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
  } catch (error) {
    console.error("API Connection Test Failed:", error);
    return false;
  }
};

export default api;

// Query client placeholder - in production, you'd set up React Query properly
export const queryClient = {
  invalidateQueries: (options: { queryKey: string[] }) => {
    // Placeholder - implement proper query invalidation
    console.log("Invalidating queries:", options.queryKey);
  },
};

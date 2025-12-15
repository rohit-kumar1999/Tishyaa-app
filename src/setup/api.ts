// API setup for React Native with environment detection

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

  // Development URL - Use production API for mobile devices
  // Since localhost:3000 doesn't work on mobile devices (iOS/Android)
  // We'll use the production server for all platforms in development
  return "https://kaess-be.vercel.app";

  // Note: If you have a local development server and want to use it for web only,
  // you can uncomment and modify the following:
  // if (Platform.OS === "web") {
  //   return "http://localhost:3000";
  // }
  // return "https://kaess-be.vercel.app";
};

class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  async request(url: string, options: RequestInit = {}): Promise<any> {
    const fullUrl = `${this.config.baseURL}${url}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add Clerk authentication header if available
    if (globalGetToken) {
      try {
        const token = await globalGetToken();
        if (token) {
          defaultHeaders["Authorization"] = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn("Failed to get auth token:", error);
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
      } catch (error) {
        console.warn("Failed to get user ID:", error);
      }
    }

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

// Simple query client implementation with active query tracking
class SimpleQueryClient {
  private activeQueries = new Map<string, () => void>();

  registerQuery(key: string, refetchFn: () => void) {
    this.activeQueries.set(key, refetchFn);
  }

  unregisterQuery(key: string) {
    this.activeQueries.delete(key);
  }

  invalidateQueries(options: { queryKey: string[] }) {
    console.log("Invalidating queries:", options.queryKey);
    options.queryKey.forEach((key) => {
      const refetchFn = this.activeQueries.get(key);
      if (refetchFn) {
        console.log(`Refetching query: ${key}`);
        refetchFn();
      }
    });
  }
}

export const queryClient = new SimpleQueryClient();

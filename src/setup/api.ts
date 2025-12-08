// Basic API setup for React Native
// This is a simplified version - in production you'd want a full axios setup

interface ApiConfig {
  baseURL: string;
  timeout: number;
}

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

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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

// Create API instance
export const api = new ApiClient({
  baseURL: "http://192.168.29.195:3000", // Local backend API using IP address to avoid CORS issues
  timeout: 10000,
});

export default api;

// Query client placeholder - in production, you'd set up React Query properly
export const queryClient = {
  invalidateQueries: (options: { queryKey: string[] }) => {
    // Placeholder - implement proper query invalidation
    console.log("Invalidating queries:", options.queryKey);
  },
};

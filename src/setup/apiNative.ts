// Alternative API client specifically for React Native to bypass CORS issues
interface ApiConfig {
  baseURL: string;
  timeout: number;
}

class ReactNativeApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private createXMLHttpRequest(): Promise<XMLHttpRequest> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      resolve(xhr);
    });
  }

  async request(url: string, options: RequestInit = {}): Promise<any> {
    const fullUrl = `${this.config.baseURL}${url}`;

    return new Promise(async (resolve, reject) => {
      try {
        const xhr = await this.createXMLHttpRequest();

        const method = (options.method || "GET").toUpperCase();

        xhr.open(method, fullUrl, true);

        // Set headers
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");

        // Add custom headers
        if (options.headers) {
          Object.entries(options.headers).forEach(([key, value]) => {
            if (typeof value === "string") {
              xhr.setRequestHeader(key, value);
            }
          });
        }

        xhr.timeout = this.config.timeout;

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (parseError) {
              reject(new Error(`Failed to parse response: ${parseError}`));
            }
          } else {
            reject(
              new Error(
                `API Error: ${xhr.status} ${xhr.statusText} - ${xhr.responseText}`
              )
            );
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network request failed"));
        };

        xhr.ontimeout = () => {
          reject(new Error("Request timeout"));
        };

        // Send request
        if (options.body) {
          xhr.send(options.body);
        } else {
          xhr.send();
        }
      } catch (error) {
        reject(error);
      }
    });
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

// Create native API instance
export const nativeApi = new ReactNativeApiClient({
  baseURL: "http://192.168.29.195:3000",
  timeout: 15000,
});

export default nativeApi;

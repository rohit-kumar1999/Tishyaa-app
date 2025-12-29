import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import api from "../setup/api";
import { toast } from "./use-toast";

// Common options for API query hooks
interface ApiQueryOptions {
  invalidateQueries?: string | string[];
  successMessage?: string;
  errorMessage?: string;
  transformRequest?: (data: any) => any;
}

// Simple query state interface
interface QueryState<T> {
  data: T | null;
  isLoading: boolean; // True only on initial load with no cached data
  isFetching: boolean; // True when fetching (including background)
  error: Error | null;
  refetch: () => Promise<void>;
}

// Hook to wrap API GET requests with TanStack Query caching
// Uses stale-while-revalidate: shows cached data immediately, fetches in background
export const useApiQuery = <T = unknown>(
  url: string,
  options?: Omit<ApiQueryOptions, "invalidateQueries"> & {
    enabled?: boolean;
    dependencies?: any[];
    staleTime?: number;
    gcTime?: number;
    refetchOnMount?: boolean | "always";
    refetchOnWindowFocus?: boolean;
  }
): QueryState<T> => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime = 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnMount = true, // Refetch in background when mounting
    refetchOnWindowFocus = false,
  } = options || {};

  const query = useQuery<T, Error>({
    queryKey: [url],
    queryFn: async () => {
      const response = await api.get(url);
      return response as T;
    },
    enabled,
    staleTime,
    gcTime,
    refetchOnMount,
    refetchOnWindowFocus,
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    // Key for stale-while-revalidate: keep showing previous data while fetching
    placeholderData: (previousData) => previousData,
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return {
    data: query.data ?? null,
    // isLoading: true only when pending (no data yet and fetching)
    isLoading: query.isPending && !query.data,
    // isFetching: true when any fetch is happening (including background)
    isFetching: query.isFetching,
    // Only show error if we have no data to display
    error: query.data ? null : query.error ?? null,
    refetch,
  };
};

// Simple mutation state interface
interface MutationState<T> {
  mutate: (data?: any, callbacks?: MutationCallbacks<T>) => Promise<T | null>;
  isLoading: boolean;
  error: Error | null;
}

interface MutationCallbacks<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

// Hook to wrap API POST requests with React Query
export const useApiMutation = <T = unknown, D = unknown>(
  url: string,
  options?: ApiQueryOptions & {
    method?: "POST" | "PUT" | "PATCH";
  }
): MutationState<T> => {
  const {
    invalidateQueries,
    successMessage,
    errorMessage,
    transformRequest,
    method = "POST",
  } = options || {};

  const queryClientInstance = useQueryClient();

  const mutation = useMutation<T, Error, D>({
    mutationFn: async (data?: D) => {
      const transformedData = transformRequest ? transformRequest(data) : data;
      let response: T;

      switch (method) {
        case "POST":
          response = await api.post(url, transformedData);
          break;
        case "PUT":
          response = await api.put(url, transformedData);
          break;
        case "PATCH":
          response = await api.put(url, transformedData);
          break;
        default:
          response = await api.post(url, transformedData);
      }

      return response;
    },
    onSuccess: () => {
      // Handle query invalidation
      if (invalidateQueries) {
        if (Array.isArray(invalidateQueries)) {
          invalidateQueries.forEach((query) => {
            queryClientInstance.invalidateQueries({ queryKey: [query] });
          });
        } else {
          queryClientInstance.invalidateQueries({
            queryKey: [invalidateQueries],
          });
        }
      }

      if (successMessage) {
        toast({ description: successMessage });
      }
    },
    onError: (error) => {
      const message = errorMessage || error.message || "An error occurred";
      toast({ description: message, variant: "destructive" });
    },
  });

  // Wrapper to support callbacks pattern
  const mutate = useCallback(
    async (data?: D, callbacks?: MutationCallbacks<T>): Promise<T | null> => {
      try {
        const result = await mutation.mutateAsync(data as D);
        callbacks?.onSuccess?.(result);
        callbacks?.onSettled?.();
        return result;
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("An error occurred");
        callbacks?.onError?.(err);
        callbacks?.onSettled?.();
        return null;
      }
    },
    [mutation]
  );

  return {
    mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

// Hook to wrap API PUT requests
export const useApiPutMutation = <T = unknown, D = unknown>(
  url: string,
  options?: ApiQueryOptions
): MutationState<T> => {
  return useApiMutation<T, D>(url, { ...options, method: "PUT" });
};

// Hook to wrap API DELETE requests with React Query
export const useApiDeleteMutation = <T = unknown>(
  url: string,
  options?: ApiQueryOptions
): MutationState<T> => {
  const { invalidateQueries, successMessage, errorMessage, transformRequest } =
    options || {};

  const queryClientInstance = useQueryClient();

  const mutation = useMutation<T, Error, any>({
    mutationFn: async (data: any) => {
      const transformedData = transformRequest ? transformRequest(data) : data;
      let response: T;
      let deleteUrl = url;

      if (transformedData && typeof transformedData === "object") {
        if (transformedData.params) {
          // Handle query parameters for DELETE requests
          const params = new URLSearchParams(transformedData.params).toString();
          deleteUrl = `${url}?${params}`;
          response = await api.delete(deleteUrl);
        } else {
          // Use object as request body
          response = await api.delete(url, {
            body: JSON.stringify(transformedData),
            headers: { "Content-Type": "application/json" },
          });
        }
      } else if (transformedData) {
        // If we just have an ID, add it to the URL
        response = await api.delete(`${url}/${transformedData}`);
      } else {
        // Simple DELETE request
        response = await api.delete(url);
      }

      return response;
    },
    onSuccess: () => {
      // Handle query invalidation
      if (invalidateQueries) {
        if (Array.isArray(invalidateQueries)) {
          invalidateQueries.forEach((query) => {
            queryClientInstance.invalidateQueries({ queryKey: [query] });
          });
        } else {
          queryClientInstance.invalidateQueries({
            queryKey: [invalidateQueries],
          });
        }
      }

      if (successMessage) {
        toast({ description: successMessage });
      }
    },
    onError: (error) => {
      const message = errorMessage || error.message || "An error occurred";
      toast({ description: message, variant: "destructive" });
    },
  });

  // Wrapper to support callbacks pattern
  const mutate = useCallback(
    async (data?: any, callbacks?: MutationCallbacks<T>): Promise<T | null> => {
      try {
        const result = await mutation.mutateAsync(data);
        callbacks?.onSuccess?.(result);
        callbacks?.onSettled?.();
        return result;
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("An error occurred");
        callbacks?.onError?.(err);
        callbacks?.onSettled?.();
        return null;
      }
    },
    [mutation]
  );

  return {
    mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

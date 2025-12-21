import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "../hooks/useApiQuery";
import api from "../setup/api";

export interface UserPreferences {
  userId: string;
  newsletter: boolean;
  promotions: boolean;
  updates: boolean;
}

// Ensure endpoint is properly formatted for API calls
const PREFERENCE_ENDPOINT = `/user`;

// Get user preferences
export const useGetPreference = () => {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      try {
        return await api.get(`${PREFERENCE_ENDPOINT}?userId=${userId}`);
      } catch (error: any) {
        // If 404, return null instead of throwing - user preferences don't exist yet
        if (
          error?.status === 404 ||
          error?.message?.includes("404") ||
          error?.message?.includes("not found")
        ) {
          return null;
        }
        throw error;
      }
    },
    // Only execute query if we have a userId
    enabled: !!userId,
    // Don't retry on 404 - it's expected for new users
    retry: (failureCount, error: any) => {
      // Don't retry on 404
      if (
        error?.status === 404 ||
        error?.message?.includes("404") ||
        error?.message?.includes("not found")
      ) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    // Keep stale data while refetching
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Create or update user preferences
export const useCreateOrUpdatePreferences = () => {
  const { user } = useUser();
  const userId = user?.id;

  return useApiMutation<UserPreferences, UserPreferences>(PREFERENCE_ENDPOINT, {
    invalidateQueries: ["user"],
    successMessage: "Preferences updated successfully",
    transformRequest: (data) => ({ ...data, userId }),
  });
};

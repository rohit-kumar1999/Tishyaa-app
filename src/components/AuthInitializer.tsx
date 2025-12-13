import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { setAuthTokenGetter } from "../setup/api";

/**
 * Component that initializes the global auth token getter for API calls
 * Should be placed high in the component tree after ClerkProvider
 */
export const AuthInitializer = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set the global auth token getter for the API client
    setAuthTokenGetter(async () => {
      try {
        return await getToken();
      } catch (error) {
        console.warn("Failed to get Clerk token:", error);
        return null;
      }
    });
  }, [getToken]);

  return null; // This component doesn't render anything
};

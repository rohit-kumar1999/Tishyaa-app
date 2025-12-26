import { useAuth, useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { setAuthTokenGetter, setUserIdGetter } from "../setup/api";

/**
 * Component that initializes the global auth token getter for API calls
 * Should be placed high in the component tree after ClerkProvider
 */
export const AuthInitializer = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    // Set the global auth token getter for the API client
    setAuthTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });

    // Set the global user ID getter for the API client
    setUserIdGetter(() => {
      return user?.id || null;
    });
  }, [getToken, user]);

  return null; // This component doesn't render anything
};

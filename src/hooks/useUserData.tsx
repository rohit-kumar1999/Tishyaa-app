import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

// Interface for the return type of our custom hook
interface UserData {
  userId: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  userFullName: string | null;
  userEmail: string | null;
  primaryEmailAddress: string | null;
}

// User data interface for storage
interface StoredUser {
  id: string;
  fullName: string;
  email: string;
}

const USER_STORAGE_KEY = "@tishyaa_user";

/**
 * Custom hook to provide user data throughout the application
 * This centralizes user information access and makes it easier to use in components
 * Adapted for React Native using AsyncStorage instead of Clerk
 */
export const useUserData = (): UserData => {
  const [userData, setUserData] = useState<UserData>({
    userId: null,
    isLoaded: false,
    isSignedIn: false,
    userFullName: null,
    userEmail: null,
    primaryEmailAddress: null,
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          const user: StoredUser = JSON.parse(storedUser);
          setUserData({
            userId: user.id,
            isLoaded: true,
            isSignedIn: true,
            userFullName: user.fullName,
            userEmail: user.email,
            primaryEmailAddress: user.email,
          });
        } else {
          setUserData((prev) => ({
            ...prev,
            isLoaded: true,
            isSignedIn: false,
          }));
        }
      } catch {
        setUserData((prev) => ({
          ...prev,
          isLoaded: true,
          isSignedIn: false,
        }));
      }
    };

    loadUserData();
  }, []);

  return userData;
};

// Helper functions for user management
export const signInUser = async (user: StoredUser) => {
  try {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return true;
  } catch {
    return false;
  }
};

export const signOutUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};

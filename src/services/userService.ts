import { useUser } from "@clerk/clerk-expo";

/**
 * Hook for user operations using Clerk's client methods
 */
export const useUserService = () => {
  const { user } = useUser();

  const deleteCurrentUser = async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      if (!user) {
        return {
          success: false,
          message: "User not found or not authenticated",
        };
      }

      // Use Clerk's client-side delete method
      await user.delete();

      console.log("✅ User deleted successfully using Clerk client method");
      return { success: true, message: "Account deleted successfully" };
    } catch (error) {
      console.error("Error deleting user:", error);

      // Handle specific Clerk errors
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete account";

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  return {
    deleteCurrentUser,
  };
};

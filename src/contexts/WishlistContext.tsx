import { useAuth, useUser } from "@clerk/clerk-expo";
import React, { createContext, ReactNode, useContext } from "react";
import {
  useApiDeleteMutation,
  useApiMutation,
  useApiQuery,
} from "../hooks/useApiQuery";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  images: any;
  inStock: boolean;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  wishlistProductIds: string[];
  isWishlistLoading: boolean;
  wishlistError: Error | null;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: any) => Promise<void>;
  refetchWishlist: () => Promise<void>;
  isWishlistProcessing: Record<string, boolean>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({
  children,
}) => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isWishlistProcessing, setIsWishlistProcessing] = React.useState<
    Record<string, boolean>
  >({});

  const userId = user?.id;
  const wishlistUrl = userId ? `/wishlist?userId=${userId}` : null;

  // Single API query for wishlist data
  const {
    data: wishlistItems,
    isLoading: isWishlistLoading,
    error: wishlistError,
    refetch: refetchWishlist,
  } = useApiQuery<WishlistItem[]>(wishlistUrl!, {
    enabled: !!isSignedIn && !!userId && !!wishlistUrl,
    errorMessage: "Failed to load wishlist",
  });

  const wishlist = wishlistItems || [];
  const wishlistCount = wishlist.length;
  const wishlistProductIds = wishlist.map((item) => item.id) || [];

  // Mutations
  const wishlistAddMutation = useApiMutation<any, { productId: string }>(
    "/wishlist",
    {
      invalidateQueries: userId ? [`/wishlist?userId=${userId}`] : [],
      successMessage: "Added to wishlist",
      errorMessage: "Failed to add to wishlist",
    }
  );

  const wishlistRemoveMutation = useApiDeleteMutation<any>("/wishlist", {
    invalidateQueries: userId ? [`/wishlist?userId=${userId}`] : [],
    successMessage: "Removed from wishlist",
    errorMessage: "Failed to remove from wishlist",
  });

  const isInWishlist = (productId: string): boolean => {
    return wishlistProductIds.includes(productId);
  };

  const toggleWishlist = async (product: any): Promise<void> => {
    if (!isSignedIn) {
      return;
    }

    setIsWishlistProcessing((prev) => ({ ...prev, [product.id]: true }));
    const isCurrentlyInWishlist = isInWishlist(product.id);

    try {
      if (isCurrentlyInWishlist) {
        await wishlistRemoveMutation.mutate({
          params: { productId: product.id, userId },
        });
      } else {
        await wishlistAddMutation.mutate({ productId: product.id });
      }
      // No need for manual refetch - mutations already invalidate queries automatically
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    } finally {
      setIsWishlistProcessing((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const contextValue: WishlistContextType = {
    wishlist,
    wishlistCount,
    wishlistProductIds,
    isWishlistLoading,
    wishlistError,
    isInWishlist,
    toggleWishlist,
    refetchWishlist,
    isWishlistProcessing,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

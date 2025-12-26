import { useAuth, useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";
import { Product } from "../types";
import { toast } from "./use-toast";
import {
  useApiDeleteMutation,
  useApiMutation,
  useApiQuery,
} from "./useApiQuery";
import { useCart } from "./useCart";

// Wishlist API types
interface WishlistResponse {
  items: WishlistItem[];
}

interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
}

interface WishlistActionRequest {
  productId: string;
  action: "add" | "remove";
}

interface WishlistRemoveRequest {
  productId: string;
}

export const useProductManager = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isWishlistProcessing, setIsWishlistProcessing] = useState<
    Record<string, boolean>
  >({});
  const [isCartProcessing, setIsCartProcessing] = useState<
    Record<string, boolean>
  >({});

  const userId = user?.id;

  // Get wishlist data - backend returns array directly, not wrapped in items
  // Only construct URL and make request when userId is available
  const wishlistUrl = userId ? `/wishlist?userId=${userId}` : null;

  const {
    data: wishlistItems,
    isLoading: wishlistQueryLoading,
    error: wishlistQueryError,
    refetch: refetchWishlist,
  } = useApiQuery<any[]>(wishlistUrl!, {
    enabled: !!isSignedIn && !!userId && !!wishlistUrl,
    errorMessage: "Failed to load wishlist",
  });

  // Backend returns array of products with wishlist metadata
  const wishlist = wishlistItems || [];
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

  const { addItemToCart, isProcessing: cartProcessing } = useCart();

  // Check if product is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistProductIds.includes(productId);
  };

  // Wishlist count for easy access
  const wishlistCount = wishlist.length;

  // Handle wishlist toggle
  const toggleWishlist = (product: Product) => {
    if (!isSignedIn) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to add items to your wishlist",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign In",
            onPress: () => {
              // Navigate to sign in - you can uncomment this if you have router available
              // router.push('/auth/login');
            },
          },
        ]
      );
      return;
    }

    setIsWishlistProcessing((prev) => ({ ...prev, [product.id]: true }));

    const isCurrentlyInWishlist = isInWishlist(product.id);

    if (isCurrentlyInWishlist) {
      // Backend expects DELETE /wishlist?productId=X&userId=Y
      wishlistRemoveMutation
        .mutate({ params: { productId: product.id, userId } })
        .then(() => {
          setIsWishlistProcessing((prev) => ({
            ...prev,
            [product.id]: false,
          }));
          // Force immediate refetch to sync with server
          refetchWishlist();
        })
        .catch(() => {
          setIsWishlistProcessing((prev) => ({
            ...prev,
            [product.id]: false,
          }));
        });
    } else {
      // Backend expects POST /wishlist with { productId } in body
      wishlistAddMutation
        .mutate({ productId: product.id })
        .then(() => {
          setIsWishlistProcessing((prev) => ({
            ...prev,
            [product.id]: false,
          }));
          // Force immediate refetch to sync with server
          refetchWishlist();
        })
        .catch(() => {
          setIsWishlistProcessing((prev) => ({
            ...prev,
            [product.id]: false,
          }));
        });
    }
  };

  // Handle add to cart with processing state
  const handleAddToCart = (
    product: Product,
    quantity: number = 1,
    showAlert: boolean = true
  ) => {
    if (!isSignedIn) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to add items to your cart",
        [{ text: "OK" }]
      );
      return;
    }

    setIsCartProcessing((prev) => ({ ...prev, [product.id]: true }));

    // Use the cart hook's addItemToCart function
    addItemToCart(product.id, quantity, showAlert);

    // Reset processing state after a delay (since addItemToCart is async)
    setTimeout(() => {
      setIsCartProcessing((prev) => ({ ...prev, [product.id]: false }));
    }, 1000);
  };

  // Handle quick actions (add to cart + wishlist)
  const handleQuickActions = (product: Product) => {
    Alert.alert(product.name, "Choose an action:", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: isInWishlist(product.id)
          ? "Remove from Wishlist"
          : "Add to Wishlist",
        onPress: () => toggleWishlist(product),
      },
      {
        text: "Add to Cart",
        onPress: () => handleAddToCart(product, 1, true),
      },
    ]);
  };

  // Bulk operations
  const addMultipleToCart = (products: Product[]) => {
    if (!isSignedIn) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to add items to your cart",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert("Add Multiple Items", `Add ${products.length} items to cart?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Add All",
        onPress: () => {
          products.forEach((product) => {
            handleAddToCart(product, 1, false);
          });
          toast({
            description: `Added ${products.length} items to cart`,
          });
        },
      },
    ]);
  };

  const clearWishlist = () => {
    Alert.alert(
      "Clear Wishlist",
      "Are you sure you want to remove all items from your wishlist?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            wishlist.forEach((item) => {
              wishlistRemoveMutation.mutate({ productId: item.productId });
            });
            toast({ description: "Wishlist cleared" });
          },
        },
      ]
    );
  };

  return {
    // Wishlist data
    wishlist,
    wishlistProductIds,
    wishlistCount,
    isInWishlist,

    // Loading and error states
    isWishlistLoading: wishlistQueryLoading,
    wishlistError: wishlistQueryError,

    // Processing states
    isWishlistProcessing,
    isCartProcessing: { ...isCartProcessing, ...cartProcessing },

    // Actions
    toggleWishlist,
    handleAddToCart,
    handleQuickActions,
    addMultipleToCart,
    clearWishlist,

    // Utilities
    refetchWishlist,
  };
};

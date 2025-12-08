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
import { useUserData } from "./useUserData";

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
  const { isSignedIn } = useUserData();
  const [isWishlistProcessing, setIsWishlistProcessing] = useState<
    Record<string, boolean>
  >({});
  const [isCartProcessing, setIsCartProcessing] = useState<
    Record<string, boolean>
  >({});

  // Get wishlist data
  const { data: wishlistResponse, refetch: refetchWishlist } =
    useApiQuery<WishlistResponse>("/wishlist", {
      enabled: isSignedIn,
      errorMessage: "Failed to load wishlist",
    });

  // Handle different response formats from the API
  const wishlist = wishlistResponse?.items || [];
  const wishlistProductIds = wishlist.map((item) => item.productId) || [];

  // Mutations
  const wishlistAddMutation = useApiMutation<any, WishlistActionRequest>(
    "/wishlist",
    {
      invalidateQueries: ["/wishlist"],
      successMessage: "Added to wishlist",
      errorMessage: "Failed to add to wishlist",
    }
  );

  const wishlistRemoveMutation = useApiDeleteMutation<any>("/wishlist", {
    invalidateQueries: ["/wishlist"],
    successMessage: "Removed from wishlist",
    errorMessage: "Failed to remove from wishlist",
  });

  const { addItemToCart, isProcessing: cartProcessing } = useCart();

  // Check if product is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistProductIds.includes(productId);
  };

  // Handle wishlist toggle
  const toggleWishlist = (product: Product) => {
    if (!isSignedIn) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to add items to your wishlist",
        [{ text: "OK" }]
      );
      return;
    }

    setIsWishlistProcessing((prev) => ({ ...prev, [product.id]: true }));

    const isCurrentlyInWishlist = isInWishlist(product.id);

    if (isCurrentlyInWishlist) {
      // Remove from wishlist
      wishlistRemoveMutation.mutate({ productId: product.id });
      refetchWishlist();
      setIsWishlistProcessing((prev) => ({
        ...prev,
        [product.id]: false,
      }));
    } else {
      // Add to wishlist
      wishlistAddMutation.mutate({
        productId: product.id,
        action: "add",
      });
      refetchWishlist();
      setIsWishlistProcessing((prev) => ({
        ...prev,
        [product.id]: false,
      }));
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
    isInWishlist,

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

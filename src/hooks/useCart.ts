import { useState } from "react";
import { Alert } from "react-native";
import { Product } from "../types";
import { toast } from "./use-toast";
import {
  useApiDeleteMutation,
  useApiMutation,
  useApiQuery,
} from "./useApiQuery";
import { useUserData } from "./useUserData";

// Cart API response types
interface CartResponse {
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

interface AddToCartRequest {
  productId: string;
  quantity: number;
}

interface UpdateCartRequest {
  cartId: string;
  quantity: number;
}

interface RemoveFromCartRequest {
  cartId: string;
}

// Mock API functions - replace with actual service calls
const getCartService = (): Promise<CartResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items: [],
        total: 0,
        itemCount: 0,
      });
    }, 500);
  });
};

export const useCart = () => {
  const { isSignedIn } = useUserData();
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  // Fetch cart items
  const {
    data: cartResponse,
    isLoading,
    error,
    refetch,
  } = useApiQuery<CartResponse>("/cart", {
    enabled: isSignedIn,
    errorMessage: "Failed to load cart",
  });

  // Extract cart items from response
  const cartItems = cartResponse?.items || [];

  // Cart operations mutations
  const addToCartMutation = useApiMutation<any, AddToCartRequest>("/cart/add", {
    invalidateQueries: ["/cart"],
    successMessage: "Added to cart successfully",
    errorMessage: "Failed to add item to cart",
  });

  const updateCartMutation = useApiMutation<any, UpdateCartRequest>(
    "/cart/update",
    {
      invalidateQueries: ["/cart"],
      successMessage: "Cart updated successfully",
      errorMessage: "Failed to update cart item",
      method: "PUT",
    }
  );

  const removeFromCartMutation = useApiDeleteMutation<any>("/cart/remove", {
    invalidateQueries: ["/cart"],
    successMessage: "Item removed from cart",
    errorMessage: "Failed to remove item from cart",
  });

  // Add product to cart
  const addItemToCart = (
    productId: string,
    quantity: number = 1,
    showSuccessAlert: boolean = true
  ) => {
    if (!isSignedIn) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to add items to your cart",
        [{ text: "OK" }]
      );
      return;
    }

    setIsProcessing((prev) => ({ ...prev, [productId]: true }));

    addToCartMutation.mutate({ productId, quantity });
  };

  // Update cart item quantity or remove if quantity is 0
  const updateItemQuantity = (id: string, quantity: number) => {
    setIsProcessing((prev) => ({ ...prev, [id]: true }));

    if (quantity <= 0) {
      // Remove item from cart
      removeFromCartMutation.mutate({ cartId: id });
      setIsProcessing((prev) => ({ ...prev, [id]: false }));
      refetch();
    } else {
      // Update item quantity
      updateCartMutation.mutate({ cartId: id, quantity });
      setIsProcessing((prev) => ({ ...prev, [id]: false }));
      refetch();
    }
  };

  // Remove item from cart with confirmation
  const removeItem = (id: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setIsProcessing((prev) => ({ ...prev, [id]: true }));

            removeFromCartMutation.mutate({ cartId: id });
            setIsProcessing((prev) => ({ ...prev, [id]: false }));
            refetch();
          },
        },
      ]
    );
  };

  // Clear entire cart
  const clearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            // Implement clear cart API call
            removeFromCartMutation.mutate({ cartId: "all" });
            refetch();
            toast({ description: "Cart cleared successfully" });
          },
        },
      ]
    );
  };

  return {
    cartItems,
    cartResponse,
    isLoading,
    error,
    isProcessing,
    addItemToCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    refetch,
    // Expose mutations for advanced use cases
    addToCartMutation,
    updateCartMutation,
    removeFromCartMutation,
  };
};

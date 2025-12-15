import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "../hooks/use-toast";
import {
  CartItem,
  useAddToCart,
  useGetCart,
  useRemoveFromCart,
  useUpdateCartItem,
} from "../services/productService";

interface ApiCartContextType {
  cartItems: CartItem[] | undefined;
  cartCount: number;
  isInitialLoading: boolean; // Only for first load
  error: any;
  isProcessing: Record<string, boolean>;
  addItemToCart: (
    productId: string,
    quantity?: number,
    navigateToCart?: boolean
  ) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  refetch: () => Promise<void>;
}

const ApiCartContext = createContext<ApiCartContextType | undefined>(undefined);

export const ApiCartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  console.log("🔐 ApiCartProvider Auth State:", {
    isSignedIn,
    userId: user?.id,
    userLoaded: !!user,
  });

  // Single API call for cart data - shared across all components
  const { data: cartItems, isLoading, error, refetch } = useGetCart();

  // Only show loading for initial load, not for updates
  const isInitialLoading = isLoading && !cartItems;

  // Cart operations mutations
  const { mutate: addToCart } = useAddToCart();
  const { mutate: updateCart } = useUpdateCartItem();
  const { mutate: removeFromCart } = useRemoveFromCart();

  // Calculate cart count once - always show current count, even during updates
  const cartCount =
    cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  console.log("🧮 ApiCartProvider - Cart count calculation:", {
    cartItemsLength: cartItems?.length || 0,
    cartItems: cartItems?.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      productPrice: item.product?.price,
      productName: item.product?.name || "Unknown",
    })),
    calculatedCartCount: cartCount,
  });

  // Add product to cart
  const addItemToCart = (
    productId: string,
    quantity: number = 1,
    navigateToCart: boolean = true
  ) => {
    console.log("🛒 Add to cart called:", {
      productId,
      quantity,
      navigateToCart,
    });

    if (!isSignedIn) {
      console.log("❌ User not signed in");
      toast({
        description: "Please sign in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    console.log("✅ User signed in, proceeding with add to cart");
    setIsProcessing((prev) => ({ ...prev, [productId]: true }));

    addToCart(
      { productId, quantity },
      {
        onSuccess: (data) => {
          console.log("✅ Add to cart success:", data);
          setIsProcessing((prev) => ({ ...prev, [productId]: false }));

          // Explicitly refetch cart data to ensure UI updates
          console.log("🔄 Refetching cart data after add");
          refetch();

          // Show success toast
          toast({
            description: navigateToCart
              ? "Added to Cart! Redirecting..."
              : "Product added to your cart",
          });

          // Navigate to cart page if requested
          if (navigateToCart) {
            setTimeout(() => {
              console.log("🔄 Navigating to cart");
              router.push("/cart");
            }, 700); // Allow time for cart to update
          }
        },
        onError: (error) => {
          console.log("❌ Add to cart error:", error);
          setIsProcessing((prev) => ({ ...prev, [productId]: false }));
          toast({
            description: "Failed to add item to cart",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Update cart item quantity or remove if quantity is 0
  const updateItemQuantity = (id: string, quantity: number) => {
    console.log("🔄 Update cart item quantity:", { id, quantity });
    setIsProcessing((prev) => ({ ...prev, [id]: true }));

    if (quantity <= 0) {
      // Remove item from cart
      removeFromCart(
        { cartId: id },
        {
          onSuccess: () => {
            console.log("✅ Remove from cart success");
            setIsProcessing((prev) => ({ ...prev, [id]: false }));

            // Explicitly refetch cart data to ensure UI updates
            console.log("🔄 Refetching cart data after remove");
            refetch();
          },
          onError: () => {
            console.log("❌ Remove from cart error");
            setIsProcessing((prev) => ({ ...prev, [id]: false }));
            toast({
              description: "Failed to remove item from cart",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Update item quantity
      updateCart(
        { cartId: id, quantity },
        {
          onSuccess: () => {
            console.log("✅ Update cart item success");
            setIsProcessing((prev) => ({ ...prev, [id]: false }));

            // Explicitly refetch cart data to ensure UI updates
            console.log("🔄 Refetching cart data after update");
            refetch();
          },
          onError: () => {
            console.log("❌ Update cart item error");
            setIsProcessing((prev) => ({ ...prev, [id]: false }));
            toast({
              description: "Failed to update cart item",
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    console.log("🗑️ Remove item from cart:", { id });
    setIsProcessing((prev) => ({ ...prev, [id]: true }));

    removeFromCart(
      { cartId: id },
      {
        onSuccess: () => {
          console.log("✅ Remove item success");
          setIsProcessing((prev) => ({ ...prev, [id]: false }));

          // Explicitly refetch cart data to ensure UI updates
          console.log("🔄 Refetching cart data after remove item");
          refetch();
        },
        onError: () => {
          console.log("❌ Remove item error");
          setIsProcessing((prev) => ({ ...prev, [id]: false }));
          toast({
            description: "Failed to remove item from cart",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <ApiCartContext.Provider
      value={{
        cartItems: cartItems || undefined,
        cartCount,
        isInitialLoading,
        error,
        isProcessing,
        addItemToCart,
        updateItemQuantity,
        removeItem,
        refetch,
      }}
    >
      {children}
    </ApiCartContext.Provider>
  );
};

export const useApiCart = () => {
  const context = useContext(ApiCartContext);
  if (context === undefined) {
    throw new Error("useApiCart must be used within an ApiCartProvider");
  }
  return context;
};

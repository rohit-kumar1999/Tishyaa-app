import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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

  // Local cart count for instant updates
  const [localCartCount, setLocalCartCount] = useState(0);

  // Single API call for cart data - shared across all components
  const { data: cartItems, isLoading, error, refetch } = useGetCart();

  // Only show loading for initial load, not for updates
  const isInitialLoading = isLoading && !cartItems;

  // Cart operations mutations
  const { mutate: addToCart } = useAddToCart();
  const { mutate: updateCart } = useUpdateCartItem();
  const { mutate: removeFromCart } = useRemoveFromCart();

  // Sync local cart count with API data
  useEffect(() => {
    const apiCartCount =
      cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
    setLocalCartCount(apiCartCount);
  }, [cartItems]);

  // Use local cart count for instant UI updates
  const cartCount = localCartCount;

  // Add product to cart
  const addItemToCart = useCallback(
    (
      productId: string,
      quantity: number = 1,
      navigateToCart: boolean = true
    ) => {
      if (!isSignedIn) {
        toast({
          description: "Please sign in to add items to your cart",
          variant: "destructive",
        });
        return;
      }

      // Optimistically update cart count immediately
      setLocalCartCount((prev) => prev + quantity);

      setIsProcessing((prev) => ({ ...prev, [productId]: true }));

      addToCart(
        { productId, quantity },
        {
          onSuccess: async () => {
            setIsProcessing((prev) => ({ ...prev, [productId]: false }));

            // Refetch cart data to sync with server
            await refetch();

            // Show success toast
            toast({
              title: "Added to Cart",
              description: navigateToCart
                ? "Redirecting to cart..."
                : "Product added to your cart",
              variant: "success",
            });

            // Navigate to cart page if requested
            if (navigateToCart) {
              setTimeout(() => {
                router.push("/cart");
              }, 500);
            }
          },
          onError: () => {
            // Revert optimistic update on error
            setLocalCartCount((prev) => prev - quantity);
            setIsProcessing((prev) => ({ ...prev, [productId]: false }));
            toast({
              title: "Error",
              description: "Failed to add item to cart",
              variant: "destructive",
            });
          },
        }
      );
    },
    [isSignedIn, addToCart, refetch]
  );

  // Update cart item quantity or remove if quantity is 0
  const updateItemQuantity = useCallback(
    (id: string, quantity: number) => {
      // Find current item to calculate difference for optimistic update
      const currentItem = cartItems?.find((item) => item.id === id);
      const previousQuantity = currentItem?.quantity || 0;
      const quantityDiff = quantity - previousQuantity;

      // Optimistically update cart count
      if (quantity <= 0) {
        setLocalCartCount((prev) => Math.max(0, prev - previousQuantity));
      } else {
        setLocalCartCount((prev) => Math.max(0, prev + quantityDiff));
      }

      setIsProcessing((prev) => ({ ...prev, [id]: true }));

      if (quantity <= 0) {
        // Remove item from cart
        removeFromCart(
          { cartId: id },
          {
            onSuccess: async () => {
              setIsProcessing((prev) => ({ ...prev, [id]: false }));
              await refetch();
            },
            onError: () => {
              // Revert optimistic update
              setLocalCartCount((prev) => prev + previousQuantity);
              setIsProcessing((prev) => ({ ...prev, [id]: false }));
              toast({
                title: "Error",
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
            onSuccess: async () => {
              setIsProcessing((prev) => ({ ...prev, [id]: false }));
              await refetch();
            },
            onError: () => {
              // Revert optimistic update
              setLocalCartCount((prev) => prev - quantityDiff);
              setIsProcessing((prev) => ({ ...prev, [id]: false }));
              toast({
                title: "Error",
                description: "Failed to update cart item",
                variant: "destructive",
              });
            },
          }
        );
      }
    },
    [cartItems, removeFromCart, updateCart, refetch]
  );

  // Remove item from cart
  const removeItem = useCallback(
    (id: string) => {
      // Find current item for optimistic update
      const currentItem = cartItems?.find((item) => item.id === id);
      const previousQuantity = currentItem?.quantity || 0;

      // Optimistically update cart count
      setLocalCartCount((prev) => Math.max(0, prev - previousQuantity));

      setIsProcessing((prev) => ({ ...prev, [id]: true }));

      removeFromCart(
        { cartId: id },
        {
          onSuccess: async () => {
            setIsProcessing((prev) => ({ ...prev, [id]: false }));
            await refetch();
          },
          onError: () => {
            // Revert optimistic update
            setLocalCartCount((prev) => prev + previousQuantity);
            setIsProcessing((prev) => ({ ...prev, [id]: false }));
            toast({
              description: "Failed to remove item from cart",
              variant: "destructive",
            });
          },
        }
      );
    },
    [cartItems, removeFromCart, refetch]
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<ApiCartContextType>(
    () => ({
      cartItems: cartItems || undefined,
      cartCount,
      isInitialLoading,
      error,
      isProcessing,
      addItemToCart,
      updateItemQuantity,
      removeItem,
      refetch,
    }),
    [
      cartItems,
      cartCount,
      isInitialLoading,
      error,
      isProcessing,
      addItemToCart,
      updateItemQuantity,
      removeItem,
      refetch,
    ]
  );

  return (
    <ApiCartContext.Provider value={contextValue}>
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

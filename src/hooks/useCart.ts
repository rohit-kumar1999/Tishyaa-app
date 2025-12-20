import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useState } from "react";
import {
  useAddToCart,
  useGetCart,
  useRemoveFromCart,
  useUpdateCartItem,
} from "../services/productService";
import { toast } from "./use-toast";

export const useCart = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  // Fetch cart items
  const { data: cartItems, isLoading, error, refetch } = useGetCart();

  // Cart operations mutations
  const { mutate: addToCart } = useAddToCart();
  const { mutate: updateCart } = useUpdateCartItem();
  const { mutate: removeFromCart } = useRemoveFromCart();

  // Add product to cart
  const addItemToCart = (
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

    setIsProcessing((prev) => ({ ...prev, [productId]: true }));

    addToCart(
      { productId, quantity },
      {
        onSuccess: (data) => {
          setIsProcessing((prev) => ({ ...prev, [productId]: false }));

          // Explicitly refetch cart data to ensure UI updates
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
              router.push("/cart");
            }, 700); // Allow time for cart to update
          }
        },
        onError: (error) => {
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
    setIsProcessing((prev) => ({ ...prev, [id]: true }));

    if (quantity <= 0) {
      // Remove item from cart
      removeFromCart(
        { cartId: id },
        {
          onSuccess: () => {
            setIsProcessing((prev) => ({ ...prev, [id]: false }));

            // Explicitly refetch cart data to ensure UI updates
            refetch();
            refetch();
          },
          onError: () => {
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
            setIsProcessing((prev) => ({ ...prev, [id]: false }));

            // Explicitly refetch cart data to ensure UI updates
            refetch();
          },
          onError: () => {
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
    setIsProcessing((prev) => ({ ...prev, [id]: true }));

    removeFromCart(
      { cartId: id },
      {
        onSuccess: () => {
          setIsProcessing((prev) => ({ ...prev, [id]: false }));

          // Explicitly refetch cart data to ensure UI updates
          refetch();
          refetch();
          toast({
            description: "Item removed from cart",
          });
        },
        onError: () => {
          setIsProcessing((prev) => ({ ...prev, [id]: false }));
          toast({
            description: "Failed to remove item from cart",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Calculate total cart item count
  const cartCount =
    cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return {
    cartItems,
    cartCount,
    isLoading,
    error,
    isProcessing,
    addItemToCart,
    updateItemQuantity,
    removeItem,
    refetch,
  };
};

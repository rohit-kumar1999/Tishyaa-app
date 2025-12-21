import { useApiCart } from "../contexts/ApiCartContext";

// Re-export the ApiCartContext hook for backward compatibility
// This ensures all cart operations use the same shared state with optimistic updates
export const useCart = () => {
  const {
    cartItems,
    cartCount,
    isInitialLoading: isLoading,
    error,
    isProcessing,
    addItemToCart,
    updateItemQuantity,
    removeItem,
    refetch,
  } = useApiCart();

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

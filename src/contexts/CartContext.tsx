import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { Alert } from "react-native";
import { CartItem, Product } from "../types";

// Enhanced cart state with additional features
interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  isLoading: boolean;
  lastUpdated: string | null;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Product & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "APPLY_DISCOUNT"; payload: number }
  | { type: "SET_SHIPPING"; payload: number }
  | { type: "SET_TAX"; payload: number };

// Enhanced context interface
interface CartContextType extends CartState {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string, showConfirmation?: boolean) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: (showConfirmation?: boolean) => void;
  applyDiscount: (amount: number) => void;
  setShipping: (amount: number) => void;
  setTax: (amount: number) => void;
  getItemById: (id: string) => CartItem | undefined;
  isItemInCart: (id: string) => boolean;
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "@tishyaa_cart";
const CART_METADATA_KEY = "@tishyaa_cart_metadata";

// Enhanced total calculations with tax and shipping
const calculateTotals = (
  items: CartItem[],
  discount: number = 0,
  tax: number = 0,
  shipping: number = 0
) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const taxAmount = discountedSubtotal * (tax / 100);
  const total = discountedSubtotal + taxAmount + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    total: Math.round(total * 100) / 100, // Round to 2 decimal places
    itemCount,
  };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  const now = new Date().toISOString();

  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "LOAD_CART": {
      const { subtotal, total, itemCount } = calculateTotals(
        action.payload,
        state.discount,
        state.tax,
        state.shipping
      );
      return {
        ...state,
        items: action.payload,
        subtotal,
        total,
        itemCount,
        isLoading: false,
      };
    }

    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      const quantityToAdd = action.payload.quantity || 1;

      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          { ...action.payload, quantity: quantityToAdd },
        ];
      }

      const { subtotal, total, itemCount } = calculateTotals(
        newItems,
        state.discount,
        state.tax,
        state.shipping
      );
      return {
        ...state,
        items: newItems,
        subtotal,
        total,
        itemCount,
        lastUpdated: now,
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      const { subtotal, total, itemCount } = calculateTotals(
        newItems,
        state.discount,
        state.tax,
        state.shipping
      );
      return {
        ...state,
        items: newItems,
        subtotal,
        total,
        itemCount,
        lastUpdated: now,
      };
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        const newItems = state.items.filter(
          (item) => item.id !== action.payload.id
        );
        const { subtotal, total, itemCount } = calculateTotals(
          newItems,
          state.discount,
          state.tax,
          state.shipping
        );
        return {
          ...state,
          items: newItems,
          subtotal,
          total,
          itemCount,
          lastUpdated: now,
        };
      }

      const newItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const { subtotal, total, itemCount } = calculateTotals(
        newItems,
        state.discount,
        state.tax,
        state.shipping
      );
      return {
        ...state,
        items: newItems,
        subtotal,
        total,
        itemCount,
        lastUpdated: now,
      };
    }

    case "APPLY_DISCOUNT": {
      const { subtotal, total, itemCount } = calculateTotals(
        state.items,
        action.payload,
        state.tax,
        state.shipping
      );
      return {
        ...state,
        discount: action.payload,
        subtotal,
        total,
        lastUpdated: now,
      };
    }

    case "SET_SHIPPING": {
      const { subtotal, total, itemCount } = calculateTotals(
        state.items,
        state.discount,
        state.tax,
        action.payload
      );
      return {
        ...state,
        shipping: action.payload,
        subtotal,
        total,
        lastUpdated: now,
      };
    }

    case "SET_TAX": {
      const { subtotal, total, itemCount } = calculateTotals(
        state.items,
        state.discount,
        action.payload,
        state.shipping
      );
      return {
        ...state,
        tax: action.payload,
        subtotal,
        total,
        lastUpdated: now,
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
        discount: 0,
        lastUpdated: now,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    subtotal: 0,
    itemCount: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    isLoading: true,
    lastUpdated: null,
  });

  // Load cart and metadata from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const [savedCart, savedMetadata] = await Promise.all([
          AsyncStorage.getItem(CART_STORAGE_KEY),
          AsyncStorage.getItem(CART_METADATA_KEY),
        ]);

        if (savedCart) {
          const items = JSON.parse(savedCart);
          dispatch({ type: "LOAD_CART", payload: items });

          // Load metadata (tax, shipping, discount)
          if (savedMetadata) {
            const metadata = JSON.parse(savedMetadata);
            if (metadata.tax)
              dispatch({ type: "SET_TAX", payload: metadata.tax });
            if (metadata.shipping)
              dispatch({ type: "SET_SHIPPING", payload: metadata.shipping });
            if (metadata.discount)
              dispatch({ type: "APPLY_DISCOUNT", payload: metadata.discount });
          }
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      const saveCart = async () => {
        try {
          await Promise.all([
            AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items)),
            AsyncStorage.setItem(
              CART_METADATA_KEY,
              JSON.stringify({
                tax: state.tax,
                shipping: state.shipping,
                discount: state.discount,
                lastUpdated: state.lastUpdated,
              })
            ),
          ]);
        } catch {
          // Save failed silently
        }
      };

      saveCart();
    }
  }, [state.items, state.tax, state.shipping, state.discount, state.isLoading]);

  // Enhanced cart operations
  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: "ADD_ITEM", payload: { ...product, quantity } });
  };

  const removeItem = (id: string, showConfirmation: boolean = true) => {
    if (showConfirmation) {
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
            onPress: () => dispatch({ type: "REMOVE_ITEM", payload: id }),
          },
        ]
      );
    } else {
      dispatch({ type: "REMOVE_ITEM", payload: id });
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = (showConfirmation: boolean = true) => {
    if (showConfirmation) {
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
            onPress: () => dispatch({ type: "CLEAR_CART" }),
          },
        ]
      );
    } else {
      dispatch({ type: "CLEAR_CART" });
    }
  };

  const applyDiscount = (amount: number) => {
    dispatch({ type: "APPLY_DISCOUNT", payload: amount });
  };

  const setShipping = (amount: number) => {
    dispatch({ type: "SET_SHIPPING", payload: amount });
  };

  const setTax = (amount: number) => {
    dispatch({ type: "SET_TAX", payload: amount });
  };

  // Utility functions
  const getItemById = (id: string): CartItem | undefined => {
    return state.items.find((item) => item.id === id);
  };

  const isItemInCart = (id: string): boolean => {
    return state.items.some((item) => item.id === id);
  };

  const getItemQuantity = (id: string): number => {
    const item = getItemById(id);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyDiscount,
        setShipping,
        setTax,
        getItemById,
        isItemInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};

// Keep the original useCart for backward compatibility
export const useCart = useCartContext;

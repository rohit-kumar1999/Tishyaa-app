import { Alert } from "react-native";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  originalPrice?: number;
  images: string[];
  category?: string;
  inStock?: boolean;
}

export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString()}`;
};

export const calculateItemTotal = (price: number, quantity: number): number => {
  return price * quantity;
};

export const calculateShipping = (subtotal: number): number => {
  return subtotal >= 499 ? 0 : 30;
};

export const calculateTotal = (subtotal: number, shipping: number): number => {
  return subtotal + shipping;
};

export const getShippingMessage = (subtotal: number): string => {
  if (subtotal >= 499) {
    return "🎉 You've qualified for free shipping!";
  } else {
    const remaining = 499 - subtotal;
    return `Add ₹${remaining.toLocaleString()} more for free shipping!`;
  }
};

export const showAddToCartSuccess = (productName: string) => {
  Alert.alert("Added to Cart", `${productName} has been added to your cart.`, [
    { text: "Continue Shopping", style: "cancel" },
    { text: "View Cart", onPress: () => {} },
  ]);
};

export const debugCartProduct = (product: CartProduct): void => {
  console.log("🔍 Cart Product Debug:", {
    id: product.id,
    name: product.name,
    price: product.price,
    inStock: product.inStock,
    hasValidId: !!product.id,
    hasValidName: !!product.name,
    hasValidPrice: typeof product.price === "number" && product.price > 0,
    images: product.images?.length || 0,
  });
};

export const validateCartItem = (item: any): boolean => {
  return (
    item &&
    item.id &&
    item.product &&
    item.quantity > 0 &&
    item.product.price > 0
  );
};

export const getDiscountPercentage = (
  originalPrice: number,
  discountPrice: number
): number => {
  if (!originalPrice || !discountPrice || discountPrice >= originalPrice) {
    return 0;
  }
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};

export const getSavingsAmount = (
  originalPrice: number,
  discountPrice: number,
  quantity: number = 1
): number => {
  if (!originalPrice || !discountPrice || discountPrice >= originalPrice) {
    return 0;
  }
  return (originalPrice - discountPrice) * quantity;
};

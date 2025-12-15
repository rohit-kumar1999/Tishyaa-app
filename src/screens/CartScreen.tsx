import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavigation from "../components/common/BottomNavigation";
import { TopHeader } from "../components/common/TopHeader";
import { useApiCart } from "../contexts/ApiCartContext";
import {
  calculateShipping,
  calculateTotal,
  formatPrice,
  getShippingMessage,
} from "../utils/cartHelpers";

export default function CartScreen() {
  const {
    cartItems,
    isInitialLoading,
    isProcessing,
    updateItemQuantity,
    removeItem,
    refetch,
    error,
  } = useApiCart();

  // Debug cart data
  console.log("🛒 CartScreen Debug:", {
    cartItemsCount: cartItems?.length,
    cartItems: cartItems?.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      productId: item.productId,
      productName: item.product?.name,
      productPrice: item.product?.price,
      itemPrice: item.price,
      itemTotal: item.total,
    })),
  });

  // Calculate totals
  const { itemCount, subtotal, shippingCharges, total } = useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return {
        itemCount: 0,
        subtotal: 0,
        shippingCharges: 0,
        total: 0,
      };
    }

    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const sub = cartItems.reduce(
      (sum, item) =>
        sum + (item.price || item.product?.price || 0) * item.quantity,
      0
    );
    const shipping = calculateShipping(sub);
    return {
      itemCount: count,
      subtotal: sub,
      shippingCharges: shipping,
      total: calculateTotal(sub, shipping),
    };
  }, [cartItems]);

  const handleRefresh = async () => {
    await refetch();
  };

  if (isInitialLoading) {
    return (
      <View style={styles.container}>
        <TopHeader />
        <View style={styles.content}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={styles.loadingText}>Loading your cart...</Text>
          </View>
        </View>
        <BottomNavigation currentRoute="/cart" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopHeader />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Shopping Cart</Text>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
            <Text style={styles.errorTitle}>Failed to load cart</Text>
            <Text style={styles.errorSubtitle}>
              There was a problem loading your cart items.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
        <BottomNavigation currentRoute="/cart" />
      </View>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <TopHeader />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Shopping Cart</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven't added any items to your cart yet.
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/products")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#e11d48", "#be185d"]}
                style={styles.exploreGradient}
              >
                <Text style={styles.exploreButtonText}>Continue Shopping</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        <BottomNavigation currentRoute="/cart" />
      </View>
    );
  }

  const renderCartItem = ({ item }: { item: any }) => {
    const product = item.product;
    const itemPrice = item.price || product?.price || 0;
    const itemTotal = itemPrice * item.quantity;

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemContent}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: product?.images?.[0] || "https://via.placeholder.com/100",
              }}
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>

          {/* Product Details */}
          <View style={styles.productInfo}>
            <TouchableOpacity
              onPress={() => router.push(`/product/${product?.id}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.productName} numberOfLines={2}>
                {product?.name || "Unknown Product"}
              </Text>
            </TouchableOpacity>

            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>{formatPrice(itemPrice)}</Text>
              {product?.originalPrice && product?.originalPrice > itemPrice && (
                <Text style={styles.originalPrice}>
                  {formatPrice(product.originalPrice)}
                </Text>
              )}
            </View>

            <Text style={styles.stockStatus}>In stock</Text>

            {/* Quantity Controls */}
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  item.quantity <= 1 && styles.quantityButtonDisabled,
                ]}
                onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                disabled={isProcessing[item.id] || item.quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={16}
                  color={item.quantity <= 1 ? "#9ca3af" : "#374151"}
                />
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                {isProcessing[item.id] ? (
                  <ActivityIndicator size="small" color="#e11d48" />
                ) : (
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                disabled={isProcessing[item.id]}
              >
                <Ionicons name="add" size={16} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Item Total */}
            <Text style={styles.itemTotal}>{formatPrice(itemTotal)}</Text>
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(item.id)}
            disabled={isProcessing[item.id]}
          >
            {isProcessing[item.id] ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TopHeader />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <Text style={styles.itemCount}>
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Cart Items */}
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cartList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              colors={["#e11d48"]}
              tintColor="#e11d48"
            />
          }
        />

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
            </Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            {shippingCharges === 0 ? (
              <Text style={styles.freeShipping}>Free</Text>
            ) : (
              <Text style={styles.summaryValue}>
                {formatPrice(shippingCharges)}
              </Text>
            )}
          </View>

          {subtotal > 0 && subtotal < 499 && (
            <View style={styles.shippingNotice}>
              <Ionicons name="information-circle" size={16} color="#f59e0b" />
              <Text style={styles.shippingNoticeText}>
                {getShippingMessage(subtotal)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push("/checkout")}
            activeOpacity={0.8}
            disabled={itemCount === 0}
          >
            <LinearGradient
              colors={["#e11d48", "#be185d"]}
              style={styles.checkoutGradient}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.policyContainer}>
            <Text style={styles.policyText}>
              {getShippingMessage(subtotal)}
            </Text>
            <Text style={styles.policyText}>7-day return policy</Text>
          </View>
        </View>
      </View>
      <BottomNavigation currentRoute="/cart" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#f9fafb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#db2777",
  },
  itemCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },
  exploreButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  exploreGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exploreButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  cartList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cartItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  stockStatus: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quantityButtonDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#f3f4f6",
  },
  quantityDisplay: {
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e11d48",
  },
  removeButton: {
    padding: 8,
    alignSelf: "flex-start",
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  freeShipping: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
  },
  shippingNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  shippingNoticeText: {
    fontSize: 12,
    color: "#d97706",
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  totalRow: {
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e11d48",
  },
  checkoutButton: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  checkoutGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  checkoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  policyContainer: {
    alignItems: "center",
  },
  policyText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: "#e11d48",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BottomNavigation from "../components/common/BottomNavigation";
import { TopHeader } from "../components/common/TopHeader";
import { TouchableOpacity } from "../components/common/TouchableOpacity";
import { useApiCart } from "../contexts/ApiCartContext";
import { calculateShipping, calculateTotal } from "../utils/cartHelpers";

// Memoized cart item component
const CartItem = memo(function CartItem({
  item,
  isProcessing,
  updateItemQuantity,
  removeItem,
}: {
  item: any;
  isProcessing: Record<string, boolean>;
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
}) {
  const handleDecrement = useCallback(() => {
    updateItemQuantity(item.id, item.quantity - 1);
  }, [item.id, item.quantity, updateItemQuantity]);

  const handleIncrement = useCallback(() => {
    updateItemQuantity(item.id, item.quantity + 1);
  }, [item.id, item.quantity, updateItemQuantity]);

  const handleRemove = useCallback(() => {
    removeItem(item.id);
  }, [item.id, removeItem]);

  const handleProductPress = useCallback(() => {
    router.push(`/product/${item.productId}`);
  }, [item.productId]);

  return (
    <View style={styles.cartItem}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              (item as any).productImages?.[0] ||
              "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=120&h=120&fit=crop&crop=center",
          }}
          style={styles.productImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={item.id}
        />
      </View>
      <View style={styles.itemDetails}>
        <TouchableOpacity onPress={handleProductPress} activeOpacity={0.7}>
          <Text style={styles.productName} numberOfLines={2}>
            {(item as any).productName || "Unknown Product"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.productPrice}>
          ₹
          {(
            (item as any).productDiscountPrice ||
            (item as any).productPrice ||
            0
          ).toLocaleString()}
        </Text>
        <Text style={styles.stockStatus}>
          {(item as any).productInStock ? "In stock" : "Out of stock"}
        </Text>
        <View style={styles.quantityRow}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity <= 1 && styles.quantityButtonDisabled,
              ]}
              onPress={handleDecrement}
              disabled={isProcessing[item.id] || item.quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={16}
                color={item.quantity <= 1 ? "#9ca3af" : "#374151"}
              />
            </TouchableOpacity>
            {isProcessing[item.id] ? (
              <ActivityIndicator size="small" color="#e11d48" />
            ) : (
              <Text style={styles.quantityText}>{item.quantity}</Text>
            )}
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncrement}
              disabled={isProcessing[item.id]}
            >
              <Ionicons name="add" size={16} color="#374151" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleRemove}
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
    </View>
  );
});

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
        sum +
        ((item as any).productDiscountPrice ||
          (item as any).productPrice ||
          0) *
          item.quantity,
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

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Render cart item using memoized component
  const renderCartItem = useCallback(
    ({ item }: { item: any }) => (
      <CartItem
        item={item}
        isProcessing={isProcessing}
        updateItemQuantity={updateItemQuantity}
        removeItem={removeItem}
      />
    ),
    [isProcessing, updateItemQuantity, removeItem]
  );

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: any) => item.id, []);

  // Cart summary footer component
  const CartSummary = useMemo(
    () => (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
          </Text>
          <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text
            style={[
              styles.summaryValue,
              shippingCharges === 0 && styles.freeShipping,
            ]}
          >
            {shippingCharges === 0
              ? "Free"
              : `₹${shippingCharges.toLocaleString()}`}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push("/checkout")}
          activeOpacity={0.8}
          disabled={itemCount === 0}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    ),
    [itemCount, subtotal, shippingCharges, total]
  );

  // Cart header component
  const CartHeader = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.itemCount}>
          {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
        </Text>
      </View>
    ),
    [itemCount]
  );

  return (
    <View style={styles.container}>
      <TopHeader />

      {isInitialLoading ? (
        <View style={styles.content}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={styles.loadingText}>Loading your cart...</Text>
          </View>
        </View>
      ) : error ? (
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
      ) : !cartItems || cartItems.length === 0 ? (
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
      ) : (
        <FlatList
          style={styles.content}
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={CartHeader}
          ListFooterComponent={CartSummary}
          contentContainerStyle={styles.flatListContent}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              colors={["#e11d48"]}
              tintColor="#e11d48"
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={5}
        />
      )}

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
  flatListContent: {
    paddingBottom: 20,
  },
  cartItemsContainer: {
    marginBottom: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#f9fafb",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 16,
    color: "#6b7280",
  },
  cartList: {
    paddingBottom: 20,
  },
  cartItem: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
    marginRight: 12,
  },
  productImage: {
    width: 100,
    height: 100,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3b82f6",
    marginBottom: 8,
    lineHeight: 22,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  stockStatus: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "500",
    marginBottom: 16,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quantityButtonDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#f3f4f6",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    minWidth: 24,
    textAlign: "center",
  },
  deleteButton: {
    padding: 8,
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#1f2937",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  freeShipping: {
    color: "#16a34a",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  checkoutButton: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
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

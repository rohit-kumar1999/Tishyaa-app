import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../contexts/CartContext";
import { formatCurrency } from "../utils";

export default function CartScreen() {
  const { items, total, itemCount, removeItem, updateQuantity, isLoading } =
    useCart();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C9A961" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some beautiful jewelry to get started
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color="#C9A961" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color="#C9A961" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{itemCount} items</Text>
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      {/* Cart Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({itemCount} items)</Text>
          <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>FREE</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push("/checkout")}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: "#C9A961",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cartList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cartItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C9A961",
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: {
    padding: 8,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#C9A961",
  },
  checkoutButton: {
    backgroundColor: "#C9A961",
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
});

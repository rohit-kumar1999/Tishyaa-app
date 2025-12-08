// Example integration file showing how to use all migrated hooks and contexts
import React from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { CartProvider, useCart } from "./contexts/CartContext";
import {
  HomepageDataProvider,
  useHomepageData,
} from "./contexts/HomepageDataContext";
import { useToast } from "./hooks/use-toast";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { usePayment } from "./hooks/usePayment";
import { useScreenDimensions } from "./hooks/usePerformanceOptimization";
import { useProductManager } from "./hooks/useProductManager";
import { signInUser, signOutUser, useUserData } from "./hooks/useUserData";
import { Product } from "./types";

// Example component using multiple hooks
const ExampleProductList = () => {
  const { featuredProducts, isLoading } = useHomepageData();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useProductManager();
  const { isSignedIn } = useUserData();
  const { toast } = useToast();
  const { width } = useScreenDimensions();
  const [favorites, setFavorites] = useLocalStorage<string[]>("favorites", []);

  const handleAddToCart = (product: Product) => {
    if (!isSignedIn) {
      Alert.alert("Sign In Required", "Please sign in to add items to cart");
      return;
    }

    addItem(product);
    toast({
      title: "Success",
      description: `${product.name} added to cart`,
    });
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={{ padding: 16, width: width / 2 - 24 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.name}</Text>
      <Text style={{ fontSize: 14, color: "#666" }}>₹{item.price}</Text>

      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <TouchableOpacity
          onPress={() => handleAddToCart(item)}
          style={{
            backgroundColor: "#007AFF",
            padding: 8,
            borderRadius: 4,
            flex: 1,
            marginRight: 4,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Add to Cart
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleWishlist(item)}
          style={{
            backgroundColor: isInWishlist(item.id) ? "#FF3B30" : "#34C759",
            padding: 8,
            borderRadius: 4,
            flex: 1,
            marginLeft: 4,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            {isInWishlist(item.id) ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading products...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={featuredProducts}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={{ padding: 16 }}
    />
  );
};

// Example cart component
const ExampleCart = () => {
  const {
    items,
    total,
    subtotal,
    tax,
    shipping,
    discount,
    updateQuantity,
    removeItem,
    clearCart,
    applyDiscount,
  } = useCart();

  const handleApplyDiscount = () => {
    Alert.prompt(
      "Apply Discount",
      "Enter discount amount:",
      (text) => {
        const amount = parseFloat(text);
        if (!isNaN(amount) && amount > 0) {
          applyDiscount(amount);
        }
      },
      "plain-text",
      "",
      "numeric"
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Cart ({items.length} items)
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {item.name}
              </Text>
              <Text style={{ color: "#666" }}>
                ₹{item.price} x {item.quantity}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                style={{
                  padding: 8,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 4,
                }}
              >
                <Text>-</Text>
              </TouchableOpacity>

              <Text style={{ marginHorizontal: 12 }}>{item.quantity}</Text>

              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                style={{
                  padding: 8,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 4,
                }}
              >
                <Text>+</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeItem(item.id)}
                style={{
                  padding: 8,
                  backgroundColor: "#FF3B30",
                  borderRadius: 4,
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: "white" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View
        style={{
          marginTop: 20,
          padding: 16,
          backgroundColor: "#f9f9f9",
          borderRadius: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <Text>Subtotal:</Text>
          <Text>₹{subtotal.toFixed(2)}</Text>
        </View>
        {discount > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text style={{ color: "#34C759" }}>Discount:</Text>
            <Text style={{ color: "#34C759" }}>-₹{discount.toFixed(2)}</Text>
          </View>
        )}
        {tax > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text>Tax:</Text>
            <Text>₹{((subtotal - discount) * (tax / 100)).toFixed(2)}</Text>
          </View>
        )}
        {shipping > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text>Shipping:</Text>
            <Text>₹{shipping.toFixed(2)}</Text>
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: "#ddd",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Total:</Text>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            ₹{total.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", marginTop: 16 }}>
        <TouchableOpacity
          onPress={handleApplyDiscount}
          style={{
            backgroundColor: "#34C759",
            padding: 12,
            borderRadius: 4,
            flex: 1,
            marginRight: 8,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Apply Discount
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => clearCart()}
          style={{
            backgroundColor: "#FF3B30",
            padding: 12,
            borderRadius: 4,
            flex: 1,
            marginLeft: 8,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Clear Cart
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main app component showing provider setup
const ExampleApp = () => {
  return (
    <CartProvider>
      <HomepageDataProvider>
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
              marginVertical: 20,
            }}
          >
            Tishyaa Jewels Mobile
          </Text>

          {/* This would be your navigation setup */}
          <ExampleProductList />
          {/* <ExampleCart /> */}
        </View>
      </HomepageDataProvider>
    </CartProvider>
  );
};

export default ExampleApp;

// Additional helper components for testing

export const TestUserAuth = () => {
  const { isSignedIn, userFullName } = useUserData();

  const handleSignIn = async () => {
    const success = await signInUser({
      id: "123",
      fullName: "Test User",
      email: "test@example.com",
    });
    if (success) {
      Alert.alert("Success", "Signed in successfully");
    }
  };

  const handleSignOut = async () => {
    const success = await signOutUser();
    if (success) {
      Alert.alert("Success", "Signed out successfully");
    }
  };

  return (
    <View style={{ padding: 16 }}>
      {isSignedIn ? (
        <View>
          <Text>Welcome, {userFullName}!</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Text>Sign Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={handleSignIn}>
          <Text>Sign In</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const TestPayment = () => {
  const { processPayment, isProcessing } = usePayment();
  const { userId } = useUserData();

  const handlePayment = async () => {
    if (!userId) {
      Alert.alert("Error", "Please sign in first");
      return;
    }

    const success = await processPayment({
      userId,
      cartIds: ["cart1", "cart2"],
      addressId: "addr123",
      paymentMethod: "razorpay",
      amount: 1500,
    });

    if (success) {
      Alert.alert("Success", "Payment completed successfully!");
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePayment}
      disabled={isProcessing}
      style={{
        backgroundColor: isProcessing ? "#ccc" : "#007AFF",
        padding: 12,
        borderRadius: 4,
        margin: 16,
      }}
    >
      <Text style={{ color: "white", textAlign: "center" }}>
        {isProcessing ? "Processing..." : "Test Payment (₹15.00)"}
      </Text>
    </TouchableOpacity>
  );
};

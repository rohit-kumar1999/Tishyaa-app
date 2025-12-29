import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CartItem as CartItemType } from "../types";
import { TouchableOpacity } from "./common/TouchableOpacity";

interface CartItemProps {
  item: CartItemType;
  updateItemQuantity: (id: string, quantity: number) => void;
  refetch: () => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  updateItemQuantity,
  refetch,
}) => {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      updateItemQuantity(item.id, 0);
    } else {
      updateItemQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    updateItemQuantity(item.id, 0);
  };

  // Handle case where product might not be present
  const productName = item.name;
  const productPrice = item.price;
  const productImage = item.images;

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri:
            (Array.isArray(productImage) ? productImage[0] : productImage) ||
            "https://via.placeholder.com/64x64",
        }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
      />

      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {productName}
        </Text>
        <Text style={styles.price}>₹{productPrice?.toLocaleString()}</Text>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color="#374151" />
        </TouchableOpacity>

        <Text style={styles.quantity}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.total}>
          ₹{(productPrice * item.quantity).toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
        <Ionicons name="close" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: "#6b7280",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    marginHorizontal: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  quantity: {
    width: 40,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  totalContainer: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  total: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});

export { CartItem };

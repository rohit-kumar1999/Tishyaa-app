import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../contexts/CartContext";
import { useProductManager } from "../hooks/useProductManager";
import { RootStackParamList } from "../types";
import { formatCurrency } from "../utils";

type ProductDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ProductDetail"
>;
type ProductDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "ProductDetail"
>;

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist, isWishlistProcessing } =
    useProductManager();

  const { productId } = route.params;

  // Mock product data - in a real app, fetch based on productId
  const product = {
    id: productId,
    name: "Diamond Pendant Set",
    description:
      "Exquisite diamond pendant set crafted with precision and elegance. Perfect for special occasions and everyday wear.",
    price: 25000,
    originalPrice: 30000,
    images: [
      "https://via.placeholder.com/300x300/C9A961/FFFFFF?text=Product+1",
      "https://via.placeholder.com/300x300/C9A961/FFFFFF?text=Product+2",
      "https://via.placeholder.com/300x300/C9A961/FFFFFF?text=Product+3",
    ],
    category: "Necklaces",
    materials: ["Gold", "Diamond", "Sterling Silver"],
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    stockQuantity: 5,
    care: [
      "Store in a dry place",
      "Clean with soft cloth",
      "Avoid contact with perfumes",
      "Remove before swimming",
    ],
  };

  const handleAddToCart = () => {
    addItem(product as any);
    // Show success message or navigate to cart
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image Gallery */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.imageGallery}
      >
        {product.images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.category}>{product.category}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.wishlistButton,
              isInWishlist(product.id) && styles.wishlistButtonActive,
            ]}
            onPress={() => toggleWishlist(product as any)}
            disabled={isWishlistProcessing[product.id]}
          >
            {isWishlistProcessing[product.id] ? (
              <Ionicons name="heart" size={24} color="#C9A961" />
            ) : (
              <Ionicons
                name={isInWishlist(product.id) ? "heart" : "heart-outline"}
                size={24}
                color="#C9A961"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Rating */}
        <View style={styles.ratingSection}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{product.rating}</Text>
            <Text style={styles.reviewCount}>
              ({product.reviewCount} reviews)
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewReviews}>View Reviews</Text>
          </TouchableOpacity>
        </View>

        {/* Price */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              {formatCurrency(product.originalPrice)}
            </Text>
          )}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(
                ((product.originalPrice! - product.price) /
                  product.originalPrice!) *
                  100
              )}
              % OFF
            </Text>
          </View>
        </View>

        {/* Stock Status */}
        <View style={styles.stockSection}>
          <Ionicons
            name={product.inStock ? "checkmark-circle" : "close-circle"}
            size={16}
            color={product.inStock ? "#4CAF50" : "#f44336"}
          />
          <Text
            style={[
              styles.stockText,
              { color: product.inStock ? "#4CAF50" : "#f44336" },
            ]}
          >
            {product.inStock
              ? `In Stock (${product.stockQuantity} available)`
              : "Out of Stock"}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Materials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materials</Text>
          <View style={styles.materialsContainer}>
            {product.materials.map((material, index) => (
              <View key={index} style={styles.materialTag}>
                <Text style={styles.materialText}>{material}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Care Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Instructions</Text>
          {product.care.map((instruction, index) => (
            <View key={index} style={styles.careItem}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.careText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            !product.inStock && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <Ionicons name="bag-add" size={20} color="#fff" />
          <Text style={styles.addToCartText}>
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.buyNowButton,
            !product.inStock && styles.disabledButton,
          ]}
          disabled={!product.inStock}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageGallery: {
    height: 300,
  },
  productImage: {
    width: width,
    height: 300,
  },
  productInfo: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: "#C9A961",
    fontWeight: "500",
  },
  wishlistButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  wishlistButtonActive: {
    backgroundColor: "rgba(201, 169, 97, 0.1)",
    borderWidth: 1,
    borderColor: "#C9A961",
  },
  ratingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: "#666",
  },
  viewReviews: {
    fontSize: 14,
    color: "#C9A961",
    fontWeight: "500",
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C9A961",
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  stockSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  stockText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  materialsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  materialTag: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  materialText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  careItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  careText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#C9A961",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
  buyNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});

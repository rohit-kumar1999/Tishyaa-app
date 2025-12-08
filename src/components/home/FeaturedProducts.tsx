import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useHomepageDataContext } from "../../contexts/HomepageDataContext";

const screenWidth = Dimensions.get("window").width;

export const FeaturedProducts = () => {
  const { featuredProducts, isLoading, error } = useHomepageDataContext();

  const handleToggleWishlist = (product: any) => {
    // Implement wishlist functionality
    console.log("Toggle wishlist for:", product.name);
  };

  const handleAddToCart = (product: any) => {
    // Implement add to cart functionality
    console.log("Add to cart:", product.name);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleViewAllPress = () => {
    router.push("/products");
  };

  const renderProduct = (product: (typeof featuredProducts)[0]) => (
    <View key={product.id} style={styles.productCard}>
      <TouchableOpacity
        onPress={() => handleProductPress(product.id)}
        style={styles.productButton}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {/* Product Image */}
          <Image
            source={{
              uri:
                product.images[0] ||
                "https://via.placeholder.com/400x400/f3f4f6/e11d48?text=Product",
            }}
            style={styles.productImage}
            contentFit="cover"
          />

          {/* Badges */}
          <View style={styles.badgeContainer}>
            {!product.active && (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.badgeText}>Out of Stock</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={() => handleToggleWishlist(product)}
              activeOpacity={0.8}
            >
              <Ionicons name="heart-outline" size={16} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Quick Add to Cart */}
          <View style={styles.cartButtonContainer}>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                !product.active && styles.disabledButton,
              ]}
              onPress={() => handleAddToCart(product)}
              disabled={!product.active}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#e11d48", "#ec4899"]}
                style={styles.cartButtonGradient}
              >
                <Ionicons name="bag-outline" size={14} color="#ffffff" />
                <Text style={styles.cartButtonText}>Add to Cart</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>

          <View style={styles.ratingContainer}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
            <Text style={styles.reviewCount}>
              ({product.ratingCount} reviews)
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <Text style={styles.sectionSubtitle}>
              Discover our most loved pieces, carefully selected for their
              exceptional design and quality
            </Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e11d48" />
          </View>
        </View>
      </View>
    );
  }

  // Show error message if there's an error and no products
  if (error && featuredProducts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <Text style={styles.sectionSubtitle}>
              Unable to load products. Please try again later.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <Text style={styles.sectionSubtitle}>
            Discover our most loved pieces, carefully selected for their
            exceptional design and quality
          </Text>
        </View>

        {/* Products Grid - 2 per row */}
        <View style={styles.productsGrid}>
          {featuredProducts
            .reduce((rows: any[], product: any, index: number) => {
              if (index % 2 === 0) {
                rows.push([product]);
              } else {
                rows[rows.length - 1].push(product);
              }
              return rows;
            }, [])
            .map((row: any[], rowIndex: number) => (
              <View key={rowIndex} style={styles.productRow}>
                {row.map(renderProduct)}
              </View>
            ))}
        </View>

        {/* View All Button */}
        <View style={styles.viewAllContainer}>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={handleViewAllPress}
            activeOpacity={0.8}
          >
            <Text style={styles.viewAllButtonText}>View All Products</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 64,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: screenWidth > 1024 ? 36 : 30,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 600,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  productsGrid: {
    gap: 16,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  productButton: {
    width: "100%",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  badgeContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "column",
    gap: 4,
  },
  outOfStockBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "column",
    gap: 8,
    opacity: 1, // Always visible on mobile
  },
  wishlistButton: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cartButtonContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    opacity: 1, // Always visible on mobile
  },
  addToCartButton: {
    borderRadius: 8,
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cartButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  cartButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  productInfo: {
    padding: 16,
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 20,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  reviewCount: {
    fontSize: 12,
    color: "#6b7280",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  viewAllContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  viewAllButton: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
});

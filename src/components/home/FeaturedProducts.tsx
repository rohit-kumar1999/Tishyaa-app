import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useApiCart } from "../../contexts/ApiCartContext";
import { useHomepageDataContext } from "../../contexts/HomepageDataContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { Product } from "../../types";
import { TouchableOpacity } from "../common/TouchableOpacity";

const screenWidth = Dimensions.get("window").width;

export const FeaturedProducts = memo(() => {
  const { featuredProducts, isLoading, isFetching, error } =
    useHomepageDataContext();
  const { toggleWishlist, isInWishlist, isWishlistProcessing } = useWishlist();
  const { addItemToCart, isProcessing: isCartProcessing } = useApiCart();

  const handleToggleWishlist = useCallback(
    (product: any) => {
      // Convert product to Product type for toggleWishlist
      const productData: Product = {
        id: product.id,
        name: product.name || "",
        description: product.description || "",
        discountedPrice: product.discountedPrice || product.price || 0,
        regularPrice:
          product.regularPrice || product.discountedPrice || product.price || 0,
        images: product.images || [],
        category: product.category || "",
        subcategory: product.subcategory,
        tags: product.tags || [],
        stockQuantity: product.stockQuantity || 0,
        weight: product.weight,
        dimensions: product.dimensions,
        care: product.care || [],
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        featured: product.featured || false,
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: product.updatedAt || new Date().toISOString(),
      };
      toggleWishlist(productData);
    },
    [toggleWishlist]
  );

  const handleAddToCart = useCallback(
    (product: any) => {
      addItemToCart(product.id, 1, true);
    },
    [addItemToCart]
  );

  const handleProductPress = useCallback((productId: string) => {
    router.push(`/product/${productId}`);
  }, []);

  const handleViewAllPress = useCallback(() => {
    router.push("/products");
  }, []);

  const renderProduct = (product: NonNullable<typeof featuredProducts>[0]) => (
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
            cachePolicy="memory-disk"
          />

          {/* Badges */}
          <View style={styles.badgeContainer}>
            {product.stockQuantity <= 0 && (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.badgeText}>Out of Stock</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.wishlistButton,
                isInWishlist(product.id) && styles.wishlistButtonActive,
              ]}
              onPress={() => handleToggleWishlist(product)}
              disabled={isWishlistProcessing[product.id]}
              activeOpacity={0.8}
            >
              {isWishlistProcessing[product.id] ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <Ionicons
                  name={isInWishlist(product.id) ? "heart" : "heart-outline"}
                  size={16}
                  color={isInWishlist(product.id) ? "#dc2626" : "#374151"}
                />
              )}
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
              disabled={!product.active || isCartProcessing[product.id]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#e11d48", "#ec4899"]}
                style={styles.cartButtonGradient}
              >
                {isCartProcessing[product.id] ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="bag-outline" size={14} color="#ffffff" />
                    <Text style={styles.cartButtonText}>Add to Cart</Text>
                  </>
                )}
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
            {(() => {
              // Derived values
              const discountedPrice = Number(product.discountedPrice) || 0;
              const regularPrice =
                Number(product.regularPrice) || discountedPrice;
              const discountPercent =
                discountedPrice && regularPrice > discountedPrice
                  ? Math.round(
                      ((regularPrice - discountedPrice) / regularPrice) * 100
                    )
                  : 0;
              const effectivePrice = discountedPrice || regularPrice;

              return discountPercent > 0 ? (
                <>
                  <Text style={styles.discountPrice}>
                    ₹{effectivePrice.toLocaleString()}
                  </Text>
                  <Text style={styles.originalPrice}>
                    ₹{regularPrice.toLocaleString()}
                  </Text>
                </>
              ) : (
                <Text style={styles.price}>
                  ₹{effectivePrice.toLocaleString()}
                </Text>
              );
            })()}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Only show loading state when there's no cached data
  if (isLoading && (!featuredProducts || featuredProducts.length === 0)) {
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
  if (error && (!featuredProducts || featuredProducts.length === 0)) {
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
          {(featuredProducts || [])
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
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    backgroundColor: "#fff5f7",
  },
  contentContainer: {
    paddingHorizontal: 12,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
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
    gap: 8,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
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
    aspectRatio: 0.8,
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
    top: 8,
    right: 8,
    flexDirection: "column",
    gap: 4,
    opacity: 1, // Always visible on mobile
  },
  wishlistButton: {
    width: 28,
    height: 28,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  wishlistButtonActive: {
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  cartButtonContainer: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
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
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 3,
  },
  cartButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  productInfo: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  discountPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e11d48",
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6b7280",
    textDecorationLine: "line-through",
  },
  viewAllContainer: {
    alignItems: "center",
    marginTop: 20,
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

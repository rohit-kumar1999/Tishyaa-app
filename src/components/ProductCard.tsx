import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useApiCart } from "../contexts/ApiCartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useToast } from "../hooks/use-toast";
import { Product } from "../services/productService";
import { TouchableOpacity } from "./common/TouchableOpacity";

const { width } = Dimensions.get("window");
const cardWidth = (width - 24) / 2; // 2 columns with minimal margins

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

const ProductCard: React.FC<ProductCardProps> = memo(function ProductCard({
  product,
  viewMode = "grid",
}) {
  const { isInWishlist, toggleWishlist, isWishlistProcessing } = useWishlist();
  const { addItemToCart, isProcessing: isCartProcessing } = useApiCart();

  const isProductInWishlist = isInWishlist(product.id);
  const isWishlistLoading = isWishlistProcessing[product.id] || false;
  const isCartLoading = isCartProcessing[product.id] || false;
  const router = useRouter();
  const { toast } = useToast();

  const isOutOfStock = useMemo(
    () => product.stockQuantity <= 0,
    [product.active, product.stockQuantity]
  );

  const addProductToCart = useCallback(
    (prod: Product) => {
      addItemToCart(prod.id, 1, true); // Set navigateToCart to true
    },
    [addItemToCart]
  );

  const handleProductPress = useCallback(() => {
    router.push(`/product/${product.id}`);
  }, [router, product.id]);

  const handleWishlistPress = useCallback(() => {
    toggleWishlist(product);
  }, [toggleWishlist, product]);

  const handleAddToCart = useCallback(() => {
    if (isOutOfStock) {
      toast({
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }
    addProductToCart(product);
  }, [isOutOfStock, toast, addProductToCart, product]);

  const imageUri = useMemo(() => {
    return product.images && product.images.length > 0 ? product.images[0] : "";
  }, [product.images]);

  const cardStyle = viewMode === "list" ? styles.listCard : styles.gridCard;
  const imageStyle = viewMode === "list" ? styles.listImage : styles.gridImage;
  const contentStyle =
    viewMode === "list" ? styles.listContent : styles.gridContent;

  return (
    <TouchableOpacity
      style={[styles.card, cardStyle]}
      onPress={handleProductPress}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, imageStyle]}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
          recyclingKey={product.id}
        />

        {/* Badges */}
        <View style={styles.badgeContainer}>
          {isOutOfStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>

        {/* Wishlist Button */}
        <TouchableOpacity
          style={[
            styles.wishlistButton,
            isProductInWishlist && styles.wishlistButtonActive,
          ]}
          onPress={handleWishlistPress}
          disabled={isWishlistLoading}
        >
          {isWishlistLoading ? (
            <ActivityIndicator size="small" color="#dc2626" />
          ) : (
            <Ionicons
              name={isProductInWishlist ? "heart" : "heart-outline"}
              size={18}
              color={isProductInWishlist ? "#dc2626" : "#666"}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.content, contentStyle]}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>

          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color="#fbbf24" />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
            <Text style={styles.reviewCount}>(0 reviews)</Text>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {product.description}
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
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  ₹{effectivePrice.toLocaleString()}
                </Text>
                <Text style={styles.originalPrice}>
                  ₹{regularPrice.toLocaleString()}
                </Text>
                <Text style={styles.discountBadge}>{discountPercent}% OFF</Text>
              </View>
            ) : (
              <Text style={styles.price}>
                ₹{effectivePrice.toLocaleString()}
              </Text>
            );
          })()}
        </View>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            isOutOfStock && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={isCartLoading || isOutOfStock}
        >
          {isCartLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="shopping-cart" size={14} color="#fff" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  gridCard: {
    width: cardWidth,
  },
  listCard: {
    flexDirection: "row",
    width: "100%",
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    aspectRatio: 0.8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  listImage: {
    width: 120,
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badgeContainer: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  outOfStockBadge: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  outOfStockText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  wishlistButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  wishlistButtonActive: {
    backgroundColor: "#fef2f2",
  },
  content: {
    padding: 10,
    flex: 1,
  },
  gridContent: {
    minHeight: 100,
  },
  listContent: {
    justifyContent: "space-between",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 10,
    color: "#6b7280",
    marginLeft: 6,
  },
  description: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 15,
    marginBottom: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceContainer: {
    marginBottom: 0,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  originalPrice: {
    fontSize: 12,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#16a34a",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  wishlistActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#dc2626",
    backgroundColor: "transparent",
  },
  wishlistActionText: {
    fontSize: 12,
    color: "#dc2626",
    marginLeft: 4,
    fontWeight: "500",
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#e11d48",
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  addToCartText: {
    fontSize: 11,
    color: "#fff",
    marginLeft: 4,
    fontWeight: "600",
  },
});

export { ProductCard };
export default ProductCard;

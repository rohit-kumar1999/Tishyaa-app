import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;

// Mock product data - replace with actual API call
const mockProduct = {
  id: "1",
  name: "Rose Gold Diamond Ring",
  price: 25999,
  originalPrice: 30999,
  rating: 4.8,
  reviewCount: 124,
  images: [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1543294001-f7cd5d7fb134?w=600&h=600&fit=crop",
  ],
  category: "rings",
  active: true,
  discount: 16,
  description:
    "Elegant rose gold ring featuring a brilliant diamond centerpiece. Crafted with precision and designed for timeless beauty.",
  details: [
    "Metal: 18K Rose Gold",
    "Stone: Natural Diamond (0.5 Carat)",
    "Ring Size: Adjustable (US 5-9)",
    "Weight: 3.2 grams",
    "Warranty: 1 Year International",
    "Certification: GIA Certified",
  ],
  specifications: {
    material: "18K Rose Gold",
    stone: "Natural Diamond",
    weight: "3.2g",
    certification: "GIA",
  },
  reviews: [
    {
      id: "1",
      name: "Sarah Johnson",
      rating: 5,
      comment:
        "Absolutely stunning! The quality is exceptional and it fits perfectly.",
      date: "2024-01-15",
      verified: true,
    },
    {
      id: "2",
      name: "Michael Chen",
      rating: 5,
      comment: "Beautiful ring, great craftsmanship. My wife loves it!",
      date: "2024-01-10",
      verified: true,
    },
  ],
  inStock: true,
  fastDelivery: true,
  freeShipping: true,
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const scrollY = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const product = mockProduct; // Replace with actual API call

  const headerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: `rgba(255, 255, 255, ${interpolate(
        scrollY.value,
        [0, 100],
        [0, 1],
        Extrapolation.CLAMP
      )})`,
    };
  });

  const handleAddToCart = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Success", "Product added to cart!");
    }, 1000);
  };

  const handleBuyNow = () => {
    router.push("/checkout");
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const renderImageGallery = () => (
    <View style={styles.imageGallery}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.floor(
            event.nativeEvent.contentOffset.x / screenWidth
          );
          setSelectedImageIndex(index);
        }}
      >
        {product.images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={{ uri: image }}
              style={styles.productImage}
              contentFit="cover"
            />
          </View>
        ))}
      </ScrollView>

      {/* Image Indicators */}
      <View style={styles.imageIndicators}>
        {product.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === selectedImageIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      {/* Discount Badge */}
      {product.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{product.discount}%</Text>
        </View>
      )}
    </View>
  );

  const renderProductInfo = () => (
    <View style={styles.productInfo}>
      <Text style={styles.productName}>{product.name}</Text>

      <View style={styles.ratingContainer}>
        <View style={styles.stars}>
          {[...Array(5)].map((_, index) => (
            <Ionicons
              key={index}
              name="star"
              size={16}
              color={index < Math.floor(product.rating) ? "#fbbf24" : "#d1d5db"}
            />
          ))}
        </View>
        <Text style={styles.ratingText}>{product.rating}</Text>
        <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
        {product.originalPrice && (
          <Text style={styles.originalPrice}>
            ₹{product.originalPrice.toLocaleString()}
          </Text>
        )}
      </View>

      <View style={styles.badgesContainer}>
        {product.inStock && (
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={styles.badgeText}>In Stock</Text>
          </View>
        )}
        {product.fastDelivery && (
          <View style={styles.badge}>
            <Ionicons name="flash" size={16} color="#f59e0b" />
            <Text style={styles.badgeText}>Fast Delivery</Text>
          </View>
        )}
        {product.freeShipping && (
          <View style={styles.badge}>
            <Ionicons name="car" size={16} color="#3b82f6" />
            <Text style={styles.badgeText}>Free Shipping</Text>
          </View>
        )}
      </View>

      <Text style={styles.description}>{product.description}</Text>
    </View>
  );

  const renderDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>Product Details</Text>
      {product.details.map((detail, index) => (
        <View key={index} style={styles.detailItem}>
          <Ionicons name="checkmark" size={16} color="#10b981" />
          <Text style={styles.detailText}>{detail}</Text>
        </View>
      ))}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.reviewsContainer}>
      <View style={styles.reviewsHeader}>
        <Text style={styles.sectionTitle}>Reviews ({product.reviewCount})</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {product.reviews.slice(0, 2).map((review) => (
        <View key={review.id} style={styles.reviewItem}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewerName}>{review.name}</Text>
            {review.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          <View style={styles.reviewRating}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name="star"
                size={12}
                color={index < review.rating ? "#fbbf24" : "#d1d5db"}
              />
            ))}
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>

          <Text style={styles.reviewComment}>{review.comment}</Text>
        </View>
      ))}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionContainer}>
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={handleAddToCart}
        disabled={isLoading}
        activeOpacity={0.9}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <>
            <Ionicons name="cart" size={20} color="#ffffff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buyNowButton}
        onPress={handleBuyNow}
        activeOpacity={0.9}
      >
        <Text style={styles.buyNowText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#e11d48" : "#111827"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              /* Share functionality */
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        {renderImageGallery()}
        {renderProductInfo()}
        {renderDetails()}
        {renderReviews()}

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      {renderActionButtons()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  imageGallery: {
    position: "relative",
    height: screenWidth,
  },
  imageContainer: {
    width: screenWidth,
    height: screenWidth,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeIndicator: {
    backgroundColor: "#ffffff",
  },
  discountBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  reviewCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  originalPrice: {
    fontSize: 18,
    color: "#6b7280",
    textDecorationLine: "line-through",
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  description: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  reviewsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#e11d48",
    fontWeight: "500",
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  verifiedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#10b981",
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "500",
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  reviewDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  reviewComment: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingTop: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: "#e11d48",
    borderRadius: 12,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  buyNowButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#111827",
    borderRadius: 12,
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  bottomSpacing: {
    height: 100,
  },
});

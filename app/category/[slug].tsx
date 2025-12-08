import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

// Mock category data
const mockCategories = {
  rings: {
    name: "Rings",
    description: "Elegant rings for every occasion",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=400&fit=crop",
    subcategories: [
      { id: "engagement", name: "Engagement Rings", count: 45 },
      { id: "wedding", name: "Wedding Rings", count: 32 },
      { id: "fashion", name: "Fashion Rings", count: 67 },
      { id: "vintage", name: "Vintage Rings", count: 23 },
    ],
  },
  necklaces: {
    name: "Necklaces",
    description: "Beautiful necklaces to complete your look",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=400&fit=crop",
    subcategories: [
      { id: "pendants", name: "Pendant Necklaces", count: 54 },
      { id: "chains", name: "Chain Necklaces", count: 38 },
      { id: "chokers", name: "Chokers", count: 29 },
      { id: "statement", name: "Statement Necklaces", count: 41 },
    ],
  },
};

// Mock products data for category
const mockCategoryProducts = [
  {
    id: "1",
    name: "Diamond Solitaire Ring",
    price: 45999,
    originalPrice: 52999,
    rating: 4.9,
    reviewCount: 156,
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
    discount: 13,
    inStock: true,
  },
  {
    id: "2",
    name: "Rose Gold Band Ring",
    price: 18999,
    rating: 4.7,
    reviewCount: 89,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
    inStock: true,
  },
  {
    id: "3",
    name: "Vintage Emerald Ring",
    price: 32999,
    rating: 4.8,
    reviewCount: 124,
    image:
      "https://images.unsplash.com/photo-1543294001-f7cd5d7fb134?w=400&h=400&fit=crop",
    inStock: false,
  },
  // Add more products...
];

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const category = mockCategories[slug as keyof typeof mockCategories];
  const products = mockCategoryProducts;

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#6b7280" />
        <Text style={styles.errorText}>Category not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleSubcategoryPress = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    // Filter products by subcategory
  };

  const renderCategoryHeader = () => (
    <View style={styles.categoryHeader}>
      <Image
        source={{ uri: category.image }}
        style={styles.categoryImage}
        contentFit="cover"
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
        </View>
      </LinearGradient>

      <TouchableOpacity
        style={styles.backButtonHeader}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  const renderSubcategories = () => (
    <View style={styles.subcategoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subcategoriesList}
      >
        <TouchableOpacity
          style={[
            styles.subcategoryItem,
            selectedSubcategory === "all" && styles.selectedSubcategory,
          ]}
          onPress={() => handleSubcategoryPress("all")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.subcategoryText,
              selectedSubcategory === "all" && styles.selectedSubcategoryText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {category.subcategories.map((subcategory) => (
          <TouchableOpacity
            key={subcategory.id}
            style={[
              styles.subcategoryItem,
              selectedSubcategory === subcategory.id &&
                styles.selectedSubcategory,
            ]}
            onPress={() => handleSubcategoryPress(subcategory.id)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.subcategoryText,
                selectedSubcategory === subcategory.id &&
                  styles.selectedSubcategoryText,
              ]}
            >
              {subcategory.name}
            </Text>
            <Text
              style={[
                styles.subcategoryCount,
                selectedSubcategory === subcategory.id &&
                  styles.selectedSubcategoryCount,
              ]}
            >
              ({subcategory.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
        <Ionicons name="options" size={20} color="#374151" />
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sortButton} activeOpacity={0.8}>
        <Text style={styles.sortButtonText}>Sort: Featured</Text>
        <Ionicons name="chevron-down" size={16} color="#374151" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewButton} activeOpacity={0.8}>
        <Ionicons name="grid" size={20} color="#374151" />
      </TouchableOpacity>
    </View>
  );

  const renderProductCard = (product: (typeof mockCategoryProducts)[0]) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => handleProductPress(product.id)}
      activeOpacity={0.9}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          contentFit="cover"
        />

        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}

        {!product.inStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}

        <TouchableOpacity style={styles.wishlistButton} activeOpacity={0.8}>
          <Ionicons name="heart-outline" size={16} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#fbbf24" />
          <Text style={styles.ratingText}>{product.rating}</Text>
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              ₹{product.originalPrice.toLocaleString()}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderCategoryHeader()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSubcategories()}
        {renderFilterBar()}

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {products.length} products found
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {products.map(renderProductCard)}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  categoryHeader: {
    position: "relative",
    height: 200,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: "flex-end",
  },
  headerContent: {
    padding: 20,
    paddingBottom: 16,
  },
  categoryName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  backButtonHeader: {
    position: "absolute",
    top: 60,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  subcategoriesContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  subcategoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  subcategoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    gap: 4,
  },
  selectedSubcategory: {
    backgroundColor: "#e11d48",
  },
  subcategoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  selectedSubcategoryText: {
    color: "#ffffff",
  },
  subcategoryCount: {
    fontSize: 12,
    color: "#6b7280",
  },
  selectedSubcategoryCount: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  viewButton: {
    padding: 8,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: "#6b7280",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    padding: 16,
    justifyContent: "space-between",
  },
  productCard: {
    width: screenWidth > 640 ? "48%" : "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  productImageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ef4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  outOfStockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
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
  originalPrice: {
    fontSize: 12,
    color: "#6b7280",
    textDecorationLine: "line-through",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#e11d48",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 20,
  },
});

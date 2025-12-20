import ProductCard from "@/src/components/ProductCard";
import { useWishlist } from "@/src/contexts/WishlistContext";
import { Product } from "@/src/services/productService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavigation from "../src/components/common/BottomNavigation";
import { TopHeader } from "../src/components/common/TopHeader";

// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 3;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 2) {
        pages.push(-1); // Ellipsis
      }
      if (currentPage !== 1 && currentPage !== totalPages) {
        pages.push(currentPage);
      }
      if (currentPage < totalPages - 1) {
        pages.push(-1); // Ellipsis
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <View style={styles.paginationContainer}>
      {/* Previous Button */}
      <TouchableOpacity
        style={[
          styles.paginationButton,
          currentPage === 1 && styles.paginationButtonDisabled,
        ]}
        onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color={currentPage === 1 ? "#9ca3af" : "#374151"}
        />
      </TouchableOpacity>

      {/* Page Numbers */}
      <View style={styles.pageNumbersContainer}>
        {getPageNumbers().map((page, index) =>
          page === -1 ? (
            <Text key={`ellipsis-${index}`} style={styles.ellipsis}>
              ...
            </Text>
          ) : (
            <TouchableOpacity
              key={`page-${page}`}
              style={[
                styles.pageButton,
                page === currentPage && styles.pageButtonActive,
              ]}
              onPress={() => onPageChange(page)}
            >
              <Text
                style={[
                  styles.pageButtonText,
                  page === currentPage && styles.pageButtonTextActive,
                ]}
              >
                {page}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[
          styles.paginationButton,
          currentPage === totalPages && styles.paginationButtonDisabled,
        ]}
        onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={currentPage === totalPages ? "#9ca3af" : "#374151"}
        />
      </TouchableOpacity>
    </View>
  );
};

// Main Wishlist Screen
export default function WishlistScreen() {
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 8;

  const {
    wishlist,
    isWishlistLoading,
    wishlistError,
    toggleWishlist,
    isWishlistProcessing,
    refetchWishlist,
  } = useWishlist();

  // Pagination calculations
  const totalItems = wishlist?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = wishlist?.slice(startIndex, endIndex) || [];

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchWishlist();
    } catch (error) {
      console.error("Failed to refresh wishlist:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Helper function to render content based on state
  const renderContent = () => {
    if (isWishlistLoading) {
      return (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Wishlist</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={styles.loadingText}>Loading your wishlist...</Text>
          </View>
        </>
      );
    }

    if (wishlistError) {
      return (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Wishlist</Text>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="heart-outline" size={64} color="#ef4444" />
            <Text style={styles.errorTitle}>Could not load wishlist</Text>
            <Text style={styles.errorSubtitle}>
              There was a problem loading your wishlist items.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (currentItems.length === 0) {
      return (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Wishlist</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Save items you love for later.
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
                <Text style={styles.exploreButtonText}>Explore Collection</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    return (
      <FlatList
        data={currentItems}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Wishlist</Text>
          </View>
        )}
        renderItem={({ item }) => {
          // Transform wishlist item to Product format for ProductCard
          const product: Product = {
            id: item.id,
            name: item.name || "",
            description: "",
            shortDescription: "",
            productType: "jewelry",
            category: "jewelry",
            subcategory: "",
            originalPrice: item.price?.toString() || "0",
            price: item.price || 0,
            discountPrice: null,
            discount: null,
            images: Array.isArray(item.images)
              ? item.images
              : [item.images].filter(Boolean),
            rating: 0,
            ratingCount: 0,
            active: true,
            inStock: item.inStock ?? true,
            stockQuantity: 10,
            specifications: {},
            attributes: {},
            hasPromotion: false,
            promotionText: null,
            promotionType: null,
            promotionData: null,
            tags: [],
            keywords: [],
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return <ProductCard product={product} viewMode="grid" />;
        }}
        keyExtractor={(item, index) => `wishlist-${item.id}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={() =>
          totalPages > 1 ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          ) : null
        }
      />
    );
  };

  // Single return statement with consistent layout
  return (
    <View style={styles.container}>
      <TopHeader />
      <View style={styles.content}>{renderContent()}</View>
      <BottomNavigation currentRoute="/wishlist" />
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#f9fafb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#db2777",
    textAlign: "left",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 32,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
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
    marginBottom: 24,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exploreButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  paginationButtonDisabled: {
    backgroundColor: "#f3f4f6",
    elevation: 0,
    shadowOpacity: 0,
  },
  pageNumbersContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pageButtonActive: {
    backgroundColor: "#e11d48",
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  pageButtonTextActive: {
    color: "white",
  },
  ellipsis: {
    fontSize: 14,
    color: "#6b7280",
    marginHorizontal: 4,
  },
});

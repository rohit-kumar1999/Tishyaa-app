import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavigation from "../components/common/BottomNavigation";
import { TopHeader } from "../components/common/TopHeader";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Product, useProducts } from "../services/productService";

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  materials: string[];
  occasions: string[];
  discounts: string[];
  ratings: number[];
  inStock: boolean;
  sortBy: string;
  sortOrder: string;
  search?: string;
}

const initialFilters: FilterState = {
  categories: [],
  priceRange: [0, 100000],
  materials: [],
  occasions: [],
  discounts: [],
  ratings: [],
  inStock: false,
  sortBy: "createdAt",
  sortOrder: "desc",
  search: undefined,
};

const SORT_OPTIONS = [
  { label: "Newest First", value: "createdAt", order: "desc" },
  { label: "Oldest First", value: "createdAt", order: "asc" },
  { label: "Price: Low to High", value: "price", order: "asc" },
  { label: "Price: High to Low", value: "price", order: "desc" },
  { label: "Name: A to Z", value: "name", order: "asc" },
  { label: "Name: Z to A", value: "name", order: "desc" },
];

export default function ProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [filters, setFilters] = useLocalStorage<FilterState>(
    "productFilters",
    initialFilters
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Ref for scrolling to top
  const flatListRef = useRef<FlatList>(null);

  // Handle initial category from params
  useEffect(() => {
    if (params?.category) {
      setFilters((prev) => ({
        ...prev,
        categories: [params.category as string],
      }));
    }
  }, [params?.category]);

  // Search functionality with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchText !== filters.search) {
        setFilters((prev) => ({ ...prev, search: searchText || undefined }));
        setPageNumber(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchText, filters.search]);

  // Scroll to top when page changes
  useEffect(() => {
    const scrollToTop = () => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    };

    // Small delay to ensure new data is loaded
    const timeoutId = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timeoutId);
  }, [pageNumber]);

  // Define itemsPerPage constant before using it
  const itemsPerPageConstant = 20;

  // Prepare query parameters for useProducts hook with stable references
  const queryParams = useMemo(
    () => ({
      page: pageNumber,
      limit: itemsPerPageConstant,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder as "asc" | "desc",
      categories:
        filters.categories.length > 0 ? filters.categories : undefined,
      materials: filters.materials.length > 0 ? filters.materials : undefined,
      occasions: filters.occasions.length > 0 ? filters.occasions : undefined,
      search: filters.search,
      priceRange:
        filters.priceRange[0] > 0 || filters.priceRange[1] < 100000
          ? filters.priceRange
          : undefined,
      inStock: filters.inStock || undefined,
    }),
    [
      pageNumber,
      itemsPerPageConstant,
      filters.sortBy,
      filters.sortOrder,
      JSON.stringify(filters.categories),
      JSON.stringify(filters.materials),
      JSON.stringify(filters.occasions),
      filters.search,
      JSON.stringify(filters.priceRange),
      filters.inStock,
    ]
  );

  const {
    data: productsResponse,
    products,
    categories,
    materials,
    occasions,
    pagination,
    isLoading,
    error,
    refetch,
  } = useProducts(queryParams);

  const totalPages = pagination?.totalPages || 1;
  const totalProducts = pagination?.totalItems || products.length;
  const currentPage = pagination?.currentPage || pageNumber;
  const itemsPerPage = pagination?.itemsPerPage || itemsPerPageConstant;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== pageNumber) {
      setPageNumber(page);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < totalPages) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber((prev) => prev - 1);
    }
  };

  const getVisiblePageNumbers = (): (number | string)[] => {
    // Fixed number of pages to show (fits mobile screen)
    const maxVisiblePages = 5;

    if (totalPages === 1) return [1];

    // If total pages fit within max, show all
    if (totalPages <= maxVisiblePages) {
      const pages: (number | string)[] = [];
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    const pages: (number | string)[] = [1];

    // Calculate start and end for middle section
    let start = Math.max(2, pageNumber - 1);
    let end = Math.min(totalPages - 1, pageNumber + 1);

    // Adjust if we're near the beginning
    if (pageNumber <= 3) {
      end = Math.min(totalPages - 1, 4);
    }

    // Adjust if we're near the end
    if (pageNumber >= totalPages - 2) {
      start = Math.max(2, totalPages - 3);
    }

    // Add ellipsis and middle pages
    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Add ellipsis and last page
    if (end < totalPages - 1) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const discountPercentage = item.originalPrice
      ? Math.round(
          ((parseFloat(item.originalPrice) - item.price) /
            parseFloat(item.originalPrice)) *
            100
        )
      : item.discount
      ? Math.round(item.discount)
      : 0;

    return (
      <TouchableOpacity
        onPress={() => handleProductPress(item.id)}
        style={styles.productCard}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.images?.[0] || "https://via.placeholder.com/150",
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercentage}% off</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <TouchableOpacity style={styles.heartButton}>
              <Ionicons name="heart-outline" size={20} color="#DC3545" />
            </TouchableOpacity>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{item.rating || "3.9"}</Text>
              <Ionicons
                name="star"
                size={10}
                color="white"
                style={{ marginLeft: 2 }}
              />
            </View>
            <Text style={styles.reviewText}>({item.ratingCount || "68"})</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
            )}
            {discountPercentage > 0 && (
              <Text style={styles.discount}>({discountPercentage}% off)</Text>
            )}
          </View>

          <TouchableOpacity style={styles.addToCartButton}>
            <Ionicons name="bag" size={14} color="white" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeroSection = () => (
    <LinearGradient
      colors={["#F8E8E8", "#F0D0D0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroContainer}
    >
      <Text style={styles.heroTitle}>
        Discover Timeless Artificial Jewellery
      </Text>
      <Text style={styles.heroSubtitle}>
        Elegant, affordable, and perfect for every occasion. Explore our
        handcrafted collections.
      </Text>
    </LinearGradient>
  );

  const renderSortDropdown = () => (
    <TouchableOpacity
      style={styles.sortButton}
      onPress={() => setShowSort(true)}
    >
      <Text style={styles.sortButtonText}>Newest First</Text>
      <Ionicons name="chevron-down" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderFiltersButton = () => (
    <TouchableOpacity
      style={styles.filtersButton}
      onPress={() => setShowFilters(true)}
    >
      <Ionicons name="filter" size={20} color="#000" />
      <Text style={styles.filtersButtonText}>Filters</Text>
      <Text style={styles.showText}>Show</Text>
    </TouchableOpacity>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const visiblePages = getVisiblePageNumbers();

    return (
      <View style={styles.paginationContainer}>
        <View style={styles.paginationControls}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              pageNumber === 1 && styles.paginationButtonDisabled,
            ]}
            onPress={goToPreviousPage}
            disabled={pageNumber === 1}
          >
            <Ionicons
              name="chevron-back"
              size={14}
              color={pageNumber === 1 ? "#CCC" : "#666"}
            />
          </TouchableOpacity>

          <View style={styles.pageNumbersContainer}>
            {visiblePages.map((page, index) => {
              if (page === "...") {
                return (
                  <View key={`dots-${index}`} style={styles.paginationDots}>
                    <Text style={styles.paginationDotsText}>...</Text>
                  </View>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === pageNumber;

              return (
                <TouchableOpacity
                  key={pageNum}
                  style={[
                    styles.pageNumberButton,
                    isActive && styles.pageNumberButtonActive,
                  ]}
                  onPress={() => goToPage(pageNum)}
                >
                  <Text
                    style={[
                      styles.pageNumberText,
                      isActive && styles.pageNumberTextActive,
                    ]}
                  >
                    {pageNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              pageNumber === totalPages && styles.paginationButtonDisabled,
            ]}
            onPress={goToNextPage}
            disabled={pageNumber === totalPages}
          >
            <Ionicons
              name="chevron-forward"
              size={14}
              color={pageNumber === totalPages ? "#CCC" : "#666"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <TopHeader />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Products</Text>
          <Text style={styles.errorMessage}>Please try again later</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <BottomNavigation currentRoute="/products" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader />

      <FlatList
        ref={flatListRef}
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {renderHeroSection()}
            <View style={styles.controlsContainer}>
              {renderSortDropdown()}
              {renderFiltersButton()}
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#C9A961" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={64} color="#CCC" />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptyMessage}>
                Try adjusting your filters or search terms
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          <View>
            {renderPagination()}
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationInfoText}>
                Showing{" "}
                {products.length > 0 ? (pageNumber - 1) * itemsPerPage + 1 : 0}{" "}
                to {Math.min(pageNumber * itemsPerPage, totalProducts)} of{" "}
                {totalProducts} products
              </Text>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <BottomNavigation currentRoute="/products" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContainer: {
    paddingBottom: 20,
  },
  heroContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    marginBottom: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#8B4513",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 22,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sortButtonText: {
    fontSize: 16,
    color: "#000",
  },
  filtersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filtersButtonText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 8,
    flex: 1,
  },
  showText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  discountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#DC3545",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    flex: 1,
    marginRight: 8,
  },
  heartButton: {
    padding: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28A745",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  ratingText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  reviewText: {
    fontSize: 13,
    color: "#666",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 13,
    color: "#666",
    textDecorationLine: "line-through",
    marginRight: 6,
  },
  discount: {
    fontSize: 13,
    color: "#28A745",
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC3545",
    paddingVertical: 8,
    borderRadius: 6,
  },
  addToCartText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EF4444",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#C9A961",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingFooterText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  // Pagination Styles
  paginationContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paginationControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#F9FAFB",
    minWidth: 36,
    justifyContent: "center",
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 12,
    color: "#666",
    marginHorizontal: 2,
  },
  paginationButtonTextDisabled: {
    color: "#CCC",
  },
  pageNumbersContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  pageNumberButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 1,
    borderRadius: 4,
    backgroundColor: "#F9FAFB",
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  pageNumberButtonActive: {
    backgroundColor: "#C9A961",
  },
  pageNumberText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  pageNumberTextActive: {
    color: "white",
    fontWeight: "600",
  },
  paginationDots: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  paginationDotsText: {
    fontSize: 12,
    color: "#CCC",
  },
  paginationInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  paginationInfoText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ProductCard } from "../components/ProductCard";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Mock interfaces and hooks
interface CategoryWithCount {
  id: string;
  name: string;
  count: number;
}

const useGetProducts = () => {
  return {
    data: [] as any[],
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

const { width } = Dimensions.get("window");

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
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const itemsPerPage = 20;

  // Handle initial category from params
  useEffect(() => {
    if (params?.category) {
      setFilters((prev) => ({
        ...prev,
        categories: [params.category as string],
      }));
    }
  }, [params?.category]);

  // Search functionality
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchText !== filters.search) {
        setFilters((prev) => ({ ...prev, search: searchText || undefined }));
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchText]);

  // Prepare query parameters
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      categories: filters.categories,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1],
      materials: filters.materials,
      occasions: filters.occasions,
      discounts: filters.discounts,
      ratings: filters.ratings,
      inStock: filters.inStock,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      search: filters.search,
    }),
    [filters, currentPage]
  );

  const {
    data: productsResponse,
    isLoading,
    error,
    refetch,
  } = useGetProducts();

  const products = productsResponse || [];
  const categories: CategoryWithCount[] = [];
  const materials: CategoryWithCount[] = [];
  const occasions: CategoryWithCount[] = [];
  const totalPages = 1;
  const totalProducts = products.length;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
    setSearchText("");
    setCurrentPage(1);
  };

  const applyFilter = (filterType: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  const toggleArrayFilter = (
    filterType: "categories" | "materials" | "occasions" | "discounts",
    value: string
  ) => {
    setFilters((prev) => {
      const currentArray = prev[filterType] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [filterType]: newArray };
    });
    setCurrentPage(1);
  };

  const applySorting = (sortBy: string, sortOrder: string) => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    setShowSort(false);
    setCurrentPage(1);
  };

  const loadMoreProducts = () => {
    if (currentPage < totalPages && !isLoading) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const renderFilterModal = () => (
    <Modal visible={showFilters} animationType="slide">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          style={styles.filterContent}
          data={[
            { type: "categories", title: "Categories", data: categories },
            { type: "materials", title: "Materials", data: materials },
            { type: "occasions", title: "Occasions", data: occasions },
          ]}
          keyExtractor={(item) => item.type}
          renderItem={({ item }) => (
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>{item.title}</Text>
              <View style={styles.filterOptions}>
                {item.data.map((option: CategoryWithCount) => {
                  const filterArray = filters[
                    item.type as keyof FilterState
                  ] as string[];
                  const isSelected =
                    Array.isArray(filterArray) &&
                    filterArray.includes(option.name);

                  return (
                    <TouchableOpacity
                      key={option.name}
                      style={[
                        styles.filterOption,
                        isSelected && styles.selectedFilterOption,
                      ]}
                      onPress={() =>
                        toggleArrayFilter(
                          item.type as "categories" | "materials" | "occasions",
                          option.name
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          isSelected && styles.selectedFilterOptionText,
                        ]}
                      >
                        {option.name} ({option.count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );

  const renderSortModal = () => (
    <Modal visible={showSort} animationType="slide" transparent>
      <View style={styles.sortModalOverlay}>
        <View style={styles.sortModalContent}>
          <View style={styles.sortModalHeader}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <TouchableOpacity onPress={() => setShowSort(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {SORT_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.sortOption,
                filters.sortBy === option.value &&
                  filters.sortOrder === option.order &&
                  styles.selectedSortOption,
              ]}
              onPress={() => applySorting(option.value, option.order)}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  filters.sortBy === option.value &&
                    filters.sortOrder === option.order &&
                    styles.selectedSortOptionText,
                ]}
              >
                {option.label}
              </Text>
              {filters.sortBy === option.value &&
                filters.sortOrder === option.order && (
                  <Ionicons name="checkmark" size={20} color="#C9A961" />
                )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
      </View>

      <View style={styles.filterSortContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#666" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSort(true)}
        >
          <Ionicons name="swap-vertical" size={20} color="#666" />
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.resultsText}>
        {totalProducts} Product{totalProducts !== 1 ? "s" : ""} Found
      </Text>
    </View>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleProductPress(item.id)}>
      <ProductCard product={item} />
    </TouchableOpacity>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Products</Text>
          <Text style={styles.errorMessage}>Please try again later</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color="#C9A961" />
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {renderFilterModal()}
      {renderSortModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContainer: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  filterSortContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 0.48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 0.48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sortButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  row: {
    justifyContent: "space-between",
  },
  productCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  clearText: {
    fontSize: 16,
    color: "#C9A961",
  },
  filterContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilterOption: {
    backgroundColor: "#C9A961",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#374151",
  },
  selectedFilterOptionText: {
    color: "white",
  },
  // Sort Modal Styles
  sortModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sortModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  sortModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectedSortOption: {
    backgroundColor: "#F9F5F0",
  },
  sortOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  selectedSortOptionText: {
    color: "#C9A961",
    fontWeight: "600",
  },
  // Error States
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 64,
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
});

import { LoadingSpinner } from "@/src/components/common";
import {
  useDeleteProduct,
  useGetAllProducts,
} from "@/src/services/adminService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function AdminProductsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useGetAllProducts();

  const { mutate: deleteProduct } = useDeleteProduct();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "stock":
          return a.stock - b.stock;
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchText, selectedCategory, sortBy]);

  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      Alert.alert("Success", "Product deleted successfully");
      setShowDeleteModal(false);
      setProductToDelete(null);
      refetch();
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { color: "#ef4444", text: "Out of Stock" };
    if (stock <= 10) return { color: "#f59e0b", text: "Low Stock" };
    return { color: "#10b981", text: "In Stock" };
  };

  const renderProduct = ({ item }: { item: any }) => {
    const stockStatus = getStockStatus(item.stock);

    return (
      <TouchableOpacity style={styles.productCard}>
        <View style={styles.productImageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.productImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={32} color="#9ca3af" />
            </View>
          )}
          <View
            style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}
          >
            <Text style={styles.stockBadgeText}>{item.stock}</Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productCategory}>
            {item.category || "Uncategorized"}
          </Text>
          <View style={styles.productPriceRow}>
            <Text style={styles.productPrice}>
              ₹{item.price?.toLocaleString()}
            </Text>
            {item.originalPrice && item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>
                ₹{item.originalPrice.toLocaleString()}
              </Text>
            )}
          </View>
          <View style={styles.stockContainer}>
            <View
              style={[
                styles.stockIndicator,
                { backgroundColor: stockStatus.color },
              ]}
            />
            <Text style={[styles.stockText, { color: stockStatus.color }]}>
              {stockStatus.text}
            </Text>
          </View>
          <Text style={styles.productDate}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => router.push(`/admin/products/edit/${item.id}`)}
          >
            <Ionicons name="create-outline" size={18} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            <Ionicons name="eye-outline" size={18} color="#10b981" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={["#f8fafc", "#f1f5f9", "#e2e8f0"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Products Management</Text>
            <Text style={styles.subtitle}>
              {filteredProducts.length} products
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/admin/products/add")}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#9ca3af"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options-outline" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{products?.length || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {products?.filter((p) => p.stock <= 10).length || 0}
            </Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {products?.filter((p) => p.stock <= 0).length || 0}
            </Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
        </View>

        {/* Products List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="storefront-outline"
                    size={64}
                    color="#9ca3af"
                  />
                </View>
                <Text style={styles.emptyTitle}>No products found</Text>
                <Text style={styles.emptyText}>
                  {searchText
                    ? "Try adjusting your search"
                    : "Start by adding your first product"}
                </Text>
                <TouchableOpacity
                  style={styles.emptyAction}
                  onPress={() => router.push("/admin/products/add")}
                >
                  <Text style={styles.emptyActionText}>Add Product</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {/* Filters Modal */}
        <Modal visible={showFilters} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filters & Sort</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowFilters(false)}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.deleteModalContainer}>
              <View style={styles.deleteIconContainer}>
                <Ionicons name="warning-outline" size={48} color="#ef4444" />
              </View>
              <Text style={styles.deleteTitle}>Delete Product</Text>
              <Text style={styles.deleteText}>
                Are you sure you want to delete "{productToDelete?.name}"? This
                action cannot be undone.
              </Text>
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDeleteButton}
                  onPress={confirmDelete}
                >
                  <Text style={styles.confirmDeleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: "#6b7280" },
  addButton: {
    backgroundColor: "#6366f1",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: "#1f2937" },
  filterButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: "#6b7280", textAlign: "center" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: { fontSize: 16, color: "#6b7280", marginTop: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  productCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
    position: "relative",
  },
  productImage: { width: "100%", height: "100%", borderRadius: 12 },
  placeholderImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  stockBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  stockBadgeText: { fontSize: 10, fontWeight: "bold", color: "white" },
  productInfo: { flex: 1, marginBottom: 16 },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
    lineHeight: 20,
  },
  productCategory: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  productPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  productPrice: { fontSize: 18, fontWeight: "bold", color: "#059669" },
  originalPrice: {
    fontSize: 14,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  stockIndicator: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 12, fontWeight: "500" },
  productDate: { fontSize: 11, color: "#9ca3af" },
  productActions: { flexDirection: "row", gap: 8 },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  viewButton: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAction: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: { color: "white", fontWeight: "600", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1f2937" },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalActions: { marginTop: 24 },
  applyButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
  deleteModalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  deleteText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteActions: { flexDirection: "row", gap: 12, width: "100%" },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: { color: "#374151", fontWeight: "600", fontSize: 14 },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmDeleteButtonText: { color: "white", fontWeight: "600", fontSize: 14 },
});

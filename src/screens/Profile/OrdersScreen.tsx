import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../types";
// import LoadingSpinner from '../../components/LoadingSpinner';
import { LinearGradient } from "expo-linear-gradient";

type ProfileOrdersNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;

const { width } = Dimensions.get("window");

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  total: number;
  items: any[];
  paymentMethod: string;
  shippingAddress: any;
}

// Mock hook for orders
const useGetUserOrders = () => {
  return {
    data: [] as Order[],
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

export default function ProfileOrdersScreen() {
  const navigation = useNavigation<ProfileOrdersNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const { data: orders = [], isLoading, error, refetch } = useGetUserOrders();

  const filterTabs = [
    { id: "all", label: "All Orders", count: orders.length },
    {
      id: "pending",
      label: "Pending",
      count: orders.filter((o: Order) => o.status === "pending").length,
    },
    {
      id: "shipped",
      label: "Shipped",
      count: orders.filter((o: Order) => o.status === "shipped").length,
    },
    {
      id: "delivered",
      label: "Delivered",
      count: orders.filter((o: Order) => o.status === "delivered").length,
    },
  ];

  const filteredOrders = useMemo(() => {
    if (selectedFilter === "all") return orders;
    return orders.filter((order: Order) => order.status === selectedFilter);
  }, [orders, selectedFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "confirmed":
        return "#3B82F6";
      case "shipped":
        return "#8B5CF6";
      case "delivered":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      case "returned":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "time";
      case "confirmed":
        return "checkmark-circle";
      case "shipped":
        return "airplane";
      case "delivered":
        return "checkmark-done-circle";
      case "cancelled":
        return "close-circle";
      case "returned":
        return "return-up-back";
      default:
        return "ellipse";
    }
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const renderFilterTab = (filter: any) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterTab,
        selectedFilter === filter.id && styles.activeFilterTab,
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text
        style={[
          styles.filterLabel,
          selectedFilter === filter.id && styles.activeFilterLabel,
        ]}
      >
        {filter.label}
      </Text>
      {filter.count > 0 && (
        <View
          style={[
            styles.filterBadge,
            selectedFilter === filter.id && styles.activeFilterBadge,
          ]}
        >
          <Text
            style={[
              styles.filterCount,
              selectedFilter === filter.id && styles.activeFilterCount,
            ]}
          >
            {filter.count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => openOrderDetail(item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}20` },
          ]}
        >
          <Ionicons
            name={getStatusIcon(item.status) as any}
            size={14}
            color={getStatusColor(item.status)}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderContent}>
        <Text style={styles.orderTotal}>₹{item.total.toLocaleString()}</Text>
        <Text style={styles.orderItems}>
          {item.items.length} item{item.items.length > 1 ? "s" : ""}
        </Text>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye" size={16} color="#C9A961" />
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>

        {item.status === "delivered" && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="return-up-back" size={16} color="#6B7280" />
            <Text style={styles.actionButtonTextSecondary}>Return</Text>
          </TouchableOpacity>
        )}

        {(item.status === "shipped" || item.status === "delivered") && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="location" size={16} color="#3B82F6" />
            <Text style={styles.actionButtonTextSecondary}>Track</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderOrderDetailModal = () => (
    <Modal
      visible={showOrderDetail}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowOrderDetail(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowOrderDetail(false)}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedOrder && (
          <FlatList
            style={styles.modalContent}
            data={[
              { type: "header" },
              ...selectedOrder.items.map((item) => ({
                type: "item",
                data: item,
              })),
            ]}
            keyExtractor={(item, index) => `${item.type}-${index}`}
            renderItem={({ item, index }) => {
              if (item.type === "header") {
                return (
                  <View style={styles.orderDetailHeader}>
                    <LinearGradient
                      colors={["#C9A961", "#B8935A"]}
                      style={styles.orderDetailGradient}
                    >
                      <Text style={styles.orderDetailNumber}>
                        Order #{selectedOrder.orderNumber}
                      </Text>
                      <Text style={styles.orderDetailDate}>
                        Placed on{" "}
                        {new Date(selectedOrder.date).toLocaleDateString()}
                      </Text>
                      <View style={styles.orderDetailStatus}>
                        <Ionicons
                          name={getStatusIcon(selectedOrder.status) as any}
                          size={20}
                          color="white"
                        />
                        <Text style={styles.orderDetailStatusText}>
                          {selectedOrder.status.charAt(0).toUpperCase() +
                            selectedOrder.status.slice(1)}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                );
              }

              return (
                <View style={styles.orderItemCard}>
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemName}>
                      {(item as any).data?.name || "Product"}
                    </Text>
                    <Text style={styles.orderItemPrice}>
                      ₹{(item as any).data?.price || 0}
                    </Text>
                    <Text style={styles.orderItemQty}>
                      Quantity: {(item as any).data?.quantity || 1}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListFooterComponent={() => (
              <View style={styles.orderSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    ₹{(selectedOrder.total * 0.9).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping</Text>
                  <Text style={styles.summaryValue}>
                    ₹{(selectedOrder.total * 0.05).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>
                    ₹{(selectedOrder.total * 0.05).toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    ₹{selectedOrder.total.toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          data={filterTabs}
          renderItem={({ item }) => renderFilterTab(item)}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabs}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color="#C9A961" />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="bag" size={64} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptyMessage}>
                {selectedFilter === "all"
                  ? "You haven't placed any orders yet"
                  : `No ${selectedFilter} orders found`}
              </Text>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => navigation.navigate("Main")}
              >
                <Text style={styles.shopButtonText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          )
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {renderOrderDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
  },
  filterContainer: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterTabs: {
    paddingHorizontal: 16,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  activeFilterTab: {
    backgroundColor: "#C9A961",
  },
  filterLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeFilterLabel: {
    color: "white",
  },
  filterBadge: {
    marginLeft: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeFilterBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  filterCount: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "bold",
  },
  activeFilterCount: {
    color: "white",
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  orderDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  orderContent: {
    marginBottom: 12,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C9A961",
  },
  orderItems: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#C9A961",
    fontWeight: "600",
    marginLeft: 4,
  },
  actionButtonTextSecondary: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: "#C9A961",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  modalContent: {
    flex: 1,
  },
  orderDetailHeader: {
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  orderDetailGradient: {
    padding: 20,
    alignItems: "center",
  },
  orderDetailNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  orderDetailDate: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
  },
  orderDetailStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  orderDetailStatusText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  orderItemCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C9A961",
  },
  orderItemQty: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  orderSummary: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 16,
    color: "#1F2937",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C9A961",
  },
});

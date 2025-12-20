import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import { LoadingSpinner } from '../../components/LoadingSpinner';
// import { useGetAllOrders, useUpdateOrderStatus } from '../../services/adminService';

const { width } = Dimensions.get("window");

export default function AdminOrdersScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [sortBy, setSortBy] = useState("date");

  // Mock data until adminService is implemented
  const orders: any[] = [];
  const isLoading = false;
  const refetch = () => {};
  // Mock function until adminService is implemented
  const updateOrderStatus = (_data: any) => {
    // TODO: Implement order status update
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { bg: "#fef3c7", text: "#d97706", icon: "time-outline" };
      case "processing":
        return { bg: "#dbeafe", text: "#2563eb", icon: "construct-outline" };
      case "shipped":
        return { bg: "#e0e7ff", text: "#6366f1", icon: "airplane-outline" };
      case "delivered":
        return {
          bg: "#dcfce7",
          text: "#16a34a",
          icon: "checkmark-circle-outline",
        };
      case "cancelled":
        return { bg: "#fecaca", text: "#dc2626", icon: "close-circle-outline" };
      case "returned":
        return {
          bg: "#fed7d7",
          text: "#e53e3e",
          icon: "return-up-back-outline",
        };
      default:
        return { bg: "#f3f4f6", text: "#6b7280", icon: "help-circle-outline" };
    }
  };

  const statusOptions = [
    { value: "all", label: "All Orders", count: orders.length },
    {
      value: "pending",
      label: "Pending",
      count: orders.filter((o: any) => o.status === "pending").length,
    },
    {
      value: "processing",
      label: "Processing",
      count: orders.filter((o: any) => o.status === "processing").length,
    },
    {
      value: "shipped",
      label: "Shipped",
      count: orders.filter((o: any) => o.status === "shipped").length,
    },
    {
      value: "delivered",
      label: "Delivered",
      count: orders.filter((o: any) => o.status === "delivered").length,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      count: orders.filter((o: any) => o.status === "cancelled").length,
    },
  ];

  const filteredOrders = useMemo(() => {
    let filtered = orders.filter((order: any) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customer?.name
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        order.customer?.email?.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" || order.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });

    // Sort orders
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "total":
          return b.total - a.total;
        case "customer":
          return (a.customer?.name || "").localeCompare(b.customer?.name || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, searchText, selectedStatus, sortBy]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatus({ orderId, status: newStatus });
    Alert.alert("Success", "Order status updated successfully");
    setShowStatusModal(false);
    setSelectedOrder(null);
    refetch();
  };

  const openStatusModal = (order: any) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const renderOrder = ({ item }: { item: any }) => {
    const statusInfo = getStatusColor(item.status);
    const orderDate = new Date(item.createdAt).toLocaleDateString();
    const orderTime = new Date(item.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/admin/orders/${item.id}`)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderId}>
              #{item.id.slice(-6).toUpperCase()}
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}
            >
              <Ionicons
                name={statusInfo.icon as any}
                size={12}
                color={statusInfo.text}
              />
              <Text style={[styles.statusText, { color: statusInfo.text }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openStatusModal(item)}
          >
            <Ionicons name="create-outline" size={18} color="#6366f1" />
          </TouchableOpacity>
        </View>

        <View style={styles.customerSection}>
          <View style={styles.customerIcon}>
            <Ionicons name="person-outline" size={16} color="#6b7280" />
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>
              {item.customer?.name || "Guest"}
            </Text>
            <Text style={styles.customerEmail}>{item.customer?.email}</Text>
          </View>
        </View>

        <View style={styles.orderDetailsRow}>
          <View style={styles.orderInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
              <Text style={styles.infoText}>{orderDate}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={14} color="#9ca3af" />
              <Text style={styles.infoText}>{orderTime}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="bag-outline" size={14} color="#9ca3af" />
              <Text style={styles.infoText}>
                {item.items?.length || 0} items
              </Text>
            </View>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalAmount}>
              ₹{item.total?.toLocaleString()}
            </Text>
            <Text style={styles.totalLabel}>Total</Text>
          </View>
        </View>

        {item.shippingAddress && (
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={14} color="#9ca3af" />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.shippingAddress.city}, {item.shippingAddress.state}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderStatusFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.statusFilters}
    >
      {statusOptions.map((status) => (
        <TouchableOpacity
          key={status.value}
          style={[
            styles.statusFilterButton,
            selectedStatus === status.value && styles.statusFilterButtonActive,
          ]}
          onPress={() => setSelectedStatus(status.value)}
        >
          <Text
            style={[
              styles.statusFilterText,
              selectedStatus === status.value && styles.statusFilterTextActive,
            ]}
          >
            {status.label}
          </Text>
          {status.count > 0 && (
            <View
              style={[
                styles.statusCount,
                selectedStatus === status.value && styles.statusCountActive,
              ]}
            >
              <Text
                style={[
                  styles.statusCountText,
                  selectedStatus === status.value &&
                    styles.statusCountTextActive,
                ]}
              >
                {status.count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders Management</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {}} />
        }
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#C9A961",
  },
  orderDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  orderActions: {
    alignItems: "flex-end",
  },
  viewButton: {
    backgroundColor: "#C9A961",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C9A961",
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  customerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  customerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  customerEmail: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  orderDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
    marginRight: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
  },
  totalContainer: {
    alignItems: "flex-end",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#C9A961",
  },
  totalLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  addressText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
    flex: 1,
  },
  statusFilters: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusFilterButtonActive: {
    backgroundColor: "#C9A961",
    borderColor: "#C9A961",
  },
  statusFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  statusFilterTextActive: {
    color: "white",
  },
  statusCount: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statusCountActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  statusCountText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  statusCountTextActive: {
    color: "#C9A961",
  },
});

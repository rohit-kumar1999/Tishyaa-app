import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import BottomNavigation from "../../components/common/BottomNavigation";
import { TouchableOpacity } from "../../components/common/TouchableOpacity";
import { toast } from "../../hooks/use-toast";
import { usePayment } from "../../hooks/usePayment";
import { Order, useGetUserOrders } from "../../services/paymentService";
import {
  CreateExchangeRequest,
  CreateReturnRequest,
  EXCHANGE_REASONS,
  ExchangeReasonType,
  RETURN_REASONS,
  ReturnReasonType,
  useCheckReturnEligibility,
  useCreateExchangeRequest,
  useCreateReturnRequest,
} from "../../services/returnService";

const { width } = Dimensions.get("window");

// Status configuration
const getStatusConfig = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || "PENDING";
  switch (normalizedStatus) {
    case "PENDING":
      return {
        color: "#6B7280",
        bgColor: "#F3F4F6",
        icon: "time-outline" as const,
        label: "Pending",
      };
    case "AWAITING_PAYMENT":
      return {
        color: "#F59E0B",
        bgColor: "#FEF3C7",
        icon: "time-outline" as const,
        label: "Awaiting Payment",
      };
    case "PAYMENT_FAILED":
      return {
        color: "#EF4444",
        bgColor: "#FEE2E2",
        icon: "close-circle-outline" as const,
        label: "Payment Failed",
      };
    case "PLACED":
      return {
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        icon: "checkmark-circle-outline" as const,
        label: "Placed",
      };
    case "PROCESSING":
      return {
        color: "#8B5CF6",
        bgColor: "#EDE9FE",
        icon: "cube-outline" as const,
        label: "Processing",
      };
    case "DISPATCHED":
      return {
        color: "#6366F1",
        bgColor: "#E0E7FF",
        icon: "airplane-outline" as const,
        label: "Dispatched",
      };
    case "OUT_FOR_DELIVERY":
      return {
        color: "#06B6D4",
        bgColor: "#CFFAFE",
        icon: "bicycle-outline" as const,
        label: "Out for Delivery",
      };
    case "DELIVERED":
      return {
        color: "#10B981",
        bgColor: "#D1FAE5",
        icon: "checkmark-done-circle-outline" as const,
        label: "Delivered",
      };
    case "CANCELLED":
      return {
        color: "#6B7280",
        bgColor: "#F3F4F6",
        icon: "close-circle-outline" as const,
        label: "Cancelled",
      };
    case "RETURN_REQUESTED":
    case "PARTIAL_RETURN_REQUESTED":
      return {
        color: "#F97316",
        bgColor: "#FFEDD5",
        icon: "return-up-back-outline" as const,
        label: "Return Requested",
      };
    case "RETURN_IN_PROGRESS":
    case "PARTIAL_RETURN_PROCESSING":
      return {
        color: "#F97316",
        bgColor: "#FFEDD5",
        icon: "sync-outline" as const,
        label: "Return In Progress",
      };
    case "RETURN_COMPLETED":
    case "PARTIAL_RETURN_COMPLETED":
      return {
        color: "#10B981",
        bgColor: "#D1FAE5",
        icon: "checkmark-circle-outline" as const,
        label: "Return Completed",
      };
    case "EXCHANGE_REQUESTED":
    case "PARTIAL_EXCHANGE_REQUESTED":
      return {
        color: "#8B5CF6",
        bgColor: "#EDE9FE",
        icon: "swap-horizontal-outline" as const,
        label: "Exchange Requested",
      };
    case "EXCHANGE_IN_PROGRESS":
    case "PARTIAL_EXCHANGE_PROCESSING":
      return {
        color: "#8B5CF6",
        bgColor: "#EDE9FE",
        icon: "sync-outline" as const,
        label: "Exchange In Progress",
      };
    case "EXCHANGE_COMPLETED":
    case "PARTIAL_EXCHANGE_COMPLETED":
      return {
        color: "#10B981",
        bgColor: "#D1FAE5",
        icon: "checkmark-circle-outline" as const,
        label: "Exchange Completed",
      };
    case "REFUNDED":
      return {
        color: "#10B981",
        bgColor: "#D1FAE5",
        icon: "cash-outline" as const,
        label: "Refunded",
      };
    default:
      return {
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        icon: "cube-outline" as const,
        label:
          status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
          "Unknown",
      };
  }
};

// Order Journey Steps - Different flows based on status
const DELIVERY_STEPS = [
  { key: "PLACED", label: "Placed", icon: "checkmark-circle" },
  { key: "PROCESSING", label: "Processing", icon: "cube" },
  { key: "DISPATCHED", label: "Dispatched", icon: "airplane" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "bicycle" },
  { key: "DELIVERED", label: "Delivered", icon: "checkmark-done-circle" },
];

const RETURN_STEPS = [
  { key: "DELIVERED", label: "Delivered", icon: "checkmark-done-circle" },
  {
    key: "RETURN_REQUESTED",
    label: "Return Requested",
    icon: "return-up-back",
  },
  { key: "RETURN_IN_PROGRESS", label: "In Progress", icon: "sync" },
  { key: "RETURN_COMPLETED", label: "Completed", icon: "checkmark-circle" },
];

const EXCHANGE_STEPS = [
  { key: "DELIVERED", label: "Delivered", icon: "checkmark-done-circle" },
  {
    key: "EXCHANGE_REQUESTED",
    label: "Exchange Requested",
    icon: "swap-horizontal",
  },
  { key: "EXCHANGE_IN_PROGRESS", label: "In Progress", icon: "sync" },
  { key: "EXCHANGE_COMPLETED", label: "Completed", icon: "checkmark-circle" },
];

const CANCELLED_STEPS = [
  { key: "PLACED", label: "Placed", icon: "checkmark-circle" },
  { key: "CANCELLED", label: "Cancelled", icon: "close-circle" },
];

const REFUNDED_STEPS = [
  { key: "PLACED", label: "Placed", icon: "checkmark-circle" },
  { key: "REFUNDED", label: "Refunded", icon: "cash" },
];

const PAYMENT_FAILED_STEPS = [
  { key: "AWAITING_PAYMENT", label: "Awaiting Payment", icon: "time" },
  { key: "PAYMENT_FAILED", label: "Payment Failed", icon: "close-circle" },
];

// Get appropriate steps based on status
const getOrderSteps = (status: string) => {
  const normalizedStatus = status?.toUpperCase() || "PENDING";

  // Return flow
  if (normalizedStatus.includes("RETURN")) {
    return RETURN_STEPS;
  }

  // Exchange flow
  if (normalizedStatus.includes("EXCHANGE")) {
    return EXCHANGE_STEPS;
  }

  // Cancelled
  if (normalizedStatus === "CANCELLED") {
    return CANCELLED_STEPS;
  }

  // Refunded
  if (normalizedStatus === "REFUNDED") {
    return REFUNDED_STEPS;
  }

  // Payment failed
  if (
    normalizedStatus === "PAYMENT_FAILED" ||
    normalizedStatus === "AWAITING_PAYMENT"
  ) {
    return PAYMENT_FAILED_STEPS;
  }

  // Default delivery flow
  return DELIVERY_STEPS;
};

const getStepIndex = (status: string, steps: typeof DELIVERY_STEPS) => {
  const normalizedStatus = status?.toUpperCase() || "PENDING";

  // Handle partial statuses (map to their base status)
  let mappedStatus = normalizedStatus;
  if (normalizedStatus.includes("PARTIAL_RETURN")) {
    mappedStatus = normalizedStatus.replace("PARTIAL_", "");
  } else if (normalizedStatus.includes("PARTIAL_EXCHANGE")) {
    mappedStatus = normalizedStatus.replace("PARTIAL_", "");
  }
  // Handle PROCESSING suffix
  if (mappedStatus.endsWith("_PROCESSING")) {
    mappedStatus = mappedStatus.replace("_PROCESSING", "_IN_PROGRESS");
  }

  const index = steps.findIndex((step) => step.key === mappedStatus);
  return index >= 0 ? index : 0;
};

export default function ProfileOrdersScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  const { retryOrderPayment, isProcessing } = usePayment();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Fetch orders
  const {
    data: ordersResponse,
    isLoading,
    refetch,
  } = useGetUserOrders(userId || "", currentPage, ordersPerPage);

  const orders = ordersResponse?.data || [];
  const totalOrders = parseInt(ordersResponse?.pagination?.totalCount || "0");
  const totalPages = ordersResponse?.pagination?.totalPages || 1;

  // UI State
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  );
  const [filterPage, setFilterPage] = useState(1);
  const itemsPerPage = 10;

  // Double-click prevention refs
  const lastClickTimeRef = useRef<{ [key: string]: number }>({});
  const CLICK_DEBOUNCE_MS = 1000;

  // Return/Exchange Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState<
    ReturnReasonType | ExchangeReasonType | null
  >(null);
  const [reasonDescription, setReasonDescription] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [showReasonPicker, setShowReasonPicker] = useState(false);

  // Return/Exchange API hooks
  const { data: eligibilityData, isLoading: checkingEligibility } =
    useCheckReturnEligibility(returnOrderId || "");
  const createReturnMutation = useCreateReturnRequest(returnOrderId || "");
  const createExchangeMutation = useCreateExchangeRequest(returnOrderId || "");

  // Reset filter page when filter changes
  const handleFilterChange = useCallback((filterId: string) => {
    setSelectedFilter(filterId);
    setFilterPage(1);
  }, []);

  // Get current status from order
  const getCurrentStatus = useCallback((order: Order) => {
    if (
      !order?.state ||
      !Array.isArray(order.state) ||
      order.state.length === 0
    ) {
      return "PENDING";
    }
    const lastState = order.state[order.state.length - 1];
    return lastState?.state?.toUpperCase() || "PENDING";
  }, []);

  // State categories for filtering
  const STATE_CATEGORIES = useMemo(
    () => ({
      pending: ["PENDING", "AWAITING_PAYMENT", "PAYMENT_FAILED"],
      processing: ["PLACED", "PROCESSING", "DISPATCHED", "OUT_FOR_DELIVERY"],
      delivered: ["DELIVERED"],
      returns: [
        "RETURN_REQUESTED",
        "RETURN_IN_PROGRESS",
        "RETURN_COMPLETED",
        "PARTIAL_RETURN_REQUESTED",
        "PARTIAL_RETURN_PROCESSING",
        "PARTIAL_RETURN_COMPLETED",
        "EXCHANGE_REQUESTED",
        "EXCHANGE_IN_PROGRESS",
        "EXCHANGE_COMPLETED",
        "PARTIAL_EXCHANGE_REQUESTED",
        "PARTIAL_EXCHANGE_PROCESSING",
        "PARTIAL_EXCHANGE_COMPLETED",
        "REFUNDED",
        "CANCELLED",
      ],
    }),
    []
  );

  // Get all filtered orders (without pagination)
  const allFilteredOrders = useMemo(() => {
    if (selectedFilter === "all") return orders;

    const categoryStates =
      STATE_CATEGORIES[selectedFilter as keyof typeof STATE_CATEGORIES];
    if (!categoryStates) return orders;

    return orders.filter((order) => {
      const status = getCurrentStatus(order);
      return categoryStates.includes(status);
    });
  }, [orders, selectedFilter, getCurrentStatus, STATE_CATEGORIES]);

  // Calculate counts for each filter category
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };

    Object.entries(STATE_CATEGORIES).forEach(([key, states]) => {
      counts[key] = orders.filter((order) => {
        const status = getCurrentStatus(order);
        return states.includes(status);
      }).length;
    });

    return counts;
  }, [orders, getCurrentStatus, STATE_CATEGORIES]);

  // Filter tabs with dynamic counts
  const filterTabs = useMemo(
    () => [
      { id: "all", label: "All", count: filterCounts.all },
      { id: "pending", label: "Pending", count: filterCounts.pending },
      { id: "processing", label: "Processing", count: filterCounts.processing },
      { id: "delivered", label: "Delivered", count: filterCounts.delivered },
    ],
    [filterCounts]
  );

  // Paginate filtered orders locally
  const filteredOrders = useMemo(() => {
    const startIndex = (filterPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allFilteredOrders.slice(startIndex, endIndex);
  }, [allFilteredOrders, filterPage, itemsPerPage]);

  // Calculate pagination for filtered results
  const filteredTotalPages = useMemo(() => {
    return Math.ceil(allFilteredOrders.length / itemsPerPage) || 1;
  }, [allFilteredOrders.length, itemsPerPage]);

  // Check if payment can be retried
  const canRetryPayment = useCallback((status: string) => {
    const retryableStates = ["PENDING", "AWAITING_PAYMENT", "PAYMENT_FAILED"];
    return retryableStates.includes(status?.toUpperCase() || "");
  }, []);

  // Check if order can be returned/exchanged
  const canReturnOrder = useCallback(
    (order: Order) => {
      const status = getCurrentStatus(order);
      return status === "DELIVERED";
    },
    [getCurrentStatus]
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Handle retry payment
  const handleRetryPayment = useCallback(
    async (order: Order) => {
      // Prevent double clicks
      const now = Date.now();
      const lastClick = lastClickTimeRef.current[`retry_${order.id}`] || 0;
      if (now - lastClick < CLICK_DEBOUNCE_MS) {
        return;
      }
      lastClickTimeRef.current[`retry_${order.id}`] = now;

      try {
        setProcessingOrderId(order.id);
        const result = await retryOrderPayment(order);

        if (result) {
          Alert.alert(
            "Payment Successful!",
            "Your order payment has been completed.",
            [{ text: "OK", onPress: () => refetch() }]
          );
        }
      } catch (error) {
        console.error("Retry payment error:", error);
        Alert.alert(
          "Payment Error",
          "Failed to process payment. Please try again later."
        );
      } finally {
        setProcessingOrderId(null);
      }
    },
    [retryOrderPayment, refetch]
  );

  // Handle download invoice
  const handleDownloadInvoice = useCallback(async (order: Order) => {
    const invoiceContent = `
INVOICE - TISHYAA JEWELS

Order #: ${order.code}
Order Date: ${new Date(order.createdAt).toLocaleDateString()}
Customer: ${order.address?.name || "Guest"}

Delivery Address:
${order.address?.name || "N/A"}
${order.address?.street || ""}
${order.address?.city || ""}, ${order.address?.state || ""}
${order.address?.zipCode || ""}

Items:
${
  order.lines
    ?.map(
      (line) =>
        `${line.product?.name || "Product"} x${line.quantity || 1} - ₹${
          line.price?.toLocaleString() || 0
        }`
    )
    .join("\n") || "No items"
}

Total Amount: ₹${order.netValue?.toLocaleString()}

${
  order.payment
    ? `
Payment Information:
Payment ID: ${
        order.payment.response?.razorpay_payment_id ||
        order.payment.transactionId ||
        "N/A"
      }
Payment Method: ${order.payment.methodSummary || "Online Payment"}
Payment Status: ${order.payment.status || "N/A"}
`
    : ""
}

Thank you for shopping with Tishyaa Jewels!
    `.trim();

    try {
      await Share.share({
        message: invoiceContent,
        title: `Invoice - ${order.code}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share invoice");
    }
  }, []);

  // Navigate to product
  const navigateToProduct = useCallback(
    (productId: string) => {
      // Close modal first before navigating
      setShowOrderDetail(false);
      setSelectedOrder(null);

      // Small delay to allow modal to close smoothly
      setTimeout(() => {
        router.push(`/product/${productId}`);
      }, 100);
    },
    [router]
  );

  // Handle open return modal
  const handleOpenReturnModal = useCallback((order: Order) => {
    setReturnOrderId(order.id);
    setSelectedItems([]);
    setSelectedReason(null);
    setReasonDescription("");
    setShowOrderDetail(false);
    setShowReturnModal(true);
  }, []);

  // Handle open exchange modal
  const handleOpenExchangeModal = useCallback((order: Order) => {
    setReturnOrderId(order.id);
    setSelectedItems([]);
    setSelectedReason(null);
    setReasonDescription("");
    setShowOrderDetail(false);
    setShowExchangeModal(true);
  }, []);

  // Handle toggle item selection
  const handleToggleItemSelection = useCallback((lineId: string) => {
    setSelectedItems((prev) =>
      prev.includes(lineId)
        ? prev.filter((id) => id !== lineId)
        : [...prev, lineId]
    );
  }, []);

  // Handle select all items
  const handleSelectAllItems = useCallback(() => {
    if (eligibilityData?.eligibleItems) {
      const allLineIds = eligibilityData.eligibleItems.map(
        (item) => item.lineId
      );
      setSelectedItems((prev) =>
        prev.length === allLineIds.length ? [] : allLineIds
      );
    }
  }, [eligibilityData]);

  // Handle submit return request
  const handleSubmitReturn = useCallback(async () => {
    // Prevent double clicks
    const now = Date.now();
    const lastClick = lastClickTimeRef.current["submit_return"] || 0;
    if (now - lastClick < CLICK_DEBOUNCE_MS) {
      return;
    }
    lastClickTimeRef.current["submit_return"] = now;

    if (!selectedReason || selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select items and a reason for return",
      });
      return;
    }

    if (selectedReason === "other" && !reasonDescription.trim()) {
      toast({
        title: "Error",
        description: "Please provide a description for 'Other' reason",
      });
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const request: CreateReturnRequest = {
        requestType: "return",
        reason: selectedReason as ReturnReasonType,
        description: reasonDescription || undefined,
        items: selectedItems.map((lineId) => {
          const item = eligibilityData?.eligibleItems.find(
            (i) => i.lineId === lineId
          );
          return {
            lineId,
            quantity: item?.availableQuantity || 1,
          };
        }),
      };

      createReturnMutation.mutate(request, {
        onSuccess: () => {
          setIsSubmittingReturn(false);
          setShowReturnModal(false);
          refetch();
          Alert.alert(
            "Return Request Submitted",
            "We'll process your return and contact you within 3-4 days for pickup. Refunds will be processed to your original payment method."
          );
        },
        onError: (error) => {
          setIsSubmittingReturn(false);
          toast({
            title: "Error",
            description: error?.message || "Failed to submit return request",
          });
        },
      });
    } catch (error: any) {
      setIsSubmittingReturn(false);
      toast({
        title: "Error",
        description: error?.message || "Failed to submit return request",
      });
    }
  }, [
    selectedReason,
    selectedItems,
    reasonDescription,
    eligibilityData,
    createReturnMutation,
    refetch,
  ]);

  // Handle submit exchange request
  const handleSubmitExchange = useCallback(async () => {
    // Prevent double clicks
    const now = Date.now();
    const lastClick = lastClickTimeRef.current["submit_exchange"] || 0;
    if (now - lastClick < CLICK_DEBOUNCE_MS) {
      return;
    }
    lastClickTimeRef.current["submit_exchange"] = now;

    if (!selectedReason || selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select items and a reason for exchange",
      });
      return;
    }

    if (selectedReason === "other" && !reasonDescription.trim()) {
      toast({
        title: "Error",
        description: "Please provide a description for 'Other' reason",
      });
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const request: CreateExchangeRequest = {
        requestType: "exchange",
        reason: selectedReason as ExchangeReasonType,
        description: reasonDescription || undefined,
        items: selectedItems.map((lineId) => {
          const item = eligibilityData?.eligibleItems.find(
            (i) => i.lineId === lineId
          );
          return {
            lineId,
            quantity: item?.availableQuantity || 1,
          };
        }),
      };

      createExchangeMutation.mutate(request, {
        onSuccess: () => {
          setIsSubmittingReturn(false);
          setShowExchangeModal(false);
          refetch();
          Alert.alert(
            "Exchange Request Submitted",
            "We'll process your exchange request and contact you within 3-4 days. Our team will guide you through the exchange process."
          );
        },
        onError: (error) => {
          setIsSubmittingReturn(false);
          toast({
            title: "Error",
            description: error?.message || "Failed to submit exchange request",
          });
        },
      });
    } catch (error: any) {
      setIsSubmittingReturn(false);
      toast({
        title: "Error",
        description: error?.message || "Failed to submit exchange request",
      });
    }
  }, [
    selectedReason,
    selectedItems,
    reasonDescription,
    eligibilityData,
    createExchangeMutation,
    refetch,
  ]);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  // Render filter tab
  const renderFilterTab = useCallback(
    ({ item }: { item: (typeof filterTabs)[0] }) => (
      <TouchableOpacity
        style={[
          styles.filterTab,
          selectedFilter === item.id && styles.activeFilterTab,
        ]}
        onPress={() => handleFilterChange(item.id)}
      >
        <Text
          style={[
            styles.filterLabel,
            selectedFilter === item.id && styles.activeFilterLabel,
          ]}
        >
          {item.label}
        </Text>
        {item.count !== undefined && (
          <View
            style={[
              styles.filterBadge,
              selectedFilter === item.id && styles.activeFilterBadge,
            ]}
          >
            <Text
              style={[
                styles.filterCount,
                selectedFilter === item.id && styles.activeFilterCount,
              ]}
            >
              {item.count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    ),
    [selectedFilter, handleFilterChange]
  );

  // Render order card
  const renderOrderCard = useCallback(
    ({ item: order }: { item: Order }) => {
      const currentStatus = getCurrentStatus(order);
      const statusConfig = getStatusConfig(currentStatus);
      const firstProduct = order.lines?.[0];
      const isProcessingThis = processingOrderId === order.id;

      return (
        <TouchableOpacity
          style={styles.orderCard}
          onPress={() => {
            setSelectedOrder(order);
            setShowOrderDetail(true);
          }}
          activeOpacity={0.7}
        >
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>#{order.code}</Text>
              <Text style={styles.orderDate}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              <Ionicons
                name={statusConfig.icon}
                size={14}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Product Preview */}
          <View style={styles.productPreview}>
            {firstProduct?.product?.images?.[0] ? (
              <Image
                source={{ uri: firstProduct.product.images[0] }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.productImage, styles.placeholderImage]}>
                <Ionicons name="cube-outline" size={24} color="#9CA3AF" />
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {firstProduct?.product?.name || "Product"}
              </Text>
              {order.lines && order.lines.length > 1 && (
                <Text style={styles.moreItems}>
                  +{order.lines.length - 1} more items
                </Text>
              )}
              <Text style={styles.orderTotal}>
                ₹{order.netValue?.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.orderActions}>
            {canRetryPayment(currentStatus) ? (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isProcessingThis && styles.buttonDisabled,
                ]}
                onPress={() => handleRetryPayment(order)}
                disabled={isProcessingThis}
              >
                {isProcessingThis ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="card-outline" size={16} color="#fff" />
                    <Text style={styles.primaryButtonText}>Pay Now</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setSelectedOrder(order);
                  setShowOrderDetail(true);
                }}
              >
                <Ionicons name="eye-outline" size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>View Details</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleDownloadInvoice(order)}
            >
              <Ionicons name="download-outline" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [
      getCurrentStatus,
      processingOrderId,
      formatDate,
      canRetryPayment,
      handleRetryPayment,
      handleDownloadInvoice,
    ]
  );

  // Render Order Journey
  const renderOrderJourney = useCallback(
    (order: Order) => {
      const currentStatus = getCurrentStatus(order);
      const steps = getOrderSteps(currentStatus);
      const currentStepIndex = getStepIndex(currentStatus, steps);

      // Determine colors based on status type
      const normalizedStatus = currentStatus?.toUpperCase() || "";
      const isNegativeFlow =
        normalizedStatus === "CANCELLED" ||
        normalizedStatus === "PAYMENT_FAILED";
      const isReturnExchangeFlow =
        normalizedStatus.includes("RETURN") ||
        normalizedStatus.includes("EXCHANGE");

      // Get accent color based on flow type
      const getAccentColor = () => {
        if (isNegativeFlow) return "#EF4444"; // Red for cancelled/failed
        if (isReturnExchangeFlow) return "#8B5CF6"; // Purple for return/exchange
        return "#10B981"; // Green for normal flow
      };

      const accentColor = getAccentColor();

      return (
        <View style={styles.journeyContainer}>
          <Text style={styles.journeySectionTitle}>Order Journey</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.journeySteps}>
              {steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const stepColor = isCompleted ? accentColor : "#D1D5DB";

                return (
                  <View key={step.key} style={styles.journeyStep}>
                    <View style={styles.journeyStepIndicator}>
                      <View
                        style={[
                          styles.journeyStepCircle,
                          {
                            backgroundColor: isCompleted
                              ? accentColor
                              : "#F3F4F6",
                            borderColor: stepColor,
                          },
                        ]}
                      >
                        <Ionicons
                          name={step.icon as any}
                          size={16}
                          color={isCompleted ? "#fff" : "#9CA3AF"}
                        />
                      </View>
                      {index < steps.length - 1 && (
                        <View
                          style={[
                            styles.journeyConnector,
                            {
                              backgroundColor:
                                index < currentStepIndex
                                  ? accentColor
                                  : "#E5E7EB",
                            },
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.journeyStepLabel,
                        {
                          color: isCompleted ? accentColor : "#9CA3AF",
                          fontWeight: isCurrent ? "600" : "400",
                        },
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      );
    },
    [getCurrentStatus]
  );

  // Render Order Detail Modal
  const renderOrderDetailModal = () => {
    if (!selectedOrder) return null;

    const currentStatus = getCurrentStatus(selectedOrder);
    const statusConfig = getStatusConfig(currentStatus);

    return (
      <Modal
        visible={showOrderDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOrderDetail(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowOrderDetail(false)}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity
              onPress={() => handleDownloadInvoice(selectedOrder)}
            >
              <Ionicons name="share-outline" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Order Header Card */}
            <LinearGradient
              colors={["#e11d48", "#be123c"]}
              style={styles.orderDetailHeader}
            >
              <Text style={styles.orderDetailNumber}>
                Order #{selectedOrder.code}
              </Text>
              <Text style={styles.orderDetailDate}>
                Placed on {formatDate(selectedOrder.createdAt)}
              </Text>
              <View style={styles.orderDetailStatusBadge}>
                <Ionicons name={statusConfig.icon} size={18} color="#fff" />
                <Text style={styles.orderDetailStatusText}>
                  {statusConfig.label}
                </Text>
              </View>
            </LinearGradient>

            {/* Order Journey */}
            {renderOrderJourney(selectedOrder)}

            {/* Order Items */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="cube-outline" size={16} color="#e11d48" /> Order
                Items ({selectedOrder.lines?.length || 0})
              </Text>
              {selectedOrder.lines?.map((line) => (
                <TouchableOpacity
                  key={line.id}
                  style={styles.orderItemCard}
                  onPress={() =>
                    line.product?.id && navigateToProduct(line.product.id)
                  }
                >
                  {line.product?.images?.[0] ? (
                    <Image
                      source={{ uri: line.product.images[0] }}
                      style={styles.orderItemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[styles.orderItemImage, styles.placeholderImage]}
                    >
                      <Ionicons name="cube-outline" size={20} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemName} numberOfLines={2}>
                      {line.product?.name || "Product"}
                    </Text>
                    <Text style={styles.orderItemQty}>
                      Qty: {line.quantity || 1}
                    </Text>
                  </View>
                  <Text style={styles.orderItemPrice}>
                    ₹{line.price?.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Delivery Address */}
            {selectedOrder.address && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="location-outline" size={16} color="#e11d48" />{" "}
                  Delivery Address
                </Text>
                <View style={styles.addressCard}>
                  <Text style={styles.addressName}>
                    {selectedOrder.address.name}
                  </Text>
                  <Text style={styles.addressText}>
                    {selectedOrder.address.street}
                  </Text>
                  <Text style={styles.addressText}>
                    {selectedOrder.address.city}, {selectedOrder.address.state}{" "}
                    {selectedOrder.address.zipCode}
                  </Text>
                  {selectedOrder.address.phone && (
                    <Text style={styles.addressPhone}>
                      <Ionicons name="call-outline" size={12} />{" "}
                      {selectedOrder.address.phone}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Payment Information */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="card-outline" size={16} color="#e11d48" />{" "}
                Payment Details
              </Text>
              <View style={styles.paymentCard}>
                {selectedOrder.payment ? (
                  <>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Payment Method</Text>
                      <Text style={styles.paymentValue}>
                        {selectedOrder.payment.methodSummary ||
                          "Online Payment"}
                      </Text>
                    </View>
                    {selectedOrder.payment.response?.razorpay_payment_id && (
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Transaction ID</Text>
                        <Text
                          style={styles.paymentValueSmall}
                          numberOfLines={1}
                        >
                          {selectedOrder.payment.response.razorpay_payment_id}
                        </Text>
                      </View>
                    )}
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Status</Text>
                      <View
                        style={[
                          styles.paymentStatusBadge,
                          { backgroundColor: "#D1FAE5" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.paymentStatusText,
                            { color: "#10B981" },
                          ]}
                        >
                          {selectedOrder.payment.status || "Paid"}
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <Text style={styles.paymentPending}>
                    Payment information will be available after payment is
                    completed.
                  </Text>
                )}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>
                    ₹{selectedOrder.netValue?.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              {canRetryPayment(currentStatus) && (
                <TouchableOpacity
                  style={styles.modalPrimaryButton}
                  onPress={() => {
                    setShowOrderDetail(false);
                    handleRetryPayment(selectedOrder);
                  }}
                >
                  <Ionicons name="card-outline" size={18} color="#fff" />
                  <Text style={styles.modalPrimaryButtonText}>
                    Complete Payment
                  </Text>
                </TouchableOpacity>
              )}

              {canReturnOrder(selectedOrder) && (
                <>
                  <TouchableOpacity
                    style={styles.modalSecondaryButton}
                    onPress={() => handleOpenReturnModal(selectedOrder)}
                  >
                    <Ionicons
                      name="return-up-back-outline"
                      size={18}
                      color="#e11d48"
                    />
                    <Text style={styles.modalSecondaryButtonText}>
                      Request Return
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSecondaryButton}
                    onPress={() => handleOpenExchangeModal(selectedOrder)}
                  >
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={18}
                      color="#e11d48"
                    />
                    <Text style={styles.modalSecondaryButtonText}>
                      Request Exchange
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={() => handleDownloadInvoice(selectedOrder)}
              >
                <Ionicons name="download-outline" size={18} color="#e11d48" />
                <Text style={styles.modalSecondaryButtonText}>
                  Download Invoice
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // Return Request Modal
  const renderReturnModal = () => {
    const eligibleItems = eligibilityData?.eligibleItems || [];
    const isEligible = eligibilityData?.eligible ?? false;
    const daysRemaining = eligibilityData?.returnWindow?.daysRemaining || 0;

    return (
      <Modal
        visible={showReturnModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReturnModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowReturnModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Return Items</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Loading State */}
            {checkingEligibility && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e11d48" />
                <Text style={styles.loadingText}>Checking eligibility...</Text>
              </View>
            )}

            {/* Not Eligible */}
            {!checkingEligibility && !isEligible && (
              <View style={styles.notEligibleContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#EF4444"
                />
                <Text style={styles.notEligibleTitle}>
                  Not Eligible for Return
                </Text>
                <Text style={styles.notEligibleText}>
                  {eligibilityData?.restrictions?.[0] ||
                    "This order is not eligible for returns."}
                </Text>
              </View>
            )}

            {/* Eligible Items */}
            {!checkingEligibility && isEligible && (
              <>
                {/* Return Window Info */}
                <View style={styles.returnWindowCard}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <View style={styles.returnWindowContent}>
                    <Text style={styles.returnWindowTitle}>
                      Return window open
                    </Text>
                    <Text style={styles.returnWindowText}>
                      You have {daysRemaining} days remaining to return items
                    </Text>
                  </View>
                </View>

                {/* Select All */}
                <TouchableOpacity
                  style={styles.selectAllButton}
                  onPress={handleSelectAllItems}
                >
                  <Ionicons
                    name={
                      selectedItems.length === eligibleItems.length
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={22}
                    color="#e11d48"
                  />
                  <Text style={styles.selectAllText}>
                    {selectedItems.length === eligibleItems.length
                      ? "Deselect All"
                      : "Select All Items"}
                  </Text>
                </TouchableOpacity>

                {/* Items List */}
                <Text style={styles.sectionTitle}>Select Items to Return</Text>
                {eligibleItems.map((item) => (
                  <TouchableOpacity
                    key={item.lineId}
                    style={[
                      styles.returnItemCard,
                      selectedItems.includes(item.lineId) &&
                        styles.returnItemCardSelected,
                    ]}
                    onPress={() => handleToggleItemSelection(item.lineId)}
                  >
                    <View style={styles.returnItemCheckbox}>
                      <Ionicons
                        name={
                          selectedItems.includes(item.lineId)
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={22}
                        color={
                          selectedItems.includes(item.lineId)
                            ? "#e11d48"
                            : "#9CA3AF"
                        }
                      />
                    </View>
                    <View style={styles.returnItemImage}>
                      {item.images && item.images.length > 0 ? (
                        <Image
                          source={{ uri: item.images[0] }}
                          style={styles.returnItemImg}
                        />
                      ) : (
                        <Ionicons
                          name="cube-outline"
                          size={24}
                          color="#9CA3AF"
                        />
                      )}
                    </View>
                    <View style={styles.returnItemInfo}>
                      <Text style={styles.returnItemName} numberOfLines={2}>
                        {item.productName}
                      </Text>
                      <Text style={styles.returnItemDetails}>
                        ₹{(item.price || item.unitPrice)?.toLocaleString()} •
                        Qty: {item.availableQuantity}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Reason Selection */}
                <Text style={styles.sectionTitle}>Reason for Return</Text>
                <TouchableOpacity
                  style={styles.reasonSelector}
                  onPress={() => setShowReasonPicker(true)}
                >
                  <Text
                    style={
                      selectedReason
                        ? styles.reasonSelectorText
                        : styles.reasonSelectorPlaceholder
                    }
                  >
                    {selectedReason
                      ? RETURN_REASONS.find((r) => r.value === selectedReason)
                          ?.label
                      : "Select reason for return"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>

                {/* Reason Picker Modal */}
                <Modal
                  visible={showReasonPicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowReasonPicker(false)}
                >
                  <TouchableOpacity
                    style={styles.reasonPickerOverlay}
                    activeOpacity={1}
                    onPress={() => setShowReasonPicker(false)}
                  >
                    <View style={styles.reasonPickerContainer}>
                      <Text style={styles.reasonPickerTitle}>
                        Select Reason
                      </Text>
                      {RETURN_REASONS.map((reason) => (
                        <TouchableOpacity
                          key={reason.value}
                          style={[
                            styles.reasonPickerItem,
                            selectedReason === reason.value &&
                              styles.reasonPickerItemSelected,
                          ]}
                          onPress={() => {
                            setSelectedReason(reason.value);
                            setShowReasonPicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.reasonPickerItemText,
                              selectedReason === reason.value &&
                                styles.reasonPickerItemTextSelected,
                            ]}
                          >
                            {reason.label}
                          </Text>
                          {selectedReason === reason.value && (
                            <Ionicons
                              name="checkmark"
                              size={20}
                              color="#e11d48"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>

                {/* Description for 'Other' reason */}
                {selectedReason === "other" && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Description *</Text>
                    <TextInput
                      style={styles.descriptionInput}
                      placeholder="Please describe the issue..."
                      value={reasonDescription}
                      onChangeText={setReasonDescription}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                )}

                {/* Pickup Info */}
                <View style={styles.infoCard}>
                  <Ionicons name="car-outline" size={20} color="#6B7280" />
                  <View style={styles.infoCardContent}>
                    <Text style={styles.infoCardTitle}>Pickup Information</Text>
                    <Text style={styles.infoCardText}>
                      • We'll arrange pickup within 3-4 business days{"\n"}• Our
                      courier will contact you to schedule pickup{"\n"}• Please
                      keep items in original packaging if possible
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Submit Button */}
          {!checkingEligibility && isEligible && (
            <View style={styles.returnSubmitContainer}>
              <TouchableOpacity
                style={[
                  styles.returnSubmitButton,
                  (selectedItems.length === 0 ||
                    !selectedReason ||
                    isSubmittingReturn) &&
                    styles.returnSubmitButtonDisabled,
                ]}
                onPress={handleSubmitReturn}
                disabled={
                  selectedItems.length === 0 ||
                  !selectedReason ||
                  isSubmittingReturn
                }
              >
                {isSubmittingReturn ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.returnSubmitButtonText}>
                      Submit Return Request
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    );
  };

  // Exchange Request Modal
  const renderExchangeModal = () => {
    const eligibleItems = eligibilityData?.eligibleItems || [];
    const isEligible = eligibilityData?.eligible ?? false;
    const daysRemaining = eligibilityData?.returnWindow?.daysRemaining || 0;

    return (
      <Modal
        visible={showExchangeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExchangeModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowExchangeModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Exchange Items</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Loading State */}
            {checkingEligibility && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e11d48" />
                <Text style={styles.loadingText}>Checking eligibility...</Text>
              </View>
            )}

            {/* Not Eligible */}
            {!checkingEligibility && !isEligible && (
              <View style={styles.notEligibleContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#EF4444"
                />
                <Text style={styles.notEligibleTitle}>
                  Not Eligible for Exchange
                </Text>
                <Text style={styles.notEligibleText}>
                  {eligibilityData?.restrictions?.[0] ||
                    "This order is not eligible for exchanges."}
                </Text>
              </View>
            )}

            {/* Eligible Items */}
            {!checkingEligibility && isEligible && (
              <>
                {/* Exchange Window Info */}
                <View style={styles.returnWindowCard}>
                  <Ionicons name="swap-horizontal" size={20} color="#10B981" />
                  <View style={styles.returnWindowContent}>
                    <Text style={styles.returnWindowTitle}>
                      Exchange window open
                    </Text>
                    <Text style={styles.returnWindowText}>
                      You have {daysRemaining} days remaining to exchange items
                    </Text>
                  </View>
                </View>

                {/* Select All */}
                <TouchableOpacity
                  style={styles.selectAllButton}
                  onPress={handleSelectAllItems}
                >
                  <Ionicons
                    name={
                      selectedItems.length === eligibleItems.length
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={22}
                    color="#e11d48"
                  />
                  <Text style={styles.selectAllText}>
                    {selectedItems.length === eligibleItems.length
                      ? "Deselect All"
                      : "Select All Items"}
                  </Text>
                </TouchableOpacity>

                {/* Items List */}
                <Text style={styles.sectionTitle}>
                  Select Items to Exchange
                </Text>
                {eligibleItems.map((item) => (
                  <TouchableOpacity
                    key={item.lineId}
                    style={[
                      styles.returnItemCard,
                      selectedItems.includes(item.lineId) &&
                        styles.returnItemCardSelected,
                    ]}
                    onPress={() => handleToggleItemSelection(item.lineId)}
                  >
                    <View style={styles.returnItemCheckbox}>
                      <Ionicons
                        name={
                          selectedItems.includes(item.lineId)
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={22}
                        color={
                          selectedItems.includes(item.lineId)
                            ? "#e11d48"
                            : "#9CA3AF"
                        }
                      />
                    </View>
                    <View style={styles.returnItemImage}>
                      {item.images && item.images.length > 0 ? (
                        <Image
                          source={{ uri: item.images[0] }}
                          style={styles.returnItemImg}
                        />
                      ) : (
                        <Ionicons
                          name="cube-outline"
                          size={24}
                          color="#9CA3AF"
                        />
                      )}
                    </View>
                    <View style={styles.returnItemInfo}>
                      <Text style={styles.returnItemName} numberOfLines={2}>
                        {item.productName}
                      </Text>
                      <Text style={styles.returnItemDetails}>
                        ₹{(item.price || item.unitPrice)?.toLocaleString()} •
                        Qty: {item.availableQuantity}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Reason Selection */}
                <Text style={styles.sectionTitle}>Reason for Exchange</Text>
                <TouchableOpacity
                  style={styles.reasonSelector}
                  onPress={() => setShowReasonPicker(true)}
                >
                  <Text
                    style={
                      selectedReason
                        ? styles.reasonSelectorText
                        : styles.reasonSelectorPlaceholder
                    }
                  >
                    {selectedReason
                      ? EXCHANGE_REASONS.find((r) => r.value === selectedReason)
                          ?.label
                      : "Select reason for exchange"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>

                {/* Reason Picker Modal */}
                <Modal
                  visible={showReasonPicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowReasonPicker(false)}
                >
                  <TouchableOpacity
                    style={styles.reasonPickerOverlay}
                    activeOpacity={1}
                    onPress={() => setShowReasonPicker(false)}
                  >
                    <View style={styles.reasonPickerContainer}>
                      <Text style={styles.reasonPickerTitle}>
                        Select Reason
                      </Text>
                      {EXCHANGE_REASONS.map((reason) => (
                        <TouchableOpacity
                          key={reason.value}
                          style={[
                            styles.reasonPickerItem,
                            selectedReason === reason.value &&
                              styles.reasonPickerItemSelected,
                          ]}
                          onPress={() => {
                            setSelectedReason(reason.value);
                            setShowReasonPicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.reasonPickerItemText,
                              selectedReason === reason.value &&
                                styles.reasonPickerItemTextSelected,
                            ]}
                          >
                            {reason.label}
                          </Text>
                          {selectedReason === reason.value && (
                            <Ionicons
                              name="checkmark"
                              size={20}
                              color="#e11d48"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>

                {/* Description for 'Other' reason */}
                {selectedReason === "other" && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Description *</Text>
                    <TextInput
                      style={styles.descriptionInput}
                      placeholder="Please describe the issue..."
                      value={reasonDescription}
                      onChangeText={setReasonDescription}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                )}

                {/* Exchange Info */}
                <View style={styles.infoCard}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#6B7280"
                  />
                  <View style={styles.infoCardContent}>
                    <Text style={styles.infoCardTitle}>Exchange Process</Text>
                    <Text style={styles.infoCardText}>
                      • We'll schedule pickup of your original items{"\n"}•
                      Quality check will be performed upon receipt{"\n"}• Our
                      team will contact you for replacement options{"\n"}•
                      Estimated processing time: 5-7 business days
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Submit Button */}
          {!checkingEligibility && isEligible && (
            <View style={styles.returnSubmitContainer}>
              <TouchableOpacity
                style={[
                  styles.returnSubmitButton,
                  (selectedItems.length === 0 ||
                    !selectedReason ||
                    isSubmittingReturn) &&
                    styles.returnSubmitButtonDisabled,
                ]}
                onPress={handleSubmitExchange}
                disabled={
                  selectedItems.length === 0 ||
                  !selectedReason ||
                  isSubmittingReturn
                }
              >
                {isSubmittingReturn ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.returnSubmitButtonText}>
                      Submit Exchange Request
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={["#FEE2E2", "#FECACA"]}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="bag-outline" size={48} color="#EF4444" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptyMessage}>
        Start shopping to see your order history here. Discover our exquisite
        collection of handcrafted jewelry!
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push("/products")}
      >
        <Ionicons name="bag-handle-outline" size={18} color="#fff" />
        <Text style={styles.shopButtonText}>Explore Collection</Text>
      </TouchableOpacity>
    </View>
  );

  // Handle page change for server-side pagination
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    setFilterPage(1); // Reset filter page when changing server page
  }, []);

  // Pagination controls
  const renderPagination = () => {
    // For "all" filter, use server-side pagination
    if (selectedFilter === "all") {
      if (totalPages <= 1) return null;

      return (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === 1 && styles.paginationButtonDisabled,
            ]}
            onPress={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={currentPage === 1 ? "#D1D5DB" : "#374151"}
            />
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === 1 && styles.paginationButtonTextDisabled,
              ]}
            >
              Prev
            </Text>
          </TouchableOpacity>

          <Text style={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === totalPages && styles.paginationButtonDisabled,
            ]}
            onPress={() =>
              currentPage < totalPages && handlePageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages || isLoading}
          >
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === totalPages &&
                  styles.paginationButtonTextDisabled,
              ]}
            >
              Next
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={currentPage === totalPages ? "#D1D5DB" : "#374151"}
            />
          </TouchableOpacity>
        </View>
      );
    }

    // For filtered views, use local pagination
    if (filteredTotalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            filterPage === 1 && styles.paginationButtonDisabled,
          ]}
          onPress={() => filterPage > 1 && setFilterPage(filterPage - 1)}
          disabled={filterPage === 1}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={filterPage === 1 ? "#D1D5DB" : "#374151"}
          />
          <Text
            style={[
              styles.paginationButtonText,
              filterPage === 1 && styles.paginationButtonTextDisabled,
            ]}
          >
            Prev
          </Text>
        </TouchableOpacity>

        <Text style={styles.paginationInfo}>
          Page {filterPage} of {filteredTotalPages}
        </Text>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            filterPage === filteredTotalPages &&
              styles.paginationButtonDisabled,
          ]}
          onPress={() =>
            filterPage < filteredTotalPages && setFilterPage(filterPage + 1)
          }
          disabled={filterPage === filteredTotalPages}
        >
          <Text
            style={[
              styles.paginationButtonText,
              filterPage === filteredTotalPages &&
                styles.paginationButtonTextDisabled,
            ]}
          >
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={filterPage === filteredTotalPages ? "#D1D5DB" : "#374151"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#fdf2f8", "#fce7f3"]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>My Orders</Text>
            {isLoading && (
              <ActivityIndicator
                size="small"
                color="#e11d48"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          <Text style={styles.orderCount}>
            {selectedFilter === "all" ? totalOrders : allFilteredOrders.length}{" "}
            order
            {(selectedFilter === "all"
              ? totalOrders
              : allFilteredOrders.length) !== 1
              ? "s"
              : ""}
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <FlatList
            data={filterTabs}
            renderItem={renderFilterTab}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabs}
          />
        </View>

        {/* Orders List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={styles.loadingText}>Loading your orders...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderCard}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#e11d48"
              />
            }
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderPagination}
            contentContainerStyle={[
              styles.listContainer,
              filteredOrders.length === 0 && styles.emptyListContainer,
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Order Detail Modal */}
        {renderOrderDetailModal()}

        {/* Return Modal */}
        {renderReturnModal()}

        {/* Exchange Modal */}
        {renderExchangeModal()}

        {/* Bottom Navigation */}
        <BottomNavigation currentRoute="/profile" />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  orderCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  filterContainer: {
    backgroundColor: "transparent",
    paddingVertical: 12,
  },
  filterTabs: {
    paddingHorizontal: 16,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  activeFilterTab: {
    backgroundColor: "#e11d48",
  },
  filterLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeFilterLabel: {
    color: "#fff",
  },
  filterBadge: {
    marginLeft: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeFilterBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  filterCount: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "bold",
  },
  activeFilterCount: {
    color: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  productPreview: {
    flexDirection: "row",
    marginBottom: 12,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e11d48",
  },
  orderActions: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e11d48",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  secondaryButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  shopButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e11d48",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#fdf2f8",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
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
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  orderDetailNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  orderDetailDate: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
  },
  orderDetailStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  orderDetailStatusText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  journeyContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  journeySectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  journeySteps: {
    flexDirection: "row",
    paddingRight: 16,
  },
  journeyStep: {
    alignItems: "center",
    marginRight: 8,
  },
  journeyStepIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  journeyStepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  journeyConnector: {
    width: 40,
    height: 2,
  },
  journeyStepLabel: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
    width: 70,
  },
  detailSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  orderItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  orderItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  orderItemQty: {
    fontSize: 12,
    color: "#6B7280",
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e11d48",
  },
  addressCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
  },
  addressName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 13,
    color: "#3B82F6",
    marginTop: 8,
  },
  paymentCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  paymentValueSmall: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1F2937",
    maxWidth: 180,
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  paymentPending: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e11d48",
  },
  modalActions: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  modalPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e11d48",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalPrimaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalSecondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e11d48",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalSecondaryButtonText: {
    color: "#e11d48",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  paginationButtonDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#F3F4F6",
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginHorizontal: 4,
  },
  paginationButtonTextDisabled: {
    color: "#D1D5DB",
  },
  paginationInfo: {
    fontSize: 14,
    color: "#6B7280",
  },
  // Return/Exchange Modal Styles
  modalCloseButton: {
    padding: 8,
  },
  notEligibleContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  notEligibleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  notEligibleText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  returnWindowCard: {
    flexDirection: "row",
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  returnWindowContent: {
    flex: 1,
    marginLeft: 12,
  },
  returnWindowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#065F46",
  },
  returnWindowText: {
    fontSize: 13,
    color: "#047857",
    marginTop: 2,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  selectAllText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#e11d48",
    marginLeft: 10,
  },
  returnItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  returnItemCardSelected: {
    backgroundColor: "#FDF2F8",
    borderColor: "#e11d48",
  },
  returnItemCheckbox: {
    marginRight: 12,
  },
  returnItemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  returnItemImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  returnItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  returnItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  returnItemDetails: {
    fontSize: 13,
    color: "#6B7280",
  },
  reasonSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  reasonSelectorText: {
    fontSize: 15,
    color: "#1F2937",
  },
  reasonSelectorPlaceholder: {
    fontSize: 15,
    color: "#9CA3AF",
  },
  reasonPickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  reasonPickerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  reasonPickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  reasonPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 4,
  },
  reasonPickerItemSelected: {
    backgroundColor: "#FDF2F8",
  },
  reasonPickerItemText: {
    fontSize: 15,
    color: "#374151",
  },
  reasonPickerItemTextSelected: {
    color: "#e11d48",
    fontWeight: "600",
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  descriptionInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 15,
    color: "#1F2937",
    minHeight: 100,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 16,
  },
  infoCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
  returnSubmitContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  returnSubmitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e11d48",
    borderRadius: 12,
    paddingVertical: 16,
  },
  returnSubmitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  returnSubmitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
});

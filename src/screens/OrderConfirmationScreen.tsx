import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "../components/common/TouchableOpacity";
// Using React Native's built-in Clipboard
import { Clipboard as RNClipboard } from "react-native";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { toast } from "../hooks/use-toast";
import { useGetOrderDetails } from "../services/paymentService";

// Brand colors
const BRAND_COLOR = "#C9A961";
const SUCCESS_COLOR = "#22c55e";
const BACKGROUND_COLOR = "#f0fdf4";

interface OrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  pinCode?: string;
  country?: string;
  phone?: string;
}

interface OrderData {
  id?: string;
  code?: string;
  amount?: number;
  totalAmount?: number;
  netValue?: number;
  paymentMethod?: string;
  items?: OrderItem[];
  products?: OrderItem[];
  lines?: Array<{
    productId: string;
    quantity: number;
    price: number;
    product?: { name?: string };
  }>;
  shippingAddress?: ShippingAddress;
  address?: ShippingAddress;
  createdAt?: string;
}

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId?: string;
    orderData?: string;
  }>();

  const orderId = params.orderId;

  // Parse order data from params if available
  let orderDataFromParams: OrderData | null = null;
  try {
    if (params.orderData) {
      orderDataFromParams = JSON.parse(params.orderData);
    }
  } catch (e) {
    // Silent fail - will fallback to API data
  }

  // Fetch order details from API if orderId is available
  const {
    data: orderDataFromAPI,
    isLoading,
    error,
  } = useGetOrderDetails(orderId || "");

  // Use params data if available, otherwise use API data
  const orderData: OrderData | null = orderDataFromParams || orderDataFromAPI;

  // Animation refs
  const successScale = useRef(new Animated.Value(0)).current;
  const successRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Run animations on mount
  useEffect(() => {
    // Success icon animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(successRotate, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Derived values
  const orderNumber = orderData?.code || orderData?.id || orderId || "N/A";
  const totalAmount =
    orderData?.amount || orderData?.totalAmount || orderData?.netValue || 0;
  const paymentMethod = orderData?.paymentMethod || "Online Payment";

  // Get items from various possible structures
  const items: OrderItem[] =
    orderData?.items ||
    orderData?.products ||
    orderData?.lines?.map((line) => ({
      productId: line.productId,
      productName: line.product?.name,
      quantity: line.quantity,
      price: line.price,
    })) ||
    [];

  const shippingAddress = orderData?.shippingAddress || orderData?.address;

  // Calculate estimated delivery (5-7 days from now)
  const estimatedDelivery = new Date(
    Date.now() + 5 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Handlers
  const copyOrderNumber = () => {
    if (orderNumber && orderNumber !== "N/A") {
      RNClipboard.setString(orderNumber);
      toast({
        title: "Copied!",
        description: "Order number copied to clipboard",
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just ordered from Tishyaa Jewels! 🎉\nOrder #${orderNumber}\n\nCheck out their beautiful collection at tishyaajewels.com`,
        title: "My Tishyaa Jewels Order",
      });
    } catch (error) {
      // Sharing cancelled or failed - no action needed
    }
  };

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@tishyaajewels.com");
  };

  const handleCallSupport = () => {
    Linking.openURL("tel:+919876543210");
  };

  // Loading state
  if (isLoading && !orderDataFromParams) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={SUCCESS_COLOR} />
        <Text style={styles.loadingText}>Loading Order Details...</Text>
        <Text style={styles.loadingSubtext}>
          Please wait while we fetch your order information.
        </Text>
      </View>
    );
  }

  // Error state
  if (error && !orderDataFromParams) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="cube-outline" size={48} color="#ef4444" />
        </View>
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <Text style={styles.errorText}>
          We couldn't find the order details. Please check your order number or
          try again.
        </Text>
        <View style={styles.errorButtons}>
          <Button
            variant="default"
            onPress={() => router.push("/profile/orders")}
            style={styles.errorButton}
          >
            View All Orders
          </Button>
          <Button
            variant="outline"
            onPress={() => router.push("/products")}
            style={styles.errorButton}
          >
            Continue Shopping
          </Button>
        </View>
      </View>
    );
  }

  const rotateInterpolate = successRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-180deg", "0deg"],
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Header */}
      <View style={styles.heroSection}>
        {/* Animated Success Icon */}
        <View style={styles.successIconWrapper}>
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.successIconContainer,
              {
                transform: [
                  { scale: successScale },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={64} color="#fff" />
          </Animated.View>
        </View>

        {/* Success Message */}
        <Animated.View
          style={[
            styles.heroContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.heroTitle}>🎉 Order Placed Successfully!</Text>
          <Text style={styles.heroSubtitle}>
            Thank you for your purchase! Your order #{orderNumber} has been
            confirmed and is being processed.
          </Text>

          {/* Order Number Badge */}
          <TouchableOpacity
            style={styles.orderNumberBadge}
            onPress={copyOrderNumber}
            activeOpacity={0.7}
          >
            <Ionicons name="cube" size={20} color={SUCCESS_COLOR} />
            <Text style={styles.orderNumberText}>Order #{orderNumber}</Text>
            <Ionicons name="copy-outline" size={16} color="#6b7280" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Order Summary Card */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Order Summary</Text>
              <Badge
                variant="secondary"
                style={styles.confirmedBadge}
                textStyle={styles.confirmedBadgeText}
              >
                Confirmed
              </Badge>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <View style={styles.summaryIconRow}>
                  <Ionicons name="cube-outline" size={16} color="#6b7280" />
                  <Text style={styles.summaryLabel}>Order Code</Text>
                </View>
                <Text style={styles.summaryValueMono}>{orderNumber}</Text>
              </View>

              <View style={styles.summaryItem}>
                <View style={styles.summaryIconRow}>
                  <Ionicons name="card-outline" size={16} color="#6b7280" />
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                </View>
                <Text style={styles.summaryValueLarge}>
                  ₹{totalAmount.toLocaleString()}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <View style={styles.summaryIconRow}>
                  <Ionicons name="wallet-outline" size={16} color="#6b7280" />
                  <Text style={styles.summaryLabel}>Payment Method</Text>
                </View>
                <Text style={styles.summaryValue}>{paymentMethod}</Text>
              </View>

              <View style={styles.summaryItem}>
                <View style={styles.summaryIconRow}>
                  <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                  <Text style={styles.summaryLabel}>Estimated Delivery</Text>
                </View>
                <Text style={styles.summaryValue}>{estimatedDelivery}</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </Animated.View>

      {/* Order Items */}
      {items.length > 0 && (
        <View style={styles.section}>
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <Text style={styles.cardTitle}>Order Items ({items.length})</Text>
              <View style={styles.itemsList}>
                {items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>
                        {item.productName || `Product ${item.productId}`}
                      </Text>
                      <Text style={styles.itemDetails}>
                        Qty: {item.quantity} • ₹{item.price.toLocaleString()}{" "}
                        each
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        </View>
      )}

      {/* Shipping Address */}
      {shippingAddress && (
        <View style={styles.section}>
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Ionicons name="location-outline" size={20} color="#374151" />
                <Text style={styles.cardTitle}>Shipping Address</Text>
              </View>
              <View style={styles.addressBox}>
                <Text style={styles.addressName}>{shippingAddress.name}</Text>
                <Text style={styles.addressText}>
                  {shippingAddress.street}
                  {"\n"}
                  {shippingAddress.city}, {shippingAddress.state}
                  {"\n"}
                  {shippingAddress.zipCode || shippingAddress.pinCode}
                  {"\n"}
                  {shippingAddress.country || "India"}
                </Text>
                {shippingAddress.phone && (
                  <View style={styles.phoneRow}>
                    <Ionicons name="call-outline" size={14} color="#6b7280" />
                    <Text style={styles.phoneText}>
                      {shippingAddress.phone}
                    </Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        </View>
      )}

      {/* Order Timeline */}
      <View style={styles.section}>
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={20} color="#374151" />
              <Text style={styles.cardTitle}>Order Timeline</Text>
            </View>

            <View style={styles.timeline}>
              <TimelineItem
                icon="checkmark-circle"
                iconColor="#fff"
                iconBg={SUCCESS_COLOR}
                title="Order Confirmed"
                subtitle="Just now"
                isActive
              />
              <TimelineItem
                icon="cube"
                iconColor="#6b7280"
                iconBg="#e5e7eb"
                title="Processing"
                subtitle="Within 24 hours"
              />
              <TimelineItem
                icon="car"
                iconColor="#6b7280"
                iconBg="#e5e7eb"
                title="Shipped"
                subtitle="2-3 business days"
              />
              <TimelineItem
                icon="home"
                iconColor="#6b7280"
                iconBg="#e5e7eb"
                title="Delivered"
                subtitle="5-7 business days"
                isLast
              />
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/profile/orders")}
              >
                <Ionicons name="cube-outline" size={20} color="#374151" />
                <Text style={styles.actionButtonText}>Track Order</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="#374151" />
                <Text style={styles.actionButtonText}>Share Order</Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Special Offer */}
      <View style={styles.section}>
        <View style={styles.offerCard}>
          <Ionicons name="gift" size={32} color="#9333ea" />
          <Text style={styles.offerTitle}>Special Offer!</Text>
          <Text style={styles.offerText}>
            Get 15% off on your next purchase. Use code{" "}
            <Text style={styles.offerCode}>NEXT15</Text>
          </Text>
          <TouchableOpacity
            style={styles.offerButton}
            onPress={() => router.push("/products")}
          >
            <Text style={styles.offerButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.mainActions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/products")}
        >
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/profile/orders")}
        >
          <Text style={styles.secondaryButtonText}>View All Orders</Text>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.supportSection}>
        <Text style={styles.supportTitle}>Need Help?</Text>
        <Text style={styles.supportText}>
          If you have any questions about your order, feel free to contact our
          support team.
        </Text>
        <View style={styles.supportButtons}>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Ionicons name="mail-outline" size={18} color="#374151" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleCallSupport}
          >
            <Ionicons name="call-outline" size={18} color="#374151" />
            <Text style={styles.supportButtonText}>+91 98765 43210</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Timeline Item Component
interface TimelineItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  isActive?: boolean;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  isActive,
  isLast,
}) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineLeft}>
      <View style={[styles.timelineIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      {!isLast && <View style={styles.timelineLine} />}
    </View>
    <View style={styles.timelineContent}>
      <Text
        style={[
          styles.timelineTitle,
          !isActive && styles.timelineTitleInactive,
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.timelineSubtitle,
          !isActive && styles.timelineSubtitleInactive,
        ]}
      >
        {subtitle}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND_COLOR,
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 20,
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  errorButtons: {
    gap: 12,
    width: "100%",
    maxWidth: 300,
  },
  errorButton: {
    marginBottom: 8,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  successIconWrapper: {
    position: "relative",
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  pulseCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: SUCCESS_COLOR,
    opacity: 0.3,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: SUCCESS_COLOR,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: SUCCESS_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  orderNumberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderNumberText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  confirmedBadge: {
    backgroundColor: "#dcfce7",
    borderColor: "#bbf7d0",
  },
  confirmedBadgeText: {
    color: "#15803d",
  },
  summaryGrid: {
    gap: 20,
  },
  summaryItem: {
    gap: 6,
  },
  summaryIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  summaryValueMono: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  summaryValueLarge: {
    fontSize: 24,
    fontWeight: "700",
    color: SUCCESS_COLOR,
  },
  itemsList: {
    gap: 12,
    marginTop: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 13,
    color: "#6b7280",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  addressBox: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  phoneText: {
    fontSize: 14,
    color: "#6b7280",
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: "row",
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: "center",
    width: 40,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  timelineTitleInactive: {
    color: "#9ca3af",
  },
  timelineSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  timelineSubtitleInactive: {
    color: "#d1d5db",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f9fafb",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  offerCard: {
    alignItems: "center",
    backgroundColor: "#faf5ff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e9d5ff",
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
    marginBottom: 8,
  },
  offerText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  offerCode: {
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#9333ea",
  },
  offerButton: {
    backgroundColor: "#9333ea",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  offerButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  mainActions: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: SUCCESS_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  supportSection: {
    marginTop: 32,
    marginHorizontal: 16,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  supportButtons: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
});

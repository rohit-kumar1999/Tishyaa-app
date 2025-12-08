import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useGetAnalytics,
  useGetProfitAnalysis,
} from "../../services/adminService";

// Mock dashboard data hook
const useGetDashboardData = () => {
  const analytics = useGetAnalytics();
  const profit = useGetProfitAnalysis();

  return {
    data: {
      totalProducts: 156,
      totalOrders: 245,
      totalRevenue: 150000,
      avgRating: 4.8,
      metrics: [],
      recentOrders: [],
      topProducts: [],
      alerts: [],
    },
    isLoading: analytics.isLoading || profit.isLoading,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  color: string[];
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
}

export default function AdminDashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useGetDashboardData();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const navigateToScreen = (screenName: string) => {
    router.push(`/admin/${screenName}` as any);
  };

  const metrics: DashboardMetric[] = [
    {
      id: "totalProducts",
      title: "Total Products",
      value: dashboardData?.totalProducts || 0,
      icon: "storefront",
      color: ["#8B5CF6", "#A855F7"],
    },
    {
      id: "totalOrders",
      title: "Total Orders",
      value: dashboardData?.totalOrders || 0,
      icon: "bag",
      color: ["#06B6D4", "#0891B2"],
      change: { value: 12, type: "increase" },
    },
    {
      id: "totalRevenue",
      title: "Revenue",
      value: `₹${dashboardData?.totalRevenue?.toLocaleString() || 0}`,
      icon: "cash",
      color: ["#10B981", "#059669"],
      change: { value: 8, type: "increase" },
    },
    {
      id: "avgRating",
      title: "Avg Rating",
      value: `${dashboardData?.avgRating || 0}/5`,
      icon: "star",
      color: ["#F59E0B", "#D97706"],
      change: { value: 0.2, type: "increase" },
    },
  ];

  const quickActions = [
    {
      id: "addProduct",
      title: "Add Product",
      description: "Add new jewelry to catalog",
      icon: "add-circle",
      color: ["#C9A961", "#B8935A"],
      screen: "AdminProductForm",
    },
    {
      id: "viewOrders",
      title: "View Orders",
      description: "Manage customer orders",
      icon: "list",
      color: ["#8B5CF6", "#A855F7"],
      screen: "AdminOrders",
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "View performance metrics",
      icon: "analytics",
      color: ["#06B6D4", "#0891B2"],
      screen: "AdminAnalytics",
    },
    {
      id: "settings",
      title: "Settings",
      description: "App & store settings",
      icon: "settings",
      color: ["#6B7280", "#4B5563"],
      screen: "AdminSettings",
    },
  ];

  const recentAlerts = [
    {
      id: 1,
      type: "warning",
      title: "Low Stock Alert",
      description: "5 products are running low on stock",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "info",
      title: "New Reviews",
      description: "12 new product reviews need attention",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "success",
      title: "Revenue Goal",
      description: "Monthly revenue target achieved!",
      time: "1 day ago",
    },
  ];

  const renderMetricCard = (metric: DashboardMetric) => (
    <TouchableOpacity key={metric.id} style={styles.metricCard}>
      <LinearGradient
        colors={metric.color as any}
        style={styles.metricGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.metricContent}>
          <View style={styles.metricHeader}>
            <Ionicons name={metric.icon as any} size={24} color="white" />
            {metric.change && (
              <View
                style={[
                  styles.changeBadge,
                  metric.change.type === "increase"
                    ? styles.increaseBadge
                    : styles.decreaseBadge,
                ]}
              >
                <Ionicons
                  name={
                    metric.change.type === "increase"
                      ? "trending-up"
                      : "trending-down"
                  }
                  size={12}
                  color="white"
                />
                <Text style={styles.changeText}>
                  {metric.change.value}
                  {typeof metric.change.value === "number" &&
                  metric.change.value < 1
                    ? ""
                    : "%"}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.metricValue}>{metric.value}</Text>
          <Text style={styles.metricTitle}>{metric.title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderQuickAction = (action: any) => (
    <TouchableOpacity
      key={action.id}
      style={styles.actionCard}
      onPress={() => navigateToScreen(action.screen)}
    >
      <LinearGradient
        colors={action.color}
        style={styles.actionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.actionContent}>
          <Ionicons name={action.icon as any} size={32} color="white" />
          <Text style={styles.actionTitle}>{action.title}</Text>
          <Text style={styles.actionDescription}>{action.description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderAlert = (alert: any) => {
    const getAlertIcon = () => {
      switch (alert.type) {
        case "warning":
          return "warning";
        case "success":
          return "checkmark-circle";
        case "error":
          return "alert-circle";
        default:
          return "information-circle";
      }
    };

    const getAlertColor = () => {
      switch (alert.type) {
        case "warning":
          return "#F59E0B";
        case "success":
          return "#10B981";
        case "error":
          return "#EF4444";
        default:
          return "#3B82F6";
      }
    };

    return (
      <TouchableOpacity key={alert.id} style={styles.alertCard}>
        <View
          style={[
            styles.alertIcon,
            { backgroundColor: `${getAlertColor()}20` },
          ]}
        >
          <Ionicons
            name={getAlertIcon() as any}
            size={20}
            color={getAlertColor()}
          />
        </View>
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>{alert.title}</Text>
          <Text style={styles.alertDescription}>{alert.description}</Text>
          <Text style={styles.alertTime}>{alert.time}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#C9A961" />
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Dashboard</Text>
          <Text style={styles.errorMessage}>Failed to load dashboard data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
              <Text style={styles.headerSubtitle}>
                Welcome back! Here's what's happening today.
              </Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications" size={24} color="#C9A961" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsGrid}>
            {metrics.map(renderMetricCard)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={styles.alertsSection}>
          <View style={styles.alertsHeader}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.alertsList}>{recentAlerts.map(renderAlert)}</View>
        </View>

        {/* Management Links */}
        <View style={styles.managementSection}>
          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.managementGrid}>
            {[
              {
                title: "Products",
                icon: "storefront",
                screen: "AdminProducts",
              },
              { title: "Orders", icon: "bag", screen: "AdminOrders" },
              { title: "Coupons", icon: "pricetag", screen: "AdminCoupons" },
              {
                title: "Messages",
                icon: "chatbubbles",
                screen: "AdminMessages",
              },
              {
                title: "Instagram",
                icon: "logo-instagram",
                screen: "AdminInstagram",
              },
              {
                title: "Analytics",
                icon: "analytics",
                screen: "AdminAnalytics",
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.title}
                style={styles.managementCard}
                onPress={() => navigateToScreen(item.screen)}
              >
                <Ionicons name={item.icon as any} size={24} color="#C9A961" />
                <Text style={styles.managementTitle}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={16} color="#C9A961" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  metricsSection: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: CARD_WIDTH,
    height: 120,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  metricGradient: {
    flex: 1,
    padding: 16,
  },
  metricContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  increaseBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  decreaseBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  changeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  metricTitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  actionsSection: {
    padding: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: CARD_WIDTH,
    height: 140,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  actionGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  actionContent: {
    alignItems: "center",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginTop: 12,
    textAlign: "center",
  },
  actionDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
    textAlign: "center",
  },
  alertsSection: {
    padding: 16,
  },
  alertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    color: "#C9A961",
    fontSize: 14,
    fontWeight: "600",
  },
  alertsList: {},
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  managementSection: {
    padding: 16,
    marginBottom: 32,
  },
  managementGrid: {},
  managementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  managementTitle: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
    marginLeft: 12,
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
});

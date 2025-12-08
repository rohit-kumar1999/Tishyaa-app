import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
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
const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 32;
const CARD_WIDTH = (width - 48) / 2;

export default function AdminAnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: analyticsData, isLoading } = useGetAnalytics();
  const { data: profitData } = useGetProfitAnalysis();

  const metrics = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: `₹${analyticsData?.totalRevenue?.toLocaleString() || "0"}`,
        change: { value: "+12.5%", direction: "up" as const },
        icon: "cash",
        color: ["#10B981", "#059669"],
        description: "vs last period",
      },
      {
        title: "Total Orders",
        value: analyticsData?.totalOrders || "0",
        change: { value: "+8.2%", direction: "up" as const },
        icon: "bag",
        color: ["#3B82F6", "#1D4ED8"],
        description: "completed orders",
      },
      {
        title: "Conversion Rate",
        value: `${analyticsData?.conversionRate || "0"}%`,
        change: { value: "+2.1%", direction: "up" as const },
        icon: "trending-up",
        color: ["#8B5CF6", "#7C3AED"],
        description: "visitors to buyers",
      },
      {
        title: "Avg Order Value",
        value: `₹${analyticsData?.averageOrderValue?.toLocaleString() || "0"}`,
        change: { value: "-1.2%", direction: "down" as const },
        icon: "calculator",
        color: ["#F59E0B", "#D97706"],
        description: "per transaction",
      },
    ],
    [analyticsData]
  );

  const tabs = [
    { id: "overview", title: "Overview", icon: "bar-chart" },
    { id: "sales", title: "Sales", icon: "trending-up" },
    { id: "products", title: "Products", icon: "storefront" },
    { id: "customers", title: "Customers", icon: "people" },
  ];

  const periods = [
    { id: "7d", title: "Last 7 days" },
    { id: "30d", title: "Last 30 days" },
    { id: "90d", title: "Last 3 months" },
    { id: "1y", title: "Last year" },
  ];

  return (
    <LinearGradient
      colors={["#f8fafc", "#f1f5f9", "#e2e8f0"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Analytics Dashboard</Text>
              <Text style={styles.subtitle}>
                Comprehensive business insights
              </Text>
            </View>
          </View>

          {/* Period Selection */}
          <View style={styles.periodSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.id}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period.id && styles.periodButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(period.id)}
                >
                  <Text
                    style={[
                      styles.periodText,
                      selectedPeriod === period.id && styles.periodTextActive,
                    ]}
                  >
                    {period.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              {metrics.map((metric, index) => (
                <View key={index} style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: metric.color[0] },
                      ]}
                    >
                      <Ionicons
                        name={metric.icon as any}
                        size={20}
                        color="white"
                      />
                    </View>
                    <View style={styles.trendContainer}>
                      <Ionicons
                        name={
                          metric.change.direction === "up"
                            ? "trending-up"
                            : "trending-down"
                        }
                        size={16}
                        color={
                          metric.change.direction === "up"
                            ? "#10b981"
                            : "#ef4444"
                        }
                      />
                      <Text
                        style={[
                          styles.changeText,
                          {
                            color:
                              metric.change.direction === "up"
                                ? "#10b981"
                                : "#ef4444",
                          },
                        ]}
                      >
                        {metric.change.value}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                  <Text style={styles.metricTitle}>{metric.title}</Text>
                  <Text style={styles.metricDescription}>
                    {metric.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tabButton,
                    activeTab === tab.id && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={18}
                    color={activeTab === tab.id ? "#6366f1" : "#6b7280"}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.id && styles.tabTextActive,
                    ]}
                  >
                    {tab.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chart Section */}
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Sales Trend</Text>
              <TouchableOpacity style={styles.chartSettings}>
                <Ionicons name="settings-outline" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.chartContainer}>
              <Ionicons name="bar-chart-outline" size={64} color="#9ca3af" />
              <Text style={styles.chartPlaceholder}>
                Chart visualization coming soon
              </Text>
              <Text style={styles.chartSubtext}>
                Interactive charts will be implemented
              </Text>
            </View>
          </View>

          {/* Top Products Section */}
          <View style={styles.topProductsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Performing Products</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.productsList}>
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.productItem}>
                  <View style={styles.productIcon}>
                    <Ionicons
                      name="diamond-outline"
                      size={20}
                      color="#c9a961"
                    />
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>Gold Ring #{item}</Text>
                    <Text style={styles.productSales}>
                      ₹{(Math.random() * 50000 + 10000).toFixed(0)} sales
                    </Text>
                  </View>
                  <View style={styles.productRank}>
                    <Text style={styles.rankText}>#{item}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() =>
                  Alert.alert("Feature", "Export analytics report")
                }
              >
                <Ionicons name="download-outline" size={24} color="#6366f1" />
                <Text style={styles.actionText}>Export Report</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push("/admin/settings")}
              >
                <Ionicons name="settings-outline" size={24} color="#8b5cf6" />
                <Text style={styles.actionText}>Analytics Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
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
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  periodSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  periodButtonActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  periodText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  periodTextActive: {
    color: "#ffffff",
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  metricCard: {
    width: CARD_WIDTH,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginRight: 12,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  tabText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#6366f1",
    fontWeight: "600",
  },
  chartSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  chartSettings: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  chartContainer: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  chartPlaceholder: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 12,
    fontWeight: "500",
  },
  chartSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  topProductsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "600",
  },
  productsList: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  productSales: {
    fontSize: 14,
    color: "#6b7280",
  },
  productRank: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
  },
  quickActionsSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
});

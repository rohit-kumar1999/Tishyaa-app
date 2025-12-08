import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminSettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    name: "Sparkle & Shine",
    email: "admin@sparkleshine.com",
    phone: "+91 98765 43210",
    address: "Mumbai, Maharashtra",
  });

  const settingsOptions = [
    {
      title: "Store Configuration",
      items: [
        {
          icon: "storefront-outline",
          label: "Store Information",
          type: "nav",
          action: () => setShowStoreModal(true),
          description: "Name, contact details, address",
        },
        {
          icon: "card-outline",
          label: "Payment Methods",
          type: "nav",
          action: () =>
            Alert.alert("Payment Settings", "Configure Razorpay, UPI, COD"),
          description: "Razorpay, UPI, Cash on Delivery",
        },
        {
          icon: "airplane-outline",
          label: "Shipping Options",
          type: "nav",
          action: () =>
            Alert.alert("Shipping Settings", "Configure delivery options"),
          description: "Delivery zones, rates, policies",
        },
        {
          icon: "receipt-outline",
          label: "Tax Configuration",
          type: "nav",
          action: () =>
            Alert.alert("Tax Settings", "Configure GST and other taxes"),
          description: "GST, service charges",
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: "notifications-outline",
          label: "Push Notifications",
          type: "toggle",
          value: notifications,
          onChange: setNotifications,
          description: "Mobile app notifications",
        },
        {
          icon: "mail-outline",
          label: "Email Notifications",
          type: "toggle",
          value: emailNotifications,
          onChange: setEmailNotifications,
          description: "Order and system emails",
        },
        {
          icon: "bag-outline",
          label: "Order Alerts",
          type: "toggle",
          value: orderAlerts,
          onChange: setOrderAlerts,
          description: "New order notifications",
        },
        {
          icon: "alert-circle-outline",
          label: "Low Stock Alerts",
          type: "toggle",
          value: lowStockAlerts,
          onChange: setLowStockAlerts,
          description: "Inventory warnings",
        },
      ],
    },
    {
      title: "System Settings",
      items: [
        {
          icon: "cloud-upload-outline",
          label: "Auto Backup",
          type: "toggle",
          value: autoBackup,
          onChange: setAutoBackup,
          description: "Daily automatic backups",
        },
        {
          icon: "construct-outline",
          label: "Maintenance Mode",
          type: "toggle",
          value: maintenanceMode,
          onChange: setMaintenanceMode,
          description: "Temporarily disable store",
        },
        {
          icon: "shield-checkmark-outline",
          label: "Security Settings",
          type: "nav",
          action: () => Alert.alert("Security", "Configure security settings"),
          description: "Password, 2FA, access control",
        },
        {
          icon: "language-outline",
          label: "Language & Region",
          type: "nav",
          action: () => Alert.alert("Language", "Configure language settings"),
          description: "Currency, timezone, language",
        },
      ],
    },
    {
      title: "Data Management",
      items: [
        {
          icon: "download-outline",
          label: "Export Data",
          type: "action",
          action: () => Alert.alert("Export", "Exporting data..."),
          description: "Download orders, products, customers",
        },
        {
          icon: "sync-outline",
          label: "Sync Data",
          type: "action",
          action: () => Alert.alert("Sync", "Syncing with server..."),
          description: "Synchronize with cloud",
        },
        {
          icon: "refresh-outline",
          label: "Clear Cache",
          type: "action",
          action: () => Alert.alert("Cache", "Cache cleared successfully"),
          description: "Clear temporary files",
        },
        {
          icon: "archive-outline",
          label: "Backup & Restore",
          type: "nav",
          action: () => Alert.alert("Backup", "Configure backup settings"),
          description: "Manual backup and restore",
        },
      ],
    },
    {
      title: "Advanced",
      items: [
        {
          icon: "analytics-outline",
          label: "Analytics Settings",
          type: "nav",
          action: () => router.push("/admin/analytics"),
          description: "Configure tracking and reports",
        },
        {
          icon: "code-slash-outline",
          label: "Developer Options",
          type: "nav",
          action: () => Alert.alert("Developer", "Developer settings"),
          description: "API keys, webhooks, integrations",
        },
        {
          icon: "help-circle-outline",
          label: "Help & Support",
          type: "nav",
          action: () => Alert.alert("Support", "Contact support team"),
          description: "Documentation, contact support",
        },
        {
          icon: "information-circle-outline",
          label: "About",
          type: "nav",
          action: () => Alert.alert("About", "Sparkle & Shine Admin v1.0"),
          description: "App version and information",
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.label}
      style={styles.settingItem}
      onPress={item.action || (() => {})}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          <Ionicons name={item.icon as any} size={22} color="#6366f1" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{item.label}</Text>
          <Text style={styles.settingDescription}>{item.description}</Text>
        </View>
      </View>
      <View style={styles.settingRight}>
        {item.type === "toggle" ? (
          <Switch
            value={item.value}
            onValueChange={item.onChange}
            trackColor={{ false: "#e5e7eb", true: "#a5b4fc" }}
            thumbColor={item.value ? "#6366f1" : "#9ca3af"}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {settingsOptions.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        <View style={styles.dangerZone}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={[styles.settingItem, styles.dangerItem]}>
              <View style={styles.settingLeft}>
                <Ionicons name="warning" size={20} color="#EF4444" />
                <Text style={[styles.settingLabel, styles.dangerText]}>
                  Reset All Data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  content: { flex: 1 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  settingInfo: { flex: 1, marginLeft: 12 },
  settingLabel: { fontSize: 16, color: "#1F2937" },
  settingDescription: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  settingRight: { alignItems: "center" },
  dangerZone: { marginBottom: 32 },
  dangerItem: { borderBottomWidth: 0 },
  dangerText: { color: "#EF4444" },
});

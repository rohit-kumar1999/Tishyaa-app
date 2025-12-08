import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import notificationService, {
  NotificationPreferences,
} from "../../services/notificationService";

export const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orderUpdates: true,
    promotions: true,
    newArrivals: true,
    cartReminders: true,
    wishlistAlerts: true,
    generalNotifications: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await notificationService.loadNotificationPreferences();
      setPreferences(stored);
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      await notificationService.saveNotificationPreferences(newPreferences);
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "Failed to save notification preferences");
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.sendLocalNotification({
        title: "Test Notification",
        body: "This is a test notification from Tishyaa Jewels!",
        data: { type: "test" },
      });
      Alert.alert("Success", "Test notification sent!");
    } catch (error) {
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  const renderPreferenceItem = (
    key: keyof NotificationPreferences,
    title: string,
    description: string,
    icon: string
  ) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceInfo}>
        <Ionicons
          name={icon as any}
          size={24}
          color="#C9A961"
          style={styles.preferenceIcon}
        />
        <View style={styles.preferenceText}>
          <Text style={styles.preferenceTitle}>{title}</Text>
          <Text style={styles.preferenceDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={preferences[key]}
        onValueChange={(value) => updatePreference(key, value)}
        trackColor={{ false: "#E0E0E0", true: "#C9A961" }}
        thumbColor={preferences[key] ? "#FFF" : "#FFF"}
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading notification preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications" size={32} color="#C9A961" />
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <Text style={styles.headerSubtitle}>
          Customize when and how you receive notifications
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order & Shopping</Text>

        {renderPreferenceItem(
          "orderUpdates",
          "Order Updates",
          "Get notified about order status changes and delivery updates",
          "package"
        )}

        {renderPreferenceItem(
          "cartReminders",
          "Cart Reminders",
          "Gentle reminders about items left in your cart",
          "cart"
        )}

        {renderPreferenceItem(
          "wishlistAlerts",
          "Wishlist Alerts",
          "Notifications when wishlist items go on sale or are back in stock",
          "heart"
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Marketing & Promotions</Text>

        {renderPreferenceItem(
          "promotions",
          "Promotions & Offers",
          "Special deals, discounts, and exclusive offers",
          "gift"
        )}

        {renderPreferenceItem(
          "newArrivals",
          "New Arrivals",
          "Be the first to know about new jewelry collections",
          "sparkles"
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>

        {renderPreferenceItem(
          "generalNotifications",
          "General Notifications",
          "App updates, account changes, and other important information",
          "information-circle"
        )}
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.testButton} onPress={testNotification}>
          <Ionicons name="send" size={20} color="#FFF" />
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          You can also manage notifications through your device settings
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  section: {
    backgroundColor: "#FFF",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  preferenceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  preferenceIcon: {
    marginRight: 16,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  actionSection: {
    padding: 24,
    alignItems: "center",
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C9A961",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 16,
  },
  testButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
});

export default NotificationSettings;

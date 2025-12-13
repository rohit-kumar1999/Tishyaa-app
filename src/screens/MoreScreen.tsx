import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../types";

type MoreScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function MoreScreen() {
  const navigation = useNavigation<MoreScreenNavigationProp>();

  const quickActions = [
    {
      id: "1",
      title: "Search",
      icon: "search-outline",
      color: "#4CAF50",
      onPress: () => navigation.navigate("Search"),
    },
    {
      id: "2",
      title: "Offers",
      icon: "pricetag-outline",
      color: "#FF9800",
      onPress: () => {},
    },
    {
      id: "3",
      title: "Wishlist",
      icon: "heart-outline",
      color: "#E91E63",
      onPress: () => router.push("/wishlist"),
    },
    {
      id: "4",
      title: "Orders",
      icon: "bag-outline",
      color: "#2196F3",
      onPress: () => {},
    },
  ];

  const menuSections = [
    {
      title: "Account",
      items: [
        {
          id: "profile",
          title: "My Profile",
          subtitle: "Manage your account",
          icon: "person-outline",
          onPress: () => {},
        },
        {
          id: "orders",
          title: "My Orders",
          subtitle: "Track and manage orders",
          icon: "bag-outline",
          onPress: () => {},
        },
        {
          id: "addresses",
          title: "Addresses",
          subtitle: "Manage shipping addresses",
          icon: "location-outline",
          onPress: () => {},
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          title: "Help & Support",
          subtitle: "FAQs and customer support",
          icon: "help-circle-outline",
          onPress: () => navigation.navigate("Help"),
        },
        {
          id: "contact",
          title: "Contact Us",
          subtitle: "Get in touch with us",
          icon: "call-outline",
          onPress: () => navigation.navigate("Contact"),
        },
        {
          id: "feedback",
          title: "Feedback",
          subtitle: "Share your experience",
          icon: "chatbubble-outline",
          onPress: () => {},
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          id: "about",
          title: "About Tishyaa",
          subtitle: "Learn more about us",
          icon: "information-circle-outline",
          onPress: () => navigation.navigate("About"),
        },
        {
          id: "privacy",
          title: "Privacy Policy",
          subtitle: "How we handle your data",
          icon: "shield-outline",
          onPress: () => {},
        },
        {
          id: "terms",
          title: "Terms of Service",
          subtitle: "Terms and conditions",
          icon: "document-text-outline",
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={action.onPress}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: action.color },
                ]}
              >
                <Ionicons name={action.icon as any} size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <View key={section.title} style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index < section.items.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color="#C9A961"
                    />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#ccc"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* App Info */}
      <View style={styles.appInfoContainer}>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
        <Text style={styles.appCopyright}>© 2024 Tishyaa Jewels</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionCard: {
    alignItems: "center",
    width: "23%",
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  appInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  appVersion: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: "#ccc",
  },
});

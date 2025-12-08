import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HelpMainScreen() {
  const helpSections = [
    {
      title: "Getting Started",
      items: [
        {
          icon: "help-circle-outline",
          title: "Frequently Asked Questions",
          description: "Common questions and answers",
          route: "/help/faq",
        },
        {
          icon: "information-circle-outline",
          title: "How to Order",
          description: "Step-by-step ordering guide",
          route: "/help/how-to-order",
        },
        {
          icon: "card-outline",
          title: "Payment Methods",
          description: "Accepted payment options",
          route: "/help/payments",
        },
      ],
    },
    {
      title: "Shipping & Returns",
      items: [
        {
          icon: "airplane-outline",
          title: "Shipping Information",
          description: "Delivery times and locations",
          route: "/help/shipping",
        },
        {
          icon: "return-up-back-outline",
          title: "Returns & Exchange",
          description: "Return policy and process",
          route: "/help/returns",
        },
        {
          icon: "shield-checkmark-outline",
          title: "Order Tracking",
          description: "Track your order status",
          route: "/help/tracking",
        },
      ],
    },
    {
      title: "Product Information",
      items: [
        {
          icon: "resize-outline",
          title: "Size Guide",
          description: "Jewelry sizing information",
          route: "/help/size-guide",
        },
        {
          icon: "heart-outline",
          title: "Care Instructions",
          description: "Jewelry care and maintenance",
          route: "/help/care",
        },
        {
          icon: "diamond-outline",
          title: "Quality Guarantee",
          description: "Our quality assurance",
          route: "/help/quality",
        },
      ],
    },
    {
      title: "Legal & Policies",
      items: [
        {
          icon: "document-text-outline",
          title: "Terms of Service",
          description: "Terms and conditions",
          route: "/help/terms",
        },
        {
          icon: "lock-closed-outline",
          title: "Privacy Policy",
          description: "How we protect your data",
          route: "/help/privacy",
        },
        {
          icon: "checkmark-circle-outline",
          title: "Warranty Policy",
          description: "Product warranty details",
          route: "/help/warranty",
        },
      ],
    },
    {
      title: "Contact & Support",
      items: [
        {
          icon: "mail-outline",
          title: "Contact Us",
          description: "Get in touch with support",
          route: "/contact",
        },
        {
          icon: "chatbubbles-outline",
          title: "Live Chat",
          description: "Chat with our team",
          route: "/help/chat",
        },
        {
          icon: "call-outline",
          title: "Phone Support",
          description: "Call our support line",
          route: "/help/phone",
        },
      ],
    },
  ];

  const renderHelpItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={styles.helpItem}
      onPress={() => router.push(item.route)}
    >
      <View style={styles.helpIconContainer}>
        <Ionicons name={item.icon as any} size={24} color="#6366f1" />
      </View>
      <View style={styles.helpContent}>
        <Text style={styles.helpTitle}>{item.title}</Text>
        <Text style={styles.helpDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

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
            <Text style={styles.title}>Help & Support</Text>
            <Text style={styles.subtitle}>Find answers and get help</Text>
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push("/help/search")}
          >
            <Ionicons name="search-outline" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push("/help/faq")}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={32}
                  color="#6366f1"
                />
                <Text style={styles.quickActionText}>FAQ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push("/contact")}
              >
                <Ionicons name="mail-outline" size={32} color="#8b5cf6" />
                <Text style={styles.quickActionText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push("/help/tracking")}
              >
                <Ionicons name="location-outline" size={32} color="#06b6d4" />
                <Text style={styles.quickActionText}>Track Order</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push("/help/returns")}
              >
                <Ionicons
                  name="return-up-back-outline"
                  size={32}
                  color="#f59e0b"
                />
                <Text style={styles.quickActionText}>Returns</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Sections */}
          {helpSections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionCard}>
                {section.items.map((item, itemIndex) => (
                  <View key={item.title}>
                    {renderHelpItem(item)}
                    {itemIndex < section.items.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Contact Card */}
          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Ionicons name="headset-outline" size={32} color="#6366f1" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Still Need Help?</Text>
                <Text style={styles.contactDescription}>
                  Our support team is here to help
                </Text>
              </View>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => router.push("/contact")}
              >
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  searchButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: { flex: 1, paddingHorizontal: 20 },
  quickActionsSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  quickActionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickActionCard: {
    flex: 1,
    minWidth: "22%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  section: { marginBottom: 20 },
  sectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  helpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f9ff",
    alignItems: "center",
    justifyContent: "center",
  },
  helpContent: { flex: 1 },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  helpDescription: { fontSize: 14, color: "#6b7280", lineHeight: 20 },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginHorizontal: 16 },
  contactCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 16,
  },
  contactInfo: { flex: 1 },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  contactDescription: { fontSize: 14, color: "#6b7280" },
  contactActions: { alignItems: "stretch" },
  contactButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  contactButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
});

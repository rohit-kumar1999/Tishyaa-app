import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShippingScreen() {
  const shippingOptions = [
    {
      title: "Standard Shipping",
      duration: "5-7 Business Days",
      price: "Free on orders above ₹2,000",
      icon: "cube-outline",
    },
    {
      title: "Express Shipping",
      duration: "2-3 Business Days",
      price: "₹199",
      icon: "flash-outline",
    },
    {
      title: "Same Day Delivery",
      duration: "Within 24 Hours",
      price: "₹399 (Select Cities)",
      icon: "rocket-outline",
    },
  ];

  const sections = [
    {
      title: "Domestic Shipping",
      content:
        "We ship to all locations across India. Orders are processed within 1-2 business days. Once shipped, you will receive a tracking number via email and SMS to monitor your package.",
    },
    {
      title: "International Shipping",
      content:
        "We ship to over 50+ countries worldwide. International shipping typically takes 7-14 business days. Customs duties and taxes may apply based on your country's regulations.",
    },
    {
      title: "Order Tracking",
      content:
        "Track your order anytime using the tracking number provided. You can also view order status in the 'My Orders' section of your account. Updates are sent via email and SMS at each stage.",
    },
    {
      title: "Packaging",
      content:
        "All jewelry items are carefully packaged in our signature gift boxes to ensure safe delivery. Each piece is wrapped in protective materials and sealed to maintain quality.",
    },
    {
      title: "Delivery Attempts",
      content:
        "Our courier partners will make up to 3 delivery attempts. If delivery fails, the package will be returned to our warehouse. Please ensure the correct address and contact number are provided.",
    },
    {
      title: "Shipping Restrictions",
      content:
        "Some items may have shipping restrictions to certain locations. Please check product details for any specific shipping limitations before placing your order.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/home")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Shipping Information</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Ionicons name="airplane" size={48} color="#C9A961" />
          <Text style={styles.introTitle}>Fast & Secure Delivery</Text>
          <Text style={styles.introText}>
            We partner with trusted courier services to ensure your precious
            jewelry arrives safely and on time.
          </Text>
        </View>

        {/* Shipping Options */}
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>Shipping Options</Text>
          {shippingOptions.map((option, index) => (
            <View key={index} style={styles.optionCard}>
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon as any} size={28} color="#C9A961" />
              </View>
              <View style={styles.optionDetails}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDuration}>{option.duration}</Text>
                <Text style={styles.optionPrice}>{option.price}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Need Help With Shipping?</Text>
          <Text style={styles.contactText}>
            Contact our support team for any shipping-related queries.
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color="#C9A961" />
              <Text style={styles.contactValue}>
                shipping@tishyaajewels.com
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={16} color="#C9A961" />
              <Text style={styles.contactValue}>+91 9876543210</Text>
            </View>
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
  content: {
    flex: 1,
  },
  introSection: {
    backgroundColor: "white",
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  introText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  optionsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: "row",
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
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionDetails: {
    flex: 1,
    justifyContent: "center",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  optionDuration: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C9A961",
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  contactSection: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 32,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 16,
    lineHeight: 24,
  },
  contactInfo: {
    marginTop: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactValue: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
  },
});

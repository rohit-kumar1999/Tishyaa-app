import { Ionicons } from "@expo/vector-icons";
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

export default function ReturnsExchangeScreen() {
  const policies = [
    {
      title: "30-Day Return Policy",
      icon: "calendar-outline",
      description:
        "Return any item within 30 days of delivery for a full refund.",
    },
    {
      title: "Free Returns",
      icon: "pricetag-outline",
      description: "We offer free return shipping on all orders within India.",
    },
    {
      title: "Easy Exchange",
      icon: "swap-horizontal-outline",
      description:
        "Exchange for a different size, color, or style at no extra cost.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Initiate Return",
      description:
        "Go to 'My Orders' in the app and select the item you wish to return. Click 'Request Return'.",
    },
    {
      number: "2",
      title: "Pack the Item",
      description:
        "Place the item in its original packaging with all tags attached. Include the invoice and any accessories.",
    },
    {
      number: "3",
      title: "Schedule Pickup",
      description:
        "Our courier partner will contact you to schedule a convenient pickup time.",
    },
    {
      number: "4",
      title: "Refund Processed",
      description:
        "Once we receive and inspect the item, your refund will be processed within 5-7 business days.",
    },
  ];

  const sections = [
    {
      title: "Eligible Items",
      content:
        "Most items are eligible for return within 30 days of delivery. Items must be unworn, undamaged, and in original packaging with all tags attached. Custom or personalized items are not eligible for return.",
    },
    {
      title: "Non-Returnable Items",
      content:
        "Custom-made or personalized jewelry, items marked as 'Final Sale', earrings (for hygiene reasons), items without original tags or packaging, and items showing signs of wear or damage.",
    },
    {
      title: "Exchange Policy",
      content:
        "Exchange requests can be made within 30 days of delivery. If the new item is priced higher, you'll need to pay the difference. If lower, the difference will be refunded.",
    },
    {
      title: "Refund Timeline",
      content:
        "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.",
    },
    {
      title: "Damaged or Defective Items",
      content:
        "If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos. We will arrange a replacement or full refund immediately.",
    },
    {
      title: "International Returns",
      content:
        "International orders can be returned, but customers are responsible for return shipping costs. Please contact our support team for the return address and customs information.",
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
        <Text style={styles.title}>Returns & Exchange</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Ionicons name="refresh-circle" size={48} color="#C9A961" />
          <Text style={styles.introTitle}>Hassle-Free Returns</Text>
          <Text style={styles.introText}>
            Not satisfied with your purchase? We make returns and exchanges
            simple and stress-free.
          </Text>
        </View>

        {/* Policy Highlights */}
        <View style={styles.policiesContainer}>
          {policies.map((policy, index) => (
            <View key={index} style={styles.policyCard}>
              <View style={styles.policyIconContainer}>
                <Ionicons name={policy.icon as any} size={24} color="#C9A961" />
              </View>
              <Text style={styles.policyTitle}>{policy.title}</Text>
              <Text style={styles.policyDescription}>{policy.description}</Text>
            </View>
          ))}
        </View>

        {/* Return Steps */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>How to Return</Text>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.number}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Detailed Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Need Assistance?</Text>
          <Text style={styles.contactText}>
            Our customer support team is here to help with your return or
            exchange.
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color="#C9A961" />
              <Text style={styles.contactValue}>returns@tishyaajewels.com</Text>
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
  policiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 12,
    marginBottom: 16,
  },
  policyCard: {
    width: "46%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    margin: "2%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  policyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
  },
  policyDescription: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  stepsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  stepCard: {
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
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#C9A961",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
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

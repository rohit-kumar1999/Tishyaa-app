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

export default function PrivacyPolicyScreen() {
  const sections = [
    {
      title: "Information We Collect",
      content:
        "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes your name, email address, phone number, shipping address, and payment information.",
    },
    {
      title: "How We Use Your Information",
      content:
        "We use your information to process orders, communicate with you, improve our services, and comply with legal obligations. We may also use it for marketing purposes with your consent.",
    },
    {
      title: "Information Sharing",
      content:
        "We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who help us operate our business, such as payment processors and shipping companies.",
    },
    {
      title: "Data Security",
      content:
        "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment information is encrypted using SSL technology.",
    },
    {
      title: "Your Rights",
      content:
        "You have the right to access, update, or delete your personal information. You can also opt out of marketing communications at any time. Contact us to exercise these rights.",
    },
    {
      title: "Cookies and Tracking",
      content:
        "We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can control cookie settings in your browser.",
    },
    {
      title: "Third-Party Links",
      content:
        "Our app may contain links to third-party websites. We are not responsible for the privacy practices of these sites and encourage you to read their privacy policies.",
    },
    {
      title: "Children's Privacy",
      content:
        "Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.",
    },
    {
      title: "Changes to This Policy",
      content:
        "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date.",
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
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Your Privacy Matters</Text>
          <Text style={styles.lastUpdated}>Last updated: December 5, 2024</Text>
          <Text style={styles.introText}>
            At Tishyaa Jewels, we are committed to protecting your privacy and
            personal information. This policy explains how we collect, use, and
            safeguard your data.
          </Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Questions About Privacy?</Text>
          <Text style={styles.contactText}>
            If you have any questions about this Privacy Policy, please contact
            us:
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color="#C9A961" />
              <Text style={styles.contactValue}>privacy@tishyaajewels.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={16} color="#C9A961" />
              <Text style={styles.contactValue}>+91 9876543210</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={16} color="#C9A961" />
              <Text style={styles.contactValue}>
                Tishyaa Jewels, Mumbai, India
              </Text>
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
    padding: 20,
    borderRadius: 12,
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
    marginBottom: 8,
    textAlign: "center",
  },
  lastUpdated: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  introText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    textAlign: "center",
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

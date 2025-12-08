import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TermsOfServiceScreen() {
  const navigation = useNavigation();

  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing and using Tishyaa Jewels' services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
    },
    {
      title: "Use of Services",
      content: "You may use our services only for lawful purposes and in accordance with these Terms. You agree not to use the services in any way that could damage, disable, overburden, or impair our systems."
    },
    {
      title: "Account Registration",
      content: "To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account."
    },
    {
      title: "Product Information",
      content: "We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions or pricing are error-free. We reserve the right to correct errors and update information."
    },
    {
      title: "Orders and Payment",
      content: "All orders are subject to acceptance and availability. We reserve the right to refuse or cancel orders. Payment must be received before order processing. All prices are in Indian Rupees and include applicable taxes."
    },
    {
      title: "Shipping and Delivery",
      content: "We will make reasonable efforts to deliver within estimated timeframes, but delivery dates are not guaranteed. Risk of loss transfers to you upon delivery to the shipping address."
    },
    {
      title: "Returns and Exchanges",
      content: "Returns are accepted within 30 days of delivery, subject to our return policy. Items must be in original condition. Custom or personalized items may not be returnable unless defective."
    },
    {
      title: "Intellectual Property",
      content: "All content on our platform, including designs, logos, and text, is protected by intellectual property rights. You may not use our content without permission."
    },
    {
      title: "Limitation of Liability",
      content: "Our liability is limited to the maximum extent permitted by law. We are not liable for indirect, incidental, or consequential damages."
    },
    {
      title: "Governing Law",
      content: "These terms are governed by Indian law. Any disputes will be resolved in the courts of Mumbai, India."
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Terms & Conditions</Text>
          <Text style={styles.lastUpdated}>Last updated: December 5, 2024</Text>
          <Text style={styles.introText}>
            Please read these Terms of Service carefully before using Tishyaa Jewels' services. 
            These terms create a legal agreement between you and Tishyaa Jewels.
          </Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{index + 1}. {section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Questions About These Terms?</Text>
          <Text style={styles.contactText}>
            If you have questions about these Terms of Service, please contact us at legal@tishyaajewels.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  introSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  introText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  contactSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 32,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { TouchableOpacity } from "../components/common/TouchableOpacity";
import BottomNavigation from "../components/common/BottomNavigation";
import { Footer } from "../components/common/Footer";
import { TopHeader } from "../components/common/TopHeader";

const { width: screenWidth } = Dimensions.get("window");

interface ContactInfo {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  details: string[];
  action?: () => void;
}

interface FAQ {
  question: string;
  answer: string;
}

export default function ContactScreen() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number.");
      return;
    }

    if (!formData.subject.trim()) {
      Alert.alert("Error", "Please enter a subject.");
      return;
    }

    if (!formData.message.trim()) {
      Alert.alert("Error", "Please enter your message.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Message Sent!",
        "Thank you for contacting us. We'll get back to you within 24 hours."
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 1500);
  };

  const handleCall = () => {
    Linking.openURL("tel:+919876543210");
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const contactInfo: ContactInfo[] = [
    {
      icon: "call",
      title: "Call Us",
      details: ["+91 98765 43210", "+91 87654 32109", "Mon-Sat: 10 AM - 8 PM"],
      action: handleCall,
    },
    {
      icon: "mail",
      title: "Email Us",
      details: [
        "info@tishyaa.com",
        "support@tishyaa.com",
        "orders@tishyaa.com",
      ],
      action: () => handleEmail("info@tishyaa.com"),
    },
    {
      icon: "time",
      title: "Business Hours",
      details: [
        "Monday - Saturday: 10 AM - 8 PM",
        "Sunday: 11 AM - 6 PM",
        "Online: 24/7",
      ],
    },
  ];

  const faqs: FAQ[] = [
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day hassle-free return policy. Items must be in original condition with tags attached.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Currently, we only ship within India. We are working on expanding to international markets soon.",
    },
    {
      question: "Are your jewelry pieces hypoallergenic?",
      answer:
        "Yes, most of our jewelry is made with hypoallergenic materials. Check individual product descriptions for specific details.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order is shipped, you will receive a tracking number via email and SMS to track your package.",
    },
  ];

  return (
    <View style={styles.container}>
      <TopHeader />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={["#fff1f2", "#fce7f3", "#f3e8ff"]}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Get in Touch</Text>
          <Text style={styles.heroDescription}>
            Have questions about our jewelry or need assistance? We're here to
            help! Reach out to us through any of the channels below.
          </Text>
        </LinearGradient>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Send us a Message</Text>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange("name", value)}
                  placeholder="Your name"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.formField}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  placeholder="your@email.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.formFieldFull}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formFieldFull}>
              <Text style={styles.label}>Subject *</Text>
              <TextInput
                style={styles.input}
                value={formData.subject}
                onChangeText={(value) => handleInputChange("subject", value)}
                placeholder="What is this about?"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formFieldFull}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={formData.message}
                onChangeText={(value) => handleInputChange("message", value)}
                placeholder="Tell us more about your inquiry..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.9}
            >
              <Ionicons
                name={isSubmitting ? "hourglass" : "send"}
                size={18}
                color="#fff"
              />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactInfoSection}>
          {contactInfo.map((info, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactCard}
              onPress={info.action}
              activeOpacity={info.action ? 0.8 : 1}
              disabled={!info.action}
            >
              <View style={styles.contactIconContainer}>
                <Ionicons name={info.icon} size={24} color="#e11d48" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactTitle}>{info.title}</Text>
                {info.details.map((detail, idx) => (
                  <Text key={idx} style={styles.contactText}>
                    {detail}
                  </Text>
                ))}
              </View>
              {info.action && (
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqGrid}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqCard}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Support Section */}
        <LinearGradient
          colors={["#fff1f2", "#fce7f3"]}
          style={styles.supportSection}
        >
          <Text style={styles.supportTitle}>Need Immediate Assistance?</Text>
          <Text style={styles.supportDescription}>
            Our customer support team is available to help you with any
            questions or concerns.
          </Text>
          <View style={styles.supportButtons}>
            <TouchableOpacity
              style={styles.supportPrimaryButton}
              onPress={handleCall}
              activeOpacity={0.9}
            >
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.supportPrimaryButtonText}>
                Call: +91 98765 43210
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.supportSecondaryButton}
              onPress={() => handleEmail("support@tishyaa.com")}
              activeOpacity={0.9}
            >
              <Ionicons name="mail" size={18} color="#e11d48" />
              <Text style={styles.supportSecondaryButtonText}>
                Email Support
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Footer />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  heroDescription: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 400,
  },

  // Form Section
  formSection: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  formField: {
    flex: 1,
  },
  formFieldFull: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },
  textarea: {
    minHeight: 120,
    paddingTop: 12,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e11d48",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  // Contact Info Section
  contactInfoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  contactCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
  },
  contactDetails: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  contactText: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 20,
  },

  // FAQ Section
  faqSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  faqGrid: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
  },

  // Support Section
  supportSection: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  supportTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  supportDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  supportButtons: {
    width: "100%",
    gap: 12,
  },
  supportPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e11d48",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  supportPrimaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  supportSecondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e11d48",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  supportSecondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e11d48",
  },
});

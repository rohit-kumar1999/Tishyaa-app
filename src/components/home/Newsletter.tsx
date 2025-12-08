import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = () => {
    if (email.trim()) {
      // Handle newsletter subscription
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <LinearGradient colors={["#e11d48", "#ec4899"]} style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.centerContent}>
          {/* Gift Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="gift"
              size={screenWidth > 640 ? 32 : 24}
              color="#ffffff"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Get Exclusive Offers & Latest Designs
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Subscribe to our newsletter and be the first to know about new
            collections, special discounts, and styling tips. Plus, get 10% off
            your first order!
          </Text>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.formContent}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail"
                  size={screenWidth > 640 ? 20 : 16}
                  color="#6b7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email address"
                  placeholderTextColor="#6b7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Subscribe Button */}
              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  isSubscribed && styles.subscribeButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubscribed}
                activeOpacity={0.8}
              >
                <Text style={styles.subscribeButtonText}>
                  {isSubscribed ? "Subscribed!" : "Subscribe"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitDot} />
              <Text style={styles.benefitText}>10% off first order</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitDot} />
              <Text style={styles.benefitText}>Early access to sales</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitDot} />
              <Text style={styles.benefitText}>Styling tips & trends</Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: screenWidth > 1024 ? 80 : screenWidth > 640 ? 64 : 48,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  centerContent: {
    maxWidth: 1024,
    marginHorizontal: "auto",
    alignItems: "center",
  },
  iconContainer: {
    width: screenWidth > 640 ? 64 : 48,
    height: screenWidth > 640 ? 64 : 48,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: screenWidth > 640 ? 32 : 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: screenWidth > 640 ? 24 : 16,
  },
  title: {
    fontSize:
      screenWidth > 1280
        ? 36
        : screenWidth > 1024
        ? 30
        : screenWidth > 640
        ? 24
        : 20,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: screenWidth > 640 ? 16 : 12,
    paddingHorizontal: 16,
  },
  subtitle: {
    color: "#fecaca",
    fontSize: screenWidth > 640 ? 16 : 14,
    textAlign: "center",
    lineHeight: screenWidth > 640 ? 24 : 20,
    marginBottom: screenWidth > 640 ? 32 : 24,
    maxWidth: 600,
    paddingHorizontal: 16,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 0,
  },
  formContent: {
    gap: screenWidth > 640 ? 16 : 12,
  },
  inputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  inputIcon: {
    position: "absolute",
    left: screenWidth > 640 ? 16 : 12,
    zIndex: 1,
  },
  emailInput: {
    flex: 1,
    paddingLeft: screenWidth > 640 ? 48 : 40,
    paddingRight: 16,
    paddingVertical: screenWidth > 640 ? 16 : 14,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    color: "#111827",
    fontSize: screenWidth > 640 ? 16 : 14,
  },
  subscribeButton: {
    backgroundColor: "#ffffff",
    paddingVertical: screenWidth > 640 ? 16 : 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: "#e11d48",
    fontWeight: "600",
    fontSize: screenWidth > 640 ? 16 : 14,
  },
  benefitsContainer: {
    marginTop: screenWidth > 640 ? 32 : 24,
    flexDirection: screenWidth > 640 ? "row" : "column",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: screenWidth > 640 ? 16 : 12,
    paddingHorizontal: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  benefitDot: {
    width: screenWidth > 640 ? 8 : 6,
    height: screenWidth > 640 ? 8 : 6,
    backgroundColor: "#ffffff",
    borderRadius: screenWidth > 640 ? 4 : 3,
    flexShrink: 0,
  },
  benefitText: {
    color: "#fecaca",
    fontSize: screenWidth > 640 ? 14 : 12,
  },
});

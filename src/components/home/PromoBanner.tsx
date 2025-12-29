import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

export const PromoBanner = memo(() => {
  // Animated values for floating icons
  const sparklesAnim = useRef(new Animated.Value(0)).current;
  const crownAnim = useRef(new Animated.Value(0)).current;
  const giftAnim = useRef(new Animated.Value(0)).current;
  const mainContentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate main content
    Animated.timing(mainContentAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Create floating animation for icons
    const createFloatingAnimation = (
      animValue: Animated.Value,
      delay: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 3000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start floating animations with different delays
    createFloatingAnimation(sparklesAnim, 0).start();
    createFloatingAnimation(crownAnim, 1000).start();
    createFloatingAnimation(giftAnim, 2000).start();
  }, []);

  const handleShopNow = () => {
    router.push("/products");
  };

  // Transform values for floating animation
  const sparklesTransform = sparklesAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const crownTransform = crownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const giftTransform = giftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const mainContentTransform = {
    opacity: mainContentAnim,
    transform: [
      {
        translateY: mainContentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <LinearGradient
      colors={["#f8fafc", "#f1f5f9", "#e2e8f0"]}
      style={styles.container}
    >
      {/* Background Floating Icons */}
      <View style={styles.backgroundElements}>
        <Animated.View
          style={[
            styles.floatingIcon,
            styles.sparklesIcon,
            { transform: [{ translateY: sparklesTransform }] },
          ]}
        >
          <Ionicons name="sparkles" size={32} color="rgba(226, 29, 72, 0.1)" />
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingIcon,
            styles.crownIcon,
            { transform: [{ translateY: crownTransform }] },
          ]}
        >
          <Ionicons name="diamond" size={24} color="rgba(226, 29, 72, 0.1)" />
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingIcon,
            styles.giftIcon,
            { transform: [{ translateY: giftTransform }] },
          ]}
        >
          <Ionicons name="gift" size={28} color="rgba(226, 29, 72, 0.1)" />
        </Animated.View>
      </View>

      <View style={styles.contentContainer}>
        <Animated.View style={[styles.mainContent, mainContentTransform]}>
          {/* Title */}
          <Text style={styles.title}>Limited Time Offer!</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Get up to 20% off on premium jewelry collections. Free shipping on
            orders above ₹1999
          </Text>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={handleShopNow}
              activeOpacity={0.9}
            >
              <Text style={styles.shopButtonText}>Shop Now</Text>
            </TouchableOpacity>

            <View style={styles.urgencyContainer}>
              <Ionicons name="time" size={16} color="#6b7280" />
              <Text style={styles.urgencyText}>Offer ends in 2 days</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "relative",
    paddingVertical: screenWidth > 1024 ? 64 : screenWidth > 640 ? 48 : 32,
    overflow: "hidden",
  },
  backgroundElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  floatingIcon: {
    position: "absolute",
  },
  sparklesIcon: {
    top: 40,
    left: 40,
  },
  crownIcon: {
    top: 80,
    right: 80,
  },
  giftIcon: {
    bottom: 40,
    left: "25%",
  },
  contentContainer: {
    paddingHorizontal: 16,
    alignItems: "center",
    position: "relative",
    zIndex: 10,
  },
  mainContent: {
    alignItems: "center",
    maxWidth: 600,
  },
  title: {
    fontSize: screenWidth > 1024 ? 36 : screenWidth > 640 ? 30 : 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: screenWidth > 1024 ? 18 : screenWidth > 640 ? 16 : 14,
    textAlign: "center",
    lineHeight: screenWidth > 1024 ? 26 : screenWidth > 640 ? 24 : 20,
    marginBottom: 24,
  },
  ctaSection: {
    alignItems: "center",
    gap: 16,
    flexDirection: screenWidth > 640 ? "row" : "column",
  },
  shopButton: {
    backgroundColor: "#e11d48",
    paddingHorizontal: screenWidth > 640 ? 32 : 24,
    paddingVertical: screenWidth > 640 ? 16 : 12,
    borderRadius: 8,
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  shopButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: screenWidth > 640 ? 16 : 14,
  },
  urgencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  urgencyText: {
    color: "#6b7280",
    fontSize: 14,
  },
});

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
  const starAnim = useRef(new Animated.Value(0)).current;
  const mainContentAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate main content
    Animated.timing(mainContentAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    ).start();

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
    createFloatingAnimation(crownAnim, 800).start();
    createFloatingAnimation(giftAnim, 1600).start();
    createFloatingAnimation(starAnim, 2400).start();
  }, []);

  const handleShopNow = () => {
    router.push("/products");
  };

  // Transform values for floating animation
  const sparklesTransform = sparklesAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const crownTransform = crownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const giftTransform = giftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  const starTransform = starAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const mainContentTransform = {
    opacity: mainContentAnim,
    transform: [
      {
        translateY: mainContentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  };

  return (
    <LinearGradient
      colors={["#fffbeb", "#fef3c7", "#fde68a"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative top border */}
      <LinearGradient
        colors={["#b45309", "#d97706", "#f59e0b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBorder}
      />

      {/* Background Floating Icons */}
      <View style={styles.backgroundElements}>
        <Animated.View
          style={[
            styles.floatingIcon,
            styles.sparklesIcon,
            { transform: [{ translateY: sparklesTransform }] },
          ]}
        >
          <Ionicons name="sparkles" size={36} color="rgba(217, 119, 6, 0.25)" />
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingIcon,
            styles.crownIcon,
            { transform: [{ translateY: crownTransform }] },
          ]}
        >
          <Ionicons name="diamond" size={28} color="rgba(180, 83, 9, 0.2)" />
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingIcon,
            styles.giftIcon,
            { transform: [{ translateY: giftTransform }] },
          ]}
        >
          <Ionicons name="gift" size={32} color="rgba(217, 119, 6, 0.25)" />
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingIcon,
            styles.starIcon,
            { transform: [{ translateY: starTransform }] },
          ]}
        >
          <Ionicons name="star" size={24} color="rgba(180, 83, 9, 0.2)" />
        </Animated.View>
      </View>

      <View style={styles.contentContainer}>
        <Animated.View style={[styles.mainContent, mainContentTransform]}>
          {/* Badge */}
          <View style={styles.badgeContainer}>
            <LinearGradient
              colors={["#b45309", "#d97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badge}
            >
              <Ionicons name="flash" size={14} color="#ffffff" />
              <Text style={styles.badgeText}>EXCLUSIVE OFFER</Text>
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>Limited Time Offer!</Text>

          {/* Discount Highlight */}
          <View style={styles.discountContainer}>
            <Text style={styles.discountText}>UP TO</Text>
            <Text style={styles.discountValue}>20% OFF</Text>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            On premium jewelry collections{"\n"}Free shipping on orders above
            ₹1999
          </Text>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.shopButtonWrapper}
              onPress={handleShopNow}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#b45309", "#92400e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shopButton}
              >
                <Text style={styles.shopButtonText}>Shop Now</Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Urgency Timer */}
          <View style={styles.urgencyContainer}>
            <View style={styles.timerIcon}>
              <Ionicons name="time-outline" size={18} color="#b45309" />
            </View>
            <Text style={styles.urgencyText}>
              Offer ends in <Text style={styles.urgencyHighlight}>2 days</Text>
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Decorative bottom border */}
      <LinearGradient
        colors={["#f59e0b", "#d97706", "#b45309"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomBorder}
      />
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "relative",
    paddingVertical: screenWidth > 1024 ? 80 : screenWidth > 640 ? 64 : 48,
    overflow: "hidden",
  },
  topBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  bottomBorder: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  backgroundElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingIcon: {
    position: "absolute",
  },
  sparklesIcon: {
    top: 30,
    left: 30,
  },
  crownIcon: {
    top: 60,
    right: 50,
  },
  giftIcon: {
    bottom: 50,
    left: "20%",
  },
  starIcon: {
    bottom: 70,
    right: 30,
  },
  contentContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
    position: "relative",
    zIndex: 10,
  },
  mainContent: {
    alignItems: "center",
    maxWidth: 500,
  },
  badgeContainer: {
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    fontSize: screenWidth > 1024 ? 42 : screenWidth > 640 ? 36 : 28,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  discountContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  discountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: 2,
    marginBottom: 4,
  },
  discountValue: {
    fontSize: screenWidth > 1024 ? 56 : screenWidth > 640 ? 48 : 40,
    fontWeight: "900",
    color: "#b45309",
    letterSpacing: -1,
  },
  subtitle: {
    color: "#4b5563",
    fontSize: screenWidth > 1024 ? 18 : screenWidth > 640 ? 16 : 15,
    textAlign: "center",
    lineHeight: screenWidth > 1024 ? 28 : screenWidth > 640 ? 26 : 24,
    marginBottom: 28,
  },
  ctaSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  shopButtonWrapper: {
    shadowColor: "#b45309",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  shopButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: screenWidth > 640 ? 40 : 32,
    paddingVertical: screenWidth > 640 ? 18 : 16,
    borderRadius: 30,
    gap: 10,
  },
  shopButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: screenWidth > 640 ? 18 : 16,
    letterSpacing: 0.5,
  },
  urgencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(180, 83, 9, 0.2)",
  },
  timerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(180, 83, 9, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  urgencyText: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "500",
  },
  urgencyHighlight: {
    color: "#b45309",
    fontWeight: "700",
  },
});

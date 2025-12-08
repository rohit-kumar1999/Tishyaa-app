import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

export const TrustBadges = () => {
  const badges = [
    {
      icon: "shield-checkmark",
      title: "Quality Assured",
      description: "Premium artificial jewelry with lifetime warranty",
    },
    {
      icon: "car",
      title: "Free Shipping",
      description: "On all orders above ₹499",
    },
    {
      icon: "refresh",
      title: "Easy Returns",
      description: "7-days hassle-free returns",
    },
    {
      icon: "headset",
      title: "24/7 Support",
      description: "Dedicated customer service",
    },
  ];

  const renderBadge = (badge: (typeof badges)[0], index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.badgeContainer}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={["#e11d48", "#ec4899"]}
        style={styles.iconContainer}
      >
        <Ionicons
          name={badge.icon as any}
          size={screenWidth > 640 ? 32 : 24}
          color="#ffffff"
        />
      </LinearGradient>

      <Text style={styles.badgeTitle}>{badge.title}</Text>
      <Text style={styles.badgeDescription}>{badge.description}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#fef2f2", "#fdf2f8"]} style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.badgesGrid}>{badges.map(renderBadge)}</View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: screenWidth > 640 ? 64 : 48,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: screenWidth > 640 ? 32 : 24,
    justifyContent: "space-between",
  },
  badgeContainer: {
    width: screenWidth > 1024 ? "22%" : screenWidth > 640 ? "45%" : "45%",
    alignItems: "center",
    minWidth: screenWidth > 640 ? 160 : 140,
  },
  iconContainer: {
    width: screenWidth > 640 ? 64 : 48,
    height: screenWidth > 640 ? 64 : 48,
    borderRadius: screenWidth > 640 ? 32 : 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: screenWidth > 640 ? 16 : 12,
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badgeTitle: {
    fontWeight: "600",
    fontSize: screenWidth > 640 ? 16 : 14,
    color: "#111827",
    textAlign: "center",
    marginBottom: screenWidth > 640 ? 8 : 4,
  },
  badgeDescription: {
    fontSize: screenWidth > 640 ? 14 : 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: screenWidth > 640 ? 20 : 18,
  },
});

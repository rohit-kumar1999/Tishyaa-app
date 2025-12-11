import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

export const Footer = React.memo(() => {
  // Memoized static categories for performance
  const staticCategories = useMemo(
    () => [
      { name: "Earrings", path: "/products?category=earrings" },
      { name: "Necklaces", path: "/products?category=necklaces" },
      { name: "Bracelets", path: "/products?category=bracelets" },
      { name: "Rings", path: "/products?category=rings" },
      { name: "Jewelry Sets", path: "/products?category=sets" },
    ],
    []
  );

  const handleEmailPress = () => {
    Linking.openURL("mailto:tishyaajewels@gmail.com");
  };

  const handlePhonePress = () => {
    Linking.openURL("tel:+911234567890");
  };

  const handleSocialPress = (url: string) => {
    Linking.openURL(url);
  };

  const handleNavigation = (path: string) => {
    // Convert web paths to mobile navigation
    if (path.includes("/products")) {
      router.push("/(tabs)/explore");
    } else if (path.includes("/contact")) {
      router.push("/contact");
    } else if (path.includes("/about")) {
      router.push("/about");
    } else {
      // For other paths, you might want to open in web browser or handle differently
      console.log("Navigate to:", path);
    }
  };

  return (
    <View style={styles.footer}>
      {/* Main footer content */}
      <View style={styles.container}>
        {/* Brand section */}
        <View style={styles.brandSection}>
          <Text style={styles.brandDescription}>
            Crafting beautiful artificial jewelry that brings elegance and style
            to your everyday moments.
          </Text>

          {/* Contact Info */}
          <View style={styles.contactSection}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleEmailPress}
              activeOpacity={0.7}
            >
              <Ionicons name="mail" size={16} color="#6b7280" />
              <Text style={styles.contactText}>tishyaajewels@gmail.com</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handlePhonePress}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={16} color="#6b7280" />
              <Text style={styles.contactText}>+91 12345 67890</Text>
            </TouchableOpacity>
          </View>

          {/* Social Media */}
          <View style={styles.socialSection}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() =>
                handleSocialPress("https://www.instagram.com/tishyaajewels/")
              }
              activeOpacity={0.7}
            >
              <Ionicons name="logo-instagram" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() =>
                handleSocialPress("https://www.facebook.com/tishyaajewels")
              }
              activeOpacity={0.7}
            >
              <Ionicons name="logo-facebook" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() =>
                handleSocialPress("https://twitter.com/tishyaajewels")
              }
              activeOpacity={0.7}
            >
              <Ionicons name="logo-twitter" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() =>
                handleSocialPress("https://www.youtube.com/@tishyaajewels")
              }
              activeOpacity={0.7}
            >
              <Ionicons name="logo-youtube" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Links sections */}
        <View style={styles.linksContainer}>
          {/* Quick Links */}
          <View style={styles.linkSection}>
            <Text style={styles.sectionTitle}>Quick Links</Text>
            <TouchableOpacity
              onPress={() => handleNavigation("/products")}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>All Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleNavigation("/products?newArrivals=true")}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>New Arrivals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleNavigation("/gifting")}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Gift Guide</Text>
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <View style={styles.linkSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {staticCategories.map((category) => (
              <TouchableOpacity
                key={category.name}
                onPress={() => handleNavigation(category.path)}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Customer Care */}
        <View style={styles.supportSection}>
          <Text style={styles.sectionTitle}>Customer Care</Text>
          <View style={styles.supportGrid}>
            {[
              "Contact Us",
              "About Us",
              "Shipping Info",
              "Returns & Exchange",
              "Size Guide",
              "FAQ",
              "Care Instructions",
              "Privacy Policy",
            ].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() =>
                  handleNavigation(`/${item.toLowerCase().replace(" ", "-")}`)
                }
                activeOpacity={0.7}
                style={styles.supportItem}
              >
                <Text style={styles.linkText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom footer */}
        <View style={styles.bottomFooter}>
          <View style={styles.copyrightSection}>
            <View style={styles.madeWithLove}>
              <Text style={styles.madeWithText}>Made with </Text>
              <Ionicons name="heart" size={14} color="#e11d48" />
              <Text style={styles.madeWithText}> for jewelry lovers</Text>
            </View>
            <Text style={styles.copyrightText}>
              © 2024 Tishyaa. All rights reserved.
            </Text>
          </View>

          <View style={styles.legalLinks}>
            <TouchableOpacity
              onPress={() => handleNavigation("/terms")}
              activeOpacity={0.7}
            >
              <Text style={styles.legalText}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.divider}>•</Text>
            <TouchableOpacity
              onPress={() => handleNavigation("/privacy-policy")}
              activeOpacity={0.7}
            >
              <Text style={styles.legalText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#111827",
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  brandSection: {
    marginBottom: 32,
  },
  brandGradient: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  brandDescription: {
    color: "#9ca3af",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  contactSection: {
    marginBottom: 16,
    gap: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  socialSection: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  linkSection: {
    flex: 1,
    marginRight: 20,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  linkText: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 8,
  },
  supportSection: {
    marginBottom: 32,
  },
  supportGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  supportItem: {
    width: "48%",
    marginBottom: 8,
  },
  bottomFooter: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 24,
    gap: 16,
  },
  copyrightSection: {
    alignItems: "center",
    gap: 8,
  },
  madeWithLove: {
    flexDirection: "row",
    alignItems: "center",
  },
  madeWithText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  copyrightText: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  legalText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  divider: {
    color: "#6b7280",
    fontSize: 12,
  },
});

import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
export const Footer = React.memo(() => {
  const navigation = useNavigation<NavigationProp<any>>();

  // Memoized static categories for performance
  const staticCategories = useMemo(
    () => [
      { name: "Earrings", category: "earrings" },
      { name: "Necklaces", category: "necklaces" },
      { name: "Bracelets", category: "bracelets" },
      { name: "Rings", category: "rings" },
      { name: "Jewelry Sets", category: "sets" },
    ],
    []
  );

  const customerCareItems = useMemo(
    () => [
      { name: "Contact Us", screen: "Contact" },
      { name: "About Us", screen: "About" },
      {
        name: "Shipping Info",
        screen: "Help",
        params: { section: "shipping" },
      },
      {
        name: "Returns & Exchange",
        screen: "Help",
        params: { section: "returns" },
      },
      { name: "Size Guide", screen: "Help", params: { section: "size-guide" } },
      { name: "FAQ", screen: "Help", params: { section: "faq" } },
      {
        name: "Care Instructions",
        screen: "Help",
        params: { section: "care" },
      },
      { name: "Privacy Policy", screen: "PrivacyPolicy" },
    ],
    []
  );

  const handleSocialPress = (url: string) => {
    Linking.openURL(url);
  };

  const handleEmailPress = () => {
    Linking.openURL("mailto:tishyaajewels@gmail.com");
  };

  const handlePhonePress = () => {
    Linking.openURL("tel:+911234567890");
  };

  const handleNavigation = (screen: string, params?: any) => {
    navigation.navigate(screen, params);
  };

  const handleCategoryPress = (category: string) => {
    navigation.navigate("Products", { category });
  };

  return (
    <View style={styles.footer}>
      {/* Newsletter section */}
      <View style={styles.newsletterSection}>
        <Text style={styles.newsletterTitle}>Stay in the Loop</Text>
        <Text style={styles.newsletterSubtitle}>
          Get the latest updates on new collections, exclusive offers, and
          styling tips
        </Text>
        <View style={styles.newsletterForm}>
          <Input
            placeholder="Enter your email"
            containerStyle={styles.emailInput}
            inputStyle={styles.emailInputText}
          />
          <Button style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>Subscribe</Text>
          </Button>
        </View>
      </View>

      {/* Main footer */}
      <ScrollView
        style={styles.mainFooter}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.footerContent}>
          {/* Brand section */}
          <View style={styles.brandSection}>
            <Text style={styles.brandName}>Tishyaa</Text>
            <Text style={styles.brandDescription}>
              Crafting beautiful artificial jewelry that brings elegance and
              style to your everyday moments.
            </Text>

            {/* Contact Info */}
            <View style={styles.contactInfo}>
              <TouchableOpacity
                style={styles.contactItem}
                onPress={handleEmailPress}
              >
                <MaterialIcons name="email" size={16} color="#9ca3af" />
                <Text style={styles.contactText}>tishyaajewels@gmail.com</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactItem}
                onPress={handlePhonePress}
              >
                <MaterialIcons name="phone" size={16} color="#9ca3af" />
                <Text style={styles.contactText}>+91 12345 67890</Text>
              </TouchableOpacity>
            </View>

            {/* Social Media */}
            <View style={styles.socialMedia}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  handleSocialPress("https://www.instagram.com/tishyaajewels/")
                }
              >
                <FontAwesome5 name="instagram" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  handleSocialPress("https://www.facebook.com/tishyaajewels")
                }
              >
                <FontAwesome5 name="facebook" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  handleSocialPress("https://www.twitter.com/tishyaajewels")
                }
              >
                <FontAwesome5 name="twitter" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  handleSocialPress("https://www.youtube.com/tishyaajewels")
                }
              >
                <FontAwesome5 name="youtube" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Shop Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <View style={styles.linksList}>
              {staticCategories.map((category) => (
                <TouchableOpacity
                  key={category.name}
                  style={styles.linkItem}
                  onPress={() => handleCategoryPress(category.category)}
                >
                  <Text style={styles.linkText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Customer Care */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Care</Text>
            <View style={styles.linksList}>
              {customerCareItems.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={styles.linkItem}
                  onPress={() => handleNavigation(item.screen, item.params)}
                >
                  <Text style={styles.linkText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom footer */}
        <View style={styles.bottomFooter}>
          <View style={styles.bottomContent}>
            <View style={styles.madeWithLove}>
              <Text style={styles.bottomText}>Made with </Text>
              <Ionicons name="heart" size={14} color="#dc2626" />
              <Text style={styles.bottomText}> for jewelry lovers</Text>
            </View>

            <Text style={styles.copyright}>
              © 2024 Tishyaa. All rights reserved.
            </Text>

            <View style={styles.legalLinks}>
              <TouchableOpacity onPress={() => handleNavigation("Terms")}>
                <Text style={styles.legalText}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.separator}>•</Text>
              <TouchableOpacity
                onPress={() => handleNavigation("PrivacyPolicy")}
              >
                <Text style={styles.legalText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#111827",
  },
  newsletterSection: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: "center",
  },
  newsletterTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  newsletterSubtitle: {
    fontSize: 16,
    color: "#fed7d7",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  newsletterForm: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 400,
    gap: 12,
  },
  emailInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  emailInputText: {
    color: "#fff",
  },
  subscribeButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  subscribeButtonText: {
    color: "#dc2626",
    fontWeight: "600",
  },
  mainFooter: {
    flex: 1,
  },
  footerContent: {
    padding: 16,
    paddingTop: 32,
  },
  brandSection: {
    marginBottom: 32,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f9a8d4",
    marginBottom: 16,
  },
  brandDescription: {
    fontSize: 14,
    color: "#9ca3af",
    lineHeight: 20,
    marginBottom: 16,
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#9ca3af",
    marginLeft: 8,
  },
  socialMedia: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderRadius: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  linksList: {
    gap: 8,
  },
  linkItem: {
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  bottomFooter: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    padding: 16,
    paddingTop: 24,
  },
  bottomContent: {
    alignItems: "center",
    gap: 12,
  },
  madeWithLove: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  copyright: {
    fontSize: 12,
    color: "#9ca3af",
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legalText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  separator: {
    fontSize: 12,
    color: "#6b7280",
  },
});

Footer.displayName = "Footer";

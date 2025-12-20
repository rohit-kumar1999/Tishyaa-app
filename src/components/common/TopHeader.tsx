import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApiCart } from "../../contexts/ApiCartContext";
import { useWishlist } from "../../contexts/WishlistContext";

export const TopHeader = () => {
  // Use Clerk authentication
  const { user } = useUser();

  // Get wishlist count from context
  const { wishlistCount } = useWishlist();

  // Get cart count from shared cart context
  const { cartCount } = useApiCart();

  const handleSearchPress = () => {
    router.push("/search");
  };

  const handleWishlistPress = () => {
    router.push("/wishlist");
  };

  const handleCartPress = () => {
    router.push("/cart");
  };

  const handleProfilePress = () => {
    router.push("/profile");
  };

  const handleSignInPress = () => {
    router.push("/auth");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#fdf2f8", "#fce7f3"]} style={styles.gradient}>
        <View style={styles.header}>
          {/* Brand Section */}
          <View style={styles.brandSection}>
            <TouchableOpacity onPress={() => router.push("/")}>
              <Text style={styles.brandText}>Tishyaa</Text>
            </TouchableOpacity>
          </View>

          {/* Actions Section */}
          <View style={styles.actionsSection}>
            {/* Search Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSearchPress}
            >
              <Ionicons name="search" size={24} color="#e11d48" />
            </TouchableOpacity>

            {/* Wishlist Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleWishlistPress}
            >
              <Ionicons name="heart-outline" size={24} color="#e11d48" />
              {wishlistCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{wishlistCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Cart Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCartPress}
            >
              <Ionicons name="bag-outline" size={24} color="#e11d48" />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile Section - Conditional Rendering */}
            <SignedIn>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleProfilePress}
              >
                {user?.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileIcon}>
                    <Ionicons name="person" size={16} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            </SignedIn>

            <SignedOut>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSignInPress}
              >
                <View style={styles.profileIcon}>
                  <Ionicons name="person-outline" size={16} color="#e11d48" />
                </View>
              </TouchableOpacity>
            </SignedOut>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
  },
  gradient: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 64,
  },
  brandSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  brandText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e11d48",
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    position: "relative",
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#e11d48",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e11d48",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
});

import { Feather, Ionicons } from "@expo/vector-icons";
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../hooks/useCart";
import SearchDialog from "./SearchDialog";

const NavBar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();

  // Calculate total number of items in the cart
  const cartItemsCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Calculate wishlist items count
  const wishlistItemsCount = wishlist?.length || 0;

  const navigationItems = [
    { title: "Collection", screen: "Products" },
    { title: "Category", screen: "Category" },
    {
      title: "New Arrivals",
      screen: "Products",
      params: { newArrivals: true },
    },
    { title: "Gifting", screen: "Gifting" },
    { title: "About", screen: "About" },
    { title: "Contact", screen: "Contact" },
  ];

  const isActive = (screenName: string) => {
    return route.name === screenName;
  };

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchOpen = () => {
    setIsSearchOpen(true);
  };

  const handleNavigateToScreen = (screenName: string, params?: any) => {
    navigation.navigate(screenName, params);
    setIsMobileMenuOpen(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={[styles.navbar, isScrolled && styles.scrolled]}>
        <View style={styles.content}>
          {/* Left section with hamburger and logo */}
          <View style={styles.leftSection}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleMenuToggle}
            >
              <Ionicons
                name={isMobileMenuOpen ? "close" : "menu"}
                size={24}
                color="#000"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
              <Text style={styles.logo}>Tishyaa</Text>
            </TouchableOpacity>
          </View>

          {/* Right section with actions */}
          <View style={styles.rightSection}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSearchOpen}
            >
              <Feather name="search" size={20} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Profile", { tab: "orders" })}
            >
              <Feather name="list" size={20} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("wishlist" as never)}
            >
              <Feather name="heart" size={20} color="#000" />
              {wishlistItemsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{wishlistItemsCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Cart")}
            >
              <Feather name="shopping-bag" size={20} color="#000" />
              {cartItemsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartItemsCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <Feather name="user" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <View style={styles.mobileMenu}>
            <ScrollView
              style={styles.menuContent}
              showsVerticalScrollIndicator={false}
            >
              {navigationItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() =>
                    handleNavigateToScreen(item.screen, item.params)
                  }
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      isActive(item.screen) && styles.activeMenuItem,
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  navigation.navigate("wishlist" as never);
                  setIsMobileMenuOpen(false);
                }}
              >
                <View style={styles.signInItem}>
                  <Feather name="heart" size={16} color="#666" />
                  <Text style={styles.menuItemText}>
                    Wishlist ({wishlistItemsCount})
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate("Auth")}
              >
                <View style={styles.signInItem}>
                  <Feather name="log-in" size={16} color="#666" />
                  <Text style={styles.menuItemText}>Sign In</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>

      <SearchDialog
        visible={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
  },
  navbar: {
    backgroundColor: "rgba(248, 249, 250, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrolled: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 12,
    color: "#000",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#dc2626",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  mobileMenu: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
    maxHeight: 400,
  },
  menuContent: {
    paddingVertical: 8,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuItemText: {
    fontSize: 16,
    color: "#374151",
  },
  activeMenuItem: {
    color: "#dc2626",
    fontWeight: "600",
  },
  signInItem: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default NavBar;

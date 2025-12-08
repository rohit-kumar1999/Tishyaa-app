import { Feather, Ionicons } from "@expo/vector-icons";
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../hooks/useCart";
import { useProductManager } from "../../hooks/useProductManager";
import SearchDialog from "../SearchDialog";
import { Input } from "../ui/input";

export const Header: React.FC = React.memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  // Memoize cart data to prevent unnecessary re-renders
  const { cartItems = [], isLoading: cartLoading } = useCart();
  const { wishlist = [] } = useProductManager();

  // Memoize calculated values
  const itemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();

  // Memoize navigation items
  const navigationItems = useMemo(
    () => [
      { id: "collection", screen: "Products", label: "Collection" },
      { id: "category", screen: "Category", label: "Category" },
      {
        id: "new-arrivals",
        screen: "Products",
        label: "New Arrivals",
        params: { newArrivals: true },
      },
      { id: "gifting", screen: "Gifting", label: "Gifting" },
      { id: "about", screen: "About", label: "About" },
      { id: "contact", screen: "Contact", label: "Contact" },
    ],
    []
  );

  const isActive = useCallback(
    (screenName: string) => {
      return route.name === screenName;
    },
    [route.name]
  );

  // Memoize handlers to prevent re-renders
  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  const handleSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleWishlistClick = useCallback(() => {
    navigation.navigate("Profile", { tab: "wishlist" });
  }, [navigation]);

  const handleMobileSearchFocus = useCallback(() => {
    setIsSearchOpen(true);
    setIsMenuOpen(false);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleNavigateToScreen = useCallback(
    (screenName: string, params?: any) => {
      navigation.navigate(screenName, params);
      setIsMenuOpen(false);
    },
    [navigation]
  );

  // Header background animation based on scroll
  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: ["rgba(248, 249, 250, 0.8)", "rgba(255, 255, 255, 0.95)"],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[styles.header, { backgroundColor: headerBackgroundColor }]}
    >
      <View style={styles.container}>
        <View style={styles.topRow}>
          {/* Mobile: Hamburger + Logo */}
          <View style={styles.leftSection}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleMenuToggle}
            >
              <Ionicons
                name={isMenuOpen ? "close" : "menu"}
                size={24}
                color="#000"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
              <Text style={styles.logo}>Tishyaa</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSearchOpen}
            >
              <Feather name="search" size={20} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleWishlistClick}
            >
              <Feather name="heart" size={20} color="#000" />
              {wishlistCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{wishlistCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Cart")}
            >
              <Feather name="shopping-cart" size={20} color="#000" />
              {!cartLoading && itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
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
        {isMenuOpen && (
          <View style={styles.mobileMenu}>
            <View style={styles.searchContainer}>
              <Input
                placeholder="Search jewelry..."
                onFocus={handleMobileSearchFocus}
                containerStyle={styles.searchInput}
              />
            </View>

            <ScrollView style={styles.menuItems}>
              {navigationItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
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
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}

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
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    paddingVertical: 16,
    maxHeight: 400,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 0,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
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

Header.displayName = "Header";

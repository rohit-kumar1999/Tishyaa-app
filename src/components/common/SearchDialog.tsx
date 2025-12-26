import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface SearchDialogProps {
  visible: boolean;
  onClose: () => void;
}

// Rate limiting helper
const rateLimitMap = new Map<string, number[]>();

const isRateLimited = (
  key: string,
  maxRequests: number,
  windowMs: number
): boolean => {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];

  // Filter out old timestamps
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);
  return false;
};

// Sanitize search query
const sanitizeSearchQuery = (query: string): string => {
  // Remove potentially dangerous characters and trim
  return query
    .replace(/[<>{}[\]\\]/g, "")
    .trim()
    .slice(0, 100);
};

interface QuickLink {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const quickLinks: QuickLink[] = [
  {
    id: "about",
    title: "About Us",
    icon: "information-circle-outline",
    route: "/about",
  },
  { id: "contact", title: "Contact", icon: "call-outline", route: "/contact" },
  { id: "gifting", title: "Gifting", icon: "gift-outline", route: "/gifting" },
  {
    id: "products",
    title: "All Products",
    icon: "grid-outline",
    route: "/products",
  },
  {
    id: "categories",
    title: "Categories",
    icon: "apps-outline",
    route: "/categories",
  },
];

const SearchDialog: React.FC<SearchDialogProps> = ({ visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  // Animate modal in/out
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(-50);
    }
  }, [visible]);

  // Handle search input with validation
  const handleSearchChange = (value: string) => {
    // Check rate limiting
    if (isRateLimited("search", 20, 60000)) {
      setIsBlocked(true);
      return;
    }

    const sanitizedQuery = sanitizeSearchQuery(value);
    setSearchQuery(sanitizedQuery);
    setIsBlocked(false);
  };

  // Auto-redirect to products page when user types
  useEffect(() => {
    if (searchQuery.trim().length === 0 || isBlocked) {
      setIsRedirecting(false);
      return;
    }

    setIsRedirecting(true);

    const timer = setTimeout(() => {
      // Navigate to products page with search query
      router.push({
        pathname: "/products",
        params: { search: searchQuery.trim() },
      });
      handleClose();
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery, isBlocked]);

  const handleClose = () => {
    Keyboard.dismiss();
    setSearchQuery("");
    setIsRedirecting(false);
    onClose();
  };

  const handleQuickLinkPress = (route: string) => {
    router.push(route as any);
    handleClose();
  };

  const handleSubmit = () => {
    if (searchQuery.trim().length > 0) {
      router.push({
        pathname: "/products",
        params: { search: searchQuery.trim() },
      });
      handleClose();
    }
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.container,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Search Input */}
              <View style={styles.searchInputContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#6B7280"
                  style={styles.searchIcon}
                />
                <TextInput
                  ref={inputRef}
                  style={styles.searchInput}
                  placeholder="Search products, pages..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isBlocked}
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery("")}
                    style={styles.clearButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </Pressable>
                )}
                <Pressable
                  onPress={handleClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.closeText}>Cancel</Text>
                </Pressable>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {isBlocked && (
                  <View style={styles.messageContainer}>
                    <Ionicons name="time-outline" size={24} color="#EF4444" />
                    <Text style={styles.errorText}>
                      Too many search requests. Please wait a moment.
                    </Text>
                  </View>
                )}

                {isSearching && !isBlocked && (
                  <View style={styles.redirectingContainer}>
                    <View style={styles.redirectingIconContainer}>
                      <ActivityIndicator size="small" color="#e11d48" />
                      <Ionicons
                        name="search"
                        size={18}
                        color="#e11d48"
                        style={styles.redirectingIcon}
                      />
                    </View>
                    <Text style={styles.redirectingTitle}>
                      Searching for "{searchQuery}"
                    </Text>
                    <Text style={styles.redirectingSubtitle}>
                      Redirecting to collection page...
                    </Text>
                  </View>
                )}

                {!isSearching && !isBlocked && (
                  <>
                    <View style={styles.hintContainer}>
                      <Text style={styles.hintText}>
                        Start typing to search products...
                      </Text>
                    </View>

                    <View style={styles.quickLinksSection}>
                      <Text style={styles.sectionTitle}>Quick Links</Text>
                      {quickLinks.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.quickLinkItem}
                          onPress={() => handleQuickLinkPress(item.route)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={item.icon}
                            size={20}
                            color="#6B7280"
                            style={styles.quickLinkIcon}
                          />
                          <Text style={styles.quickLinkText}>{item.title}</Text>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#D1D5DB"
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FAFAFA",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 4,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  closeText: {
    fontSize: 16,
    color: "#e11d48",
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
  },
  redirectingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  redirectingIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  redirectingIcon: {
    marginLeft: 8,
  },
  redirectingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  redirectingSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  hintContainer: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  quickLinksSection: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  quickLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  quickLinkIcon: {
    marginRight: 14,
  },
  quickLinkText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
});

export default SearchDialog;

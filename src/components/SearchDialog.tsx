import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchDialogProps {
  visible: boolean;
  onClose: () => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Handle search input with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-redirect to collection page when user types
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        router.push(
          `/products?search=${encodeURIComponent(debouncedQuery.trim())}`
        );
        onClose();
        setSearchQuery("");
        setIsSearching(false);
      }, 800); // Slight delay to show searching state

      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [debouncedQuery, router, onClose]);

  // Static page results (only show when no search query)
  const pageResults =
    searchQuery.trim().length === 0
      ? [
          { id: "about", title: "About Us", screen: "About" },
          { id: "contact", title: "Contact", screen: "Contact" },
          { id: "gifting", title: "Gifting", screen: "Gifting" },
          { id: "products", title: "All Products", screen: "Products" },
          { id: "category", title: "Categories", screen: "Category" },
        ]
      : [];

  const handleSelect = (screen: string, params?: any) => {
    const screenMap: Record<string, string> = {
      About: "/about",
      Contact: "/contact",
      Products: "/products",
      Category: "/categories",
      Gifting: "/products?category=gifts",
    };

    const route = screenMap[screen] || `/${screen.toLowerCase()}`;
    router.push(route);
    onClose();
    setSearchQuery("");
  };

  const handleClose = () => {
    setSearchQuery("");
    setIsSearching(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, pages..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              placeholderTextColor="#9ca3af"
            />
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isSearching ? (
            <View style={styles.searchingContainer}>
              <View style={styles.searchingContent}>
                <View style={styles.searchingIcons}>
                  <ActivityIndicator size="small" color="#dc2626" />
                  <Feather name="search" size={16} color="#dc2626" />
                </View>
                <Text style={styles.searchingTitle}>
                  Searching for "{searchQuery}"
                </Text>
                <Text style={styles.searchingSubtitle}>
                  Redirecting to collection page...
                </Text>
              </View>
            </View>
          ) : (
            <>
              {searchQuery.trim().length === 0 && (
                <>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Links</Text>
                    {pageResults.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.resultItem}
                        onPress={() => handleSelect(item.screen)}
                      >
                        <Feather name="search" size={16} color="#6b7280" />
                        <Text style={styles.resultText}>{item.title}</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#9ca3af"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Popular Categories</Text>
                    {[
                      "Earrings",
                      "Necklaces",
                      "Bracelets",
                      "Rings",
                      "Jewelry Sets",
                    ].map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={styles.resultItem}
                        onPress={() =>
                          handleSelect("Products", {
                            category: category.toLowerCase(),
                          })
                        }
                      >
                        <Ionicons
                          name="pricetag-outline"
                          size={16}
                          color="#6b7280"
                        />
                        <Text style={styles.resultText}>{category}</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#9ca3af"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {searchQuery.trim().length > 0 && !isSearching && (
                <View style={styles.emptyContainer}>
                  <Feather name="search" size={48} color="#d1d5db" />
                  <Text style={styles.emptyTitle}>Start typing to search</Text>
                  <Text style={styles.emptySubtitle}>
                    We'll help you find what you're looking for
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: "#000",
  },
  closeButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  closeText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  searchingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  searchingContent: {
    alignItems: "center",
  },
  searchingIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  searchingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
  },
  searchingSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  resultText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default SearchDialog;

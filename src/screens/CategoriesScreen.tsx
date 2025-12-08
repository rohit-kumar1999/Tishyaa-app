import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavigation from "../components/common/BottomNavigation";

interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
  description: string;
}

export default function CategoriesScreen() {
  const categories: Category[] = [
    {
      id: "1",
      name: "Necklaces",
      image: "https://via.placeholder.com/100x100/C9A961/FFFFFF?text=Necklaces",
      productCount: 45,
      description: "Elegant necklaces for every occasion",
    },
    {
      id: "2",
      name: "Earrings",
      image: "https://via.placeholder.com/100x100/C9A961/FFFFFF?text=Earrings",
      productCount: 32,
      description: "Beautiful earrings to complement your style",
    },
    {
      id: "3",
      name: "Rings",
      image: "https://via.placeholder.com/100x100/C9A961/FFFFFF?text=Rings",
      productCount: 28,
      description: "Stunning rings for special moments",
    },
    {
      id: "4",
      name: "Bracelets",
      image: "https://via.placeholder.com/100x100/C9A961/FFFFFF?text=Bracelets",
      productCount: 19,
      description: "Graceful bracelets for everyday wear",
    },
    {
      id: "5",
      name: "Bangles",
      image: "https://via.placeholder.com/100x100/C9A961/FFFFFF?text=Bangles",
      productCount: 24,
      description: "Traditional and modern bangle designs",
    },
    {
      id: "6",
      name: "Pendants",
      image: "https://via.placeholder.com/100x100/C9A961/FFFFFF?text=Pendants",
      productCount: 16,
      description: "Exquisite pendants for every personality",
    },
  ];

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/category/${item.name.toLowerCase()}`)}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription}>{item.description}</Text>
        <Text style={styles.productCount}>{item.productCount} Products</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={20} color="#C9A961" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <Ionicons name="search-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor="#999"
        />
      </View>

      {/* Categories List */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoriesList}
        showsVerticalScrollIndicator={false}
      />

      <BottomNavigation currentRoute="/categories" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  productCount: {
    fontSize: 12,
    color: "#C9A961",
    fontWeight: "500",
  },
});

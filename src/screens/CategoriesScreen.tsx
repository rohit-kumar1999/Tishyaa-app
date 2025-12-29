import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavigation from "../components/common/BottomNavigation";
import { TopHeader } from "../components/common/TopHeader";

const { width, height } = Dimensions.get("window");

interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
  description: string;
  color: string;
  trending?: boolean;
  new?: boolean;
  icon: string;
}

const categories: Category[] = [
  {
    id: "vacay-mode",
    name: "Vacay Mode",
    image:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=300&fit=crop",
    productCount: 28,
    description: "Beach-ready jewelry for your perfect getaway",
    color: "rgba(59, 130, 246, 0.8)", // blue
    trending: true,
    icon: "umbrella-outline",
  },
  {
    id: "women-at-work",
    name: "Women At Work",
    image:
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=300&fit=crop",
    productCount: 45,
    description: "Professional elegance for the modern woman",
    color: "rgba(55, 65, 81, 0.8)", // gray
    new: true,
    icon: "briefcase-outline",
  },
  {
    id: "date-night",
    name: "Date Night",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop",
    productCount: 32,
    description: "Romantic pieces for unforgettable evenings",
    color: "rgba(236, 72, 153, 0.8)", // pink
    trending: false,
    icon: "heart-outline",
  },
  {
    id: "must-haves",
    name: "Must Haves",
    image:
      "https://images.unsplash.com/photo-1588444645479-c520d04deb0e?w=400&h=300&fit=crop",
    productCount: 52,
    description: "Essential pieces every jewelry lover needs",
    color: "rgba(245, 158, 11, 0.8)", // amber
    trending: true,
    icon: "diamond-outline",
  },
  {
    id: "celeb-picks",
    name: "CELEB PICKS",
    image:
      "https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?w=400&h=300&fit=crop",
    productCount: 19,
    description: "Celebrity-inspired statement pieces",
    color: "rgba(139, 92, 246, 0.8)", // purple
    new: true,
    icon: "star-outline",
  },
  {
    id: "wedding-collection",
    name: "Wedding Collection",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop",
    productCount: 38,
    description: "Elegant jewelry for your special day",
    color: "rgba(251, 113, 133, 0.8)", // rose
    trending: false,
    icon: "flower-outline",
  },
];

export default function CategoriesScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const renderCategory = ({
    item,
    index,
  }: {
    item: Category;
    index: number;
  }) => (
    <Animated.View
      style={[
        styles.categoryCard,
        {
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.categoryTouchable}
        onPress={() => router.push(`/category/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.categoryImageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.categoryImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={item.id}
          />
          <LinearGradient
            colors={["transparent", item.color]}
            style={styles.categoryOverlay}
          />

          {/* Badge Container */}
          <View style={styles.badgeContainer}>
            {item.trending && (
              <View style={styles.trendingBadge}>
                <Text style={styles.badgeText}>🔥 Trending</Text>
              </View>
            )}
            {item.new && (
              <View style={styles.newBadge}>
                <Text style={styles.badgeText}>✨ New</Text>
              </View>
            )}
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon as any} size={28} color="#fff" />
          </View>
        </View>

        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryDescription}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <Text style={styles.headerTitle}>Jewelry Collections</Text>
      <Text style={styles.headerSubtitle}>Crafted for Every Occasion</Text>

      {/* Feature badges */}
      <View style={styles.featureContainer}>
        <View style={styles.featureBadge}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.featureText}>Premium Quality</Text>
        </View>
        <View style={styles.featureBadge}>
          <Ionicons name="heart" size={16} color="#EF4444" />
          <Text style={styles.featureText}>Handcrafted</Text>
        </View>
        <View style={styles.featureBadge}>
          <Ionicons name="diamond" size={16} color="#8B5CF6" />
          <Text style={styles.featureText}>Luxury Design</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopHeader />
      <LinearGradient
        colors={["#FDF2F8", "#FFFFFF", "#FEF7FF"]}
        style={styles.backgroundGradient}
      >
        {/* Categories List */}
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
        />

        <BottomNavigation currentRoute="/categories" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  featureContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  featureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  categoryCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: "#fff",
  },
  categoryTouchable: {
    backgroundColor: "#fff",
  },
  categoryImageContainer: {
    position: "relative",
    height: 200,
    overflow: "hidden",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badgeContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    gap: 8,
  },
  trendingBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  iconContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    padding: 20,
    flex: 1,
  },
  categoryName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  productCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  productCount: {
    fontSize: 12,
    color: "#C9A961",
    fontWeight: "600",
  },
  arrowContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: "rgba(201, 169, 97, 0.1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

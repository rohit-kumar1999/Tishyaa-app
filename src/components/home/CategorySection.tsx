import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useHomepageDataContext } from "../../contexts/HomepageDataContext";

const screenWidth = Dimensions.get("window").width;

export const CategorySection = () => {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const fadeAnim = new Animated.Value(1);

  // Fetch categories from context
  const { categories, isLoading, error, refetch } = useHomepageDataContext();
  const isError = !!error;

  // Log error in development
  if (error && __DEV__) {
    console.warn("Failed to load categories:", error);
  }
  const minSwipeDistance = 50;

  const visible = categories
    ? Array.from({ length: Math.min(5, categories.length) }, (_, i) => {
        return categories[(index + i) % categories.length];
      }).filter(Boolean)
    : [];

  const slideLeft = () => {
    if (!categories || categories.length === 0) return;
    setIndex((prev) => (prev === 0 ? categories.length - 1 : prev - 1));
  };

  const slideRight = () => {
    if (!categories || categories.length === 0) return;
    setIndex((prev) => (prev + 1) % categories.length);
  };

  // Touch/swipe handlers
  const onTouchStart = (event: any) => {
    setTouchEnd(null);
    setTouchStart(event.nativeEvent.pageX);
  };

  const onTouchMove = (event: any) => {
    setTouchEnd(event.nativeEvent.pageX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      slideRight();
    } else if (isRightSwipe) {
      slideLeft();
    }
  };

  // Auto rotate every 2 seconds
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      slideRight();
    }, 2000);

    return () => clearInterval(interval);
  }, [categories.length, fadeAnim]);

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  const renderCategory = (category: (typeof categories)[0]) => (
    <Animated.View
      key={category.id}
      style={[styles.categoryItem, { opacity: fadeAnim }]}
    >
      <TouchableOpacity
        onPress={() => handleCategoryPress(category.id)}
        style={styles.categoryButton}
        activeOpacity={0.8}
      >
        <View style={styles.categoryImageContainer}>
          <Image
            source={{ uri: category.imageUrl }}
            style={styles.categoryImage}
            contentFit="cover"
          />
        </View>
        <View style={styles.categoryTextContainer}>
          <Text style={styles.categoryName}>{category.name}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Everyday Demi fine Jewellery</Text>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        )}

        {/* Error State */}
        {isError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load categories</Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Categories Display */}
        {!isLoading && !isError && categories && categories.length > 0 && (
          <View style={styles.categoriesWrapper}>
            {/* Left arrow - hidden on mobile screens */}
            {screenWidth > 640 && (
              <TouchableOpacity
                onPress={slideLeft}
                style={[styles.arrowButton, styles.leftArrow]}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color="#374151" />
              </TouchableOpacity>
            )}

            {/* Categories container with touch support */}
            <View
              style={styles.categoriesContainer}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScrollContent}
                scrollEventThrottle={16}
              >
                {visible.map(renderCategory)}
              </ScrollView>
            </View>

            {/* Right arrow - hidden on mobile screens */}
            {screenWidth > 640 && (
              <TouchableOpacity
                onPress={slideRight}
                style={[styles.arrowButton, styles.rightArrow]}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={24} color="#374151" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !isError && (!categories || categories.length === 0) && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories available</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: screenWidth > 1024 ? 80 : screenWidth > 640 ? 64 : 48,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: screenWidth > 1024 ? 36 : screenWidth > 640 ? 30 : 24,
    fontWeight: "300",
    color: "#111827",
    textAlign: "center",
    marginBottom: screenWidth > 1024 ? 64 : screenWidth > 640 ? 48 : 32,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingText: {
    marginLeft: 8,
    color: "#6b7280",
    fontSize: 16,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 80,
  },
  errorText: {
    color: "#6b7280",
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    borderBottomWidth: 1,
    borderBottomColor: "#e11d48",
  },
  retryText: {
    color: "#e11d48",
    fontSize: 16,
  },
  categoriesWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  arrowButton: {
    backgroundColor: "#ffffff",
    padding: screenWidth > 640 ? 8 : 6,
    borderRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    position: "absolute",
    zIndex: 10,
  },
  leftArrow: {
    left: screenWidth > 1024 ? 16 : 8,
  },
  rightArrow: {
    right: screenWidth > 1024 ? 16 : 8,
  },
  categoriesContainer: {
    flex: 1,
    overflow: "hidden",
    width: "100%",
  },
  categoriesScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: screenWidth > 1024 ? 40 : screenWidth > 640 ? 24 : 16,
    paddingHorizontal: screenWidth > 640 ? 40 : 16,
  },
  categoryItem: {
    alignItems: "center",
    width: screenWidth > 1024 ? 192 : screenWidth > 640 ? 128 : 96,
    flexShrink: 0,
  },
  categoryButton: {
    alignItems: "center",
    width: "100%",
  },
  categoryImageContainer: {
    backgroundColor: "#fdfaf6",
    width: screenWidth > 1024 ? 192 : screenWidth > 640 ? 128 : 96,
    height: screenWidth > 1024 ? 192 : screenWidth > 640 ? 128 : 96,
    borderRadius: screenWidth > 1024 ? 96 : screenWidth > 640 ? 64 : 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
    marginBottom: screenWidth > 1024 ? 16 : screenWidth > 640 ? 12 : 8,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    borderRadius: screenWidth > 1024 ? 96 : screenWidth > 640 ? 64 : 48,
  },
  categoryTextContainer: {
    alignItems: "center",
  },
  categoryName: {
    fontSize: screenWidth > 1024 ? 18 : screenWidth > 640 ? 14 : 12,
    fontWeight: "500",
    color: "#000000",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 16,
  },
});

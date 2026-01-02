import { Image } from "expo-image";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useHomepageDataContext } from "../../contexts/HomepageDataContext";

const screenWidth = Dimensions.get("window").width;
const VISIBLE_ITEMS = 4; // Show 4 items on screen at once
const HORIZONTAL_PADDING = 16;
const ITEM_GAP = 12;
// Calculate item width to fit exactly 4 items on screen
const ITEM_WIDTH =
  (screenWidth - HORIZONTAL_PADDING * 2 - ITEM_GAP * (VISIBLE_ITEMS - 1)) /
  VISIBLE_ITEMS;
const SCROLL_INTERVAL = ITEM_WIDTH + ITEM_GAP; // Scroll by one item at a time

// Local category images mapping
const categoryImages: Record<string, ImageSourcePropType> = {
  rings: require("../../../assets/images/category/ring.png"),
  // ring: require("../../../assets/images/category/ring.png"),
  earrings: require("../../../assets/images/category/earrings.png"),
  // earring: require("../../../assets/images/category/earrings.png"),
  bracelets: require("../../../assets/images/category/bracelet.png"),
  // bracelet: require("../../../assets/images/category/bracelet.png"),
  bangles: require("../../../assets/images/category/bangles.png"),
  // bangle: require("../../../assets/images/category/bangles.png"),
  chains: require("../../../assets/images/category/chain.png"),
  // chain: require("../../../assets/images/category/chain.png"),
  pendants: require("../../../assets/images/category/pendant.png"),
  // pendant: require("../../../assets/images/category/pendant.png"),
  // necklace: require("../../../assets/images/category/necklace.jpeg"),
  necklaces: require("../../../assets/images/category/necklace.jpeg"),
  "nose-pins": require("../../../assets/images/category/noseRing.jpeg"),
  // anklet: require("../../../assets/images/category/anklet.png"),
  anklets: require("../../../assets/images/category/anklet.png"),
};

// Default fallback image
const defaultCategoryImage = require("../../../assets/images/category/ring.png");

// Get local image for category
const getCategoryLocalImage = (categoryName: string): ImageSourcePropType => {
  const name = categoryName.toLowerCase().trim();
  return categoryImages[name] || defaultCategoryImage;
};

interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

interface InfiniteCategory extends Category {
  uniqueKey: string;
  localImage: ImageSourcePropType;
}

export const CategorySection = memo(() => {
  const flatListRef = useRef<FlatList>(null);
  const currentIndexRef = useRef(0);
  const isJumpingRef = useRef(false);

  // Fetch categories from context
  const { categories, isLoading, error, refetch } = useHomepageDataContext();
  const isError = !!error;

  // Create infinite loop data by tripling the categories
  // [original] -> [original, original, original]
  // Start from the middle set so we can scroll both directions
  const infiniteData: InfiniteCategory[] = React.useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const result: InfiniteCategory[] = [];
    // Triple the data for seamless infinite scroll
    for (let i = 0; i < 3; i++) {
      categories.forEach((cat, idx) => {
        result.push({
          ...cat,
          uniqueKey: `${i}-${cat.id}-${idx}`,
          localImage: getCategoryLocalImage(cat.name),
        });
      });
    }
    return result;
  }, [categories]);

  const originalLength = categories?.length || 0;
  const startOffset = originalLength * SCROLL_INTERVAL; // Start from middle set

  // Initialize scroll position to middle set
  useEffect(() => {
    if (infiniteData.length > 0 && flatListRef.current) {
      // Small delay to ensure FlatList is mounted
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: startOffset,
          animated: false,
        });
        currentIndexRef.current = originalLength;
      }, 100);
    }
  }, [infiniteData.length, startOffset, originalLength]);

  // Auto-slide effect - slide one item at a time infinitely
  useEffect(() => {
    if (!categories || categories.length <= VISIBLE_ITEMS) return;

    const interval = setInterval(() => {
      if (isJumpingRef.current) return;

      const nextIndex = currentIndexRef.current + 1;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * SCROLL_INTERVAL,
        animated: true,
      });
      currentIndexRef.current = nextIndex;

      // Check if we need to jump back to middle set (seamlessly)
      // When we reach the end of the third set, jump to the same position in middle set
      if (nextIndex >= originalLength * 2 + originalLength - VISIBLE_ITEMS) {
        isJumpingRef.current = true;
        setTimeout(() => {
          const jumpToIndex = originalLength + (nextIndex % originalLength);
          flatListRef.current?.scrollToOffset({
            offset: jumpToIndex * SCROLL_INTERVAL,
            animated: false,
          });
          currentIndexRef.current = jumpToIndex;
          isJumpingRef.current = false;
        }, 350); // Wait for animation to complete
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [originalLength, categories?.length]);

  // Handle manual scroll
  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isJumpingRef.current) return;

      const scrollX = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollX / SCROLL_INTERVAL);
      currentIndexRef.current = index;

      // If scrolled to first set, jump to middle set
      if (index < originalLength) {
        isJumpingRef.current = true;
        setTimeout(() => {
          const jumpToIndex = index + originalLength;
          flatListRef.current?.scrollToOffset({
            offset: jumpToIndex * SCROLL_INTERVAL,
            animated: false,
          });
          currentIndexRef.current = jumpToIndex;
          isJumpingRef.current = false;
        }, 50);
      }
      // If scrolled to third set, jump to middle set
      else if (index >= originalLength * 2) {
        isJumpingRef.current = true;
        setTimeout(() => {
          const jumpToIndex = index - originalLength;
          flatListRef.current?.scrollToOffset({
            offset: jumpToIndex * SCROLL_INTERVAL,
            animated: false,
          });
          currentIndexRef.current = jumpToIndex;
          isJumpingRef.current = false;
        }, 50);
      }
    },
    [originalLength]
  );

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/products?category=${categoryId}`);
  };

  // Render individual category item
  const renderItem = useCallback(
    ({ item, index }: { item: InfiniteCategory; index: number }) => (
      <TouchableOpacity
        onPress={() => handleCategoryPress(item.id)}
        style={[
          styles.categoryButton,
          { marginRight: index < infiniteData.length - 1 ? ITEM_GAP : 0 },
        ]}
        activeOpacity={0.8}
      >
        <View style={styles.categoryImageContainer}>
          <Image
            source={item.localImage}
            style={styles.categoryImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>
        <View style={styles.categoryTextContainer}>
          <Text style={styles.categoryName} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [infiniteData.length]
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Everyday Demi fine Jewellery</Text>

        {/* Loading State - only show when no cached data */}
        {isLoading && (!categories || categories.length === 0) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        )}

        {/* Error State - only show when no data */}
        {isError && (!categories || categories.length === 0) && (
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

        {/* Categories Carousel */}
        {categories && categories.length > 0 && (
          <FlatList
            ref={flatListRef}
            data={infiniteData}
            renderItem={renderItem}
            keyExtractor={(item) => item.uniqueKey}
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            decelerationRate={0.9}
            snapToInterval={SCROLL_INTERVAL}
            snapToAlignment="start"
            onMomentumScrollEnd={onScrollEnd}
            scrollEventThrottle={16}
            contentContainerStyle={styles.flatListContent}
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH + ITEM_GAP,
              offset: (ITEM_WIDTH + ITEM_GAP) * index,
              index,
            })}
            initialNumToRender={originalLength * 3}
            maxToRenderPerBatch={originalLength * 3}
            windowSize={5}
          />
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
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: screenWidth > 1024 ? 80 : screenWidth > 640 ? 64 : 48,
    backgroundColor: "#fffbf7",
  },
  contentContainer: {
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: screenWidth > 1024 ? 36 : screenWidth > 640 ? 30 : 24,
    fontWeight: "300",
    color: "#111827",
    textAlign: "center",
    marginBottom: screenWidth > 1024 ? 64 : screenWidth > 640 ? 48 : 32,
    paddingHorizontal: 16,
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
  flatListContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  categoryButton: {
    alignItems: "center",
    width: ITEM_WIDTH,
  },
  categoryImageContainer: {
    backgroundColor: "#fdfaf6",
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: ITEM_WIDTH / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    borderRadius: ITEM_WIDTH / 2,
  },
  categoryTextContainer: {
    alignItems: "center",
    width: ITEM_WIDTH,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: "500",
    color: "#000000",
    textAlign: "center",
    letterSpacing: 0.3,
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

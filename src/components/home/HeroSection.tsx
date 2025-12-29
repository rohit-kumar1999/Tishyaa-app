import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Discover Your",
    highlight: "Perfect Sparkle",
    subtitle:
      "Crafted with precision and designed for elegance. Our artificial jewelry collection brings you the luxury look without the premium price.",
    cta: "Shop Collection",
    href: "/products",
    bg: ["#fdf2f8", "#fce7f3", "#faf5ff"] as const,
    image: "https://via.placeholder.com/400x400/f3f4f6/e11d48?text=Jewelry+1",
  },
  {
    id: "2",
    title: "Unveil the Magic of",
    highlight: "Timeless Elegance",
    subtitle:
      "Elevate your everyday style with designs that speak to your soul. Sparkle more, spend less.",
    cta: "Explore Designs",
    href: "/products",
    bg: ["#fdf4ff", "#fce7f3", "#fdf2f8"] as const,
    image: "https://via.placeholder.com/400x400/f3f4f6/e11d48?text=Jewelry+2",
  },
  {
    id: "3",
    title: "Celebrate Every",
    highlight: "Shining Moment",
    subtitle:
      "Jewelry made to celebrate your story — from casual to festive, find the perfect match.",
    cta: "Start Shopping",
    href: "/products",
    bg: ["#fce7f3", "#fdf2f8", "#f5f3ff"] as const,
    image: "https://via.placeholder.com/400x400/f3f4f6/e11d48?text=Jewelry+3",
  },
];

export const HeroSection = memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * screenWidth,
        animated: true,
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Sparkle bounce animation
  useEffect(() => {
    const sparkleLoop = () => {
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => sparkleLoop());
    };
    sparkleLoop();
  }, [sparkleAnim]);

  // Handle scroll to update current index
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const slideIndex = Math.round(
        event.nativeEvent.contentOffset.x / screenWidth
      );
      if (
        slideIndex !== currentIndex &&
        slideIndex >= 0 &&
        slideIndex < slides.length
      ) {
        setCurrentIndex(slideIndex);
      }
    },
    [currentIndex]
  );

  // Scroll to specific slide
  const scrollToSlide = useCallback((index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * screenWidth,
      animated: true,
    });
  }, []);

  // Render each slide
  const renderSlide = useCallback(
    ({ item }: { item: (typeof slides)[0] }) => (
      <LinearGradient
        colors={item.bg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.slideGradient}
      >
        <View style={styles.slideContent}>
          {/* Text Content */}
          <View style={styles.textSection}>
            {/* Badge */}
            <View style={styles.badge}>
              <Animated.View
                style={[
                  styles.sparkleIcon,
                  {
                    transform: [
                      {
                        translateY: sparkleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -3],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="sparkles" size={14} color="#e11d48" />
              </Animated.View>
              <Text style={styles.badgeText}>New Collection Launched</Text>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.highlight}>{item.highlight}</Text>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>{item.subtitle}</Text>

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push(item.href)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#e11d48", "#ec4899"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>{item.cta}</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Image Section */}
          <View style={styles.imageSection}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        </View>
      </LinearGradient>
    ),
    [sparkleAnim]
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={true}
        decelerationRate={0.9}
        snapToInterval={screenWidth}
        snapToAlignment="center"
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => scrollToSlide(i)}
            style={[
              styles.dot,
              {
                backgroundColor: i === currentIndex ? "#e11d48" : "#fda4af",
                width: i === currentIndex ? 20 : 12,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    height: 450,
  },
  slideGradient: {
    width: screenWidth,
    height: 450,
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 60,
    flexDirection: screenWidth >= 768 ? "row" : "column-reverse",
    alignItems: "center",
    gap: screenWidth >= 768 ? 48 : 24,
  },
  textSection: {
    flex: 1,
    alignItems: screenWidth >= 768 ? "flex-start" : "center",
    paddingHorizontal: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  sparkleIcon: {
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  titleContainer: {
    alignItems: screenWidth >= 768 ? "flex-start" : "center",
    marginBottom: 24,
  },
  title: {
    fontSize: screenWidth >= 768 ? 48 : 28,
    fontWeight: "bold",
    color: "#111827",
    textAlign: screenWidth >= 768 ? "left" : "center",
    lineHeight: screenWidth >= 768 ? 56 : 34,
  },
  highlight: {
    fontSize: screenWidth >= 768 ? 48 : 28,
    fontWeight: "bold",
    color: "#e11d48",
    textAlign: screenWidth >= 768 ? "left" : "center",
    lineHeight: screenWidth >= 768 ? 56 : 34,
  },
  subtitle: {
    fontSize: screenWidth >= 768 ? 18 : 14,
    color: "#4b5563",
    textAlign: screenWidth >= 768 ? "left" : "center",
    marginBottom: 32,
    lineHeight: screenWidth >= 768 ? 28 : 20,
    maxWidth: 500,
  },
  ctaButton: {
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
  imageSection: {
    flex: screenWidth >= 768 ? 1 : 0,
    width: "100%",
    height: screenWidth >= 768 ? 250 : 180,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fda4af",
  },
});

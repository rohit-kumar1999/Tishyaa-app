import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
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

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const HERO_HEIGHT = Math.min(screenHeight * 0.7, 500);

// Import local assets
const necklaceImage = require("../../../assets/images/necklace.jpeg");
const earringsImage = require("../../../assets/images/earrings.jpg");
const chainImage = require("../../../assets/images/chain.jpeg");
const necklaceVideo = require("../../../assets/images/necklace_video.mp4");

interface Slide {
  id: string;
  title: string;
  highlight: string;
  subtitle: string;
  cta: string;
  href: string;
  media: ImageSourcePropType | number;
  isVideo?: boolean;
}

const slides: Slide[] = [
  {
    id: "1",
    title: "Discover Your",
    highlight: "Perfect Sparkle",
    subtitle:
      "Crafted with precision and designed for elegance. Our jewelry collection brings you the luxury look.",
    cta: "Shop Collection",
    href: "/products",
    media: necklaceVideo,
    isVideo: true,
  },
  {
    id: "2",
    title: "Elegant",
    highlight: "Necklaces",
    subtitle:
      "Elevate your everyday style with designs that speak to your soul. Sparkle more, spend less.",
    cta: "Explore Necklaces",
    href: "/products?category=necklaces",
    media: necklaceImage,
  },
  {
    id: "3",
    title: "Stunning",
    highlight: "Earrings",
    subtitle:
      "From subtle studs to statement pieces — find earrings that match your every mood.",
    cta: "Shop Earrings",
    href: "/products?category=earrings",
    media: earringsImage,
  },
  {
    id: "4",
    title: "Timeless",
    highlight: "Chains",
    subtitle:
      "Classic chains crafted to perfection. Layer them or wear solo — the choice is yours.",
    cta: "View Chains",
    href: "/products?category=chains",
    media: chainImage,
  },
];

export const HeroSection = memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const currentIndexRef = useRef(0);
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<Video>(null);

  // Keep ref in sync
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % slides.length;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * screenWidth,
        animated: true,
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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
    ({ item, index }: { item: Slide; index: number }) => (
      <View style={styles.slideContainer}>
        {/* Background Media */}
        {item.isVideo ? (
          <Video
            ref={index === 0 ? videoRef : undefined}
            source={item.media as number}
            style={styles.backgroundMedia}
            resizeMode={ResizeMode.COVER}
            shouldPlay={currentIndex === index}
            isLooping
            isMuted
          />
        ) : (
          <Image
            source={item.media}
            style={styles.backgroundMedia}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        )}

        {/* Dark Overlay for better text visibility */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.3)",
            "rgba(0,0,0,0.1)",
            "rgba(0,0,0,0.4)",
            "rgba(0,0,0,0.7)",
          ]}
          locations={[0, 0.3, 0.6, 1]}
          style={styles.overlay}
        />

        {/* Content */}
        <View style={styles.slideContent}>
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
              colors={["#e11d48", "#be123c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>{item.cta}</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [currentIndex, sparkleAnim]
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
                backgroundColor:
                  i === currentIndex ? "#ffffff" : "rgba(255,255,255,0.5)",
                width: i === currentIndex ? 24 : 8,
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
    height: HERO_HEIGHT,
  },
  slideContainer: {
    width: screenWidth,
    height: HERO_HEIGHT,
    position: "relative",
  },
  backgroundMedia: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  slideContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  sparkleIcon: {
    marginRight: 6,
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: screenWidth > 640 ? 36 : 28,
    fontWeight: "300",
    color: "#ffffff",
    lineHeight: screenWidth > 640 ? 44 : 34,
  },
  highlight: {
    fontSize: screenWidth > 640 ? 42 : 34,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: screenWidth > 640 ? 50 : 40,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 22,
    marginBottom: 20,
    maxWidth: 320,
  },
  ctaButton: {
    alignSelf: "flex-start",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

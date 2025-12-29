import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = screenWidth - 64; // Card width with margins

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "Absolutely love my Tishyaa jewelry! The quality is amazing and I get compliments everywhere I go. The earrings I bought are my new favorites!",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "Ankita Patel",
    location: "Delhi",
    rating: 5,
    text: "The craftsmanship is incredible! These pieces look so premium and the gold plating hasn't faded even after months of wear.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "Sneha Reddy",
    location: "Bangalore",
    rating: 5,
    text: "Fast delivery and beautiful packaging. The necklace I ordered exceeded my expectations. Will definitely shop again!",
    image:
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "4",
    name: "Ritu Singh",
    location: "Chennai",
    rating: 4,
    text: "Great value for money. The designs are trendy and perfect for daily wear. My bracelet is now my go-to accessory!",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "5",
    name: "Meera Joshi",
    location: "Kolkata",
    rating: 5,
    text: "I gifted a Tishyaa ring to my sister and she absolutely loved it! The customer service was also very helpful.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face",
  },
];

export const TestimonialSection = memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % testimonials.length;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * screenWidth,
        animated: true,
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Handle scroll to update current index
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const slideIndex = Math.round(
        event.nativeEvent.contentOffset.x / screenWidth
      );
      if (
        slideIndex !== currentIndex &&
        slideIndex >= 0 &&
        slideIndex < testimonials.length
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

  const renderStars = (rating: number) => {
    return [...Array(rating)].map((_, index) => (
      <Ionicons
        key={index}
        name="star"
        size={screenWidth > 640 ? 16 : 14}
        color="#fbbf24"
      />
    ));
  };

  // Render testimonial card
  const renderTestimonial = useCallback(
    ({ item }: { item: Testimonial }) => (
      <View style={styles.slideContainer}>
        <View style={styles.testimonialCard}>
          <View style={styles.cardContent}>
            {/* Rating Stars */}
            <View style={styles.starsContainer}>
              {renderStars(item.rating)}
            </View>

            {/* Testimonial Text */}
            <Text style={styles.testimonialText}>"{item.text}"</Text>

            {/* Customer Info */}
            <View style={styles.customerInfo}>
              <Image
                source={{ uri: item.image }}
                style={styles.customerImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{item.name}</Text>
                <Text style={styles.customerLocation}>{item.location}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    ),
    []
  );

  return (
    <LinearGradient colors={["#f9fafb", "#fef2f2"]} style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>What Our Customers Say</Text>
          <Text style={styles.sectionSubtitle}>
            Join thousands of happy customers who trust Tishyaa for their
            jewelry needs
          </Text>
        </View>

        {/* Testimonials Carousel */}
        <FlatList
          ref={flatListRef}
          data={testimonials}
          renderItem={renderTestimonial}
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
          contentContainerStyle={styles.flatListContent}
        />

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {testimonials.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    currentIndex === index ? "#e11d48" : "#d1d5db",
                  width: currentIndex === index ? 20 : 12,
                },
              ]}
              onPress={() => scrollToSlide(index)}
              activeOpacity={0.8}
            />
          ))}
        </View>

        {/* Overall Rating */}
        <View style={styles.overallRatingContainer}>
          <View style={styles.overallRatingContent}>
            <View style={styles.overallStars}>{renderStars(5)}</View>
            <View style={styles.ratingDetails}>
              <Text style={styles.ratingScore}>4.8/5</Text>
              <Text style={styles.ratingCount}>from 2,500+ reviews</Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: screenWidth > 1024 ? 80 : screenWidth > 640 ? 64 : 48,
  },
  contentContainer: {
    position: "relative",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: screenWidth > 1024 ? 64 : screenWidth > 640 ? 48 : 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: screenWidth > 1024 ? 36 : screenWidth > 640 ? 30 : 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: screenWidth > 640 ? 16 : 12,
  },
  sectionSubtitle: {
    color: "#6b7280",
    fontSize: screenWidth > 640 ? 16 : 14,
    textAlign: "center",
    maxWidth: 600,
    paddingHorizontal: 16,
  },
  flatListContent: {
    paddingBottom: 16,
  },
  slideContainer: {
    width: screenWidth,
    paddingHorizontal: 32,
  },
  testimonialCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardContent: {
    padding: screenWidth > 640 ? 24 : 16,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: screenWidth > 640 ? 16 : 12,
  },
  testimonialText: {
    color: "#374151",
    fontSize: screenWidth > 640 ? 16 : 14,
    lineHeight: screenWidth > 640 ? 24 : 20,
    marginBottom: screenWidth > 640 ? 24 : 16,
    minHeight: 80,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerImage: {
    width: screenWidth > 640 ? 48 : 40,
    height: screenWidth > 640 ? 48 : 40,
    borderRadius: screenWidth > 640 ? 24 : 20,
    marginRight: 12,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontWeight: "600",
    color: "#111827",
    fontSize: screenWidth > 640 ? 16 : 14,
    marginBottom: 2,
  },
  customerLocation: {
    color: "#6b7280",
    fontSize: screenWidth > 640 ? 14 : 12,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: screenWidth > 640 ? 48 : 32,
    marginTop: 16,
  },
  dot: {
    height: 12,
    borderRadius: 6,
  },
  overallRatingContainer: {
    alignItems: "center",
  },
  overallRatingContent: {
    alignItems: "center",
    gap: screenWidth > 640 ? 12 : 8,
  },
  overallStars: {
    flexDirection: "row",
  },
  ratingDetails: {
    flexDirection: screenWidth > 640 ? "row" : "column",
    alignItems: "center",
    gap: screenWidth > 640 ? 8 : 4,
  },
  ratingScore: {
    fontWeight: "600",
    color: "#6b7280",
    fontSize: screenWidth > 640 ? 16 : 14,
  },
  ratingCount: {
    color: "#6b7280",
    fontSize: screenWidth > 640 ? 14 : 12,
  },
});

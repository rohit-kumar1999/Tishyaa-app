import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

export const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const fadeAnim = new Animated.Value(1);

  const minSwipeDistance = 50;

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      rating: 5,
      text: "Absolutely love my Tishyaa jewelry! The quality is amazing and I get compliments everywhere I go. The earrings I bought are my new favorites!",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Ankita Patel",
      location: "Delhi",
      rating: 5,
      text: "The craftsmanship is incredible! These pieces look so premium and the gold plating hasn't faded even after months of wear.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Sneha Reddy",
      location: "Bangalore",
      rating: 5,
      text: "Fast delivery and beautiful packaging. The necklace I ordered exceeded my expectations. Will definitely shop again!",
      image:
        "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Ritu Singh",
      location: "Chennai",
      rating: 4,
      text: "Great value for money. The designs are trendy and perfect for daily wear. My bracelet is now my go-to accessory!",
      image:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Meera Joshi",
      location: "Kolkata",
      rating: 5,
      text: "I gifted a Tishyaa ring to my sister and she absolutely loved it! The customer service was also very helpful.",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face",
    },
  ];

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
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentIndex(
      currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1
    );
  };

  const goToNext = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentIndex(
      currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    if (index !== currentIndex) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentIndex(index);
    }
  };

  // Auto-rotate carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

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

  const currentTestimonial = testimonials[currentIndex];

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

        {/* Desktop Navigation Arrows - Only show on larger screens */}
        {screenWidth > 1024 && (
          <>
            <TouchableOpacity
              style={[styles.navButton, styles.leftNavButton]}
              onPress={goToPrevious}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={20} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.rightNavButton]}
              onPress={goToNext}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-forward" size={20} color="#374151" />
            </TouchableOpacity>
          </>
        )}

        {/* Testimonial Card */}
        <View
          style={styles.testimonialContainer}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Animated.View
            style={[styles.testimonialCard, { opacity: fadeAnim }]}
          >
            <View style={styles.cardContent}>
              {/* Rating Stars */}
              <View style={styles.starsContainer}>
                {renderStars(currentTestimonial.rating)}
              </View>

              {/* Testimonial Text */}
              <Text style={styles.testimonialText}>
                "{currentTestimonial.text}"
              </Text>

              {/* Customer Info */}
              <View style={styles.customerInfo}>
                <Image
                  source={{ uri: currentTestimonial.image }}
                  style={styles.customerImage}
                  contentFit="cover"
                />
                <View style={styles.customerDetails}>
                  <Text style={styles.customerName}>
                    {currentTestimonial.name}
                  </Text>
                  <Text style={styles.customerLocation}>
                    {currentTestimonial.location}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

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
                  transform: [{ scale: currentIndex === index ? 1.2 : 1 }],
                },
              ]}
              onPress={() => goToSlide(index)}
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
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: screenWidth > 1024 ? 80 : screenWidth > 640 ? 64 : 48,
  },
  contentContainer: {
    paddingHorizontal: 16,
    position: "relative",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: screenWidth > 1024 ? 64 : screenWidth > 640 ? 48 : 32,
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
  navButton: {
    position: "absolute",
    top: "50%",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  leftNavButton: {
    left: screenWidth > 1024 ? 32 : 16,
  },
  rightNavButton: {
    right: screenWidth > 1024 ? 32 : 16,
  },
  testimonialContainer: {
    marginHorizontal: screenWidth > 640 ? 32 : 16,
    marginBottom: screenWidth > 640 ? 32 : 24,
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
    gap: screenWidth > 640 ? 12 : 8,
    marginBottom: screenWidth > 640 ? 48 : 32,
  },
  dot: {
    width: screenWidth > 640 ? 12 : 10,
    height: screenWidth > 640 ? 12 : 10,
    borderRadius: screenWidth > 640 ? 6 : 5,
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

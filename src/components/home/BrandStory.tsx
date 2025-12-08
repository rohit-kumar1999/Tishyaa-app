import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

export const BrandStory = () => {
  const handleLearnMore = () => {
    router.push("/about");
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.gridContainer}>
          {/* Text Content */}
          <View style={styles.textContent}>
            <View style={styles.textSpacing}>
              <View style={styles.headerSection}>
                <View style={styles.storyBadge}>
                  <Ionicons
                    name="heart"
                    size={screenWidth > 640 ? 16 : 12}
                    color="#e11d48"
                  />
                  <Text style={styles.storyBadgeText}>Our Story</Text>
                </View>
                <Text style={styles.mainTitle}>
                  Crafting Beauty That Celebrates Every Woman
                </Text>
                <Text style={styles.description}>
                  At Tishyaa, we believe that every woman deserves to feel
                  beautiful and confident. Our passion for creating exquisite
                  artificial jewelry stems from the desire to make luxury
                  accessible to all. Each piece is thoughtfully designed to
                  capture the essence of timeless elegance while embracing
                  contemporary trends.
                </Text>
              </View>

              <View style={styles.featuresContainer}>
                {/* Premium Quality Feature */}
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons
                      name="sparkles"
                      size={screenWidth > 640 ? 20 : 16}
                      color="#e11d48"
                    />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Premium Quality</Text>
                    <Text style={styles.featureDescription}>
                      High-grade materials with superior craftsmanship
                    </Text>
                  </View>
                </View>

                {/* Customer First Feature */}
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons
                      name="people"
                      size={screenWidth > 640 ? 20 : 16}
                      color="#e11d48"
                    />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Customer First</Text>
                    <Text style={styles.featureDescription}>
                      Dedicated to exceeding your expectations
                    </Text>
                  </View>
                </View>
              </View>

              {/* CTA Button */}
              <View style={styles.ctaContainer}>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handleLearnMore}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#e11d48", "#ec4899"]}
                    style={styles.ctaGradient}
                  >
                    <Text style={styles.ctaText}>Learn More About Us</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Image Grid */}
          <View style={styles.imageGrid}>
            <View style={styles.imageColumn}>
              {/* First column images */}
              <View style={styles.imageSpacing}>
                <View style={styles.squareImageContainer}>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop",
                    }}
                    style={styles.image}
                    contentFit="cover"
                  />
                </View>
                <View style={styles.tallImageContainer}>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=375&fit=crop",
                    }}
                    style={styles.image}
                    contentFit="cover"
                  />
                </View>
              </View>
            </View>

            <View style={[styles.imageColumn, styles.secondColumn]}>
              {/* Second column images with offset */}
              <View style={styles.imageSpacing}>
                <View style={styles.tallImageContainer}>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=375&fit=crop",
                    }}
                    style={styles.image}
                    contentFit="cover"
                  />
                </View>
                <View style={styles.squareImageContainer}>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop",
                    }}
                    style={styles.image}
                    contentFit="cover"
                  />
                </View>
              </View>
            </View>

            {/* Decorative circles */}
            <LinearGradient
              colors={["#fecaca", "#fda4af"]}
              style={[styles.decorativeCircle, styles.topLeftCircle]}
            />
            <LinearGradient
              colors={["#fda4af", "#fecaca"]}
              style={[styles.decorativeCircle, styles.bottomRightCircle]}
            />
          </View>
        </View>
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
  },
  gridContainer: {
    flexDirection: screenWidth > 1024 ? "row" : "column",
    gap: screenWidth > 1024 ? 64 : screenWidth > 640 ? 48 : 32,
    alignItems: "center",
  },
  textContent: {
    flex: screenWidth > 1024 ? 1 : undefined,
    width: screenWidth > 1024 ? undefined : "100%",
  },
  textSpacing: {
    gap: screenWidth > 640 ? 24 : 16,
  },
  headerSection: {
    gap: screenWidth > 640 ? 16 : 12,
  },
  storyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  storyBadgeText: {
    color: "#e11d48",
    fontWeight: "500",
    fontSize: screenWidth > 640 ? 14 : 12,
  },
  mainTitle: {
    fontSize:
      screenWidth > 1280
        ? 36
        : screenWidth > 1024
        ? 30
        : screenWidth > 640
        ? 24
        : 20,
    fontWeight: "700",
    color: "#111827",
    lineHeight:
      screenWidth > 1280
        ? 44
        : screenWidth > 1024
        ? 36
        : screenWidth > 640
        ? 32
        : 28,
  },
  description: {
    color: "#6b7280",
    fontSize: screenWidth > 640 ? 16 : 14,
    lineHeight: screenWidth > 640 ? 24 : 20,
  },
  featuresContainer: {
    gap: screenWidth > 640 ? 24 : 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIconContainer: {
    width: screenWidth > 640 ? 40 : 32,
    height: screenWidth > 640 ? 40 : 32,
    backgroundColor: "#fef2f2",
    borderRadius: screenWidth > 640 ? 8 : 6,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: "600",
    color: "#111827",
    fontSize: screenWidth > 640 ? 16 : 14,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: screenWidth > 640 ? 14 : 12,
    color: "#6b7280",
  },
  ctaContainer: {
    paddingTop: screenWidth > 640 ? 16 : 8,
  },
  ctaButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaGradient: {
    paddingHorizontal: screenWidth > 640 ? 32 : 24,
    paddingVertical: screenWidth > 640 ? 16 : 12,
    borderRadius: 8,
  },
  ctaText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: screenWidth > 640 ? 16 : 14,
  },
  imageGrid: {
    position: "relative",
    flex: screenWidth > 1024 ? 1 : undefined,
    width: screenWidth > 1024 ? undefined : "100%",
    flexDirection: "row",
    gap: screenWidth > 640 ? 16 : 12,
  },
  imageColumn: {
    flex: 1,
  },
  secondColumn: {
    paddingTop: screenWidth > 640 ? 32 : 16,
  },
  imageSpacing: {
    gap: screenWidth > 640 ? 16 : 12,
  },
  squareImageContainer: {
    aspectRatio: 1,
    borderRadius: screenWidth > 640 ? 16 : 12,
    overflow: "hidden",
  },
  tallImageContainer: {
    aspectRatio: 4 / 5,
    borderRadius: screenWidth > 640 ? 16 : 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  decorativeCircle: {
    position: "absolute",
    borderRadius: 1000,
  },
  topLeftCircle: {
    width: screenWidth > 640 ? 96 : 64,
    height: screenWidth > 640 ? 96 : 64,
    top: screenWidth > 640 ? -16 : -8,
    left: screenWidth > 640 ? -16 : -8,
    opacity: 0.6,
  },
  bottomRightCircle: {
    width: screenWidth > 640 ? 128 : 80,
    height: screenWidth > 640 ? 128 : 80,
    bottom: screenWidth > 640 ? -16 : -8,
    right: screenWidth > 640 ? -16 : -8,
    opacity: 0.4,
  },
});

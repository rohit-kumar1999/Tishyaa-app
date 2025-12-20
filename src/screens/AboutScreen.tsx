import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNavigation from "../components/common/BottomNavigation";
import { Footer } from "../components/common/Footer";
import { TopHeader } from "../components/common/TopHeader";

const { width: screenWidth } = Dimensions.get("window");

interface StatItem {
  number: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface ValueItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

interface TeamMember {
  name: string;
  role: string;
  education: string;
  description: string;
  image: string;
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  const stats: StatItem[] = [
    { number: "50K+", label: "Happy Customers", icon: "people" },
    { number: "1000+", label: "Unique Designs", icon: "diamond" },
    { number: "4.9★", label: "Customer Rating", icon: "star" },
    { number: "5+", label: "Years of Excellence", icon: "trophy" },
  ];

  const values: ValueItem[] = [
    {
      icon: "heart",
      title: "Passion for Beauty",
      description:
        "We believe every piece of jewelry should tell a story and bring joy to the wearer.",
    },
    {
      icon: "shield-checkmark",
      title: "Quality Assurance",
      description:
        "Each piece undergoes rigorous quality checks to ensure it meets our high standards.",
    },
    {
      icon: "people",
      title: "Customer First",
      description:
        "Your satisfaction is our priority. We go above and beyond to serve you better.",
    },
    {
      icon: "flag",
      title: "Mission Driven",
      description:
        "Making luxury jewelry accessible to everyone without compromising on quality.",
    },
  ];

  const team: TeamMember[] = [
    {
      name: "Jaruko Toppo",
      role: "CEO & Founder",
      education: "B.Tech (IIT Goa)",
      description:
        "Jaruko leads our vision and strategy, ensuring Tishyaa remains at the forefront of the jewelry industry with innovative designs and customer-centric approach.",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Rohit Kumar",
      role: "CTO & Co-Founder",
      education: "B.Tech (IIT Goa)",
      description:
        "Rohit brings creativity and innovation to our technology platform, ensuring seamless user experience and robust functionality across all touchpoints.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Sankalp Kaiwat",
      role: "Marketing Head",
      education: "Marketing Specialist",
      description:
        "Sankalp oversees our marketing strategies, ensuring our brand message resonates with our audience and drives meaningful customer engagement.",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
  ];

  const storyImages = [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=375&fit=crop",
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=375&fit=crop",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop",
  ];

  return (
    <View style={styles.container}>
      <TopHeader />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={["#fff1f2", "#fce7f3", "#f3e8ff"]}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={14} color="#e11d48" />
              <Text style={styles.badgeText}>About Tishyaa</Text>
            </View>

            <Text style={styles.heroTitle}>
              Crafting Beauty,{"\n"}
              <Text style={styles.heroTitleGradient}>Creating Memories</Text>
            </Text>

            <Text style={styles.heroDescription}>
              At Tishyaa, we believe that beautiful jewelry shouldn't come with
              a premium price tag. Our mission is to create stunning artificial
              jewelry that captures the elegance and sophistication of fine
              jewelry, making it accessible to everyone.
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <LinearGradient
                key={index}
                colors={["#fff", "#fef2f2"]}
                style={styles.statCard}
              >
                <View style={styles.statIconContainer}>
                  <Ionicons name={stat.icon} size={22} color="#e11d48" />
                </View>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Our Story Section */}
        <LinearGradient
          colors={["#f9fafb", "#fff1f2"]}
          style={styles.storySection}
        >
          <View style={styles.storyHeader}>
            <View style={styles.storyBadge}>
              <Ionicons name="heart" size={14} color="#e11d48" />
              <Text style={styles.storyBadgeText}>Our Story</Text>
            </View>
            <Text style={styles.storyTitle}>From Vision to Reality</Text>
          </View>

          <View style={styles.storyContent}>
            <Text style={styles.storyText}>
              Founded in 2019, Tishyaa started as a dream to democratize
              beautiful jewelry. Our founders noticed a gap in the market for
              high-quality artificial jewelry that didn't compromise on design
              or craftsmanship.
            </Text>
            <Text style={styles.storyText}>
              What began as a small online store has now grown into a trusted
              brand serving thousands of customers across India. We take pride
              in our attention to detail, customer service, and commitment to
              making every woman feel special.
            </Text>
            <Text style={styles.storyText}>
              Today, we continue to innovate and expand our collection, always
              keeping our customers' desires and feedback at the heart of
              everything we do.
            </Text>
          </View>

          {/* Story Images Grid */}
          <View style={styles.imageGrid}>
            <View style={styles.imageColumn}>
              <Image
                source={{ uri: storyImages[0] }}
                style={styles.imageSquare}
                resizeMode="cover"
              />
              <Image
                source={{ uri: storyImages[1] }}
                style={styles.imagePortrait}
                resizeMode="cover"
              />
            </View>
            <View style={[styles.imageColumn, styles.imageColumnOffset]}>
              <Image
                source={{ uri: storyImages[2] }}
                style={styles.imagePortrait}
                resizeMode="cover"
              />
              <Image
                source={{ uri: storyImages[3] }}
                style={styles.imageSquare}
                resizeMode="cover"
              />
            </View>
          </View>
        </LinearGradient>

        {/* Our Values Section */}
        <View style={styles.valuesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>Our Values</Text>
            </View>
            <Text style={styles.sectionTitle}>What We Stand For</Text>
            <Text style={styles.sectionSubtitle}>
              The principles that guide everything we do
            </Text>
          </View>

          <View style={styles.valuesGrid}>
            {values.map((value, index) => (
              <View key={index} style={styles.valueCard}>
                <View style={styles.valueIconContainer}>
                  <Ionicons name={value.icon} size={28} color="#e11d48" />
                </View>
                <Text style={styles.valueTitle}>{value.title}</Text>
                <Text style={styles.valueDescription}>{value.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Team Section */}
        <LinearGradient
          colors={["#f9fafb", "#fff1f2"]}
          style={styles.teamSection}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>Our Team</Text>
            </View>
            <Text style={styles.sectionTitle}>Meet Our Team</Text>
            <Text style={styles.sectionSubtitle}>
              The passionate people behind Tishyaa's success
            </Text>
          </View>

          <View style={styles.teamGrid}>
            {team.map((member, index) => (
              <View key={index} style={styles.teamCard}>
                <View style={styles.teamImageContainer}>
                  <Image
                    source={{ uri: member.image }}
                    style={styles.teamImage}
                    resizeMode="cover"
                  />
                  <View style={styles.teamStarBadge}>
                    <Ionicons name="star" size={12} color="#fff" />
                  </View>
                </View>
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamRole}>{member.role}</Text>
                <Text style={styles.teamEducation}>{member.education}</Text>
                <Text style={styles.teamDescription}>{member.description}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Call to Action */}
        <LinearGradient
          colors={["#e11d48", "#ec4899"]}
          style={styles.ctaSection}
        >
          <Text style={styles.ctaTitle}>Ready to Sparkle?</Text>
          <Text style={styles.ctaDescription}>
            Join thousands of satisfied customers and discover your perfect
            piece today. Experience the beauty of Tishyaa jewelry.
          </Text>

          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={styles.ctaPrimaryButton}
              onPress={() => router.push("/products")}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaPrimaryButtonText}>Shop Collection</Text>
              <Ionicons name="sparkles" size={16} color="#e11d48" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ctaSecondaryButton}
              onPress={() => router.push("/contact")}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaSecondaryButtonText}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Footer />
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 36,
  },
  heroTitleGradient: {
    color: "#e11d48",
  },
  heroDescription: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 400,
  },

  // Stats Section
  statsSection: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    width: (screenWidth - 44) / 2,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#fce7f3",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e11d48",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },

  // Story Section
  storySection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  storyHeader: {
    marginBottom: 24,
  },
  storyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  storyBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e11d48",
  },
  storyTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  storyContent: {
    marginBottom: 24,
  },
  storyText: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 24,
    marginBottom: 16,
  },
  imageGrid: {
    flexDirection: "row",
    gap: 12,
  },
  imageColumn: {
    flex: 1,
    gap: 12,
  },
  imageColumnOffset: {
    marginTop: 24,
  },
  imageSquare: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
  },
  imagePortrait: {
    width: "100%",
    aspectRatio: 0.8,
    borderRadius: 16,
  },

  // Values Section
  valuesSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  sectionBadge: {
    backgroundColor: "#fce7f3",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  sectionBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#be185d",
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
  },
  valuesGrid: {
    gap: 16,
  },
  valueCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  valueIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  valueTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  valueDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },

  // Team Section
  teamSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  teamGrid: {
    gap: 20,
  },
  teamCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  teamImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  teamImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "#fce7f3",
  },
  teamStarBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  teamRole: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e11d48",
    marginBottom: 4,
  },
  teamEducation: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 12,
  },
  teamDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },

  // CTA Section
  ctaSection: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  ctaDescription: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 400,
  },
  ctaButtons: {
    gap: 12,
    width: "100%",
    maxWidth: 320,
  },
  ctaPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  ctaPrimaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e11d48",
  },
  ctaSecondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  ctaSecondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

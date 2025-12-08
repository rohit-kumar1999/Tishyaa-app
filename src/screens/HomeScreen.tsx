import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import BottomNavigation from "../components/common/BottomNavigation";
import {
  BrandStory,
  CategorySection,
  FeaturedProducts,
  HeroSection,
  InstagramFeed,
  Newsletter,
  PromoBanner,
  TestimonialSection,
  TrustBadges,
} from "../components/home";
import { HomepageDataProvider } from "../contexts/HomepageDataContext";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  return (
    <HomepageDataProvider>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <HeroSection />
          <CategorySection />
          <FeaturedProducts />
          <PromoBanner />
          <BrandStory />
          <TestimonialSection />
          <InstagramFeed />
          <TrustBadges />
          <Newsletter />
        </ScrollView>

        <BottomNavigation currentRoute="/home" />
      </View>
    </HomepageDataProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flex: 1,
  },
});

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { ProductCard } from '../components/ProductCard';
import { LinearGradient } from 'expo-linear-gradient';

type GiftingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Gifting'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface GiftCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string[];
  suggestions: string[];
  trending?: boolean;
  new?: boolean;
}

interface Occasion {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string[];
  popularGifts: string[];
}

interface FeaturedGift {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  rating: number;
  reviewCount: number;
  giftFor: string;
  occasion: string;
  discount?: number;
}

const relationships: GiftCategory[] = [
  {
    id: 'girlfriend',
    name: 'For Girlfriend',
    description: 'Express your love with romantic and trendy pieces',
    icon: 'heart',
    color: ['#F43F5E', '#EC4899'],
    suggestions: ['Couple Rings', 'Heart Pendants', 'Delicate Earrings'],
    trending: true,
  },
  {
    id: 'wife',
    name: 'For Wife',
    description: 'Celebrate your eternal bond with elegant jewelry',
    icon: 'crown',
    color: ['#8B5CF6', '#EC4899'],
    suggestions: ['Diamond Sets', 'Gold Necklaces', 'Anniversary Bands'],
  },
  {
    id: 'mother',
    name: 'For Mother',
    description: 'Honor her with timeless and classic pieces',
    icon: 'flower',
    color: ['#F59E0B', '#EF4444'],
    suggestions: ['Traditional Sets', 'Gold Bangles', 'Temple Jewelry'],
  },
  {
    id: 'sister',
    name: 'For Sister',
    description: 'Trendy and playful jewelry for your sister',
    icon: 'sparkles',
    color: ['#06B6D4', '#8B5CF6'],
    suggestions: ['Trendy Earrings', 'Charm Bracelets', 'Statement Rings'],
  },
  {
    id: 'friend',
    name: 'For Friend',
    description: 'Friendship jewelry to celebrate your bond',
    icon: 'people',
    color: ['#10B981', '#06B6D4'],
    suggestions: ['Friendship Bracelets', 'Matching Sets', 'Casual Rings'],
  },
];

const occasions: Occasion[] = [
  {
    id: 'birthday',
    title: 'Birthday',
    description: 'Make their special day memorable',
    icon: 'gift',
    color: ['#F59E0B', '#EF4444'],
    popularGifts: ['Birthstone Jewelry', 'Personalized Pendants', 'Gold Coins'],
  },
  {
    id: 'anniversary',
    title: 'Anniversary',
    description: 'Celebrate love and commitment',
    icon: 'heart-circle',
    color: ['#EF4444', '#F43F5E'],
    popularGifts: ['Diamond Rings', 'Couple Sets', 'Eternity Bands'],
  },
  {
    id: 'wedding',
    title: 'Wedding',
    description: 'Perfect for the big day',
    icon: 'flower',
    color: ['#8B5CF6', '#EC4899'],
    popularGifts: ['Bridal Sets', 'Gold Jewelry', 'Traditional Pieces'],
  },
  {
    id: 'festival',
    title: 'Festival',
    description: 'Traditional jewelry for celebrations',
    icon: 'star',
    color: ['#F59E0B', '#10B981'],
    popularGifts: ['Temple Jewelry', 'Gold Sets', 'Festive Collections'],
  },
];

const priceRanges = [
  { id: 'budget', title: 'Budget Friendly', range: 'Under ₹5,000', min: 0, max: 5000 },
  { id: 'mid', title: 'Mid Range', range: '₹5,000 - ₹25,000', min: 5000, max: 25000 },
  { id: 'premium', title: 'Premium', range: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
  { id: 'luxury', title: 'Luxury', range: 'Above ₹50,000', min: 50000, max: 999999 },
];

const giftGuides = [
  {
    id: 'first-time',
    title: 'First Time Buyers Guide',
    description: 'New to jewelry gifting? Start here.',
    icon: 'bulb',
  },
  {
    id: 'couples',
    title: 'Couples Jewelry',
    description: 'Matching sets for you and your partner',
    icon: 'people',
  },
  {
    id: 'personalized',
    title: 'Personalized Gifts',
    description: 'Custom and engraved pieces',
    icon: 'create',
  },
];

export default function GiftingScreen() {
  const navigation = useNavigation<GiftingScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('relationships');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Add refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const navigateToProducts = (filters: any) => {
    navigation.navigate('Products', filters);
  };

  const navigateToProductDetail = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const renderRelationshipCard = ({ item }: { item: GiftCategory }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => navigateToProducts({ giftFor: item.id })}
    >
      <LinearGradient
        colors={item.color}
        style={styles.categoryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.categoryContent}>
          <View style={styles.categoryHeader}>
            <Ionicons name={item.icon as any} size={24} color="white" />
            {item.trending && (
              <View style={styles.trendingBadge}>
                <Text style={styles.trendingText}>Trending</Text>
              </View>
            )}
          </View>
          <Text style={styles.categoryTitle}>{item.name}</Text>
          <Text style={styles.categoryDescription}>{item.description}</Text>
          
          <View style={styles.suggestionsContainer}>
            {item.suggestions.slice(0, 2).map((suggestion, index) => (
              <Text key={index} style={styles.suggestionText}>• {suggestion}</Text>
            ))}
          </View>
          
          <TouchableOpacity style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>Explore</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderOccasionCard = ({ item }: { item: Occasion }) => (
    <TouchableOpacity 
      style={styles.occasionCard}
      onPress={() => navigateToProducts({ occasion: item.id })}
    >
      <LinearGradient
        colors={item.color}
        style={styles.occasionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.occasionContent}>
          <Ionicons name={item.icon as any} size={32} color="white" />
          <Text style={styles.occasionTitle}>{item.title}</Text>
          <Text style={styles.occasionDescription}>{item.description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPriceRangeCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.priceCard}
      onPress={() => navigateToProducts({ minPrice: item.min, maxPrice: item.max })}
    >
      <View style={styles.priceContent}>
        <Ionicons name="pricetag" size={24} color="#C9A961" />
        <Text style={styles.priceTitle}>{item.title}</Text>
        <Text style={styles.priceRange}>{item.range}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderGiftGuideCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.guideCard}>
      <View style={styles.guideContent}>
        <View style={styles.guideIconContainer}>
          <Ionicons name={item.icon as any} size={24} color="#C9A961" />
        </View>
        <Text style={styles.guideTitle}>{item.title}</Text>
        <Text style={styles.guideDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTabButton = (tabId: string, title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tabId && styles.activeTabButton]}
      onPress={() => setSelectedTab(tabId)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={selectedTab === tabId ? '#C9A961' : '#666'} 
      />
      <Text style={[
        styles.tabButtonText,
        selectedTab === tabId && styles.activeTabButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="gift" size={32} color="#C9A961" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Perfect Gifts</Text>
              <Text style={styles.headerSubtitle}>Find the ideal jewelry for every occasion</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {renderTabButton('relationships', 'Relationships', 'people')}
          {renderTabButton('occasions', 'Occasions', 'calendar')}
          {renderTabButton('budget', 'Budget', 'wallet')}
        </View>

        {/* Content based on selected tab */}
        {selectedTab === 'relationships' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Shop by Relationship</Text>
            <Text style={styles.sectionSubtitle}>
              Choose the perfect gift based on your relationship
            </Text>
            <FlatList
              data={relationships}
              renderItem={renderRelationshipCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.cardRow}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {selectedTab === 'occasions' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Shop by Occasion</Text>
            <Text style={styles.sectionSubtitle}>
              Celebrate special moments with perfect jewelry
            </Text>
            <FlatList
              data={occasions}
              renderItem={renderOccasionCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.cardRow}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {selectedTab === 'budget' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Shop by Budget</Text>
            <Text style={styles.sectionSubtitle}>
              Find beautiful jewelry within your price range
            </Text>
            <FlatList
              data={priceRanges}
              renderItem={renderPriceRangeCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.cardRow}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Gift Guides */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Gift Guides</Text>
          <Text style={styles.sectionSubtitle}>
            Expert tips and curated collections
          </Text>
          <FlatList
            data={giftGuides}
            renderItem={renderGiftGuideCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Popular Gift Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Popular Gift Categories</Text>
          <View style={styles.popularCategoriesGrid}>
            {['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Sets', 'Pendants'].map((category) => (
              <TouchableOpacity 
                key={category}
                style={styles.popularCategoryCard}
                onPress={() => navigateToProducts({ category: category.toLowerCase() })}
              >
                <Text style={styles.popularCategoryText}>{category}</Text>
                <Ionicons name="chevron-forward" size={16} color="#C9A961" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaContainer}>
          <LinearGradient
            colors={['#C9A961', '#B8935A']}
            style={styles.ctaGradient}
          >
            <View style={styles.ctaContent}>
              <Ionicons name="headset" size={32} color="white" />
              <Text style={styles.ctaTitle}>Need Help Choosing?</Text>
              <Text style={styles.ctaSubtitle}>
                Our jewelry experts are here to help you find the perfect gift
              </Text>
              <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Get Expert Advice</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTabButton: {
    backgroundColor: '#FEF7E6',
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  activeTabButtonText: {
    color: '#C9A961',
    fontWeight: '600',
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  cardRow: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: CARD_WIDTH,
    height: 200,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryGradient: {
    flex: 1,
    padding: 16,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
  },
  categoryDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  occasionCard: {
    width: CARD_WIDTH,
    height: 120,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  occasionGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  occasionContent: {
    alignItems: 'center',
  },
  occasionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
  occasionDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  priceCard: {
    width: CARD_WIDTH,
    height: 100,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  priceRange: {
    fontSize: 12,
    color: '#C9A961',
    marginTop: 4,
    textAlign: 'center',
  },
  horizontalList: {
    paddingLeft: 16,
  },
  guideCard: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideContent: {
    padding: 16,
  },
  guideIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#FEF7E6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  popularCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  popularCategoryCard: {
    width: (width - 48) / 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  popularCategoryText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  ctaContainer: {
    padding: 16,
    marginTop: 16,
  },
  ctaGradient: {
    borderRadius: 16,
    padding: 24,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  ctaButtonText: {
    color: '#C9A961',
    fontSize: 14,
    fontWeight: '600',
  },
});
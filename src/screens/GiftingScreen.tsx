import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNavigation from "../components/common/BottomNavigation";
import { TopHeader } from "../components/common/TopHeader";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../hooks/useCart";

const { width, height } = Dimensions.get("window");

interface GiftCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string[];
  bgColor: string[];
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
  bgColor: string[];
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
  image: string;
}

const relationships: GiftCategory[] = [
  {
    id: "girlfriend",
    name: "For Girlfriend",
    description: "Express your love with romantic and trendy pieces",
    icon: "heart",
    color: ["#F43F5E", "#EC4899"],
    bgColor: ["#FDF2F8", "#FCE7F3"],
    suggestions: ["Couple Rings", "Heart Pendants", "Delicate Earrings"],
    trending: true,
  },
  {
    id: "wife",
    name: "For Wife",
    description: "Celebrate your eternal bond with elegant jewelry",
    icon: "diamond",
    color: ["#8B5CF6", "#EC4899"],
    bgColor: ["#F3E8FF", "#FCE7F3"],
    suggestions: ["Diamond Sets", "Gold Necklaces", "Anniversary Bands"],
  },
  {
    id: "sister",
    name: "For Sister",
    description: "Show your care with beautiful and modern designs",
    icon: "flower",
    color: ["#EC4899", "#F43F5E"],
    bgColor: ["#FCE7F3", "#FDF2F8"],
    suggestions: ["Trendy Bracelets", "Luxe Earrings", "Charm Necklaces"],
    new: true,
  },
  {
    id: "mother",
    name: "For Mother",
    description: "Honor her with timeless and precious jewelry",
    icon: "leaf",
    color: ["#F59E0B", "#F43F5E"],
    bgColor: ["#FEF3C7", "#FDF2F8"],
    suggestions: ["Pearl Sets", "Classic Rings", "Traditional Necklaces"],
  },
];

const occasions: Occasion[] = [
  {
    id: "birthday",
    title: "Birthday",
    description: "Make their special day memorable",
    icon: "gift",
    color: ["#EC4899", "#F43F5E"],
    bgColor: ["#FCE7F3", "#FDF2F8"],
    popularGifts: [
      "Birthstone Jewelry",
      "Personalized Pieces",
      "Statement Rings",
    ],
  },
  {
    id: "anniversary",
    title: "Anniversary",
    description: "Celebrate your journey together",
    icon: "heart",
    color: ["#F43F5E", "#DC2626"],
    bgColor: ["#FDF2F8", "#FEE2E2"],
    popularGifts: ["Couple Jewelry", "Eternity Rings", "Diamond Sets"],
  },
  {
    id: "rakhi",
    title: "Rakhi",
    description: "Honor the sibling bond",
    icon: "flower",
    color: ["#F97316", "#EC4899"],
    bgColor: ["#FFF7ED", "#FCE7F3"],
    popularGifts: ["Traditional Sets", "Bracelets", "Festive Earrings"],
  },
  {
    id: "engagement",
    title: "Engagement",
    description: "Begin your forever story",
    icon: "sparkles",
    color: ["#8B5CF6", "#EC4899"],
    bgColor: ["#F3E8FF", "#FCE7F3"],
    popularGifts: ["Engagement Rings", "Solitaires", "Bridal Sets"],
  },
];

const featuredGifts: FeaturedGift[] = [
  {
    id: 1,
    name: "Rose Gold Heart Pendant",
    description: "Perfect for expressing love",
    price: 2499,
    originalPrice: 2999,
    category: "necklaces",
    rating: 4.9,
    reviewCount: 156,
    giftFor: "Girlfriend",
    occasion: "Anniversary",
    discount: 17,
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Diamond Stud Earrings",
    description: "Timeless elegance for her",
    price: 3999,
    originalPrice: 4599,
    category: "earrings",
    rating: 4.8,
    reviewCount: 203,
    giftFor: "Wife",
    occasion: "Birthday",
    discount: 13,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Charm Bracelet Set",
    description: "Trendy and meaningful",
    price: 1799,
    category: "bracelets",
    rating: 4.7,
    reviewCount: 89,
    giftFor: "Sister",
    occasion: "Rakhi",
    image:
      "https://images.unsplash.com/photo-1588444645479-c520d04deb0e?w=400&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Pearl Necklace Set",
    description: "Classic beauty for mothers",
    price: 4999,
    originalPrice: 5799,
    category: "necklaces",
    rating: 4.9,
    reviewCount: 124,
    giftFor: "Mother",
    occasion: "Festival",
    discount: 14,
    image:
      "https://images.unsplash.com/photo-1543294001-f7cd5d7fb134?w=400&h=400&fit=crop",
  },
];

export default function GiftingScreen() {
  const insets = useSafeAreaInsets();
  const { addItemToCart, isProcessing } = useCart();
  const { toggleWishlist, isInWishlist, isWishlistProcessing } = useWishlist();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const heartbeatAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce animation for gift icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for sparkles icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Heartbeat animation for heart icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeatAnim, {
          toValue: 1.15,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1.15,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const renderFloatingElements = () => (
    <View style={styles.floatingElements}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.floatingDot,
            {
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4],
              }),
            },
          ]}
        />
      ))}
    </View>
  );

  const renderHeroSection = () => (
    <Animated.View
      style={[
        styles.heroSection,
        {
          paddingTop: insets.top + 20,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.heroIcons}>
        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <Ionicons name="gift" size={32} color="#F43F5E" />
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Ionicons name="sparkles" size={24} color="#EC4899" />
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: heartbeatAnim }] }}>
          <Ionicons name="heart" size={28} color="#F43F5E" />
        </Animated.View>
      </View>

      <Text style={styles.heroTitle}>
        Perfect Gifts for{"\n"}
        <Text style={styles.heroTitleGradient}>Perfect Moments</Text>
      </Text>

      <Text style={styles.heroSubtitle}>
        Discover exquisite jewelry pieces that celebrate love, relationships,
        and special occasions. Make every moment unforgettable.
      </Text>

      <View style={styles.heroBadges}>
        <View style={styles.heroBadge}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.badgeText}>Handpicked Gifts</Text>
        </View>
        <View style={styles.heroBadge}>
          <Ionicons name="heart" size={16} color="#F43F5E" />
          <Text style={styles.badgeText}>Express Love</Text>
        </View>
        <View style={styles.heroBadge}>
          <Ionicons name="gift" size={16} color="#8B5CF6" />
          <Text style={styles.badgeText}>Special Moments</Text>
        </View>
      </View>

      <View style={styles.heroButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/products")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#F43F5E", "#EC4899"]}
            style={styles.gradientButton}
          >
            <Ionicons name="gift" size={24} color="white" />
            <Text style={styles.primaryButtonText}>Shop Gifts</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
          <Ionicons name="bulb" size={20} color="#F43F5E" />
          <Text style={styles.secondaryButtonText}>Gift Guide</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderRelationshipCard = (item: GiftCategory, index: number) => (
    <Animated.View
      key={item.id}
      style={[
        styles.categoryCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/products?filter=${item.id}`)}
      >
        <LinearGradient
          colors={[item.bgColor[0], item.bgColor[1]]}
          style={styles.cardContainer}
        >
          {/* Badge */}
          {(item.trending || item.new) && (
            <View style={styles.cardBadgeContainer}>
              {item.trending && (
                <View style={styles.trendingBadge}>
                  <Text style={styles.badgeTextSmall}>🔥 Hot</Text>
                </View>
              )}
              {item.new && (
                <View style={styles.newBadge}>
                  <Text style={styles.badgeTextSmall}>✨ New</Text>
                </View>
              )}
            </View>
          )}

          {/* Icon */}
          <View style={styles.cardIconContainer}>
            <LinearGradient
              colors={[item.color[0], item.color[1]]}
              style={styles.iconGradient}
            >
              <Ionicons name={item.icon as any} size={28} color="white" />
            </LinearGradient>
          </View>

          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>

          {/* Suggestions */}
          <View style={styles.suggestionsContainer}>
            {item.suggestions.map((suggestion, idx) => (
              <View key={idx} style={styles.suggestionTag}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.cardButton} activeOpacity={0.8}>
            <LinearGradient
              colors={[item.color[0], item.color[1]]}
              style={styles.cardButtonGradient}
            >
              <Text style={styles.cardButtonText}>Shop Now</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderOccasionCard = (item: Occasion, index: number) => (
    <Animated.View
      key={item.id}
      style={[
        styles.occasionCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/products?occasion=${item.id}`)}
      >
        <LinearGradient
          colors={[item.bgColor[0], item.bgColor[1]]}
          style={styles.cardContainer}
        >
          <View style={styles.cardIconContainer}>
            <LinearGradient
              colors={[item.color[0], item.color[1]]}
              style={styles.iconGradient}
            >
              <Ionicons name={item.icon as any} size={28} color="white" />
            </LinearGradient>
          </View>

          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>

          <View style={styles.popularGiftsContainer}>
            <Text style={styles.popularGiftsLabel}>Popular Gifts:</Text>
            <View style={styles.popularGiftsTags}>
              {item.popularGifts.map((gift, idx) => (
                <View key={idx} style={styles.popularGiftTag}>
                  <Text style={styles.popularGiftText}>{gift}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.cardButton} activeOpacity={0.8}>
            <LinearGradient
              colors={[item.color[0], item.color[1]]}
              style={styles.cardButtonGradient}
            >
              <Text style={styles.cardButtonText}>Explore Gifts</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFeaturedGift = (item: FeaturedGift, index: number) => (
    <Animated.View
      key={item.id}
      style={[
        styles.featuredGiftCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.featuredCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/product/${item.id}`)}
        >
          <View style={styles.featuredImageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.featuredImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`gift-${item.id}`}
            />

            {/* Badges */}
            <View style={styles.featuredBadges}>
              {item.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{item.discount}% OFF</Text>
                </View>
              )}
              <View style={styles.giftIdeaBadge}>
                <Text style={styles.giftIdeaText}>Gift Idea</Text>
              </View>
            </View>

            {/* Wishlist Button */}
            <TouchableOpacity
              style={[
                styles.wishlistButton,
                isWishlistProcessing[item.id.toString()] && { opacity: 0.7 },
              ]}
              activeOpacity={0.8}
              disabled={isWishlistProcessing[item.id.toString()]}
              onPress={(e) => {
                e.stopPropagation();
                toggleWishlist({
                  id: item.id.toString(),
                  name: item.name,
                  price: item.price,
                  images: [{ url: item.image }],
                  inStock: true,
                });
              }}
            >
              <View
                style={[
                  styles.wishlistIcon,
                  isInWishlist(item.id.toString()) && styles.wishlistIconActive,
                ]}
              >
                <Ionicons
                  name={
                    isInWishlist(item.id.toString()) ? "heart" : "heart-outline"
                  }
                  size={20}
                  color={
                    isInWishlist(item.id.toString()) ? "#F43F5E" : "#6B7280"
                  }
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.featuredContent}>
            <View style={styles.featuredTagsContainer}>
              <View style={styles.giftForTag}>
                <Text style={styles.giftForText}>{item.giftFor}</Text>
              </View>
              <View style={styles.occasionTag}>
                <Text style={styles.occasionText}>{item.occasion}</Text>
              </View>
            </View>

            <Text style={styles.featuredName}>{item.name}</Text>

            {/* Rating and Price - optimized in one row */}
            <View style={styles.ratingPriceRow}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.reviewText}>({item.reviewCount})</Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
                {item.originalPrice && (
                  <Text style={styles.originalPrice}>
                    ₹{item.originalPrice.toLocaleString()}
                  </Text>
                )}
              </View>
            </View>

            <Text style={styles.featuredDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              isProcessing[item.id.toString()] && { opacity: 0.7 },
            ]}
            activeOpacity={0.8}
            disabled={isProcessing[item.id.toString()]}
            onPress={() => {
              addItemToCart(item.id.toString(), 1, false);
            }}
          >
            <LinearGradient
              colors={["#F43F5E", "#EC4899"]}
              style={styles.addToCartGradient}
            >
              <Ionicons name="bag-add" size={16} color="white" />
              <Text style={styles.addToCartText}>
                {isProcessing[item.id.toString()] ? "Adding..." : "Add to Cart"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.buyNowButton}
            activeOpacity={0.8}
            onPress={() => {
              // Buy now functionality here
              router.push(`/checkout?productId=${item.id}`);
            }}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
            <Ionicons name="flash" size={14} color="#F43F5E" />
          </TouchableOpacity> */}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <TopHeader />
      <LinearGradient
        colors={["#FDF2F8", "#FCE7F3", "#FAE8FF"]}
        style={styles.backgroundGradient}
      >
        {renderFloatingElements()}

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          {renderHeroSection()}

          {/* Gift by Relationship */}
          <View style={styles.section}>
            <LinearGradient
              colors={["rgba(255,255,255,0.5)", "rgba(255,255,255,0.3)"]}
              style={styles.sectionBackground}
            >
              <Text style={styles.sectionTitle}>Gift by Relationship</Text>
              <Text style={styles.sectionSubtitle}>
                Find the perfect jewelry for the special women in your life
              </Text>

              <View style={styles.relationshipGrid}>
                {relationships.map((item, index) =>
                  renderRelationshipCard(item, index)
                )}
              </View>
            </LinearGradient>
          </View>

          {/* Gift by Occasion */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gift by Occasion</Text>
            <Text style={styles.sectionSubtitle}>
              Perfect jewelry for every celebration and milestone
            </Text>

            <View style={styles.occasionGrid}>
              {occasions.map((item, index) => renderOccasionCard(item, index))}
            </View>
          </View>

          {/* Featured Gifts */}
          <View style={styles.section}>
            <LinearGradient
              colors={["rgba(255,255,255,0.5)", "rgba(255,255,255,0.3)"]}
              style={styles.sectionBackground}
            >
              <View style={styles.featuredHeader}>
                <Ionicons name="gift" size={32} color="#F43F5E" />
                <Text style={styles.sectionTitle}>Featured Gifts</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Handpicked jewelry pieces that make perfect gifts
              </Text>

              <View style={styles.featuredGrid}>
                {featuredGifts.map((item, index) =>
                  renderFeaturedGift(item, index)
                )}
              </View>

              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push("/products")}
                activeOpacity={0.8}
              >
                <Text style={styles.viewAllText}>View All Gifts</Text>
                <Ionicons name="arrow-forward" size={20} color="#F43F5E" />
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Gift Guide Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="bulb" size={28} color="#F59E0B" /> Gift Guide
            </Text>
            <Text style={styles.sectionSubtitle}>
              Expert tips to help you choose the perfect jewelry gift
            </Text>

            <View style={styles.giftGuideGrid}>
              {[
                {
                  id: "budget",
                  title: "Budget-Friendly Gifts",
                  description: "Beautiful jewelry that won't break the bank",
                  icon: "cash",
                  tips: [
                    "Silver-plated jewelry under ₹1,000",
                    "Charm bracelets and pendants",
                    "Fashion earrings and rings",
                    "Personalized pieces with engravings",
                  ],
                  color: ["#10B981", "#059669"],
                  bgColor: ["#ECFDF5", "#D1FAE5"],
                },
                {
                  id: "relationship",
                  title: "Relationship Guide",
                  description: "Choose based on your relationship stage",
                  icon: "heart",
                  tips: [
                    "New relationship: Simple, elegant pieces",
                    "Committed: Meaningful, personal jewelry",
                    "Married: Classic, timeless designs",
                    "Family: Traditional and sentimental",
                  ],
                  color: ["#F43F5E", "#EC4899"],
                  bgColor: ["#FDF2F8", "#FCE7F3"],
                },
                {
                  id: "occasions",
                  title: "Occasion-Specific",
                  description: "Perfect pieces for special moments",
                  icon: "calendar",
                  tips: [
                    "Birthday: Birthstone jewelry",
                    "Anniversary: Matching couple sets",
                    "Festivals: Traditional gold pieces",
                    "Graduation: Professional, elegant items",
                  ],
                  color: ["#8B5CF6", "#EC4899"],
                  bgColor: ["#F3E8FF", "#FCE7F3"],
                },
                {
                  id: "personalization",
                  title: "Personal Touch",
                  description: "Make it uniquely theirs",
                  icon: "people",
                  tips: [
                    "Engraved initials or dates",
                    "Birthstone customization",
                    "Custom chain lengths",
                    "Personalized gift packaging",
                  ],
                  color: ["#F59E0B", "#F97316"],
                  bgColor: ["#FEF3C7", "#FFF7ED"],
                },
              ].map((tip, index) => (
                <Animated.View
                  key={tip.id}
                  style={[
                    styles.giftGuideCard,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[tip.bgColor[0], tip.bgColor[1]]}
                    style={styles.giftGuideCardContent}
                  >
                    <View style={styles.giftGuideIconContainer}>
                      <LinearGradient
                        colors={[tip.color[0], tip.color[1]]}
                        style={styles.giftGuideIcon}
                      >
                        <Ionicons
                          name={tip.icon as any}
                          size={32}
                          color="white"
                        />
                      </LinearGradient>
                    </View>

                    <Text style={styles.giftGuideTitle}>{tip.title}</Text>
                    <Text style={styles.giftGuideDescription}>
                      {tip.description}
                    </Text>

                    <View style={styles.giftGuideTips}>
                      {tip.tips.map((tipItem, idx) => (
                        <View key={idx} style={styles.giftGuideTipItem}>
                          <View style={styles.giftGuideBullet} />
                          <Text style={styles.giftGuideTipText}>{tipItem}</Text>
                        </View>
                      ))}
                    </View>
                  </LinearGradient>
                </Animated.View>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  floatingDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#F43F5E",
  },
  heroSection: {
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 1,
  },
  heroIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 44,
  },
  heroTitleGradient: {
    color: "#F43F5E",
  },
  heroSubtitle: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  heroBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  heroButtons: {
    flexDirection: "row",
    gap: 16,
  },
  primaryButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 10,
    gap: 8,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#F43F5E",
    backgroundColor: "transparent",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#F43F5E",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionBackground: {
    padding: 20,
    borderRadius: 20,
    marginHorizontal: -20,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 26,
  },
  relationshipGrid: {
    gap: 16,
  },
  categoryCard: {
    width: "100%",
    marginBottom: 16,
  },
  cardContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  cardBadgeContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
  },
  trendingBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  newBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTextSmall: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  cardIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 28,
  },
  suggestionTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suggestionText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  cardButton: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
  },
  cardButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  cardButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  occasionGrid: {
    gap: 16,
  },
  occasionCard: {
    width: "100%",
    marginBottom: 16,
  },

  popularGiftsContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  popularGiftsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  popularGiftsTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  popularGiftTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularGiftText: {
    fontSize: 11,
    color: "#6B7280",
  },

  featuredHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  featuredScroll: {
    paddingHorizontal: 10,
  },
  featuredGiftCard: {
    width: "100%",
    marginBottom: 24,
  },
  featuredImageContainer: {
    position: "relative",
    height: 280,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredBadges: {
    position: "absolute",
    top: 12,
    left: 12,
    gap: 6,
  },
  discountBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  giftIdeaBadge: {
    backgroundColor: "#F43F5E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  giftIdeaText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  featuredContent: {
    padding: 16,
  },
  featuredTagsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  giftForTag: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  giftForText: {
    color: "#B91C1C",
    fontSize: 10,
    fontWeight: "500",
  },
  occasionTag: {
    backgroundColor: "#FCE7F3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  occasionText: {
    color: "#BE185D",
    fontSize: 10,
    fontWeight: "500",
  },
  featuredName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  reviewText: {
    fontSize: 11,
    color: "#6B7280",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  originalPrice: {
    fontSize: 14,
    color: "#6B7280",
    textDecorationLine: "line-through",
  },
  featuredDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
    marginTop: 8,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#F43F5E",
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
  },
  viewAllText: {
    color: "#F43F5E",
    fontSize: 16,
    fontWeight: "600",
  },
  // Featured Gifts Styles
  featuredGrid: {
    gap: 16,
  },
  featuredCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Gift Guide Styles
  giftGuideGrid: {
    gap: 16,
  },
  giftGuideCard: {
    width: "100%",
  },
  giftGuideCardContent: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  giftGuideIconContainer: {
    marginBottom: 16,
  },
  giftGuideIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  giftGuideTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  giftGuideDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  giftGuideTips: {
    gap: 8,
  },
  giftGuideTipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  giftGuideBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F43F5E",
    marginTop: 6,
    flexShrink: 0,
  },
  giftGuideTipText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    flex: 1,
  },
  // Optimized Featured Gift Styles
  ratingPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  wishlistButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
  },
  wishlistIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  wishlistIconActive: {
    backgroundColor: "#FDF2F8",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  addToCartButton: {
    flex: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  addToCartGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  addToCartText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  buyNowButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#F43F5E",
    borderRadius: 8,
    gap: 4,
  },
  buyNowText: {
    color: "#F43F5E",
    fontSize: 13,
    fontWeight: "600",
  },
});

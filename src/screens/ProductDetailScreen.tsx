import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNavigation from "../components/common/BottomNavigation";
import { TopHeader } from "../components/common/TopHeader";
import { TouchableOpacity } from "../components/common/TouchableOpacity";
import ReviewSection from "../components/products/ReviewSection";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "../hooks/use-toast";
import { useApiQuery } from "../hooks/useApiQuery";
import { useCart } from "../hooks/useCart";
import { Product } from "../services/productService";

const { width: screenWidth } = Dimensions.get("window");

// Delivery calculation (demo - replace with actual API)
const calculateDeliveryDate = (pincode: string) => {
  const deliveryDays: Record<string, number> = {
    "1": 2,
    "4": 2,
    "5": 2,
    "6": 2,
    "7": 2,
    "8": 2,
    "11": 2,
    "12": 2,
    "14": 2,
    "2": 3,
    "3": 3,
    "9": 3,
    "10": 3,
    "13": 3,
    "15": 3,
    "16": 3,
    "17": 3,
    default: 4,
  };

  const firstDigit = pincode.charAt(0);
  const days = deliveryDays[firstDigit] || deliveryDays.default;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + days);

  return {
    days,
    date: deliveryDate.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    isCODAvailable: days <= 3,
    deliveryCharge: days <= 2 ? 0 : days === 3 ? 50 : 100,
  };
};

interface DeliveryInfo {
  days: number;
  date: string;
  isCODAvailable: boolean;
  deliveryCharge: number;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating?: number;
  description?: string;
}

interface Review {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductWithRelated extends Product {
  relatedProducts?: RelatedProduct[];
  reviews?: Review[];
  sizes?: Array<{ name: string }> | string[];
  specifications?: {
    finish?: string;
    weight?: string;
    plating?: string;
    material?: string;
    dimensions?: string;
    careInstructions?: string;
  };
  attributes?: {
    color?: string;
    metal?: string;
    style?: string;
    clarity?: string;
    occasion?: string[];
  };
  metadata?: {
    designer?: string;
    trending?: boolean;
    collection?: string;
    newArrival?: boolean;
  };
  // Legacy flat fields for backward compatibility
  metal?: string;
  clarity?: string;
  material?: string;
  finish?: string;
  weight?: string;
  dimensions?: string;
  careInstructions?: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "reviews"
  >("description");
  const [pincode, setPincode] = useState("");
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showPincodeInput, setShowPincodeInput] = useState(true);
  const [relatedProductImages, setRelatedProductImages] = useState<
    Record<string, number>
  >({});

  // Image carousel ref
  const imageCarouselRef = useRef<FlatList>(null);

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const imageScrollRef = useRef<ScrollView>(null);

  // Hooks
  const { addItemToCart, isProcessing: cartProcessing } = useCart();
  const { toggleWishlist, isInWishlist, isWishlistProcessing } = useWishlist();

  // Fetch product data
  const {
    data: product,
    isLoading,
    error,
  } = useApiQuery<ProductWithRelated>(`/product/${id}`, {
    enabled: !!id,
  });

  // Process product images
  const productImages = product?.images || [];

  // Related products from API
  const relatedProducts = product?.relatedProducts?.slice(0, 4) || [];

  // Reset selected image if out of bounds
  useEffect(() => {
    if (
      productImages.length > 0 &&
      selectedImageIndex >= productImages.length
    ) {
      setSelectedImageIndex(0);
    }
  }, [productImages.length, selectedImageIndex]);

  // Handle image carousel scroll
  const onImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth
    );
    if (
      slideIndex !== selectedImageIndex &&
      slideIndex >= 0 &&
      slideIndex < productImages.length
    ) {
      setSelectedImageIndex(slideIndex);
    }
  };

  // Scroll to specific image
  const scrollToImage = (index: number) => {
    setSelectedImageIndex(index);
    imageCarouselRef.current?.scrollToOffset({
      offset: index * screenWidth,
      animated: true,
    });
  };

  // Pincode validation
  const validatePincode = (code: string) => {
    return /^[1-9][0-9]{5}$/.test(code);
  };

  const handlePincodeCheck = () => {
    if (!pincode.trim()) {
      return;
    }

    if (!validatePincode(pincode)) {
      return;
    }

    setIsCheckingDelivery(true);

    setTimeout(() => {
      const delivery = calculateDeliveryDate(pincode);
      setDeliveryInfo(delivery);
      setIsCheckingDelivery(false);
      setShowPincodeInput(false);
    }, 1000);
  };

  const handleLocateMe = async () => {
    setIsLocating(true);

    try {
      // First check if location services are enabled on the device
      const isLocationEnabled = await Location.hasServicesEnabledAsync();

      if (!isLocationEnabled) {
        toast({
          title: "Location Services Disabled",
          description:
            "Please enable GPS/Location Services in your device settings and try again.",
          variant: "destructive",
        });
        setIsLocating(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        toast({
          title: "Permission Denied",
          description: "Please enable location access to use this feature.",
          variant: "destructive",
        });
        setIsLocating(false);
        return;
      }

      // Get current position - try multiple methods
      let location = null;

      // Method 1: Try last known position first (faster, less battery)
      try {
        location = await Location.getLastKnownPositionAsync({
          maxAge: 300000,
          requiredAccuracy: 1000,
        });
      } catch {
        // Silently continue to next method
      }

      // Method 2: If no last known, get current position
      if (!location) {
        try {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
          });
        } catch {
          // Method 3: Try with Lowest accuracy as last resort
          try {
            location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Lowest,
            });
          } catch {
            // All methods failed
          }
        }
      }

      // If still no location, show user-friendly message
      if (!location) {
        toast({
          title: "Location Unavailable",
          description:
            "Could not detect your location. Please ensure GPS is enabled, go outdoors for better signal, or enter your pincode manually.",
          variant: "destructive",
        });
        setIsLocating(false);
        return;
      }

      const { latitude, longitude } = location.coords;

      // Use reverse geocoding to get actual address/pincode
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let detectedPincode = "";

      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        // Try to get postal code from the address
        // expo-location can return postalCode in different fields
        detectedPincode = address.postalCode || address.isoCountryCode || "";

        // Clean up the pincode - remove spaces and non-numeric chars for India
        detectedPincode = detectedPincode.replace(/\s/g, "").trim();
      }

      // If we got a valid pincode (6 digits for India, or any non-empty value as fallback)
      if (detectedPincode && detectedPincode.length >= 5) {
        // For India, ensure it's numeric and 6 digits
        const cleanPincode = detectedPincode.replace(/\D/g, "").slice(0, 6);

        if (cleanPincode.length === 6) {
          setPincode(cleanPincode);
          const delivery = calculateDeliveryDate(cleanPincode);
          setDeliveryInfo(delivery);
          setShowPincodeInput(false);
          toast({
            title: "Location Detected",
            description: `Pincode: ${cleanPincode}`,
          });
        } else {
          // Got location but couldn't parse pincode
          toast({
            title: "Location detected",
            description: `Got location but couldn't extract pincode. Please enter manually.`,
            variant: "destructive",
          });
        }
      } else {
        // Fallback: Show coordinates info
        toast({
          title: "Could not detect pincode",
          description: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(
            4
          )}. Please enter pincode manually.`,
          variant: "destructive",
        });
      }

      setIsLocating(false);
    } catch (error: any) {
      let errorMessage = "Unable to get your location.";
      const errorCode = error?.code;
      const errorMsg = error?.message?.toLowerCase() || "";

      if (
        errorCode === "ERR_CURRENT_LOCATION_IS_UNAVAILABLE" ||
        errorMsg.includes("unavailable")
      ) {
        errorMessage =
          "Location is currently unavailable. Please check that location services are enabled in your device settings.";
      } else if (errorMsg.includes("timeout")) {
        errorMessage = "Location request timed out. Please try again.";
      } else if (errorMsg.includes("disabled") || errorMsg.includes("denied")) {
        errorMessage =
          "Location services are disabled. Please enable them in settings.";
      } else if (errorMsg.includes("network")) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      toast({
        title: "Location Error",
        description: `${errorMessage} Please enter pincode manually.`,
        variant: "destructive",
      });
      setIsLocating(false);
    }
  };

  // Share functionality
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this beautiful ${product?.category} - ${
          product?.name
        } for ₹${product?.price.toLocaleString("en-IN")}`,
        url: `https://www.tishyaajewels.com/product/${id}`,
        title: product?.name,
      });
    } catch {
      // Share cancelled or failed
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    if (product) {
      addItemToCart(product.id, 1, false);
    }
  };

  // Toggle wishlist
  const handleToggleWishlist = () => {
    if (product) {
      toggleWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images.map((url) => ({ url })),
        inStock: product.inStock,
      });
    }
  };

  // Related product image handling
  const getRelatedProductCurrentImage = (productId: string) => {
    return relatedProductImages[productId] || 0;
  };

  const setRelatedProductCurrentImage = (
    productId: string,
    imageIndex: number
  ) => {
    setRelatedProductImages((prev) => ({
      ...prev,
      [productId]: imageIndex,
    }));
  };

  // Check if out of stock
  const isOutOfStock = product?.active !== undefined && !product?.active;

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F43F5E" />
      </View>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#6B7280" />
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/products")}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.backButtonText}>Back to Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopHeader />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <View style={styles.carouselContainer}>
            <FlatList
              ref={imageCarouselRef}
              data={productImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              decelerationRate="fast"
              snapToInterval={screenWidth}
              snapToAlignment="center"
              disableIntervalMomentum
              onScroll={onImageScroll}
              scrollEventThrottle={16}
              getItemLayout={(_, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              keyExtractor={(_, index) => `product-image-${index}`}
              renderItem={({ item }) => (
                <View style={styles.mainImageContainer}>
                  <Image
                    source={{ uri: item }}
                    style={styles.mainImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            />

            {/* Discount Badge */}
            {product.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discount}% OFF</Text>
              </View>
            )}

            {/* Navigation Arrows */}
            {productImages.length > 1 && (
              <>
                {selectedImageIndex > 0 && (
                  <TouchableOpacity
                    style={[styles.carouselArrow, styles.carouselArrowLeft]}
                    onPress={() => scrollToImage(selectedImageIndex - 1)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
                {selectedImageIndex < productImages.length - 1 && (
                  <TouchableOpacity
                    style={[styles.carouselArrow, styles.carouselArrowRight]}
                    onPress={() => scrollToImage(selectedImageIndex + 1)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Image Indicators */}
          <View style={styles.indicatorContainer}>
            {productImages.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  selectedImageIndex === index && styles.activeIndicator,
                ]}
                onPress={() => scrollToImage(index)}
              />
            ))}
          </View>

          {/* Thumbnails */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {productImages.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.activeThumbnail,
                ]}
                onPress={() => scrollToImage(index)}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>

          {/* Product Name & SKU */}
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.sku}>SKU: TJ-{product.id}</Text>

          {/* Promotional Banner */}
          {product.hasPromotion && product.promotionText && (
            <View style={styles.promotionBanner}>
              <Text style={styles.promotionText}>{product.promotionText}</Text>
            </View>
          )}

          {/* Product Attributes */}
          {(product.sizes || product.metal || product.clarity) && (
            <View style={styles.attributesContainer}>
              {product.sizes &&
                Array.isArray(product.sizes) &&
                product.sizes.length > 0 && (
                  <View style={styles.attributeItem}>
                    <Text style={styles.attributeText}>
                      {typeof product.sizes[0] === "string"
                        ? product.sizes[0]
                        : `Size ${(product.sizes[0] as any).name}`}
                    </Text>
                  </View>
                )}
              {product.metal && (
                <View style={styles.attributeItem}>
                  <Text style={styles.attributeText}>{product.metal}</Text>
                </View>
              )}
              {product.clarity && (
                <View style={styles.clarityAttribute}>
                  <Text style={styles.clarityText}>{product.clarity}</Text>
                </View>
              )}
            </View>
          )}

          {/* Ring Size Help */}
          {product.category.toLowerCase().includes("ring") && (
            <View style={styles.ringSizeHelp}>
              <Text style={styles.ringSizeText}>
                Not sure about your ring size?
              </Text>
              <TouchableOpacity>
                <Text style={styles.learnHowText}>LEARN HOW ▶</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>
              ₹{product.price.toLocaleString("en-IN")}
            </Text>
            {product.originalPrice &&
              Number(product.originalPrice) > product.price && (
                <>
                  <Text style={styles.originalPrice}>
                    ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                  </Text>
                  {product.discount && (
                    <Text style={styles.discountPercent}>
                      ({product.discount}% off)
                    </Text>
                  )}
                </>
              )}
          </View>

          <Text style={styles.taxInfo}>Inclusive of all taxes</Text>

          {/* Stock Status */}
          {!isOutOfStock && (
            <View style={styles.stockStatus}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.inStockText}>In Stock</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                (isOutOfStock || cartProcessing[product.id]) &&
                  styles.disabledButton,
              ]}
              onPress={handleAddToCart}
              disabled={isOutOfStock || cartProcessing[product.id]}
            >
              <LinearGradient
                colors={["#F43F5E", "#EC4899"]}
                style={styles.addToCartGradient}
              >
                {cartProcessing[product.id] ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="bag-add" size={20} color="white" />
                    <Text style={styles.addToCartText}>
                      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.wishlistButton,
                isInWishlist(product.id) && styles.wishlistButtonActive,
              ]}
              onPress={handleToggleWishlist}
              disabled={isWishlistProcessing[product.id]}
            >
              {isWishlistProcessing[product.id] ? (
                <ActivityIndicator size="small" color="#F43F5E" />
              ) : (
                <Ionicons
                  name={isInWishlist(product.id) ? "heart" : "heart-outline"}
                  size={24}
                  color={isInWishlist(product.id) ? "#F43F5E" : "#6B7280"}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Delivery Section */}
          <View style={styles.deliverySection}>
            <Text style={styles.deliverySectionTitle}>
              Delivery, Stores & Trial
            </Text>

            {!deliveryInfo || showPincodeInput ? (
              <View style={styles.pincodeContainer}>
                <View style={styles.pincodeInputWrapper}>
                  <Ionicons name="location" size={18} color="#6B7280" />
                  <TextInput
                    style={styles.pincodeInput}
                    placeholder="Enter 6-digit pincode"
                    value={pincode}
                    onChangeText={(text) =>
                      setPincode(text.replace(/\D/g, "").slice(0, 6))
                    }
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    onPress={handlePincodeCheck}
                    disabled={isCheckingDelivery || !pincode.trim()}
                  >
                    {isCheckingDelivery ? (
                      <ActivityIndicator size="small" color="#8B5CF6" />
                    ) : (
                      <Text style={styles.checkText}>CHECK</Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.pincodeSeperator} />
                  <TouchableOpacity
                    onPress={handleLocateMe}
                    disabled={isLocating}
                    style={[styles.locateButton, { padding: 8, minWidth: 100 }]}
                    activeOpacity={0.6}
                  >
                    {isLocating ? (
                      <ActivityIndicator size="small" color="#8B5CF6" />
                    ) : (
                      <>
                        <Ionicons name="locate" size={16} color="#8B5CF6" />
                        <Text style={styles.locateText}>Locate Me</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.deliveryInfoContainer}>
                <View style={styles.pincodeDisplay}>
                  <View style={styles.pincodeRow}>
                    <Ionicons name="location" size={16} color="#10B981" />
                    <Text style={styles.pincodeLabel}>Pincode: {pincode}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowPincodeInput(true)}>
                    <Text style={styles.changeText}>CHANGE</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.deliveryDetails}>
                  <View style={styles.deliveryRow}>
                    <Ionicons name="cube" size={16} color="#10B981" />
                    <Text style={styles.deliveryDateText}>
                      Expected Delivery: {deliveryInfo.date}
                    </Text>
                  </View>
                  <View style={styles.deliveryTips}>
                    <Text style={styles.deliveryTip}>
                      • Delivery in {deliveryInfo.days} business days
                    </Text>
                    {deliveryInfo.deliveryCharge === 0 ? (
                      <Text style={styles.deliveryTip}>
                        • Free delivery on this order
                      </Text>
                    ) : (
                      <Text style={styles.deliveryTip}>
                        • Delivery charges: ₹{deliveryInfo.deliveryCharge}
                      </Text>
                    )}
                    {deliveryInfo.isCODAvailable && (
                      <Text style={styles.deliveryTip}>
                        • Cash on Delivery available
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Tabs Section */}
        <View style={styles.tabsSection}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "description" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("description")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "description" && styles.activeTabText,
                ]}
              >
                Description
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "specs" && styles.activeTab]}
              onPress={() => setActiveTab("specs")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "specs" && styles.activeTabText,
                ]}
              >
                Specifications
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
              onPress={() => setActiveTab("reviews")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "reviews" && styles.activeTabText,
                ]}
              >
                Reviews
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {activeTab === "description" && (
              <View>
                <Text style={styles.tabSectionTitle}>Product Description</Text>
                <Text style={styles.descriptionText}>
                  {product.description}
                </Text>
              </View>
            )}

            {activeTab === "specs" && (
              <View>
                {/* Product Specifications */}
                <Text style={styles.tabSectionTitle}>Specifications</Text>
                <View style={styles.specsList}>
                  {(product.specifications?.material || product.material) && (
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Material:</Text>
                      <Text style={styles.specValue}>
                        {product.specifications?.material || product.material}
                      </Text>
                    </View>
                  )}
                  {(product.specifications?.finish || product.finish) && (
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Finish:</Text>
                      <Text style={styles.specValue}>
                        {product.specifications?.finish || product.finish}
                      </Text>
                    </View>
                  )}
                  {product.specifications?.plating && (
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Plating:</Text>
                      <Text style={styles.specValue}>
                        {product.specifications.plating}
                      </Text>
                    </View>
                  )}
                  {(product.specifications?.weight || product.weight) && (
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Weight:</Text>
                      <Text style={styles.specValue}>
                        {product.specifications?.weight || product.weight}
                      </Text>
                    </View>
                  )}
                  {(product.specifications?.dimensions ||
                    product.dimensions) && (
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Dimensions:</Text>
                      <Text style={styles.specValue}>
                        {product.specifications?.dimensions ||
                          product.dimensions}
                      </Text>
                    </View>
                  )}
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>SKU:</Text>
                    <Text style={styles.specValue}>
                      TJ-{product.id?.slice(0, 8)}
                    </Text>
                  </View>
                </View>

                {/* Product Attributes */}
                {product.attributes && (
                  <>
                    <Text style={[styles.tabSectionTitle, { marginTop: 20 }]}>
                      Attributes
                    </Text>
                    <View style={styles.specsList}>
                      {product.attributes.color && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>Color:</Text>
                          <Text style={styles.specValue}>
                            {product.attributes.color}
                          </Text>
                        </View>
                      )}
                      {(product.attributes.metal || product.metal) && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>Metal:</Text>
                          <Text style={styles.specValue}>
                            {product.attributes.metal || product.metal}
                          </Text>
                        </View>
                      )}
                      {product.attributes.style && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>Style:</Text>
                          <Text style={styles.specValue}>
                            {product.attributes.style}
                          </Text>
                        </View>
                      )}
                      {(product.attributes.clarity || product.clarity) && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>Clarity:</Text>
                          <Text style={styles.specValue}>
                            {product.attributes.clarity || product.clarity}
                          </Text>
                        </View>
                      )}
                      {product.attributes.occasion &&
                        product.attributes.occasion.length > 0 && (
                          <View style={styles.specItem}>
                            <Text style={styles.specLabel}>Occasion:</Text>
                            <Text style={styles.specValue}>
                              {product.attributes.occasion.join(", ")}
                            </Text>
                          </View>
                        )}
                    </View>
                  </>
                )}

                {/* Product Metadata */}
                {product.metadata && (
                  <>
                    <Text style={[styles.tabSectionTitle, { marginTop: 20 }]}>
                      Additional Info
                    </Text>
                    <View style={styles.specsList}>
                      {product.metadata.collection && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>Collection:</Text>
                          <Text style={styles.specValue}>
                            {product.metadata.collection}
                          </Text>
                        </View>
                      )}
                      {product.metadata.designer && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>Designer:</Text>
                          <Text style={styles.specValue}>
                            {product.metadata.designer}
                          </Text>
                        </View>
                      )}
                      {product.metadata.newArrival && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>New Arrival:</Text>
                          <View style={styles.badgeSmall}>
                            <Text style={styles.badgeSmallText}>Yes</Text>
                          </View>
                        </View>
                      )}
                      {product.metadata.trending && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>Trending:</Text>
                          <View style={styles.badgeSmall}>
                            <Text style={styles.badgeSmallText}>Yes</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </>
                )}

                {/* Care Instructions */}
                {(product.specifications?.careInstructions ||
                  product.careInstructions) && (
                  <>
                    <Text style={[styles.tabSectionTitle, { marginTop: 20 }]}>
                      Care Instructions
                    </Text>
                    <View style={styles.careContainer}>
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color="#9333EA"
                      />
                      <Text style={styles.careText}>
                        {product.specifications?.careInstructions ||
                          product.careInstructions}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {activeTab === "reviews" && (
              <ReviewSection
                productId={product.id}
                productName={product.name}
              />
            )}
          </View>
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Match with your item</Text>
            <View style={styles.relatedGrid}>
              {relatedProducts.map((rp) => {
                const rpImages = rp.images || [];
                const currentImageIndex = getRelatedProductCurrentImage(rp.id);

                return (
                  <TouchableOpacity
                    key={rp.id}
                    style={styles.relatedCard}
                    onPress={() => router.push(`/product/${rp.id}`)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.relatedImageContainer}>
                      <Image
                        source={{
                          uri: rpImages[currentImageIndex] || rpImages[0],
                        }}
                        style={styles.relatedImage}
                        resizeMode="cover"
                      />

                      {/* Discount Badge */}
                      {rp.originalPrice && rp.originalPrice > rp.price && (
                        <View style={styles.relatedDiscountBadge}>
                          <Text style={styles.relatedDiscountText}>
                            {Math.round(
                              ((rp.originalPrice - rp.price) /
                                rp.originalPrice) *
                                100
                            )}
                            % OFF
                          </Text>
                        </View>
                      )}

                      {/* Image Indicators */}
                      {rpImages.length > 1 && (
                        <View style={styles.relatedIndicators}>
                          {rpImages.map((_, idx) => (
                            <TouchableOpacity
                              key={idx}
                              onPress={(e) => {
                                e.stopPropagation();
                                setRelatedProductCurrentImage(rp.id, idx);
                              }}
                              style={[
                                styles.relatedIndicator,
                                idx === currentImageIndex &&
                                  styles.relatedActiveIndicator,
                              ]}
                            />
                          ))}
                        </View>
                      )}

                      {/* Wishlist Button */}
                      <TouchableOpacity
                        style={styles.relatedWishlistButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleWishlist({
                            id: rp.id,
                            name: rp.name,
                            price: rp.price,
                            images: rp.images.map((url) => ({ url })),
                            inStock: true,
                          });
                        }}
                      >
                        <Ionicons
                          name={isInWishlist(rp.id) ? "heart" : "heart-outline"}
                          size={16}
                          color={isInWishlist(rp.id) ? "#F43F5E" : "#6B7280"}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.relatedContent}>
                      {/* Rating Badge - Top Right */}
                      {rp.rating && (
                        <View style={styles.relatedRatingBadge}>
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text style={styles.relatedRatingText}>
                            {rp.rating}
                          </Text>
                        </View>
                      )}
                      <View style={styles.relatedCategoryBadge}>
                        <Text style={styles.relatedCategoryText}>
                          {rp.category}
                        </Text>
                      </View>
                      <Text style={styles.relatedName} numberOfLines={2}>
                        {rp.name}
                      </Text>
                      {rp.description && (
                        <Text
                          style={styles.relatedDescription}
                          numberOfLines={2}
                        >
                          {rp.description}
                        </Text>
                      )}
                      <View style={styles.relatedPriceRow}>
                        <View>
                          <Text style={styles.relatedPrice}>
                            ₹{rp.price.toLocaleString("en-IN")}
                          </Text>
                          {rp.originalPrice && rp.originalPrice > rp.price && (
                            <View style={styles.relatedPriceSave}>
                              <Text style={styles.relatedOriginalPrice}>
                                ₹{rp.originalPrice.toLocaleString("en-IN")}
                              </Text>
                              <Text style={styles.relatedSaveText}>
                                Save ₹
                                {(rp.originalPrice - rp.price).toLocaleString(
                                  "en-IN"
                                )}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={styles.relatedFooter}>
                        <Text style={styles.freeDeliveryText}>
                          Free Delivery
                        </Text>
                      </View>

                      {/* Add to Cart Button */}
                      <TouchableOpacity
                        style={[
                          styles.relatedAddToCartButton,
                          cartProcessing[rp.id] && { opacity: 0.7 },
                        ]}
                        activeOpacity={0.8}
                        disabled={cartProcessing[rp.id]}
                        onPress={(e) => {
                          e.stopPropagation();
                          addItemToCart(rp.id, 1, false);
                        }}
                      >
                        <LinearGradient
                          colors={["#F43F5E", "#EC4899"]}
                          style={styles.relatedAddToCartGradient}
                        >
                          {cartProcessing[rp.id] ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <>
                              <Ionicons
                                name="bag-add"
                                size={14}
                                color="white"
                              />
                              <Text style={styles.relatedAddToCartText}>
                                Add to Cart
                              </Text>
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() =>
                router.push(`/products?category=${product.category}`)
              }
            >
              <Text style={styles.viewMoreText}>
                View More {product.category} Products
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F43F5E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Image Gallery
  imageGallery: {
    backgroundColor: "#F9FAFB",
  },
  carouselContainer: {
    width: screenWidth,
    height: screenWidth,
    position: "relative",
  },
  mainImageContainer: {
    width: screenWidth,
    height: screenWidth,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  carouselArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  carouselArrowLeft: {
    left: 12,
  },
  carouselArrowRight: {
    right: 12,
  },
  discountBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  discountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  activeIndicator: {
    backgroundColor: "#F43F5E",
    width: 24,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
    marginRight: 12,
  },
  activeThumbnail: {
    borderColor: "#F43F5E",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },

  // Product Info
  productInfo: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "capitalize",
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  sku: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 16,
  },
  promotionBanner: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  promotionText: {
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "500",
  },
  attributesContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  attributeItem: {
    flex: 1,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    alignItems: "center",
  },
  attributeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  clarityAttribute: {
    flex: 1,
    padding: 12,
    backgroundColor: "#FBBF24",
    alignItems: "center",
  },
  clarityText: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
  },
  ringSizeHelp: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  ringSizeText: {
    fontSize: 14,
    color: "#7C3AED",
  },
  learnHowText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C3AED",
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
  },
  originalPrice: {
    fontSize: 16,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    marginLeft: 10,
  },
  discountPercent: {
    fontSize: 14,
    color: "#EF4444",
    marginLeft: 6,
  },
  taxInfo: {
    fontSize: 13,
    color: "#10B981",
    marginBottom: 8,
  },
  stockStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  inStockText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  addToCartButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  disabledButton: {
    opacity: 0.6,
  },
  addToCartGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  addToCartText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  wishlistButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  wishlistButtonActive: {
    backgroundColor: "#FDF2F8",
    borderColor: "#F43F5E",
  },
  shareButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  // Delivery Section
  deliverySection: {
    marginTop: 8,
  },
  deliverySectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  pincodeContainer: {
    marginBottom: 8,
  },
  pincodeInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  pincodeInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
  },
  checkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  pincodeSeperator: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E7EB",
  },
  locateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  deliveryInfoContainer: {
    gap: 12,
  },
  pincodeDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  pincodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pincodeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  deliveryDetails: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 10,
    padding: 16,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  deliveryDateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#047857",
  },
  deliveryTips: {
    gap: 4,
  },
  deliveryTip: {
    fontSize: 12,
    color: "#059669",
  },

  // Tabs Section
  tabsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  tabsHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#1F2937",
    fontWeight: "600",
  },
  tabContent: {
    minHeight: 150,
  },
  tabSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 24,
  },
  specsList: {
    gap: 12,
  },
  specItem: {
    flexDirection: "row",
  },
  specLabel: {
    fontSize: 14,
    color: "#6B7280",
    width: 100,
  },
  specValue: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
  },
  careContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FAF5FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  careText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    flex: 1,
  },
  badgeSmall: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSmallText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
  },
  ratingOverview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  ratingBig: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingBigText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  ratingCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  writeReviewButton: {
    borderWidth: 1,
    borderColor: "#8B5CF6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  writeReviewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  noReviewsContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  noReviewsIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noReviewsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  noReviewsSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  noReviewsStars: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  noReviewsHint: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
  },

  // Related Products
  relatedSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  relatedTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 20,
  },
  relatedGrid: {
    gap: 16,
  },
  relatedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    marginBottom: 16,
  },
  relatedImageContainer: {
    height: 200,
    position: "relative",
  },
  relatedImage: {
    width: "100%",
    height: "100%",
  },
  relatedDiscountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  relatedDiscountText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  relatedIndicators: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  relatedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  relatedActiveIndicator: {
    backgroundColor: "white",
    transform: [{ scale: 1.3 }],
  },
  relatedWishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 8,
  },
  relatedContent: {
    padding: 12,
  },
  relatedCategoryBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedCategoryText: {
    fontSize: 10,
    color: "#6B7280",
    textTransform: "capitalize",
  },
  relatedName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 20,
  },
  relatedDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 8,
    lineHeight: 16,
  },
  relatedPriceRow: {
    marginBottom: 8,
  },
  relatedPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  relatedPriceSave: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  relatedOriginalPrice: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  relatedSaveText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  relatedFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  freeDeliveryText: {
    fontSize: 11,
    color: "#6B7280",
  },
  relatedRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  relatedRatingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  relatedRatingText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
  },
  relatedAddToCartButton: {
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
  },
  relatedAddToCartGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  relatedAddToCartText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  viewMoreButton: {
    borderWidth: 1,
    borderColor: "#8B5CF6",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 16,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B5CF6",
  },
});

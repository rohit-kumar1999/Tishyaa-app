import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import BottomNavigation from "../components/common/BottomNavigation";
import { TopHeader } from "../components/common/TopHeader";
import { TouchableOpacity } from "../components/common/TouchableOpacity";
import { useApiCart } from "../contexts/ApiCartContext";
import { usePayment } from "../hooks/usePayment";
import {
  AddressInput,
  Address as AddressType,
  useCreateAddress,
  useGetAddresses,
} from "../services/addressService";
import { PaymentRequest } from "../services/paymentService";

const fetchCoupons = async (token: string, userId: string) => {
  try {
    const response = await fetch("https://www.tishyaajewels.com/api/coupon", {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-user-id": userId,
        Accept: "application/json, text/plain, */*",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch coupons");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Use Address interface from addressService with additional optional fields
type Address = AddressType & {
  userId?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

interface Coupon {
  id: string;
  code: string;
  discountAmount: number;
  minCartValue: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CheckoutScreen() {
  const { cartItems, isInitialLoading } = useApiCart();
  const { getToken } = useAuth();
  const { user } = useUser();

  // Payment hook
  const { processPayment, isProcessing, paymentStep } = usePayment();

  // Address service hooks
  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses,
  } = useGetAddresses();
  const createAddressMutation = useCreateAddress();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<{
    type: "idle" | "processing" | "success" | "failed" | "cancelled";
    message: string;
    orderId?: string;
  }>({
    type: "idle",
    message: "",
  });

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    type: "Home",
  });
  const [phoneError, setPhoneError] = useState("");

  // Phone number validation function
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, "");

    // Check if it's a valid Indian mobile number (10 digits starting with 6-9)
    const indianMobileRegex = /^[6-9]\d{9}$/;

    if (!digitsOnly) {
      setPhoneError("Phone number is required");
      return false;
    }

    if (digitsOnly.length !== 10) {
      setPhoneError("Phone number must be 10 digits");
      return false;
    }

    if (!indianMobileRegex.test(digitsOnly)) {
      setPhoneError("Please enter a valid Indian mobile number");
      return false;
    }

    setPhoneError("");
    return true;
  };

  // Set addresses from the hook data
  useEffect(() => {
    if (addressesData) {
      setAddresses(addressesData);

      // Set default address
      const defaultAddress =
        addressesData.find((addr: Address) => addr.isDefault) ||
        addressesData[0];
      setSelectedAddress(defaultAddress || null);
    }
  }, [addressesData]);

  // Load coupons when component mounts
  useEffect(() => {
    const loadCoupons = async () => {
      if (!user?.id) return;

      try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token");

        setIsLoadingCoupons(true);
        const couponsData = await fetchCoupons(token, user.id);
        setCoupons(couponsData.filter((coupon: Coupon) => coupon.active));
      } catch {
        Alert.alert("Error", "Failed to load coupons");
      } finally {
        setIsLoadingCoupons(false);
      }
    };

    loadCoupons();
  }, [user?.id]);

  // Calculate totals
  const subtotal =
    cartItems?.reduce((sum, item) => {
      const productPrice = (item as any).productPrice || 0;
      const productDiscount = (item as any).productDiscount || 0;
      const finalPrice = productPrice - productDiscount;
      return sum + finalPrice * item.quantity;
    }, 0) || 0;

  const couponDiscount = selectedCoupon ? selectedCoupon.discountAmount : 0;
  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
  const shippingCharges = subtotal >= 499 ? 0 : 30;
  const total = subtotalAfterCoupon + shippingCharges;

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setShowAllAddresses(false);
  };

  const handleAddNewAddress = async () => {
    // Validate address fields
    if (
      !newAddress.name ||
      !newAddress.phone ||
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zipCode
    ) {
      Alert.alert("Error", "Please fill all address fields");
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(newAddress.phone)) {
      Alert.alert("Error", phoneError || "Please enter a valid phone number");
      return;
    }

    try {
      // Create address using the service
      const addressInput: AddressInput = {
        name: newAddress.name,
        phone: newAddress.phone,
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        zipCode: newAddress.zipCode,
        type: newAddress.type,
        country: "India",
        isDefault: false,
      };

      const createdAddress = await createAddressMutation.mutate(addressInput);

      // Select the newly created address
      setSelectedAddress(createdAddress);
      setShowAddressModal(false);

      // Reset form
      setNewAddress({
        name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        type: "Home",
      });

      // Refetch addresses to get the updated list
      refetchAddresses();
    } catch {
      Alert.alert("Error", "Failed to create address. Please try again.");
    }
  };

  const handleApplyCoupon = (coupon: Coupon) => {
    if (subtotal < coupon.minCartValue) {
      Alert.alert(
        "Invalid Coupon",
        `Minimum cart value should be ₹${coupon.minCartValue}`
      );
      return;
    }

    setSelectedCoupon(coupon);
    setCouponCode(coupon.code);
    setShowCouponModal(false);
    Alert.alert(
      "Coupon Applied",
      `₹${coupon.discountAmount} discount applied!`
    );
  };

  // Generate coupon description
  const getCouponDescription = (coupon: Coupon) => {
    return `Get ₹${coupon.discountAmount} off on orders above ₹${coupon.minCartValue}`;
  };

  const handleRemoveCoupon = () => {
    setSelectedCoupon(null);
    setCouponCode("");
  };

  const handlePlaceOrder = async () => {
    // Validate address
    if (!selectedAddress) {
      Alert.alert(
        "Address Required",
        "Please select or add a delivery address."
      );
      return;
    }

    // Validate user
    if (!user?.id) {
      Alert.alert("Authentication Required", "Please sign in to continue.");
      return;
    }

    setPaymentStatus({
      type: "processing",
      message: "Initializing payment...",
    });

    try {
      // Prepare payment data
      const paymentData: PaymentRequest = {
        userId: user.id,
        cartIds: (cartItems || []).map((item) => item.id),
        addressId: selectedAddress.id.toString(),
        netValue: total,
        amount: total,
        currency: "INR",
        subtotal: subtotal,
        shippingCharges: shippingCharges,
        couponDiscount: couponDiscount,
        couponCode: selectedCoupon?.code || null,
        cartItems: (cartItems || []).map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price:
            (item as any).productPrice - ((item as any).productDiscount || 0),
        })),
        shippingAddress: {
          name: selectedAddress.name,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pinCode: selectedAddress.zipCode,
          zipCode: selectedAddress.zipCode,
          country: "India",
          phone: selectedAddress.phone,
        },
        paymentMethod: "razorpay",
      };

      // Process payment
      const result = await processPayment(paymentData);
      if (result.success) {
        setPaymentStatus({
          type: "success",
          message: "Payment successful!",
          orderId: result.orderId,
        });

        setTimeout(() => {
          if (result.orderId) {
            router.push({
              pathname: "/order-confirmation",
              params: { orderId: result.orderId },
            });
          } else {
            router.push("/order-confirmation");
          }
        }, 1500);
      } else if (result.cancelled) {
        setPaymentStatus({
          type: "cancelled",
          message: "Payment was cancelled. Your order is saved.",
          orderId: result.orderId,
        });
      } else {
        setPaymentStatus({
          type: "failed",
          message: "Payment failed. Please try again.",
        });
      }
    } catch (error) {
      setPaymentStatus({
        type: "failed",
        message:
          error instanceof Error
            ? error.message
            : "Payment failed. Please try again.",
      });
    }
  };

  const handleRetryPayment = () => {
    setPaymentStatus({ type: "idle", message: "" });
  };

  if (isInitialLoading || (isLoadingAddresses && addresses.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  const renderOrderSummary = () => (
    <View style={styles.orderSummaryContainer}>
      {cartItems?.map((item) => {
        const productName = (item as any).productName || "Unknown Product";
        const productPrice = (item as any).productPrice || 0;
        const productDiscount = (item as any).productDiscount || 0;
        const discountedPrice = productPrice - productDiscount;
        const totalItemPrice = discountedPrice * item.quantity;
        const productImages = (item as any).productImages;
        const imageUrl =
          productImages && productImages.length > 0 ? productImages[0] : null;

        const category = (item as any).category || "";
        const discountPercent =
          productDiscount > 0
            ? Math.round((productDiscount / productPrice) * 100)
            : 0;

        return (
          <View key={item.productId} style={styles.orderItem}>
            <View style={styles.productImageContainer}>
              {discountPercent > 0 && (
                <View style={styles.discountBadgeCorner}>
                  <Text style={styles.discountCornerText}>
                    {discountPercent}% off
                  </Text>
                </View>
              )}
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.productImage, styles.placeholderImage]}>
                  <Ionicons name="image-outline" size={24} color="#ccc" />
                </View>
              )}
            </View>

            <View style={styles.productDetails}>
              {/* Top section */}
              <View style={styles.topSection}>
                <Text style={styles.productName} numberOfLines={2}>
                  {productName}
                </Text>
                {category && (
                  <Text style={styles.productCategory}>{category}</Text>
                )}
              </View>

              {/* Bottom section with border separator */}
              <View style={styles.bottomSection}>
                <View style={styles.priceRow}>
                  <View style={styles.priceCalculationLeft}>
                    <Text style={styles.priceText}>
                      ₹{discountedPrice.toLocaleString()}
                    </Text>
                    <Text style={styles.multiplyText}>×</Text>
                    <Text style={styles.productQuantityText}>
                      {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.finalPriceText}>
                    ₹{totalItemPrice.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}

      {/* Coupon Section */}
      <View style={styles.couponSection}>
        <View style={styles.couponInputContainer}>
          <TextInput
            style={styles.couponInput}
            placeholder="Enter coupon code"
            value={couponCode}
            onChangeText={setCouponCode}
            editable={!selectedCoupon}
          />
          {selectedCoupon ? (
            <TouchableOpacity
              onPress={handleRemoveCoupon}
              style={styles.removeCouponBtn}
            >
              <Text style={styles.removeCouponText}>Remove</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setShowCouponModal(true)}
              style={styles.applyCouponBtn}
            >
              <Text style={styles.applyCouponText}>Apply</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setShowCouponModal(true)}
          style={styles.viewCouponsBtn}
        >
          <Text style={styles.viewCouponsText}>View Available Coupons</Text>
        </TouchableOpacity>
      </View>

      {/* Price Breakdown */}
      <View style={styles.priceBreakdown}>
        <View style={styles.priceBreakdownRow}>
          <Text style={styles.priceLabel}>
            Subtotal ({cartItems?.length || 0} items)
          </Text>
          <Text style={styles.priceValue}>₹{subtotal}</Text>
        </View>

        {selectedCoupon && (
          <View style={styles.priceBreakdownRow}>
            <Text style={[styles.priceLabel, styles.discountLabel]}>
              Coupon Discount
            </Text>
            <Text style={[styles.priceValue, styles.discountValue]}>
              -₹{couponDiscount}
            </Text>
          </View>
        )}

        <View style={styles.priceBreakdownRow}>
          <Text style={styles.priceLabel}>Shipping</Text>
          <Text
            style={[
              styles.priceValue,
              shippingCharges === 0 && styles.freeShipping,
            ]}
          >
            {shippingCharges === 0 ? "FREE" : `₹${shippingCharges}`}
          </Text>
        </View>

        {shippingCharges > 0 && (
          <Text style={styles.freeShippingNote}>
            Add ₹{499 - subtotal} more for FREE shipping
          </Text>
        )}

        <View style={[styles.priceBreakdownRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>
      </View>
    </View>
  );

  const renderAddressSelection = () => (
    <View style={styles.addressContainer}>
      <Text style={styles.sectionTitle}>Shipping Address</Text>

      {/* Selected Address */}
      {selectedAddress ? (
        <TouchableOpacity
          style={styles.selectedAddressCard}
          onPress={() => setShowAllAddresses(true)}
        >
          <View style={styles.addressHeader}>
            <View style={styles.radioContainer}>
              <View style={styles.radioSelected} />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressName}>
                {selectedAddress.name}
                {selectedAddress.isDefault && (
                  <Text style={styles.defaultBadge}> (Default)</Text>
                )}
              </Text>
              <Text style={styles.addressDetails}>
                {selectedAddress.street}, {selectedAddress.city},{" "}
                {selectedAddress.state} - {selectedAddress.zipCode}
              </Text>
              <Text style={styles.addressPhone}>
                Mobile: {selectedAddress.phone}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.addAddressCard}
          onPress={() => setShowAddressModal(true)}
        >
          <View style={styles.addAddressContent}>
            <Ionicons name="add-circle-outline" size={24} color="#FF6B35" />
            <Text style={styles.addAddressText}>Add Delivery Address</Text>
            <Text style={styles.addAddressSubText}>
              Save an address for faster checkout
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Show More Button - only show if there are addresses */}
      {addresses.length > 0 && (
        <TouchableOpacity
          style={styles.showMoreBtn}
          onPress={() => setShowAllAddresses(true)}
        >
          <Text style={styles.showMoreText}>Show More Addresses</Text>
          <Ionicons name="chevron-down" size={20} color="#FF6B35" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAddressModal = () => (
    <Modal
      visible={showAllAddresses}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAllAddresses(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Address</Text>
          <TouchableOpacity onPress={() => setShowAllAddresses(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressCard,
                selectedAddress?.id === address.id &&
                  styles.selectedAddressCard,
              ]}
              onPress={() => handleSelectAddress(address)}
            >
              <View style={styles.addressHeader}>
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radio,
                      selectedAddress?.id === address.id &&
                        styles.radioSelected,
                    ]}
                  />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressName}>
                    {address.name}
                    {address.isDefault && (
                      <Text style={styles.defaultBadge}> (Default)</Text>
                    )}
                  </Text>
                  <Text style={styles.addressDetails}>
                    {address.street}, {address.city}, {address.state} -{" "}
                    {address.zipCode}
                  </Text>
                  <Text style={styles.addressPhone}>
                    Mobile: {address.phone}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addNewAddressBtn}
            onPress={() => {
              setShowAllAddresses(false);
              setShowAddressModal(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FF6B35" />
            <Text style={styles.addNewAddressText}>Add New Address</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderNewAddressModal = () => (
    <Modal
      visible={showAddressModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddressModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add New Address</Text>
          <TouchableOpacity onPress={() => setShowAddressModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput
              style={styles.formInput}
              value={newAddress.name}
              onChangeText={(text) =>
                setNewAddress({ ...newAddress, name: text })
              }
              placeholder="Enter full name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone Number *</Text>
            <TextInput
              style={[
                styles.formInput,
                phoneError ? styles.formInputError : null,
              ]}
              value={newAddress.phone}
              onChangeText={(text) => {
                // Format phone number as user types (optional)
                const digitsOnly = text.replace(/\D/g, "");
                const formatted = digitsOnly.slice(0, 10); // Limit to 10 digits
                setNewAddress({ ...newAddress, phone: formatted });

                // Clear error when user starts typing
                if (phoneError) {
                  setPhoneError("");
                }
              }}
              onBlur={() => {
                // Validate on blur
                if (newAddress.phone) {
                  validatePhoneNumber(newAddress.phone);
                }
              }}
              placeholder="Enter 10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
            />
            {phoneError ? (
              <Text style={styles.formError}>{phoneError}</Text>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Street Address *</Text>
            <TextInput
              style={[styles.formInput, styles.multilineInput]}
              value={newAddress.street}
              onChangeText={(text) =>
                setNewAddress({ ...newAddress, street: text })
              }
              placeholder="Enter street address"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>City *</Text>
              <TextInput
                style={styles.formInput}
                value={newAddress.city}
                onChangeText={(text) =>
                  setNewAddress({ ...newAddress, city: text })
                }
                placeholder="City"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>State *</Text>
              <TextInput
                style={styles.formInput}
                value={newAddress.state}
                onChangeText={(text) =>
                  setNewAddress({ ...newAddress, state: text })
                }
                placeholder="State"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Pin Code *</Text>
            <TextInput
              style={styles.formInput}
              value={newAddress.zipCode}
              onChangeText={(text) =>
                setNewAddress({ ...newAddress, zipCode: text })
              }
              placeholder="Enter pin code"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveAddressBtn,
              createAddressMutation.isLoading && styles.disabledBtn,
            ]}
            onPress={handleAddNewAddress}
            disabled={createAddressMutation.isLoading}
          >
            {createAddressMutation.isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveAddressText}>Save Address</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderCouponModal = () => (
    <Modal
      visible={showCouponModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCouponModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Available Coupons</Text>
          <TouchableOpacity onPress={() => setShowCouponModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {coupons.map((coupon) => (
            <View key={coupon.id} style={styles.couponCard}>
              <View style={styles.couponInfo}>
                <Text style={styles.couponCodeText}>{coupon.code}</Text>
                <Text style={styles.couponDescription}>
                  {getCouponDescription(coupon)}
                </Text>
                <Text style={styles.couponMinCart}>
                  Minimum cart value: ₹{coupon.minCartValue}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.applyCouponCardBtn,
                  subtotal < coupon.minCartValue && styles.disabledBtn,
                ]}
                onPress={() => handleApplyCoupon(coupon)}
                disabled={subtotal < coupon.minCartValue}
              >
                <Text
                  style={[
                    styles.applyCouponCardText,
                    subtotal < coupon.minCartValue && styles.disabledText,
                  ]}
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <TopHeader />

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderOrderSummary()}
        {renderAddressSelection()}
      </ScrollView>

      {/* Payment Processing Overlay */}
      {paymentStatus.type === "processing" && (
        <View style={styles.paymentOverlay}>
          <View style={styles.paymentModal}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.paymentStatusText}>
              {paymentStatus.message || "Processing payment..."}
            </Text>
            {paymentStep !== "idle" && (
              <Text style={styles.paymentStepText}>
                {paymentStep === "creating_order" && "Creating order..."}
                {paymentStep === "creating_razorpay" && "Setting up payment..."}
                {paymentStep === "processing" &&
                  "Complete payment in Razorpay..."}
                {paymentStep === "verifying" && "Verifying payment..."}
                {paymentStep === "creating_payment" && "Finalizing order..."}
              </Text>
            )}
          </View>
        </View>
      )}

      {paymentStatus.type === "success" && (
        <View style={styles.paymentOverlay}>
          <View style={styles.paymentModal}>
            <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            <Text style={styles.paymentStatusText}>
              {paymentStatus.message}
            </Text>
            <Text style={styles.paymentSubText}>
              Redirecting to order confirmation...
            </Text>
          </View>
        </View>
      )}

      {paymentStatus.type === "failed" && (
        <View style={styles.paymentOverlay}>
          <View style={styles.paymentModal}>
            <Ionicons name="close-circle" size={60} color="#EF4444" />
            <Text style={styles.paymentStatusText}>Payment Failed</Text>
            <Text style={styles.paymentSubText}>{paymentStatus.message}</Text>
            <View style={styles.paymentButtonRow}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetryPayment}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPaymentStatus({ type: "idle", message: "" })}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {paymentStatus.type === "cancelled" && (
        <View style={styles.paymentOverlay}>
          <View style={styles.paymentModal}>
            <Ionicons name="alert-circle" size={60} color="#F59E0B" />
            <Text style={styles.paymentStatusText}>Payment Cancelled</Text>
            <Text style={styles.paymentSubText}>{paymentStatus.message}</Text>
            <View style={styles.paymentButtonRow}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetryPayment}
              >
                <Text style={styles.retryButtonText}>Retry Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.push("/profile/orders")}
              >
                <Text style={styles.cancelButtonText}>View Orders</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Order Button */}
      <View style={styles.bottomContainer}>
        {!selectedAddress || isProcessing || paymentStatus.type !== "idle" ? (
          <View style={[styles.orderButton, styles.disabledOrderButton]}>
            <TouchableOpacity
              onPress={handlePlaceOrder}
              style={styles.orderButtonInner}
              disabled={true}
            >
              <Text style={[styles.orderButtonText, styles.disabledOrderText]}>
                {!selectedAddress
                  ? "Select Address to Continue"
                  : isProcessing
                  ? "Processing..."
                  : `Place Order • ₹${total}`}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <LinearGradient
            colors={["#FF6B35", "#F7931E"]}
            style={styles.orderButton}
          >
            <TouchableOpacity
              onPress={handlePlaceOrder}
              style={styles.orderButtonInner}
              disabled={false}
            >
              <View style={styles.orderButtonContent}>
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color="#fff"
                  style={styles.lockIcon}
                />
                <Text style={styles.orderButtonText}>Pay Now • ₹{total}</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        )}
        <Text style={styles.securePaymentText}>
          <Ionicons name="shield-checkmark" size={12} color="#666" /> 100%
          Secure Payments via Razorpay
        </Text>
      </View>

      {renderAddressModal()}
      {renderNewAddressModal()}
      {renderCouponModal()}

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  safeArea: {
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  scrollContent: {
    flex: 1,
  },

  // Order Summary Styles
  orderSummaryContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 8,
    borderBottomColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  productImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  productDetails: {
    flex: 1,
    padding: 8,
    justifyContent: "space-between",
    minWidth: 0,
  },
  topSection: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 18,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  quantityText: {
    fontSize: 12,
    color: "#666",
  },
  quantityPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  itemTotalPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  discountBadgeCorner: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#e53e3e",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  discountCornerText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  productCategory: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  bottomSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceCalculationLeft: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
  },
  multiplyText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
  },
  productQuantityText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
  },
  finalPriceText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },

  // Coupon Styles
  couponSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  couponInputContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  couponInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  applyCouponBtn: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  applyCouponText: {
    color: "#fff",
    fontWeight: "600",
  },
  removeCouponBtn: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  removeCouponText: {
    color: "#fff",
    fontWeight: "600",
  },
  viewCouponsBtn: {
    alignItems: "center",
  },
  viewCouponsText: {
    color: "#FF6B35",
    textDecorationLine: "underline",
  },

  // Price Breakdown Styles
  priceBreakdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  priceBreakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  discountLabel: {
    color: "#10B981",
  },
  discountValue: {
    color: "#10B981",
  },
  freeShipping: {
    color: "#10B981",
    fontWeight: "600",
  },
  freeShippingNote: {
    fontSize: 12,
    color: "#FF6B35",
    textAlign: "center",
    marginBottom: 8,
  },
  totalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  // Address Styles
  addressContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 8,
    borderBottomColor: "#f5f5f5",
  },
  selectedAddressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FF6B35",
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  radioContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  radioSelected: {
    borderColor: "#FF6B35",
    backgroundColor: "#FF6B35",
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  defaultBadge: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "500",
  },
  addressDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: "#666",
  },
  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  showMoreText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "500",
    marginRight: 4,
  },
  addAddressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FF6B35",
    borderStyle: "dashed",
    marginBottom: 12,
    alignItems: "center",
  },
  addAddressContent: {
    alignItems: "center",
  },
  addAddressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B35",
    marginTop: 8,
    marginBottom: 4,
  },
  addAddressSubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  addNewAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FF6B35",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  addNewAddressText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "500",
    marginLeft: 8,
  },

  // Form Styles
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  formInputError: {
    borderColor: "#FF6B35",
    borderWidth: 2,
  },
  formError: {
    color: "#FF6B35",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  saveAddressBtn: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveAddressText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Coupon Modal Styles
  couponCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  couponInfo: {
    flex: 1,
  },
  couponCodeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B35",
    marginBottom: 4,
  },
  couponDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  couponMinCart: {
    fontSize: 12,
    color: "#666",
  },
  applyCouponCardBtn: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyCouponCardText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabledBtn: {
    backgroundColor: "#ccc",
  },
  disabledText: {
    color: "#999",
  },
  emptyCouponsContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyCouponsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  addAddressBtn: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addAddressBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Payment Overlay Styles
  paymentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  paymentModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    margin: 40,
    minWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentStatusText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    textAlign: "center",
    color: "#333",
  },
  paymentSubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  paymentStepText: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
  paymentButtonRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  retryButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: "#E5E5E5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },

  // Bottom Button Styles
  bottomContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  orderButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  orderButtonInner: {
    paddingVertical: 16,
    alignItems: "center",
  },
  orderButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  lockIcon: {
    marginRight: 8,
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledOrderButton: {
    backgroundColor: "#E5E5E5",
  },
  disabledOrderText: {
    color: "#999",
  },
  securePaymentText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CheckoutScreen() {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = () => {
    // Validate form
    const requiredFields: (keyof typeof formData)[] = [
      "email",
      "firstName",
      "lastName",
      "address",
      "city",
      "phone",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field].trim()
    );

    if (missingFields.length > 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all required fields.",
      });
      return;
    }

    setIsLoading(true);

    // Simulate order processing
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Success", "Order placed successfully!", [
        { text: "OK", onPress: () => router.push("/") },
      ]);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Checkout</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => handleInputChange("firstName", value)}
                placeholder="First name"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => handleInputChange("lastName", value)}
                placeholder="Last name"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => handleInputChange("address", value)}
              placeholder="Street address"
              multiline
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(value) => handleInputChange("city", value)}
                placeholder="City"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={formData.postalCode}
                onChangeText={(value) => handleInputChange("postalCode", value)}
                placeholder="Postal code"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "card" && styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod("card")}
          >
            <View style={styles.paymentInfo}>
              <Ionicons name="card" size={20} color="#374151" />
              <Text style={styles.paymentText}>Credit/Debit Card</Text>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === "card" && styles.radioSelected,
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "upi" && styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod("upi")}
          >
            <View style={styles.paymentInfo}>
              <Ionicons name="phone-portrait" size={20} color="#374151" />
              <Text style={styles.paymentText}>UPI Payment</Text>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === "upi" && styles.radioSelected,
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "cod" && styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod("cod")}
          >
            <View style={styles.paymentInfo}>
              <Ionicons name="cash" size={20} color="#374151" />
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === "cod" && styles.radioSelected,
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹45,999</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>FREE</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>₹1,380</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Total</Text>
            <Text style={styles.summaryTotalValue}>₹47,379</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.checkoutContainer}>
        <LinearGradient
          colors={["#e11d48", "#be185d"]}
          style={styles.placeOrderButton}
        >
          <TouchableOpacity
            style={styles.placeOrderButtonInner}
            onPress={handlePlaceOrder}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.placeOrderText}>Place Order - ₹47,379</Text>
                <Ionicons name="checkmark" size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPayment: {
    borderColor: "#e11d48",
    backgroundColor: "#fef2f2",
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
  },
  radioSelected: {
    borderColor: "#e11d48",
    backgroundColor: "#e11d48",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#d1d5db",
    marginVertical: 12,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  checkoutContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  placeOrderButton: {
    borderRadius: 12,
  },
  placeOrderButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  bottomSpacing: {
    height: 20,
  },
});

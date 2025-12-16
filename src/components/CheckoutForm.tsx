import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";
import { useApiCart } from "../contexts/ApiCartContext";
import { usePayment } from "../hooks/usePayment";
import { Address, useGetAddresses } from "../services/addressService";
import PaymentMethods from "./checkout/PaymentMethods";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

const checkoutSchema = z.object({
  selectedAddressId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  paymentMethod: z.enum([
    "credit_card",
    "debit_card",
    "upi",
    "net_banking",
    "cod",
  ]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, onCancel }) => {
  const { cartItems } = useApiCart();
  const { processPayment, isProcessing } = usePayment();
  const { data: addresses = [] } = useGetAddresses();
  const { userId } = useAuth();
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("credit_card");
  const [paymentDetails, setPaymentDetails] = useState<any>({});

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
      paymentMethod: "credit_card",
    },
  });

  // Auto-select default address when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress =
        addresses.find((addr: Address) => addr.isDefault) || addresses[0];
      if (defaultAddress) {
        setValue("selectedAddressId", defaultAddress.id.toString());
        setValue("name", defaultAddress.name);
        setValue("phone", defaultAddress.phone);
        setValue("street", defaultAddress.street);
        setValue("city", defaultAddress.city);
        setValue("state", defaultAddress.state);
        setValue("zipCode", defaultAddress.zipCode);
      }
    }
  }, [addresses, setValue]);

  // Calculate totals
  const subtotal =
    cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const shipping = subtotal > 1000 ? 0 : 100; // Free shipping over ₹1000
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const paymentRequest = {
        amount: total,
        currency: "INR",
        customerInfo: {
          name: data.name,
          phone: data.phone,
          email: userId || "",
        },
        shippingAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
        items:
          cartItems?.map((item) => ({
            id: item.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
          })) || [],
        paymentMethod: data.paymentMethod as any,
        ...paymentDetails,
      };

      const result = await processPayment(paymentRequest);

      if (result) {
        Alert.alert("Success", "Order placed successfully!");
        onSuccess?.();
      } else {
        Alert.alert("Error");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const renderAddressSection = () => (
    <Card style={styles.section}>
      <CardHeader>
        <CardTitle>Shipping Address</CardTitle>
      </CardHeader>
      <CardContent>
        {addresses.length > 0 && !useNewAddress && (
          <View style={styles.addressSelection}>
            <Text style={styles.sectionSubtitle}>Saved Addresses</Text>
            {addresses.map((address: Address) => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressCard,
                  watch("selectedAddressId") === address.id.toString() &&
                    styles.selectedAddress,
                ]}
                onPress={() => {
                  setValue("selectedAddressId", address.id.toString());
                  setValue("name", address.name);
                  setValue("phone", address.phone);
                  setValue("street", address.street);
                  setValue("city", address.city);
                  setValue("state", address.state);
                  setValue("zipCode", address.zipCode);
                }}
              >
                <Text style={styles.addressName}>{address.name}</Text>
                <Text style={styles.addressText}>
                  {address.street}, {address.city}, {address.state}{" "}
                  {address.zipCode}
                </Text>
                <Text style={styles.addressPhone}>{address.phone}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.newAddressButton}
              onPress={() => setUseNewAddress(true)}
            >
              <Ionicons name="add" size={16} color="#dc2626" />
              <Text style={styles.newAddressText}>Use New Address</Text>
            </TouchableOpacity>
          </View>
        )}

        {(useNewAddress || addresses.length === 0) && (
          <View style={styles.addressForm}>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Label>Full Name</Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter full name"
                      containerStyle={errors.name && styles.errorInput}
                    />
                  )}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name.message}</Text>
                )}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Label>Phone Number</Label>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                      containerStyle={errors.phone && styles.errorInput}
                    />
                  )}
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone.message}</Text>
                )}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Label>Street Address</Label>
                <Controller
                  control={control}
                  name="street"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter street address"
                      multiline
                      numberOfLines={2}
                      containerStyle={errors.street && styles.errorInput}
                    />
                  )}
                />
                {errors.street && (
                  <Text style={styles.errorText}>{errors.street.message}</Text>
                )}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formField, styles.halfField]}>
                <Label>City</Label>
                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="City"
                      containerStyle={errors.city && styles.errorInput}
                    />
                  )}
                />
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city.message}</Text>
                )}
              </View>

              <View style={[styles.formField, styles.halfField]}>
                <Label>State</Label>
                <Controller
                  control={control}
                  name="state"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="State"
                      containerStyle={errors.state && styles.errorInput}
                    />
                  )}
                />
                {errors.state && (
                  <Text style={styles.errorText}>{errors.state.message}</Text>
                )}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formField, styles.halfField]}>
                <Label>ZIP Code</Label>
                <Controller
                  control={control}
                  name="zipCode"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="ZIP Code"
                      keyboardType="numeric"
                      containerStyle={errors.zipCode && styles.errorInput}
                    />
                  )}
                />
                {errors.zipCode && (
                  <Text style={styles.errorText}>{errors.zipCode.message}</Text>
                )}
              </View>
            </View>

            {addresses.length > 0 && (
              <TouchableOpacity
                style={styles.backToSavedButton}
                onPress={() => setUseNewAddress(false)}
              >
                <Text style={styles.backToSavedText}>
                  Back to Saved Addresses
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </CardContent>
    </Card>
  );

  const renderOrderSummary = () => (
    <Card style={styles.section}>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ₹{subtotal.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {shipping === 0 ? "Free" : `₹${shipping}`}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (GST)</Text>
            <Text style={styles.summaryValue}>₹{tax.toFixed(0)}</Text>
          </View>

          <Separator style={styles.separator} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderAddressSection()}

      <PaymentMethods
        selectedMethod={selectedPaymentMethod}
        onMethodChange={setSelectedPaymentMethod}
        onDetailsChange={setPaymentDetails}
      />

      {renderOrderSummary()}

      <View style={styles.actions}>
        <Button
          style={StyleSheet.flatten([styles.button, styles.cancelButton])}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Button>

        <Button
          style={StyleSheet.flatten([styles.button, styles.submitButton])}
          onPress={handleSubmit(onSubmit)}
          loading={isProcessing}
        >
          <Text style={styles.submitButtonText}>
            Place Order (₹{total.toLocaleString()})
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  addressSelection: {
    gap: 12,
  },
  addressCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  selectedAddress: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: "#6b7280",
  },
  newAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dc2626",
    borderStyle: "dashed",
    justifyContent: "center",
  },
  newAddressText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "500",
    marginLeft: 8,
  },
  addressForm: {
    gap: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formField: {
    flex: 1,
  },
  halfField: {
    flex: 0.5,
  },
  errorInput: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  backToSavedButton: {
    alignSelf: "flex-start",
  },
  backToSavedText: {
    fontSize: 14,
    color: "#dc2626",
    textDecorationLine: "underline",
  },
  orderSummary: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  separator: {
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    height: 48,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#dc2626",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default CheckoutForm;

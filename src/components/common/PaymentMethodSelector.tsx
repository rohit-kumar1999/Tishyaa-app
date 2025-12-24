import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "./TouchableOpacity";
import paymentService, {
  PaymentMethod,
  PaymentOptions,
  UPIPaymentOptions,
} from "../../services/paymentService";

const { width } = Dimensions.get("window");

interface PaymentMethodSelectorProps {
  amount: number;
  orderId: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentFailure: (result: any) => void;
  userDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  orderId,
  onPaymentSuccess,
  onPaymentFailure,
  userDetails,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [paymentMethods] = useState<PaymentMethod[]>(
    paymentService.getPaymentMethods()
  );

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const processPayment = async () => {
    if (!selectedMethod) {
      Alert.alert(
        "Select Payment Method",
        "Please select a payment method to continue."
      );
      return;
    }

    setProcessing(true);

    try {
      const paymentOptions: PaymentOptions = {
        amount,
        currency: "INR",
        orderId,
        description: `Payment for order ${orderId}`,
        prefill: {
          name: userDetails?.name,
          email: userDetails?.email,
          contact: userDetails?.phone,
        },
        theme: {
          color: "#C9A961",
        },
      };

      const upiOptions: UPIPaymentOptions = {
        amount,
        upiId: "merchant@paytm", // Replace with your UPI ID
        merchantName: "Tishyaa Jewels",
        transactionNote: `Payment for order ${orderId}`,
        transactionRef: orderId,
      };

      const result = await paymentService.processPayment(
        selectedMethod,
        paymentOptions,
        upiOptions
      );

      if (result.success) {
        paymentService.handlePaymentSuccess(result, onPaymentSuccess);
      } else {
        paymentService.handlePaymentFailure(result, onPaymentFailure);
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Payment failed. Please try again.");
      onPaymentFailure({ success: false, error: "Payment failed" });
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    const isSelected = selectedMethod === method.id;

    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.paymentMethodItem,
          isSelected && styles.selectedPaymentMethod,
          !method.enabled && styles.disabledPaymentMethod,
        ]}
        onPress={() => method.enabled && handlePaymentMethodSelect(method.id)}
        disabled={!method.enabled}
      >
        <View style={styles.paymentMethodIcon}>
          <Ionicons
            name={method.icon as any}
            size={24}
            color={isSelected ? "#C9A961" : method.enabled ? "#333" : "#999"}
          />
        </View>

        <View style={styles.paymentMethodInfo}>
          <Text
            style={[
              styles.paymentMethodName,
              isSelected && styles.selectedPaymentMethodText,
              !method.enabled && styles.disabledPaymentMethodText,
            ]}
          >
            {method.name}
          </Text>
          <Text
            style={[
              styles.paymentMethodType,
              !method.enabled && styles.disabledPaymentMethodText,
            ]}
          >
            {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
          </Text>
        </View>

        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color="#C9A961" />
        )}

        {!method.enabled && (
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        )}
      </TouchableOpacity>
    );
  };

  const getMethodsByCategory = (category: string) => {
    return paymentMethods.filter((method) => {
      switch (category) {
        case "cards":
          return method.type === "card" || method.type === "netbanking";
        case "wallets":
          return method.type === "wallet";
        case "upi":
          return method.type === "upi";
        default:
          return false;
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Select Payment Method</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.amount}>₹{amount.toLocaleString("en-IN")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPI & Digital Wallets</Text>
          <View style={styles.methodsGrid}>
            {getMethodsByCategory("upi").map(renderPaymentMethod)}
            {getMethodsByCategory("wallets").map(renderPaymentMethod)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cards & Banking</Text>
          <View style={styles.methodsGrid}>
            {getMethodsByCategory("cards").map(renderPaymentMethod)}
          </View>
        </View>

        {selectedMethod && (
          <View style={styles.selectedMethodInfo}>
            <View style={styles.selectedMethodHeader}>
              <Ionicons name="information-circle" size={20} color="#C9A961" />
              <Text style={styles.selectedMethodTitle}>Payment Details</Text>
            </View>

            <Text style={styles.selectedMethodDescription}>
              {getPaymentMethodDescription(selectedMethod)}
            </Text>
          </View>
        )}

        <View style={styles.securityInfo}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={styles.securityTitle}>Secure Payment</Text>
          </View>
          <Text style={styles.securityDescription}>
            All transactions are encrypted and secure. Your financial
            information is protected.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!selectedMethod || processing) && styles.disabledPayButton,
          ]}
          onPress={processPayment}
          disabled={!selectedMethod || processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="card" size={20} color="#FFF" />
              <Text style={styles.payButtonText}>
                Pay ₹{amount.toLocaleString("en-IN")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getPaymentMethodDescription = (methodId: string): string => {
  switch (methodId) {
    case "card":
      return "Pay securely using your credit or debit card. We accept Visa, MasterCard, and RuPay.";
    case "upi":
      return "Pay instantly using any UPI app installed on your phone. Quick, secure, and convenient.";
    case "gpay":
      return "Pay using Google Pay for a quick and secure transaction experience.";
    case "phonepe":
      return "Complete your payment quickly using PhonePe wallet or linked bank account.";
    case "paytm":
      return "Pay using your Paytm wallet or linked payment methods.";
    case "netbanking":
      return "Pay directly from your bank account using net banking. Supports all major banks.";
    default:
      return "Complete your payment using the selected method.";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
  },
  amountLabel: {
    fontSize: 16,
    color: "#666",
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#C9A961",
  },
  section: {
    backgroundColor: "#FFF",
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  methodsGrid: {
    gap: 12,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  selectedPaymentMethod: {
    borderColor: "#C9A961",
    backgroundColor: "#FFF8F0",
  },
  disabledPaymentMethod: {
    backgroundColor: "#F5F5F5",
    opacity: 0.7,
  },
  paymentMethodIcon: {
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedPaymentMethodText: {
    color: "#C9A961",
  },
  disabledPaymentMethodText: {
    color: "#999",
  },
  paymentMethodType: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  comingSoonText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  selectedMethodInfo: {
    backgroundColor: "#FFF",
    marginTop: 16,
    padding: 20,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  selectedMethodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedMethodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  selectedMethodDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  securityInfo: {
    backgroundColor: "#E8F5E8",
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    marginLeft: 8,
  },
  securityDescription: {
    fontSize: 12,
    color: "#2E7D32",
    lineHeight: 16,
  },
  footer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  payButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C9A961",
    padding: 16,
    borderRadius: 8,
  },
  disabledPayButton: {
    backgroundColor: "#CCCCCC",
  },
  payButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default PaymentMethodSelector;

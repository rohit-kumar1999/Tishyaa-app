import { useAuth, useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";
import { toast } from "./use-toast";
import { useApiMutation } from "./useApiQuery";

// Payment types adapted for React Native
interface PaymentRequest {
  userId: string;
  cartIds: string[];
  addressId: string;
  paymentMethod: "razorpay" | "cod" | "card";
  amount: number;
  currency?: string;
}

interface CreateOrderRequest {
  userId: string;
  cartIds: string[];
  addressId: string;
  paymentMethod: string;
  amount: number;
}

interface CreateOrderResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

interface PaymentVerificationResponse {
  success: boolean;
  orderId: string;
  paymentId?: string;
  message: string;
}

// Mock payment services - replace with actual API calls
const createOrderService = (
  data: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `order_${Date.now()}`,
        amount: data.amount,
        currency: "INR",
        status: "created",
      });
    }, 1000);
  });
};

const verifyPaymentService = (
  data: any
): Promise<PaymentVerificationResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        orderId: data.orderId,
        paymentId: data.paymentId,
        message: "Payment verified successfully",
      });
    }, 500);
  });
};

export const usePayment = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "idle" | "creating" | "processing" | "verifying"
  >("idle");

  // API mutations
  const createOrderMutation = useApiMutation<
    CreateOrderResponse,
    CreateOrderRequest
  >("/orders/create", {
    successMessage: "Order created successfully",
    errorMessage: "Failed to create order",
  });

  const verifyPaymentMutation = useApiMutation<
    PaymentVerificationResponse,
    any
  >("/payments/verify", {
    successMessage: "Payment verified successfully",
    errorMessage: "Payment verification failed",
  });

  // Process payment function
  const processPayment = async (
    paymentRequest: PaymentRequest
  ): Promise<boolean> => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a payment.",
        variant: "destructive",
      });
      return false;
    }

    setIsProcessing(true);
    setPaymentStep("creating");

    try {
      // Step 1: Create order
      const orderData: CreateOrderRequest = {
        userId,
        cartIds: paymentRequest.cartIds,
        addressId: paymentRequest.addressId,
        paymentMethod: paymentRequest.paymentMethod,
        amount: paymentRequest.amount,
      };

      const order = await createOrderMutation.mutate(orderData);
      if (!order) {
        throw new Error("Failed to create order");
      }

      setPaymentStep("processing");

      // Step 2: Handle different payment methods
      if (paymentRequest.paymentMethod === "cod") {
        // Cash on Delivery - no payment processing needed
        setPaymentStep("verifying");
        const verification = await verifyPaymentMutation.mutate({
          orderId: order.id,
          paymentMethod: "cod",
        });

        if (verification?.success) {
          setIsProcessing(false);
          setPaymentStep("idle");
          return true;
        }
      } else if (paymentRequest.paymentMethod === "razorpay") {
        // Razorpay payment processing
        const paymentSuccess = await processRazorpayPayment(order);
        if (paymentSuccess) {
          setIsProcessing(false);
          setPaymentStep("idle");
          return true;
        }
      } else {
        // Other payment methods
        Alert.alert(
          "Payment Method Not Supported",
          "This payment method is not yet implemented in the mobile app.",
          [{ text: "OK" }]
        );
      }

      setIsProcessing(false);
      setPaymentStep("idle");
      return false;
    } catch (error) {
      console.error("Payment processing error:", error);
      setIsProcessing(false);
      setPaymentStep("idle");

      toast({
        title: "Payment Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during payment processing.",
        variant: "destructive",
      });

      return false;
    }
  };

  // Process Razorpay payment (placeholder - implement actual Razorpay integration)
  const processRazorpayPayment = async (
    order: CreateOrderResponse
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        "Razorpay Payment",
        `Process payment of ₹${order.amount / 100} for order ${order.id}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Pay Now",
            onPress: async () => {
              setPaymentStep("verifying");
              // Simulate payment processing
              const verification = await verifyPaymentMutation.mutate({
                orderId: order.id,
                paymentId: `pay_${Date.now()}`,
                paymentMethod: "razorpay",
              });

              resolve(verification?.success || false);
            },
          },
        ]
      );
    });
  };

  // Retry payment for existing order
  const retryOrderPayment = async (order: any): Promise<boolean> => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to retry payment.",
        variant: "destructive",
      });
      return false;
    }

    const paymentRequest: PaymentRequest = {
      userId,
      cartIds: [],
      addressId: order.addressId,
      paymentMethod: order.paymentMethod || "razorpay",
      amount: order.netValue || order.total,
    };

    return await processPayment(paymentRequest);
  };

  // Get payment method details (simplified for mobile)
  const getPaymentMethodDetails = async (paymentId: string): Promise<any> => {
    return {
      type: paymentId.startsWith("pay_") ? "razorpay" : "unknown",
      displayName: `Payment (${paymentId.substring(0, 12)}...)`,
      rawPaymentId: paymentId,
    };
  };

  return {
    processPayment,
    retryOrderPayment,
    getPaymentMethodDetails,
    isProcessing,
    paymentStep,
    // Expose mutations for direct use if needed
    createOrderMutation,
    verifyPaymentMutation,
  };
};

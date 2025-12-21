import { useAuth, useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import {
  CreateOrderRequest,
  CreateOrderResponse,
  CreatePaymentRequest,
  FailedPaymentData,
  getPaymentMethodDetails,
  PaymentRequest,
  paymentService,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  RAZORPAY_ERROR_CODES,
  RAZORPAY_ERROR_MESSAGES,
  RazorpayOrderResponse,
  storeFailedPayment,
} from "../services/paymentService";
import { toast } from "./use-toast";
import { useApiMutation } from "./useApiQuery";

// Payment result interface for the hook
interface PaymentHookResult {
  success: boolean;
  orderId?: string;
  orderData?: any;
  cancelled?: boolean;
}

export const usePayment = () => {
  const { userId, getToken } = useAuth();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    | "idle"
    | "creating_order"
    | "creating_razorpay"
    | "processing"
    | "verifying"
    | "creating_payment"
  >("idle");

  // User details for prefill
  const userFullName = user?.fullName || user?.firstName || "";
  const primaryEmailAddress = user?.primaryEmailAddress?.emailAddress || "";
  const primaryPhone = user?.primaryPhoneNumber?.phoneNumber || "";

  // API mutations
  const createOrderMutation = useApiMutation<
    CreateOrderResponse,
    CreateOrderRequest
  >("/order", {
    successMessage: "",
    errorMessage: "Failed to create order",
  });

  const createRazorpayOrderMutation = useApiMutation<
    RazorpayOrderResponse,
    PaymentRequest
  >("/razorpay/order", {
    successMessage: "",
    errorMessage: "Failed to create Razorpay order",
  });

  const verifyRazorpayPaymentMutation = useApiMutation<
    PaymentVerificationResponse,
    PaymentVerificationRequest
  >("/razorpay/verify", {
    successMessage: "",
    errorMessage: "Payment verification failed",
  });

  const createPaymentMutation = useApiMutation<
    { success: boolean; message: string },
    CreatePaymentRequest
  >("/payment", {
    method: "POST",
    successMessage: "",
    errorMessage: "Failed to create payment record",
  });

  /**
   * Main payment processing function
   */
  const processPayment = async (
    paymentData: PaymentRequest
  ): Promise<PaymentHookResult> => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete payment.",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsProcessing(true);

    try {
      // Handle Cash on Delivery
      if (paymentData.paymentMethod === "cod") {
        return await processCODPayment(paymentData);
      }

      // For Razorpay payments
      return await processRazorpayPayment(paymentData);
    } catch (error) {
      console.error("Payment process failed:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.";

      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false };
    } finally {
      setIsProcessing(false);
      setPaymentStep("idle");
    }
  };

  /**
   * Process Cash on Delivery payment
   */
  const processCODPayment = async (
    paymentData: PaymentRequest
  ): Promise<PaymentHookResult> => {
    setPaymentStep("creating_order");

    // Create order in backend
    const backendOrder = await createOrderMutation.mutate({
      userId: paymentData.userId,
      cartIds: paymentData.cartIds,
      addressId: paymentData.addressId,
      products: paymentData.cartItems,
      netValue: paymentData.netValue,
    });

    if (!backendOrder?.orderId) {
      throw new Error("Failed to create order");
    }

    toast({
      title: "Order Placed Successfully!",
      description: "Your Cash on Delivery order has been confirmed.",
    });

    return {
      success: true,
      orderId: backendOrder.orderId,
      orderData: {
        id: backendOrder.orderId,
        amount: paymentData.netValue,
        paymentMethod: "Cash on Delivery",
        items: paymentData.cartItems,
        shippingAddress: paymentData.shippingAddress,
        currency: paymentData.currency,
        createdAt: new Date().toISOString(),
      },
    };
  };

  /**
   * Process Razorpay payment
   */
  const processRazorpayPayment = async (
    paymentData: PaymentRequest
  ): Promise<PaymentHookResult> => {
    // Step 1: Create order in backend DB
    setPaymentStep("creating_order");

    const backendOrder = await createOrderMutation.mutate({
      userId: paymentData.userId,
      cartIds: paymentData.cartIds,
      addressId: paymentData.addressId,
      products: paymentData.cartItems,
      netValue: paymentData.netValue,
    });

    if (!backendOrder?.orderId) {
      throw new Error("Failed to create order - no order ID received");
    }

    // Step 2: Create Razorpay order
    setPaymentStep("creating_razorpay");

    const paymentDataWithOrderId = {
      ...paymentData,
      orderId: backendOrder.orderId,
    };

    const razorpayOrder = await createRazorpayOrderMutation.mutate(
      paymentDataWithOrderId
    );

    if (!razorpayOrder) {
      throw new Error("Failed to create Razorpay order");
    }

    const razorpayOrderId = razorpayOrder.razorpay_order_id || razorpayOrder.id;
    if (!razorpayOrderId) {
      throw new Error("Invalid Razorpay order response - no order ID");
    }

    // Step 3: Open Razorpay SDK
    setPaymentStep("processing");

    // External wallet callback
    const handleExternalWallet = (walletName: string) => {
      toast({
        title: "Redirecting to Wallet",
        description: `Opening ${walletName} for payment...`,
      });
    };

    const razorpayResult = await paymentService.processRazorpayPayment(
      razorpayOrder,
      {
        name: userFullName || paymentData.shippingAddress.name,
        email: primaryEmailAddress,
        contact: primaryPhone || paymentData.shippingAddress.phone,
      },
      handleExternalWallet
    );

    console.log("Razorpay Result:", razorpayResult);
    // Handle payment cancellation
    if (razorpayResult.cancelled) {
      toast({
        title: "Payment Cancelled",
        description:
          RAZORPAY_ERROR_MESSAGES[RAZORPAY_ERROR_CODES.PAYMENT_CANCELLED],
      });
      return { success: false, cancelled: true, orderId: backendOrder.orderId };
    }

    // Handle payment failure with specific error messages
    if (!razorpayResult.success) {
      // Check for network errors
      if (razorpayResult.errorCode === RAZORPAY_ERROR_CODES.NETWORK_ERROR) {
        toast({
          title: "Network Error",
          description:
            RAZORPAY_ERROR_MESSAGES[RAZORPAY_ERROR_CODES.NETWORK_ERROR],
          variant: "destructive",
        });
      }

      throw new Error(razorpayResult.error || "Payment failed");
    }

    // Step 4: Verify payment
    setPaymentStep("verifying");

    const verificationResult = await verifyRazorpayPaymentMutation.mutate({
      razorpay_order_id: razorpayResult.orderId!,
      razorpay_payment_id: razorpayResult.paymentId!,
      razorpay_signature: razorpayResult.signature!,
      orderId: backendOrder.orderId,
      userId: userId,
    });

    const isVerified = verificationResult?.success || verificationResult?.valid;

    if (!isVerified) {
      throw new Error("Payment verification failed");
    }

    // Step 5: Create payment record
    setPaymentStep("creating_payment");

    const paymentMethodDetails = await getPaymentMethodDetails(
      razorpayResult.paymentId!
    );

    try {
      await createPaymentMutation.mutate({
        orderId: String(backendOrder.orderId),
        amount: razorpayOrder.amount / 100, // Convert from paise to rupees
        method: paymentMethodDetails.displayName,
        status: "captured",
        transactionId: razorpayResult.paymentId!,
        paymentGateway: "razorpay",
        userId: userId,
        idempotencyKey: `${backendOrder.orderId}_${razorpayResult.paymentId}`,
        paymentData: {
          razorpay_payment_id: razorpayResult.paymentId,
          razorpay_order_id: razorpayResult.orderId,
          razorpay_signature: razorpayResult.signature,
        },
      });
    } catch (paymentRecordError) {
      // Payment was successful but record creation failed
      console.error("Payment record creation failed:", paymentRecordError);

      // Store for recovery
      const failedPaymentData: FailedPaymentData = {
        razorpayPaymentId: razorpayResult.paymentId!,
        razorpayOrderId: razorpayResult.orderId!,
        razorpaySignature: razorpayResult.signature!,
        backendOrderId: String(backendOrder.orderId),
        amount: razorpayOrder.amount / 100,
        timestamp: new Date().toISOString(),
        userId: userId!,
        paymentMethod: paymentMethodDetails.displayName,
      };

      await storeFailedPayment(failedPaymentData);

      // Still return success since payment was processed
      toast({
        title: "Payment Successful",
        description:
          "Your payment was successful! There was a minor issue updating order status but your order is confirmed.",
      });

      return {
        success: true,
        orderId: backendOrder.orderId,
        orderData: {
          id: backendOrder.orderId,
          paymentId: razorpayResult.paymentId,
          status: "payment_successful_order_pending",
        },
      };
    }

    toast({
      title: "Payment Successful!",
      description: "Your order has been placed successfully.",
    });

    return {
      success: true,
      orderId: backendOrder.orderId,
      orderData: {
        id: backendOrder.orderId,
        amount: razorpayOrder.amount / 100,
        paymentMethod: paymentMethodDetails.displayName,
        paymentId: razorpayResult.paymentId,
        items: paymentData.cartItems,
        shippingAddress: paymentData.shippingAddress,
        currency: paymentData.currency,
        createdAt: new Date().toISOString(),
      },
    };
  };

  /**
   * Retry payment for an existing order
   */
  const retryOrderPayment = async (order: any): Promise<PaymentHookResult> => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to retry payment.",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsProcessing(true);

    try {
      // Create payment request from existing order
      const paymentRequest: PaymentRequest = {
        userId: userId,
        cartIds: [],
        addressId: order.addressId,
        netValue: order.netValue,
        amount: order.netValue,
        currency: "INR",
        cartItems: order.lines.map((line: any) => ({
          productId: line.productId,
          quantity: line.quantity,
          price: line.price,
        })),
        shippingAddress: {
          name: order.address?.name || "Customer",
          street: order.address?.street || "",
          city: order.address?.city || "",
          state: order.address?.state || "",
          pinCode: order.address?.zipCode || "",
          zipCode: order.address?.zipCode || "",
          country: order.address?.country || "India",
          phone: order.address?.phone || "",
        },
        paymentMethod: "razorpay",
        orderId: order.id,
      };

      // Step 1: Create new Razorpay order
      setPaymentStep("creating_razorpay");

      const razorpayOrder = await createRazorpayOrderMutation.mutate(
        paymentRequest
      );

      if (!razorpayOrder) {
        throw new Error("Failed to create Razorpay order");
      }

      const razorpayOrderId =
        razorpayOrder.razorpay_order_id || razorpayOrder.id;
      if (!razorpayOrderId) {
        throw new Error("Invalid Razorpay order response");
      }

      // Step 2: Open Razorpay SDK
      setPaymentStep("processing");

      const razorpayResult = await paymentService.processRazorpayPayment(
        razorpayOrder,
        {
          name: userFullName || order.address?.name,
          email: primaryEmailAddress,
          contact: primaryPhone || order.address?.phone,
        },
        (walletName) => {
          toast({
            title: "Redirecting to Wallet",
            description: `Opening ${walletName} for payment...`,
          });
        }
      );

      if (razorpayResult.cancelled) {
        toast({
          title: "Payment Cancelled",
          description:
            RAZORPAY_ERROR_MESSAGES[RAZORPAY_ERROR_CODES.PAYMENT_CANCELLED],
        });
        return { success: false, cancelled: true };
      }

      if (!razorpayResult.success) {
        throw new Error(razorpayResult.error || "Payment failed");
      }

      // Step 3: Verify payment
      setPaymentStep("verifying");

      const verificationResult = await verifyRazorpayPaymentMutation.mutate({
        razorpay_order_id: razorpayResult.orderId!,
        razorpay_payment_id: razorpayResult.paymentId!,
        razorpay_signature: razorpayResult.signature!,
        orderId: order.id,
        userId: userId,
      });

      const isVerified =
        verificationResult?.success || verificationResult?.valid;

      if (!isVerified) {
        throw new Error("Payment verification failed");
      }

      // Step 4: Create payment record
      setPaymentStep("creating_payment");

      const paymentMethodDetails = await getPaymentMethodDetails(
        razorpayResult.paymentId!
      );

      await createPaymentMutation.mutate({
        orderId: String(order.id),
        amount: razorpayOrder.amount / 100,
        method: paymentMethodDetails.displayName,
        status: "captured",
        transactionId: razorpayResult.paymentId!,
        paymentGateway: "razorpay",
        userId: userId,
        idempotencyKey: `${order.id}_${razorpayResult.paymentId}`,
        paymentData: {
          razorpay_payment_id: razorpayResult.paymentId,
          razorpay_order_id: razorpayResult.orderId,
          razorpay_signature: razorpayResult.signature,
        },
      });

      toast({
        title: "Payment Successful!",
        description: "Your order payment has been completed.",
      });

      return {
        success: true,
        orderId: order.id,
        orderData: {
          id: order.id,
          amount: razorpayOrder.amount / 100,
          paymentMethod: paymentMethodDetails.displayName,
          paymentId: razorpayResult.paymentId,
        },
      };
    } catch (error) {
      console.error("Retry payment failed:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.";

      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false };
    } finally {
      setIsProcessing(false);
      setPaymentStep("idle");
    }
  };

  /**
   * Recover a failed payment from AsyncStorage
   * Use when payment succeeded on Razorpay but backend API failed
   */
  const recoverFailedPayment = async (
    failedPayment: FailedPaymentData
  ): Promise<PaymentHookResult> => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to recover payment.",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsProcessing(true);

    try {
      // Step 1: Verify the payment again
      setPaymentStep("verifying");

      const verificationResult = await verifyRazorpayPaymentMutation.mutate({
        razorpay_order_id: failedPayment.razorpayOrderId,
        razorpay_payment_id: failedPayment.razorpayPaymentId,
        razorpay_signature: failedPayment.razorpaySignature,
        orderId: failedPayment.backendOrderId,
        userId: userId,
      });

      const isVerified =
        verificationResult?.success || verificationResult?.valid;

      if (!isVerified) {
        throw new Error("Payment verification failed during recovery");
      }

      // Step 2: Create payment record
      setPaymentStep("creating_payment");

      await createPaymentMutation.mutate({
        orderId: failedPayment.backendOrderId,
        amount: failedPayment.amount,
        method: failedPayment.paymentMethod,
        status: "captured",
        transactionId: failedPayment.razorpayPaymentId,
        paymentGateway: "razorpay",
        userId: userId,
        idempotencyKey: `${failedPayment.backendOrderId}_${failedPayment.razorpayPaymentId}`,
        paymentData: {
          razorpay_payment_id: failedPayment.razorpayPaymentId,
          razorpay_order_id: failedPayment.razorpayOrderId,
          razorpay_signature: failedPayment.razorpaySignature,
          recovered: true,
          recoveredAt: new Date().toISOString(),
        },
      });

      // Step 3: Remove from failed payments storage
      const { removeFailedPayment } = await import(
        "../services/paymentService"
      );
      await removeFailedPayment(failedPayment.razorpayPaymentId);

      toast({
        title: "Payment Recovered!",
        description: "Your payment has been successfully processed.",
      });

      return {
        success: true,
        orderId: failedPayment.backendOrderId,
      };
    } catch (error) {
      console.error("Payment recovery failed:", error);

      toast({
        title: "Recovery Failed",
        description: "Please contact support with your payment details.",
        variant: "destructive",
      });

      return { success: false };
    } finally {
      setIsProcessing(false);
      setPaymentStep("idle");
    }
  };

  return {
    processPayment,
    retryOrderPayment,
    recoverFailedPayment,
    isProcessing,
    paymentStep,
    // Expose mutation states
    isCreatingBackendOrder: createOrderMutation.isLoading,
    isCreatingRazorpayOrder: createRazorpayOrderMutation.isLoading,
    isVerifying: verifyRazorpayPaymentMutation.isLoading,
    isCreatingPayment: createPaymentMutation.isLoading,
  };
};

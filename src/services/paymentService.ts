/**
 * Razorpay Payment Service for React Native
 *
 * This service handles all payment operations using Razorpay SDK.
 * Supports: Android, iOS, and Web platforms
 *
 * Documentation References:
 * - Android: https://razorpay.com/docs/payments/payment-gateway/android-integration/standard/
 * - iOS: https://razorpay.com/docs/payments/payment-gateway/ios-integration/standard/
 * - React Native: https://razorpay.com/docs/payments/payment-gateway/react-native-integration/standard/
 */

import { Alert, Linking, Platform } from "react-native";
import { useApiMutation, useApiQuery } from "../hooks/useApiQuery";
import {
  parsePaymentMethodInfo,
  PaymentMethodInfo,
  RazorpayPaymentDetails,
} from "./razorpayService";

// ==================== RAZORPAY SDK INITIALIZATION ====================

/**
 * Dynamic import for react-native-razorpay
 * - Web: Uses JavaScript SDK (checkout.js)
 * - Native (Expo Go): Falls back to browser checkout
 * - Native (Dev Build): Uses native Razorpay SDK
 */
let RazorpayCheckout: any = null;

const initializeRazorpaySDK = () => {
  if (Platform.OS === "web") {
    return;
  }

  try {
    const razorpayModule = require("react-native-razorpay");
    RazorpayCheckout = razorpayModule.default;

    // Verify the module is actually loaded correctly
    if (!RazorpayCheckout || typeof RazorpayCheckout.open !== "function") {
      RazorpayCheckout = null;
      return;
    }
  } catch (error) {
    RazorpayCheckout = null;
  }
};

// Initialize on module load
initializeRazorpaySDK();

// ==================== RAZORPAY ERROR CODES ====================

/**
 * Razorpay Error Codes (from native SDKs)
 * Android: com.razorpay.Checkout
 * iOS: RazorpayPaymentCompletionProtocol
 */
export const RAZORPAY_ERROR_CODES = {
  // User Actions
  PAYMENT_CANCELLED: 0, // User pressed back/cancelled
  USER_CANCELLED: 2, // User explicitly cancelled

  // Network Errors
  NETWORK_ERROR: 1, // Network connectivity issue
  TLS_ERROR: 6, // TLS/SSL error

  // Payment Errors
  PAYMENT_FAILED: 3, // Payment failed at bank/provider
  INVALID_OPTIONS: 4, // Invalid checkout options
  BAD_REQUEST: 5, // Bad request to Razorpay

  // External Wallet
  EXTERNAL_WALLET_SELECTED: 10, // User selected external wallet

  // Web-specific
  SCRIPT_LOAD_FAILED: 100, // Failed to load checkout.js
  VERIFICATION_PENDING: 101, // Payment done but verification pending
} as const;

/**
 * Human-readable error messages for each error code
 */
export const RAZORPAY_ERROR_MESSAGES: Record<number, string> = {
  [RAZORPAY_ERROR_CODES.PAYMENT_CANCELLED]:
    "Payment was cancelled. Your order is saved.",
  [RAZORPAY_ERROR_CODES.NETWORK_ERROR]:
    "Network error. Please check your connection and try again.",
  [RAZORPAY_ERROR_CODES.USER_CANCELLED]:
    "Payment cancelled. You can retry from your orders page.",
  [RAZORPAY_ERROR_CODES.PAYMENT_FAILED]:
    "Payment failed. Please try again or use a different payment method.",
  [RAZORPAY_ERROR_CODES.INVALID_OPTIONS]:
    "Payment configuration error. Please contact support.",
  [RAZORPAY_ERROR_CODES.BAD_REQUEST]:
    "Invalid payment request. Please try again.",
  [RAZORPAY_ERROR_CODES.TLS_ERROR]:
    "Secure connection failed. Please try again.",
  [RAZORPAY_ERROR_CODES.EXTERNAL_WALLET_SELECTED]:
    "Redirecting to external wallet...",
  [RAZORPAY_ERROR_CODES.SCRIPT_LOAD_FAILED]:
    "Failed to load payment gateway. Please refresh and try again.",
  [RAZORPAY_ERROR_CODES.VERIFICATION_PENDING]:
    "Payment verification pending. Please check your orders page.",
};

/**
 * Parse Razorpay error response
 * Handles different error formats from Android and iOS SDKs
 */
export const parseRazorpayError = (
  error: any
): {
  code: number;
  description: string;
  isCancelled: boolean;
  isNetworkError: boolean;
} => {
  // Default values - use explicit number type to avoid literal type inference
  let code: number = RAZORPAY_ERROR_CODES.PAYMENT_FAILED;
  let description = "Payment failed. Please try again.";
  let isCancelled = false;
  let isNetworkError = false;

  if (!error) {
    return { code, description, isCancelled, isNetworkError };
  }

  // Format 1: { code: number, description: string } (Android/iOS native)
  if (typeof error.code !== "undefined") {
    code =
      typeof error.code === "number"
        ? error.code
        : parseInt(error.code) || code;
    description = error.description || error.message || description;
  }

  // Format 2: { error: { code, description, source, step, reason } } (Web/API)
  else if (error.error && typeof error.error === "object") {
    code = error.error.code || code;
    description = error.error.description || error.error.reason || description;
  }

  // Format 3: Standard Error object
  else if (error instanceof Error) {
    description = error.message;
  }

  // Format 4: String error
  else if (typeof error === "string") {
    description = error;
  }

  // Determine if user cancelled
  isCancelled =
    code === RAZORPAY_ERROR_CODES.PAYMENT_CANCELLED ||
    code === RAZORPAY_ERROR_CODES.USER_CANCELLED ||
    description?.toLowerCase()?.includes("cancelled") ||
    description?.toLowerCase()?.includes("canceled") ||
    description?.toLowerCase()?.includes("dismissed") ||
    description?.toLowerCase()?.includes("user closed") ||
    description?.toLowerCase()?.includes("payment cancelled");

  // Determine if network error
  isNetworkError =
    code === RAZORPAY_ERROR_CODES.NETWORK_ERROR ||
    code === RAZORPAY_ERROR_CODES.TLS_ERROR ||
    description?.toLowerCase()?.includes("network") ||
    description?.toLowerCase()?.includes("internet") ||
    description?.toLowerCase()?.includes("connection");

  return { code, description, isCancelled, isNetworkError };
};

// ==================== INTERFACES ====================

export interface PaymentMethod {
  id: string;
  name: string;
  type: "card" | "upi" | "wallet" | "netbanking" | "cod";
  icon: string;
  enabled: boolean;
}

export interface PaymentOptions {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
  theme?: {
    color?: string;
  };
  method?: {
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
    upi?: boolean;
  };
}

export interface CreateOrderRequest {
  userId: string;
  cartIds: string[];
  addressId: string;
  products: { productId: string; quantity: number; price: number }[];
  netValue?: number;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  message?: string;
}

export interface PaymentRequest {
  // Order creation data
  userId: string;
  cartIds: string[];
  addressId: string;
  netValue: number;

  // Payment processing data
  amount: number;
  currency: string;
  subtotal?: number;
  shippingCharges?: number;
  couponDiscount?: number;
  couponCode?: string | null;
  cartItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: "razorpay" | "cod";
  // For retry payments
  orderId?: string;
}

export interface RazorpayOrderResponse {
  id?: string;
  razorpay_order_id?: string;
  amount: number;
  amount_due?: number;
  amount_paid?: number;
  attempts?: number;
  created_at?: number;
  currency: string;
  entity?: string;
  notes?: any[];
  offer_id?: string | null;
  receipt?: string | null;
  status?: string;
  key_id?: string;
  success?: boolean;
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
  userId: string;
}

export interface PaymentVerificationResponse {
  success?: boolean;
  valid?: boolean;
  message?: string;
  orderId?: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
  errorCode?: number | string;
  errorDescription?: string;
  cancelled?: boolean;
  orderData?: any;
  externalWallet?: string;
}

export interface RazorpayErrorResponse {
  code: number | string;
  description: string;
  source?: string;
  step?: string;
  reason?: string;
  metadata?: {
    order_id?: string;
    payment_id?: string;
  };
}

export interface UPIPaymentOptions {
  amount: number;
  upiId: string;
  merchantName: string;
  transactionNote: string;
  transactionRef: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  method: string;
  status:
    | "pending"
    | "processing"
    | "captured"
    | "failed"
    | "refunded"
    | "cancelled";
  transactionId: string;
  paymentGateway?: string;
  paymentData?: Record<string, any>;
  userId: string;
  idempotencyKey: string;
}

export interface CODOrderResponse {
  success: boolean;
  orderId: string;
  message: string;
}

export interface Order {
  id: string;
  code: string;
  netValue: number;
  createdAt: string;
  addressId: string;
  state: {
    state: string;
    createdAt: string;
    metadata?: {
      refundAmount?: number;
      reason?: string;
      images?: string[];
    };
  }[];
  lines: {
    id: string;
    code: string;
    productId: string;
    quantity: number;
    price: number;
    product?: {
      id: string;
      name: string;
      shortDescriptions: string;
      images?: string[];
      tags?: string[];
    };
  }[];
  address: {
    id: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  payment?: {
    id: string;
    orderId: string;
    transactionId: string;
    method: string;
    methodSummary: string;
    amount: number;
    status: string;
    response: {
      razorpay_order_id: string;
      razorpay_signature: string;
      razorpay_payment_id: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface OrdersResponse {
  data: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: string;
    hasMore: boolean;
    pageSize: number;
  };
  meta: {
    queryTime: string;
    cached: boolean;
  };
}

// Failed payment recovery interface
export interface FailedPaymentData {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  backendOrderId: string;
  amount: number;
  timestamp: string;
  userId: string;
  paymentMethod: string;
  flowType?: string;
}

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate Razorpay response from SDK/checkout
 * As per documentation: validates payment_id, order_id, and signature format
 */
export const validateRazorpayResponse = (
  response: RazorpayResponse
): { valid: boolean; error?: string } => {
  if (!response || typeof response !== "object") {
    return { valid: false, error: "Invalid Razorpay response: not an object" };
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    response;

  // Check presence of all required fields
  if (!razorpay_payment_id) {
    return { valid: false, error: "Missing razorpay_payment_id" };
  }
  if (!razorpay_order_id) {
    return { valid: false, error: "Missing razorpay_order_id" };
  }
  if (!razorpay_signature) {
    return { valid: false, error: "Missing razorpay_signature" };
  }

  // Validate payment_id format: starts with "pay_" and has proper length
  if (
    !razorpay_payment_id.startsWith("pay_") ||
    razorpay_payment_id.length < 14
  ) {
    return {
      valid: false,
      error: `Invalid payment_id format: ${razorpay_payment_id}`,
    };
  }

  // Validate order_id format: starts with "order_" and has proper length
  if (
    !razorpay_order_id.startsWith("order_") ||
    razorpay_order_id.length < 14
  ) {
    return {
      valid: false,
      error: `Invalid order_id format: ${razorpay_order_id}`,
    };
  }

  // Validate signature length (HMAC SHA256 hex = 64 characters)
  if (razorpay_signature.length < 40) {
    return {
      valid: false,
      error: `Invalid signature length: ${razorpay_signature.length}`,
    };
  }

  // Validate IDs contain only alphanumeric and underscore
  const validIdPattern = /^[a-zA-Z0-9_]+$/;
  if (
    !validIdPattern.test(razorpay_payment_id) ||
    !validIdPattern.test(razorpay_order_id)
  ) {
    return {
      valid: false,
      error: "Invalid characters in payment_id or order_id",
    };
  }

  return { valid: true };
};

/**
 * Validate Razorpay options before opening checkout
 * As per documentation: validates key, order_id, and amount
 */
export const validateRazorpayOptions = (options: {
  key: string;
  order_id: string;
  amount: number;
}): { valid: boolean; error?: string } => {
  // Check required parameters
  if (!options.key) {
    return { valid: false, error: "Missing Razorpay key" };
  }

  if (!options.order_id) {
    return { valid: false, error: "Missing order_id" };
  }

  if (!options.amount) {
    return { valid: false, error: "Missing amount" };
  }

  // Validate amount is positive integer
  if (options.amount <= 0) {
    return { valid: false, error: "Invalid payment amount: must be positive" };
  }

  // Amount must be integer (paise, not rupees with decimals)
  if (!Number.isInteger(options.amount)) {
    return { valid: false, error: "Payment amount must be in paise (integer)" };
  }

  // Max amount validation (1 crore = 10 million rupees = 1 billion paise)
  const MAX_AMOUNT_PAISE = 1000000000; // 10 million rupees
  if (options.amount > MAX_AMOUNT_PAISE) {
    return { valid: false, error: "Payment amount exceeds maximum limit" };
  }

  // Validate order_id format
  if (!options.order_id.startsWith("order_")) {
    return { valid: false, error: "Invalid order_id format" };
  }

  return { valid: true };
};

// ==================== RAZORPAY CONFIG ====================

// Get Razorpay key from environment or config
const RAZORPAY_KEY_ID =
  process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_key_here";

// ==================== API HOOKS ====================

// Hook to create order in backend DB
export const useCreateOrder = () => {
  return useApiMutation<CreateOrderResponse, CreateOrderRequest>("/order", {
    successMessage: "Order created successfully",
    errorMessage: "Failed to create order",
  });
};

// Hook to create Razorpay order
export const useCreateRazorpayOrder = () => {
  return useApiMutation<RazorpayOrderResponse, PaymentRequest>(
    "/razorpay/order",
    {
      successMessage: "Razorpay order created successfully",
      errorMessage: "Failed to create Razorpay order",
    }
  );
};

// Hook to verify Razorpay payment
export const useVerifyRazorpayPayment = () => {
  return useApiMutation<
    PaymentVerificationResponse,
    PaymentVerificationRequest
  >("/razorpay/verify", {
    successMessage: "Payment verified successfully",
    errorMessage: "Payment verification failed",
  });
};

// Hook to create payment record
export const useCreatePayment = () => {
  return useApiMutation<
    { success: boolean; message: string },
    CreatePaymentRequest
  >("/payment", {
    method: "POST",
    successMessage: "Payment created successfully",
    errorMessage: "Failed to create payment",
  });
};

// Hook to get user orders
export const useGetUserOrders = (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  return useApiQuery<OrdersResponse>(
    `/order?userId=${userId}&page=${page}&limit=${limit}`,
    {
      successMessage: "",
      errorMessage: "Failed to load orders",
      enabled: !!userId,
    }
  );
};

// Hook to get order details
export const useGetOrderDetails = (orderId: string) => {
  return useApiQuery<Order>(`/order/${orderId}`, {
    successMessage: "",
    errorMessage: "Failed to load order details",
    enabled: !!orderId,
  });
};

// ==================== UTILITY FUNCTIONS ====================

// Store failed payment for recovery
export const storeFailedPayment = async (
  paymentData: FailedPaymentData
): Promise<void> => {
  try {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    const storageKey = `failed_payment_${paymentData.razorpayPaymentId}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(paymentData));
  } catch (error) {
    console.error("Failed to store payment data:", error);
  }
};

// Get failed payments
export const getFailedPayments = async (): Promise<FailedPaymentData[]> => {
  const failedPayments: FailedPaymentData[] = [];
  try {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    const keys = await AsyncStorage.getAllKeys();
    const failedKeys = keys.filter((key: string) =>
      key.startsWith("failed_payment_")
    );

    for (const key of failedKeys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        failedPayments.push(JSON.parse(data));
      }
    }
  } catch (error) {
    console.error("Failed to retrieve failed payments:", error);
  }
  return failedPayments;
};

// Remove failed payment after recovery
export const removeFailedPayment = async (
  razorpayPaymentId: string
): Promise<void> => {
  try {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    const storageKey = `failed_payment_${razorpayPaymentId}`;
    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Failed to remove payment data:", error);
  }
};

// Get payment method details from payment ID
export const getPaymentMethodDetails = async (
  paymentId: string,
  paymentDetails?: RazorpayPaymentDetails
): Promise<{
  type: string;
  displayName: string;
  rawPaymentId: string;
  methodInfo?: PaymentMethodInfo;
}> => {
  // If we have detailed payment info, parse it
  if (paymentDetails) {
    const methodInfo = parsePaymentMethodInfo(paymentDetails);
    return {
      type: methodInfo.type,
      displayName: methodInfo.displayName,
      rawPaymentId: paymentId,
      methodInfo,
    };
  }

  // Fallback: Basic info from payment ID
  let type = "unknown";
  let displayName = "Razorpay Payment";

  if (paymentId.startsWith("pay_")) {
    displayName = `Online Payment (${paymentId.substring(0, 12)}...)`;
    type = "razorpay";
  }

  return {
    type,
    displayName,
    rawPaymentId: paymentId,
  };
};

// ==================== PAYMENT SERVICE CLASS ====================

class PaymentService {
  private razorpayKey: string;

  constructor(razorpayKey: string) {
    this.razorpayKey = razorpayKey;
  }

  /**
   * Check if native Razorpay SDK is available
   */
  isNativeSDKAvailable(): boolean {
    return (
      Platform.OS !== "web" &&
      RazorpayCheckout !== null &&
      typeof RazorpayCheckout.open === "function"
    );
  }

  /**
   * Get available payment methods
   */
  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: "razorpay",
        name: "Pay Online",
        type: "card",
        icon: "card",
        enabled: true,
      },
      {
        id: "upi",
        name: "UPI",
        type: "upi",
        icon: "phone-portrait",
        enabled: true,
      },
      {
        id: "card",
        name: "Credit/Debit Card",
        type: "card",
        icon: "card",
        enabled: true,
      },
      {
        id: "netbanking",
        name: "Net Banking",
        type: "netbanking",
        icon: "business",
        enabled: true,
      },
      {
        id: "wallet",
        name: "Wallets",
        type: "wallet",
        icon: "wallet",
        enabled: true,
      },
      {
        id: "cod",
        name: "Cash on Delivery",
        type: "cod",
        icon: "cash",
        enabled: true,
      },
    ];
  }

  /**
   * Process payment using Razorpay SDK
   * Main entry point for payment processing
   * Follows documentation: validates options, opens checkout, validates response
   */
  async processRazorpayPayment(
    razorpayOrder: RazorpayOrderResponse,
    prefill: { name?: string; email?: string; contact?: string },
    onExternalWallet?: (walletName: string) => void
  ): Promise<PaymentResult> {
    try {
      // Get order ID from response (API may return either id or razorpay_order_id)
      const orderId = razorpayOrder.razorpay_order_id || razorpayOrder.id;

      if (!orderId) {
        console.error(
          "❌ Invalid Razorpay order - missing order ID:",
          razorpayOrder
        );
        return {
          success: false,
          error: "Invalid Razorpay order - no order ID",
          errorCode: RAZORPAY_ERROR_CODES.INVALID_OPTIONS,
        };
      }

      // Build checkout options as per Razorpay documentation
      const options = {
        key: this.razorpayKey,
        amount: razorpayOrder.amount, // Amount in paise
        currency: razorpayOrder.currency || "INR",
        order_id: orderId,
        name: "Tishyaa Jewels",
        description: "Payment for your order",
        image: "https://www.tishyaajewels.com/logo.png",
        prefill: {
          name: prefill.name || "",
          email: prefill.email || "",
          contact: prefill.contact || "",
        },
        theme: { color: "#C9A961" }, // Brand color
        retry: {
          enabled: true,
          max_count: 3,
        },
        timeout: 300, // 5 minutes
        remember_customer: true,
        // Enable all payment methods
        method: {
          card: true,
          netbanking: true,
          wallet: true,
          upi: true,
          emi: false,
        },
      };

      // Validate options before opening checkout (as per documentation)
      const validation = validateRazorpayOptions({
        key: options.key,
        order_id: options.order_id,
        amount: options.amount,
      });

      if (!validation.valid) {
        console.error(
          "❌ Razorpay options validation failed:",
          validation.error
        );
        return {
          success: false,
          error: validation.error || "Invalid payment configuration",
          errorCode: RAZORPAY_ERROR_CODES.INVALID_OPTIONS,
        };
      }

      // Route to appropriate checkout method based on platform
      if (Platform.OS === "web") {
        return await this.openWebSDKCheckout(options, orderId);
      }

      // Check if native Razorpay SDK is available (for native platforms)
      if (!this.isNativeSDKAvailable()) {
        return await this.openBrowserCheckout(options, orderId);
      }
      return await this.openNativeCheckout(options, onExternalWallet);
    } catch (error: any) {
      console.error("❌ Unexpected error in processRazorpayPayment:", error);
      const parsed = parseRazorpayError(error);
      return {
        success: false,
        error: parsed.description,
        errorCode: parsed.code,
        cancelled: parsed.isCancelled,
      };
    }
  }

  /**
   * Open native Razorpay checkout (Android/iOS)
   */
  private async openNativeCheckout(
    options: any,
    onExternalWallet?: (walletName: string) => void
  ): Promise<PaymentResult> {
    return new Promise((resolve) => {
      // Set up external wallet listener if callback provided and SDK supports it
      if (onExternalWallet && RazorpayCheckout.onExternalWalletSelection) {
        RazorpayCheckout.onExternalWalletSelection((data: any) => {
          onExternalWallet(
            data.external_wallet || data.walletName || "Unknown"
          );
        });
      }

      RazorpayCheckout.open(options)
        .then((data: RazorpayResponse) => {
          // Validate response format (as per documentation)
          const validation = validateRazorpayResponse(data);
          if (!validation.valid) {
            console.error("❌ Invalid response format:", validation.error);
            resolve({
              success: false,
              error: "Invalid payment response. Please contact support.",
              errorCode: RAZORPAY_ERROR_CODES.PAYMENT_FAILED,
            });
            return;
          }

          resolve({
            success: true,
            paymentId: data.razorpay_payment_id,
            orderId: data.razorpay_order_id,
            signature: data.razorpay_signature,
          });
        })
        .catch((error: any) => {
          const parsed = parseRazorpayError(error);

          if (parsed.isCancelled) {
            resolve({
              success: false,
              cancelled: true,
              error:
                RAZORPAY_ERROR_MESSAGES[RAZORPAY_ERROR_CODES.PAYMENT_CANCELLED],
              errorCode: RAZORPAY_ERROR_CODES.PAYMENT_CANCELLED,
            });
            return;
          }

          if (parsed.isNetworkError) {
            resolve({
              success: false,
              error:
                RAZORPAY_ERROR_MESSAGES[RAZORPAY_ERROR_CODES.NETWORK_ERROR],
              errorCode: RAZORPAY_ERROR_CODES.NETWORK_ERROR,
            });
            return;
          }

          resolve({
            success: false,
            error:
              parsed.description ||
              RAZORPAY_ERROR_MESSAGES[parsed.code] ||
              "Payment failed",
            errorCode: parsed.code,
          });
        });
    });
  }

  /**
   * Generate UPI payment link
   */
  generateUPILink(options: UPIPaymentOptions): string {
    const { amount, upiId, merchantName, transactionNote, transactionRef } =
      options;

    const params = new URLSearchParams({
      pa: upiId,
      pn: merchantName,
      am: amount.toString(),
      tn: transactionNote,
      tr: transactionRef,
      cu: "INR",
    });

    return `upi://pay?${params.toString()}`;
  }

  /**
   * Open UPI payment app
   */
  async openUPIPayment(options: UPIPaymentOptions): Promise<PaymentResult> {
    try {
      const upiLink = this.generateUPILink(options);
      const canOpen = await Linking.canOpenURL(upiLink);

      if (canOpen) {
        await Linking.openURL(upiLink);
        return {
          success: true,
          paymentId: "upi_" + options.transactionRef,
          orderId: options.transactionRef,
        };
      } else {
        return {
          success: false,
          error: "No UPI app found on this device",
          errorCode: RAZORPAY_ERROR_CODES.PAYMENT_FAILED,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to open UPI payment app",
        errorCode: RAZORPAY_ERROR_CODES.PAYMENT_FAILED,
      };
    }
  }

  /**
   * Open Razorpay web checkout (fallback when native SDK is not available)
   * Uses Razorpay JavaScript SDK on web, or browser redirect on native
   */
  async openWebCheckout(options: any, orderId: string): Promise<PaymentResult> {
    // Check if we're on web platform
    if (Platform.OS === "web") {
      return this.openWebSDKCheckout(options, orderId);
    }

    // For native platforms without SDK (Expo Go), use browser redirect
    return this.openBrowserCheckout(options, orderId);
  }

  /**
   * Load and use Razorpay JavaScript SDK on web
   */
  private async openWebSDKCheckout(
    options: any,
    orderId: string
  ): Promise<PaymentResult> {
    return new Promise((resolve) => {
      // Load Razorpay script if not already loaded
      const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((scriptResolve) => {
          if (typeof window !== "undefined" && (window as any).Razorpay) {
            scriptResolve(true);
            return;
          }

          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => {
            scriptResolve(true);
          };
          script.onerror = () => {
            scriptResolve(false);
          };
          document.body.appendChild(script);
        });
      };

      loadRazorpayScript().then((loaded) => {
        if (!loaded) {
          resolve({
            success: false,
            error:
              RAZORPAY_ERROR_MESSAGES[RAZORPAY_ERROR_CODES.SCRIPT_LOAD_FAILED],
            errorCode: RAZORPAY_ERROR_CODES.SCRIPT_LOAD_FAILED,
          });
          return;
        }

        try {
          const razorpayOptions = {
            key: options.key,
            amount: options.amount,
            currency: options.currency || "INR",
            name: options.name || "Tishyaa Jewels",
            description: options.description || "Payment",
            order_id: orderId,
            prefill: {
              name: options.prefill?.name || "",
              email: options.prefill?.email || "",
              contact: options.prefill?.contact || "",
            },
            theme: {
              color: options.theme?.color || "#C9A961",
            },
            handler: (response: any) => {
              const validation = validateRazorpayResponse(response);
              if (!validation.valid) {
                console.error("❌ Invalid response:", validation.error);
                resolve({
                  success: false,
                  error: "Invalid payment response. Please contact support.",
                  errorCode: RAZORPAY_ERROR_CODES.PAYMENT_FAILED,
                });
                return;
              }

              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
            },
            modal: {
              ondismiss: () => {
                resolve({
                  success: false,
                  cancelled: true,
                  error:
                    RAZORPAY_ERROR_MESSAGES[
                      RAZORPAY_ERROR_CODES.PAYMENT_CANCELLED
                    ],
                  errorCode: RAZORPAY_ERROR_CODES.PAYMENT_CANCELLED,
                });
              },
              escape: true,
              animation: true,
              backdropclose: false,
            },
          };

          const razorpay = new (window as any).Razorpay(razorpayOptions);

          razorpay.on("payment.failed", (response: any) => {
            const parsed = parseRazorpayError(response.error);
            resolve({
              success: false,
              error: parsed.description || "Payment failed",
              errorCode: parsed.code,
              cancelled: parsed.isCancelled,
            });
          });

          razorpay.open();
        } catch (error: any) {
          resolve({
            success: false,
            error: error.message || "Failed to open payment. Please try again.",
            errorCode: RAZORPAY_ERROR_CODES.PAYMENT_FAILED,
          });
        }
      });
    });
  }

  /**
   * Open browser-based checkout for native platforms without SDK (Expo Go)
   */
  private async openBrowserCheckout(
    options: any,
    orderId: string
  ): Promise<PaymentResult> {
    return new Promise((resolve) => {
      Alert.alert(
        "Payment",
        "You will be redirected to complete your payment.\n\n⚠️ For the best experience, please use a development build.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              resolve({
                success: false,
                cancelled: true,
                error:
                  RAZORPAY_ERROR_MESSAGES[
                    RAZORPAY_ERROR_CODES.PAYMENT_CANCELLED
                  ],
                errorCode: RAZORPAY_ERROR_CODES.PAYMENT_CANCELLED,
              });
            },
          },
          {
            text: "Continue",
            onPress: async () => {
              try {
                // Build payment URL
                const paymentUrl = `https://www.tishyaajewels.com/payment?orderId=${orderId}&amount=${options.amount}`;

                const canOpen = await Linking.canOpenURL(paymentUrl);
                if (canOpen) {
                  await Linking.openURL(paymentUrl);

                  // Show verification prompt
                  Alert.alert(
                    "Payment Initiated",
                    "Complete your payment in the browser. Tap 'Verify' once done.",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => {
                          resolve({
                            success: false,
                            cancelled: true,
                            error: "Payment cancelled",
                            errorCode: RAZORPAY_ERROR_CODES.PAYMENT_CANCELLED,
                          });
                        },
                      },
                      {
                        text: "Verify Payment",
                        onPress: () => {
                          resolve({
                            success: false,
                            error:
                              RAZORPAY_ERROR_MESSAGES[
                                RAZORPAY_ERROR_CODES.VERIFICATION_PENDING
                              ],
                            errorCode:
                              RAZORPAY_ERROR_CODES.VERIFICATION_PENDING,
                          });
                        },
                      },
                    ]
                  );
                } else {
                  resolve({
                    success: false,
                    error: "Cannot open payment page",
                    errorCode: RAZORPAY_ERROR_CODES.PAYMENT_FAILED,
                  });
                }
              } catch (error: any) {
                resolve({
                  success: false,
                  error: "Failed to open payment page",
                  errorCode: RAZORPAY_ERROR_CODES.PAYMENT_FAILED,
                });
              }
            },
          },
        ]
      );
    });
  }

  /**
   * Handle payment success - show success alert
   */
  handlePaymentSuccess(
    result: PaymentResult,
    onSuccess?: (result: PaymentResult) => void
  ) {
    if (result.success) {
      Alert.alert(
        "Payment Successful!",
        "Your payment has been processed successfully.",
        [{ text: "OK", onPress: () => onSuccess?.(result) }]
      );
    }
  }

  /**
   * Handle payment failure - show error with retry option
   */
  handlePaymentFailure(
    result: PaymentResult,
    onRetry?: () => void,
    onCancel?: () => void
  ) {
    if (!result.success && !result.cancelled) {
      Alert.alert(
        "Payment Failed",
        result.error ||
          RAZORPAY_ERROR_MESSAGES[RAZORPAY_ERROR_CODES.PAYMENT_FAILED],
        [
          { text: "Try Again", onPress: onRetry },
          { text: "Cancel", style: "cancel", onPress: onCancel },
        ]
      );
    }
  }

  /**
   * Handle payment cancellation
   */
  handlePaymentCancellation(
    result: PaymentResult,
    onRetry?: () => void,
    onCancel?: () => void
  ) {
    if (result.cancelled) {
      Alert.alert(
        "Payment Cancelled",
        RAZORPAY_ERROR_MESSAGES[RAZORPAY_ERROR_CODES.PAYMENT_CANCELLED],
        [
          { text: "Retry Now", onPress: onRetry },
          { text: "OK", style: "cancel", onPress: onCancel },
        ]
      );
    }
  }
}

// Initialize with Razorpay key
export const paymentService = new PaymentService(RAZORPAY_KEY_ID);
export default paymentService;

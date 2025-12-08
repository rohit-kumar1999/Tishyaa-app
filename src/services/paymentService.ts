import { Alert, Linking } from "react-native";
// Note: You'll need to install and configure react-native-razorpay
// import RazorpayCheckout from 'react-native-razorpay';

export interface PaymentMethod {
  id: string;
  name: string;
  type: "card" | "upi" | "wallet" | "netbanking";
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

export interface PaymentRequest {
  amount: number;
  currency: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
  errorCode?: string;
  errorDescription?: string;
}

export interface UPIPaymentOptions {
  amount: number;
  upiId: string;
  merchantName: string;
  transactionNote: string;
  transactionRef: string;
}

class PaymentService {
  private razorpayKey: string;

  constructor(razorpayKey: string) {
    this.razorpayKey = razorpayKey;
  }

  /**
   * Get available payment methods
   */
  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: "card",
        name: "Credit/Debit Card",
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
        id: "gpay",
        name: "Google Pay",
        type: "wallet",
        icon: "logo-google",
        enabled: true,
      },
      {
        id: "phonepe",
        name: "PhonePe",
        type: "wallet",
        icon: "phone-portrait",
        enabled: true,
      },
      {
        id: "paytm",
        name: "Paytm",
        type: "wallet",
        icon: "wallet",
        enabled: true,
      },
      {
        id: "netbanking",
        name: "Net Banking",
        type: "netbanking",
        icon: "business",
        enabled: true,
      },
    ];
  }

  /**
   * Process payment using Razorpay
   */
  async processRazorpayPayment(
    options: PaymentOptions
  ): Promise<PaymentResult> {
    try {
      // Note: Uncomment when react-native-razorpay is properly installed
      /*
      const razorpayOptions = {
        description: options.description,
        image: 'https://your-app-logo-url.png',
        currency: options.currency,
        key: this.razorpayKey,
        amount: options.amount * 100, // Amount in paise
        order_id: options.orderId,
        name: 'Tishyaa Jewels',
        prefill: options.prefill || {},
        theme: options.theme || { color: '#C9A961' },
        method: options.method || {
          card: true,
          netbanking: true,
          wallet: true,
          upi: true,
        },
      };

      const data = await RazorpayCheckout.open(razorpayOptions);
      
      return {
        success: true,
        paymentId: data.razorpay_payment_id,
        orderId: data.razorpay_order_id,
        signature: data.razorpay_signature,
      };
      */

      // Temporary mock response for development
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            paymentId: "pay_mock_" + Date.now(),
            orderId: options.orderId,
            signature: "mock_signature",
          });
        }, 2000);
      });
    } catch (error: any) {
      console.error("Razorpay payment error:", error);

      return {
        success: false,
        error: error.error?.description || "Payment failed",
        errorCode: error.error?.code,
        errorDescription: error.error?.description,
      };
    }
  }

  /**
   * Generate UPI payment link
   */
  generateUPILink(options: UPIPaymentOptions): string {
    const { amount, upiId, merchantName, transactionNote, transactionRef } =
      options;

    const params = new URLSearchParams({
      pa: upiId, // Payee address (UPI ID)
      pn: merchantName, // Payee name
      am: amount.toString(), // Amount
      tn: transactionNote, // Transaction note
      tr: transactionRef, // Transaction reference
      cu: "INR", // Currency
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

        // Return pending status since we can't directly get the result
        return {
          success: true,
          paymentId: "upi_" + options.transactionRef,
          orderId: options.transactionRef,
        };
      } else {
        throw new Error("No UPI app found");
      }
    } catch (error) {
      console.error("UPI payment error:", error);
      return {
        success: false,
        error: "Failed to open UPI payment app",
      };
    }
  }

  /**
   * Open Google Pay
   */
  async openGooglePay(options: UPIPaymentOptions): Promise<PaymentResult> {
    try {
      const gpayLink = this.generateUPILink(options);
      const gpayUrl = `tez://upi/pay?${gpayLink.split("?")[1]}`;

      const canOpen = await Linking.canOpenURL(gpayUrl);

      if (canOpen) {
        await Linking.openURL(gpayUrl);
        return {
          success: true,
          paymentId: "gpay_" + options.transactionRef,
          orderId: options.transactionRef,
        };
      } else {
        // Fallback to regular UPI link
        return this.openUPIPayment(options);
      }
    } catch (error) {
      console.error("Google Pay error:", error);
      return {
        success: false,
        error: "Failed to open Google Pay",
      };
    }
  }

  /**
   * Open PhonePe
   */
  async openPhonePe(options: UPIPaymentOptions): Promise<PaymentResult> {
    try {
      const upiLink = this.generateUPILink(options);
      const phonepeUrl = `phonepe://pay?${upiLink.split("?")[1]}`;

      const canOpen = await Linking.canOpenURL(phonepeUrl);

      if (canOpen) {
        await Linking.openURL(phonepeUrl);
        return {
          success: true,
          paymentId: "phonepe_" + options.transactionRef,
          orderId: options.transactionRef,
        };
      } else {
        // Fallback to regular UPI link
        return this.openUPIPayment(options);
      }
    } catch (error) {
      console.error("PhonePe error:", error);
      return {
        success: false,
        error: "Failed to open PhonePe",
      };
    }
  }

  /**
   * Open Paytm
   */
  async openPaytm(options: UPIPaymentOptions): Promise<PaymentResult> {
    try {
      const upiLink = this.generateUPILink(options);
      const paytmUrl = `paytmmp://pay?${upiLink.split("?")[1]}`;

      const canOpen = await Linking.canOpenURL(paytmUrl);

      if (canOpen) {
        await Linking.openURL(paytmUrl);
        return {
          success: true,
          paymentId: "paytm_" + options.transactionRef,
          orderId: options.transactionRef,
        };
      } else {
        // Fallback to regular UPI link
        return this.openUPIPayment(options);
      }
    } catch (error) {
      console.error("Paytm error:", error);
      return {
        success: false,
        error: "Failed to open Paytm",
      };
    }
  }

  /**
   * Process payment based on selected method
   */
  async processPayment(
    method: string,
    paymentOptions: PaymentOptions,
    upiOptions?: UPIPaymentOptions
  ): Promise<PaymentResult> {
    try {
      switch (method) {
        case "card":
        case "netbanking":
          return await this.processRazorpayPayment({
            ...paymentOptions,
            method: {
              card: method === "card",
              netbanking: method === "netbanking",
              wallet: false,
              upi: false,
            },
          });

        case "upi":
          if (!upiOptions) {
            throw new Error("UPI options required");
          }
          return await this.openUPIPayment(upiOptions);

        case "gpay":
          if (!upiOptions) {
            throw new Error("UPI options required");
          }
          return await this.openGooglePay(upiOptions);

        case "phonepe":
          if (!upiOptions) {
            throw new Error("UPI options required");
          }
          return await this.openPhonePe(upiOptions);

        case "paytm":
          if (!upiOptions) {
            throw new Error("UPI options required");
          }
          return await this.openPaytm(upiOptions);

        default:
          // Default to Razorpay with all methods enabled
          return await this.processRazorpayPayment(paymentOptions);
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment failed",
      };
    }
  }

  /**
   * Verify payment signature (for Razorpay)
   */
  verifyPaymentSignature(
    paymentId: string,
    orderId: string,
    signature: string,
    keySecret: string
  ): boolean {
    try {
      // Note: In production, this should be done on your backend
      const crypto = require("crypto");
      const body = orderId + "|" + paymentId;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(body.toString())
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }

  /**
   * Handle payment success
   */
  handlePaymentSuccess(
    result: PaymentResult,
    onSuccess?: (result: PaymentResult) => void
  ) {
    if (result.success) {
      Alert.alert(
        "Payment Successful!",
        "Your payment has been processed successfully.",
        [
          {
            text: "OK",
            onPress: () => onSuccess?.(result),
          },
        ]
      );
    }
  }

  /**
   * Handle payment failure
   */
  handlePaymentFailure(
    result: PaymentResult,
    onFailure?: (result: PaymentResult) => void
  ) {
    if (!result.success) {
      Alert.alert(
        "Payment Failed",
        result.error || "Something went wrong. Please try again.",
        [
          {
            text: "Try Again",
            onPress: () => onFailure?.(result),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    }
  }

  /**
   * Get saved payment methods (for future implementation)
   */
  async getSavedPaymentMethods(): Promise<PaymentMethod[]> {
    // This would typically fetch from your backend
    // For now, return empty array
    return [];
  }

  /**
   * Save payment method (for future implementation)
   */
  async savePaymentMethod(method: PaymentMethod): Promise<boolean> {
    // This would typically save to your backend
    // For now, return true
    return true;
  }
}

// Initialize with your Razorpay key
export const paymentService = new PaymentService("rzp_test_your_key_here");
export default paymentService;

// Razorpay Payment Details Service
// This service fetches detailed payment information from Razorpay API

export interface RazorpayPaymentDetails {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string; // "card", "netbanking", "wallet", "upi"
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, any>;
  fee: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  acquirer_data: {
    auth_code?: string;
    transaction_id?: string;
    rrn?: string;
    upi_transaction_id?: string;
  };
  created_at: number;
  card?: {
    id: string;
    entity: string;
    name: string;
    last4: string;
    network: string; // "Visa", "MasterCard", "Maestro", "RuPay"
    type: string; // "debit", "credit"
    issuer: string;
    international: boolean;
    emi: boolean;
    sub_type: string;
    token_iin?: string;
  };
  upi?: {
    vpa: string;
  };
}

export interface PaymentMethodInfo {
  type: "card" | "upi" | "netbanking" | "wallet" | "unknown";
  displayName: string;
  details: {
    // Card details
    cardNetwork?: string;
    cardType?: string;
    cardLast4?: string;
    cardIssuer?: string;

    // UPI details
    upiVpa?: string;
    upiApp?: string;

    // Net banking details
    bankName?: string;

    // Wallet details
    walletProvider?: string;

    // Common details
    paymentId: string;
    amount: number;
    status: string;
  };
}

// Extract UPI app name from VPA
const getUpiAppFromVpa = (vpa: string): string => {
  if (!vpa) return "UPI";

  const domain = vpa.split("@")[1]?.toLowerCase();
  const upiApps: Record<string, string> = {
    paytm: "Paytm",
    ybl: "PhonePe",
    okaxis: "Google Pay",
    okhdfc: "Google Pay",
    oksbi: "Google Pay",
    okicici: "Google Pay",
    okhdfcbank: "Google Pay",
    okbizaxis: "Google Pay",
    ibl: "PhonePe",
    axl: "PhonePe",
    apl: "Amazon Pay",
    fbl: "Facebook Pay",
    jupiteraxis: "Jupiter",
    waaxis: "WhatsApp Pay",
    wahdfcbank: "WhatsApp Pay",
    waicici: "WhatsApp Pay",
    wasbi: "WhatsApp Pay",
    cred: "CRED Pay",
    credpay: "CRED Pay",
    bharatpe: "BharatPe",
    slice: "Slice Pay",
    uni: "Uni Pay",
    mobikwik: "MobiKwik",
    freecharge: "FreeCharge",
    airtel: "Airtel Payments Bank",
    jiomoney: "JioMoney",
  };

  return upiApps[domain] || "UPI";
};

// Parse Razorpay payment details into user-friendly format
export const parsePaymentMethodInfo = (
  paymentDetails: RazorpayPaymentDetails
): PaymentMethodInfo => {
  const { method, amount, status, id } = paymentDetails;

  switch (method) {
    case "card":
      const cardNetwork = paymentDetails.card?.network || "Card";
      const cardLast4 = paymentDetails.card?.last4;
      const cardType = paymentDetails.card?.type;
      const cardIssuer = paymentDetails.card?.issuer;

      let cardDisplayName = cardNetwork;
      if (cardLast4) {
        cardDisplayName = `${cardNetwork} ending with ${cardLast4}`;
      }
      if (cardType) {
        cardDisplayName += ` (${
          cardType.charAt(0).toUpperCase() + cardType.slice(1)
        })`;
      }

      return {
        type: "card",
        displayName: cardDisplayName,
        details: {
          cardNetwork,
          cardType,
          cardLast4,
          cardIssuer,
          paymentId: id,
          amount,
          status,
        },
      };

    case "upi":
      const upiVpa = paymentDetails.vpa || paymentDetails.upi?.vpa;
      const upiApp = upiVpa ? getUpiAppFromVpa(upiVpa) : "UPI";

      let upiDisplayName = "UPI Pay";
      if (upiApp && upiApp !== "UPI") {
        upiDisplayName = `UPI Pay via ${upiApp}`;
      }

      return {
        type: "upi",
        displayName: upiDisplayName,
        details: {
          upiVpa: upiVpa || undefined,
          upiApp: upiApp,
          paymentId: id,
          amount,
          status,
        },
      };

    case "netbanking":
      const bankName = paymentDetails.bank;
      let netbankingDisplayName = "Net Banking";
      if (bankName) {
        netbankingDisplayName = `NetBanking-${bankName.toUpperCase()}`;
      }

      return {
        type: "netbanking",
        displayName: netbankingDisplayName,
        details: {
          bankName: bankName || undefined,
          paymentId: id,
          amount,
          status,
        },
      };

    case "wallet":
      const walletProvider = paymentDetails.wallet;
      let walletDisplayName = "Digital Wallet";
      if (walletProvider) {
        // Handle specific wallet providers
        switch (walletProvider.toLowerCase()) {
          case "paytm":
            walletDisplayName = "Paytm Wallet";
            break;
          case "mobikwik":
            walletDisplayName = "MobiKwik Wallet";
            break;
          case "olamoney":
            walletDisplayName = "Ola Money";
            break;
          case "freecharge":
            walletDisplayName = "FreeCharge";
            break;
          case "amazonpay":
            walletDisplayName = "Amazon Pay";
            break;
          case "jio":
            walletDisplayName = "JioMoney";
            break;
          case "credpay":
          case "cred":
            walletDisplayName = "Cred Pay";
            break;
          default:
            walletDisplayName = `${walletProvider} Wallet`;
        }
      }

      return {
        type: "wallet",
        displayName: walletDisplayName,
        details: {
          walletProvider: walletProvider || undefined,
          paymentId: id,
          amount,
          status,
        },
      };

    default:
      return {
        type: "unknown",
        displayName: "Online Payment",
        details: {
          paymentId: id,
          amount,
          status,
        },
      };
  }
};

// Enhanced payment method info extraction
export const getPaymentMethodInfo = (
  payment: any
): PaymentMethodInfo | null => {
  if (!payment) return null;

  // Implementation would need actual payment data parsing
  // This is a placeholder that would need backend API integration
  return null;
};

// Helper function to generate payment method display text
export const getPaymentMethodDisplay = (
  methodInfo: PaymentMethodInfo
): string => {
  // Use the enhanced displayName which already includes proper formatting
  return methodInfo.displayName;
};

// Helper function to get payment method icon name for Ionicons
export const getPaymentMethodIconName = (
  methodInfo: PaymentMethodInfo
): string => {
  const { type, details } = methodInfo;

  switch (type) {
    case "card":
      return "card";

    case "upi":
      return "phone-portrait";

    case "netbanking":
      return "business";

    case "wallet":
      return "wallet";

    default:
      return "cash";
  }
};

// Helper function to get payment method icon color
export const getPaymentMethodIconColor = (
  methodInfo: PaymentMethodInfo
): string => {
  const { type, details } = methodInfo;

  switch (type) {
    case "card":
      switch (details.cardNetwork?.toLowerCase()) {
        case "visa":
          return "#1A1F71";
        case "mastercard":
          return "#EB001B";
        case "rupay":
          return "#097969";
        default:
          return "#333333";
      }

    case "upi":
      switch (details.upiApp) {
        case "Google Pay":
          return "#4285F4";
        case "PhonePe":
          return "#5F259F";
        case "Paytm":
          return "#00BAF2";
        case "Amazon Pay":
          return "#FF9900";
        case "WhatsApp Pay":
          return "#25D366";
        case "CRED Pay":
          return "#2D2D2D";
        default:
          return "#097969";
      }

    case "netbanking":
      return "#1E3A8A";

    case "wallet":
      switch (details.walletProvider?.toLowerCase()) {
        case "paytm":
          return "#00BAF2";
        case "amazonpay":
          return "#FF9900";
        case "cred":
        case "credpay":
          return "#2D2D2D";
        default:
          return "#FF6B35";
      }

    default:
      return "#666666";
  }
};

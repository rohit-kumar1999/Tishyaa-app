import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "../hooks/useApiQuery";
import api from "../setup/api";

// ===== TYPES =====
export type ReturnReasonType =
  | "defective"
  | "wrong_size"
  | "not_as_described"
  | "change_of_mind"
  | "received_wrong_item"
  | "damaged_during_shipping"
  | "other";

export type ExchangeReasonType =
  | "wrong_size"
  | "different_color"
  | "different_style"
  | "defective"
  | "not_as_described"
  | "other";

export type ReturnStatus =
  | "initiated"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "pickup_scheduled"
  | "picked_up"
  | "in_transit"
  | "received"
  | "quality_check"
  | "processing"
  | "refunded"
  | "completed";

export type ExchangeStatus =
  | "initiated"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "payment_pending"
  | "payment_completed"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed";

// ===== INTERFACES =====
export interface EligibleItem {
  lineId: string;
  productId: string;
  productName: string;
  originalQuantity: number;
  processedQuantity: number;
  availableQuantity: number;
  unitPrice: number;
  totalValue: number;
  lineTotal: number;
  currentStatus: string;
  images?: string[];
  specifications?: Record<string, any>;
  price?: number;
}

export interface ReturnEligibility {
  eligible: boolean;
  returnWindow: {
    expiresAt: string;
    daysRemaining: number;
  };
  eligibleItems: EligibleItem[];
  policy?: {
    windowDays: number;
    allowedReturnReasons: ReturnReasonType[];
    allowedExchangeReasons: ExchangeReasonType[];
    autoApprovalEnabled: boolean;
  };
  restrictions?: string[];
  existingRequests?: {
    returns: Array<{
      id: string;
      returnNumber: string;
      status: string;
      returnType: string;
      totalAmount: number;
      createdAt: string;
    }>;
    exchanges: Array<{
      id: string;
      exchangeNumber: string;
      status: string;
      exchangeType: string;
      priceDifference: number;
      createdAt: string;
    }>;
  };
}

export interface CreateReturnRequest {
  requestType: "return";
  reason: ReturnReasonType;
  description?: string;
  items: Array<{
    lineId: string;
    quantity: number;
    reason?: ReturnReasonType;
  }>;
}

export interface CreateExchangeRequest {
  requestType: "exchange";
  reason: ExchangeReasonType;
  description?: string;
  items: Array<{
    lineId: string;
    quantity: number;
    reason?: ExchangeReasonType;
  }>;
}

export interface ReturnResponse {
  success: boolean;
  data: {
    type: "return" | "exchange";
    id: string;
    number: string;
    status: string;
    returnType?: string;
    exchangeType?: string;
    totalAmount?: number;
    priceDifference?: number;
    additionalPaymentRequired?: boolean;
    paymentAmount?: number;
    estimatedProcessingDays?: number;
    createdAt: string;
  };
  message: string;
}

// ===== API HOOKS =====

// Check return/exchange eligibility
export const useCheckReturnEligibility = (orderId: string) => {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ["return-eligibility", orderId, userId],
    queryFn: async () => {
      try {
        const response = await api.get(`/order/${orderId}/return`);

        // Transform API response to match our interface
        const data = response as any;

        return {
          eligible: data.eligible,
          returnWindow: data.requestWindow || data.returnWindow,
          eligibleItems: (data.eligibleItems || []).map((item: any) => ({
            ...item,
            price: item.price || item.unitPrice,
          })),
          policy: data.policy,
          restrictions: data.restrictions || [],
          existingRequests: data.requests || data.existingRequests,
        } as ReturnEligibility;
      } catch (error: any) {
        // If 404 or order not eligible, return not eligible
        if (error?.status === 404 || error?.message?.includes("404")) {
          return {
            eligible: false,
            returnWindow: { expiresAt: "", daysRemaining: 0 },
            eligibleItems: [],
            restrictions: ["Order not eligible for return/exchange"],
          } as ReturnEligibility;
        }
        throw error;
      }
    },
    enabled: !!orderId && !!userId,
    retry: (failureCount, error: any) => {
      if (error?.status === 404 || error?.message?.includes("404")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create return request
export const useCreateReturnRequest = (orderId: string) => {
  return useApiMutation<ReturnResponse, CreateReturnRequest>(
    `/order/${orderId}/return`,
    {
      method: "POST",
      successMessage: "Return request submitted successfully",
      errorMessage: "Failed to create return request",
      invalidateQueries: ["orders", `return-eligibility-${orderId}`],
    }
  );
};

// Create exchange request
export const useCreateExchangeRequest = (orderId: string) => {
  return useApiMutation<ReturnResponse, CreateExchangeRequest>(
    `/order/${orderId}/return`,
    {
      method: "POST",
      successMessage: "Exchange request submitted successfully",
      errorMessage: "Failed to create exchange request",
      invalidateQueries: ["orders", `return-eligibility-${orderId}`],
    }
  );
};

// ===== UTILITY FUNCTIONS =====

export const getReturnReasonLabel = (reason: ReturnReasonType): string => {
  const labels: Record<ReturnReasonType, string> = {
    defective: "Product is defective",
    wrong_size: "Wrong size/fit",
    not_as_described: "Not as described",
    change_of_mind: "Changed my mind",
    received_wrong_item: "Received wrong item",
    damaged_during_shipping: "Damaged during shipping",
    other: "Other reason",
  };
  return labels[reason] || reason;
};

export const getExchangeReasonLabel = (reason: ExchangeReasonType): string => {
  const labels: Record<ExchangeReasonType, string> = {
    wrong_size: "Wrong size/fit",
    different_color: "Different color preferred",
    different_style: "Different style preferred",
    defective: "Product is defective",
    not_as_described: "Not as described",
    other: "Other reason",
  };
  return labels[reason] || reason;
};

export const getReturnStatusLabel = (status: ReturnStatus): string => {
  const labels: Record<ReturnStatus, string> = {
    initiated: "Request Submitted",
    pending_approval: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    pickup_scheduled: "Pickup Scheduled",
    picked_up: "Item Picked Up",
    in_transit: "In Transit",
    received: "Received by Us",
    quality_check: "Quality Check",
    processing: "Processing Refund",
    refunded: "Refund Completed",
    completed: "Completed",
  };
  return labels[status] || status;
};

export const getExchangeStatusLabel = (status: ExchangeStatus): string => {
  const labels: Record<ExchangeStatus, string> = {
    initiated: "Exchange Requested",
    pending_approval: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    payment_pending: "Payment Required",
    payment_completed: "Payment Completed",
    processing: "Processing",
    shipped: "New Item Shipped",
    delivered: "Delivered",
    completed: "Completed",
  };
  return labels[status] || status;
};

export const RETURN_REASONS: { value: ReturnReasonType; label: string }[] = [
  { value: "defective", label: "Product is defective" },
  { value: "wrong_size", label: "Wrong size/fit" },
  { value: "not_as_described", label: "Not as described" },
  { value: "change_of_mind", label: "Changed my mind" },
  { value: "received_wrong_item", label: "Received wrong item" },
  { value: "damaged_during_shipping", label: "Damaged during shipping" },
  { value: "other", label: "Other reason" },
];

export const EXCHANGE_REASONS: { value: ExchangeReasonType; label: string }[] =
  [
    { value: "wrong_size", label: "Wrong size/fit" },
    { value: "different_color", label: "Different color preferred" },
    { value: "different_style", label: "Different style preferred" },
    { value: "defective", label: "Product is defective" },
    { value: "not_as_described", label: "Not as described" },
    { value: "other", label: "Other reason" },
  ];

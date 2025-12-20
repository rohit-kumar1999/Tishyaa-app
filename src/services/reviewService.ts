import { useUser } from "@clerk/clerk-expo";
import {
  useApiDeleteMutation,
  useApiMutation,
  useApiQuery,
} from "../hooks/useApiQuery";
import { queryClient } from "../setup/api";

// Review interface
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Review form data interface
export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

// Review stats interface
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Review API response interface
export interface ReviewsApiResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Array<{
      rating: number;
      count: number;
      percentage: number;
    }>;
    recentTrend: any[];
    lastUpdated: string;
  };
}

// Review endpoints
const REVIEWS_ENDPOINT = "/review";

// Utility function to invalidate review queries for a specific product
export const invalidateProductReviews = async (productId: string) => {
  // Invalidate all queries that start with the review endpoint and contain the productId
  await queryClient.invalidateQueries({
    queryKey: [`${REVIEWS_ENDPOINT}?productId=${productId}`],
  });
};

// Utility function to force refresh reviews (more reliable approach)
export const forceRefreshReviews = async (productId: string) => {
  // First invalidate all related queries
  await queryClient.invalidateQueries({
    queryKey: [`${REVIEWS_ENDPOINT}?productId=${productId}`],
  });
};

// Get reviews for a product
export const useGetProductReviews = (productId: string) => {
  return useApiQuery<ReviewsApiResponse>(
    `${REVIEWS_ENDPOINT}?productId=${productId}`,
    {
      enabled: !!productId,
    }
  );
};

// Add a new review
export const useAddReview = () => {
  const { user } = useUser();

  return useApiMutation<Review, ReviewFormData & { productId: string }>(
    REVIEWS_ENDPOINT,
    {
      successMessage: "Review added successfully!",
      transformRequest: (data) => ({
        ...data,
        userId: user?.id,
        userName: user?.fullName || user?.firstName || "Anonymous User",
      }),
    }
  );
};

// Update a review
export const useUpdateReview = () => {
  const { user } = useUser();

  return useApiMutation<Review, ReviewFormData & { reviewId: string }>(
    REVIEWS_ENDPOINT,
    {
      method: "PUT",
      successMessage: "Review updated successfully!",
      transformRequest: (data) => ({
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        id: data.reviewId,
        userName: user?.fullName || user?.firstName || "Anonymous User",
      }),
    }
  );
};

// Delete a review
export const useDeleteReview = () => {
  return useApiDeleteMutation<Review>(REVIEWS_ENDPOINT, {
    successMessage: "Review deleted successfully!",
    transformRequest: (data: { reviewId: string; reason?: string }) => ({
      params: {
        reviewId: data.reviewId,
        ...(data.reason && { reason: data.reason }),
      },
    }),
  });
};

// Mark review as helpful
export const useMarkReviewHelpful = () => {
  return useApiMutation<Review, { reviewId: string }>(
    `${REVIEWS_ENDPOINT}/helpful`,
    {
      method: "POST",
      successMessage: "Thank you for your feedback!",
      transformRequest: (data) => ({
        reviewId: data.reviewId,
      }),
    }
  );
};

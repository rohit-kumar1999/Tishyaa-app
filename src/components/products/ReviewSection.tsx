import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { toast } from "../../hooks/use-toast";
import {
  forceRefreshReviews,
  Review,
  ReviewFormData,
  useAddReview,
  useDeleteReview,
  useGetProductReviews,
  useMarkReviewHelpful,
  useUpdateReview,
} from "../../services/reviewService";
import { TouchableOpacity } from "../common/TouchableOpacity";
import { ReviewCard } from "../ReviewCard";
import ReviewFormModal from "./ReviewFormModal";

interface ReviewSectionProps {
  productId: string;
  productName: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  productId,
  productName,
}) => {
  const { isSignedIn, user } = useUser();
  const userId = user?.id;

  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);
  const [showFilterPicker, setShowFilterPicker] = useState(false);

  // API hooks
  const {
    data: reviewsResponse,
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useGetProductReviews(productId);

  const addReviewMutation = useAddReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();
  const markHelpfulMutation = useMarkReviewHelpful();

  // Extract data from API response
  const reviews = reviewsResponse?.reviews || [];
  const statistics = reviewsResponse?.statistics;

  // Use statistics from API if available
  const totalReviews = statistics?.totalReviews || reviews.length;
  const avgRating =
    statistics?.averageRating ||
    (totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0);

  // Check if user has already reviewed this product
  const userReview = reviews.find((review) => review.userId === userId);
  const hasUserReviewed = !!userReview;

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((review) => {
      if (filterRating === null) return true;
      return review.rating === filterRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "helpful":
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  const displayedReviews = showAllReviews
    ? filteredReviews
    : filteredReviews.slice(0, 5);

  // Calculate rating distribution
  const ratingDistribution =
    statistics?.ratingDistribution && statistics.ratingDistribution.length > 0
      ? [...statistics.ratingDistribution].sort((a, b) => b.rating - a.rating)
      : [5, 4, 3, 2, 1].map((rating) => {
          const count = reviews.filter((r) => r.rating === rating).length;
          const percentage =
            totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          return { rating, count, percentage };
        });

  const handleSubmitReview = async (data: ReviewFormData) => {
    if (!isSignedIn) {
      toast({
        description: "Please sign in to submit a review",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingReview) {
        await updateReviewMutation.mutate({
          ...data,
          reviewId: editingReview.id,
        });
      } else {
        await addReviewMutation.mutate({
          ...data,
          productId,
        });
      }

      // Refresh reviews
      await forceRefreshReviews(productId);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await refetchReviews();

      setIsReviewFormOpen(false);
      setEditingReview(null);

      toast({
        description: editingReview
          ? "Review updated successfully!"
          : "Review submitted successfully!",
      });
    } catch {
      toast({
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setIsReviewFormOpen(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReviewMutation.mutate({ reviewId });

      await forceRefreshReviews(productId);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await refetchReviews();
    } catch {
      // Delete failed silently
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!isSignedIn) {
      toast({
        description: "Please sign in to mark reviews as helpful",
        variant: "destructive",
      });
      return;
    }

    try {
      await markHelpfulMutation.mutate({ reviewId });

      await forceRefreshReviews(productId);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await refetchReviews();
    } catch {
      // Mark helpful failed silently
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={i <= rating ? "star" : "star-outline"}
            size={size}
            color={i <= rating ? "#F59E0B" : "#D1D5DB"}
          />
        ))}
      </View>
    );
  };

  const getSortLabel = (value: string) => {
    const labels: Record<string, string> = {
      newest: "Newest first",
      oldest: "Oldest first",
      highest: "Highest rated",
      lowest: "Lowest rated",
      helpful: "Most helpful",
    };
    return labels[value] || value;
  };

  if (reviewsError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Unable to load reviews. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Review Summary Header */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryLeft}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          {totalReviews > 0 && (
            <View style={styles.ratingRow}>
              {renderStars(Math.floor(avgRating), 18)}
              <Text style={styles.avgRatingText}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.totalReviewsText}>
                ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
              </Text>
            </View>
          )}
          {hasUserReviewed && (
            <View style={styles.reviewedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.reviewedBadgeText}>
                You have reviewed this product
              </Text>
            </View>
          )}
        </View>

        {isSignedIn && !hasUserReviewed && (
          <TouchableOpacity
            style={styles.writeReviewButton}
            onPress={() => setIsReviewFormOpen(true)}
          >
            <Text style={styles.writeReviewText}>Write Review</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rating Distribution */}
      {totalReviews > 0 && (
        <View style={styles.distributionContainer}>
          <Text style={styles.distributionTitle}>Rating Breakdown</Text>
          <View style={styles.distributionBars}>
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <TouchableOpacity
                key={rating}
                style={styles.distributionRow}
                onPress={() =>
                  setFilterRating(filterRating === rating ? null : rating)
                }
              >
                <View style={styles.distributionLabel}>
                  <Text style={styles.distributionRating}>{rating}</Text>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[styles.progressBar, { width: `${percentage}%` }]}
                  />
                </View>
                <Text style={styles.distributionCount}>{count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Filters and Sorting */}
      {totalReviews > 0 && (
        <View style={styles.filtersContainer}>
          <View style={styles.filtersRow}>
            {/* Sort Dropdown */}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowSortPicker(!showSortPicker)}
            >
              <Text style={styles.filterButtonText}>
                {getSortLabel(sortBy)}
              </Text>
              <Ionicons
                name={showSortPicker ? "chevron-up" : "chevron-down"}
                size={16}
                color="#6B7280"
              />
            </TouchableOpacity>

            {/* Filter Button */}
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterRating !== null && styles.filterButtonActive,
              ]}
              onPress={() => setShowFilterPicker(!showFilterPicker)}
            >
              <Ionicons
                name="filter"
                size={14}
                color={filterRating !== null ? "#8B5CF6" : "#6B7280"}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  filterRating !== null && styles.filterButtonTextActive,
                ]}
              >
                {filterRating !== null ? `${filterRating} Stars` : "All"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          {showSortPicker && (
            <View style={styles.pickerDropdown}>
              {["newest", "oldest", "highest", "lowest", "helpful"].map(
                (option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.pickerOption,
                      sortBy === option && styles.pickerOptionActive,
                    ]}
                    onPress={() => {
                      setSortBy(option);
                      setShowSortPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        sortBy === option && styles.pickerOptionTextActive,
                      ]}
                    >
                      {getSortLabel(option)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}

          {/* Filter Options */}
          {showFilterPicker && (
            <View style={styles.pickerDropdown}>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  filterRating === null && styles.pickerOptionActive,
                ]}
                onPress={() => {
                  setFilterRating(null);
                  setShowFilterPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    filterRating === null && styles.pickerOptionTextActive,
                  ]}
                >
                  All Ratings
                </Text>
              </TouchableOpacity>
              {[5, 4, 3, 2, 1].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.pickerOption,
                    filterRating === rating && styles.pickerOptionActive,
                  ]}
                  onPress={() => {
                    setFilterRating(rating);
                    setShowFilterPicker(false);
                  }}
                >
                  <View style={styles.pickerRatingRow}>
                    <Text
                      style={[
                        styles.pickerOptionText,
                        filterRating === rating &&
                          styles.pickerOptionTextActive,
                      ]}
                    >
                      {rating}
                    </Text>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.showingText}>
            Showing {filteredReviews.length} of {totalReviews} reviews
          </Text>
        </View>
      )}

      {/* Reviews List */}
      <View style={styles.reviewsList}>
        {reviewsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading reviews...</Text>
          </View>
        ) : filteredReviews.length === 0 ? (
          <View style={styles.noReviewsContainer}>
            <View style={styles.noReviewsIconContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
            </View>
            <Text style={styles.noReviewsTitle}>
              {filterRating === null
                ? "No Reviews Yet"
                : `No ${filterRating}-Star Reviews`}
            </Text>
            <Text style={styles.noReviewsSubtitle}>
              {filterRating === null
                ? "Be the first to share your experience with this beautiful piece"
                : "Try adjusting the filter to see other reviews"}
            </Text>
            {filterRating === null && (
              <>
                <View style={styles.noReviewsStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star-outline"
                      size={24}
                      color="#F59E0B"
                    />
                  ))}
                </View>
                <Text style={styles.noReviewsHint}>
                  Your review helps others make better choices ✨
                </Text>
              </>
            )}
          </View>
        ) : (
          <>
            {displayedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={{
                  ...review,
                  date: new Date(review.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }),
                }}
                isOwnReview={review.userId === userId}
                onMarkHelpful={() => handleMarkHelpful(review.id)}
                onEdit={() => handleEditReview(review)}
                onDelete={() => handleDeleteReview(review.id)}
              />
            ))}

            {filteredReviews.length > 5 && !showAllReviews && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllReviews(true)}
              >
                <Text style={styles.showMoreText}>
                  Show {filteredReviews.length - 5} More Reviews
                </Text>
                <Ionicons name="chevron-down" size={16} color="#8B5CF6" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Review Form Modal */}
      <ReviewFormModal
        visible={isReviewFormOpen}
        onClose={() => {
          setIsReviewFormOpen(false);
          setEditingReview(null);
        }}
        onSubmit={handleSubmitReview}
        isLoading={
          addReviewMutation.isLoading || updateReviewMutation.isLoading
        }
        editingReview={editingReview}
        productName={productName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  summaryLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  avgRatingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  totalReviewsText: {
    fontSize: 14,
    color: "#6B7280",
  },
  reviewedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: "flex-start",
  },
  reviewedBadgeText: {
    fontSize: 12,
    color: "#047857",
    fontWeight: "500",
  },
  writeReviewButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  writeReviewText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  distributionContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  distributionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  distributionBars: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  distributionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    width: 30,
  },
  distributionRating: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1F2937",
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 12,
    color: "#6B7280",
    width: 24,
    textAlign: "right",
  },
  filtersContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    marginBottom: 16,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: "#EDE9FE",
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  filterButtonText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#8B5CF6",
  },
  pickerDropdown: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  pickerOptionActive: {
    backgroundColor: "#EDE9FE",
  },
  pickerOptionText: {
    fontSize: 14,
    color: "#374151",
  },
  pickerOptionTextActive: {
    color: "#8B5CF6",
    fontWeight: "600",
  },
  pickerRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  showingText: {
    fontSize: 12,
    color: "#6B7280",
  },
  reviewsList: {
    gap: 12,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  noReviewsContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  noReviewsIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noReviewsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  noReviewsSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  noReviewsStars: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  noReviewsHint: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#8B5CF6",
    borderRadius: 25,
    gap: 8,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
});

export default ReviewSection;

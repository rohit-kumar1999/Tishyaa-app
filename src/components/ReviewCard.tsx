import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ReviewCardProps {
  review: {
    id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title?: string;
    comment: string;
    date: string;
    verified?: boolean;
    helpful?: number;
  };
  isOwnReview?: boolean;
  onMarkHelpful?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isOwnReview = false,
  onMarkHelpful,
  onEdit,
  onDelete,
  onReport,
}) => {
  const [showActions, setShowActions] = useState(false);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color={i <= rating ? "#fbbf24" : "#d1d5db"}
        />
      );
    }
    return stars;
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete?.(),
        },
      ]
    );
  };

  const handleMorePress = () => {
    if (isOwnReview) {
      Alert.alert("Review Options", "What would you like to do?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Edit Review",
          onPress: () => onEdit?.(),
        },
        {
          text: "Delete Review",
          style: "destructive",
          onPress: handleDelete,
        },
      ]);
    } else {
      Alert.alert("Report Review", "Do you want to report this review?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          onPress: () => onReport?.(),
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {review.userAvatar ? (
            <Image
              source={{ uri: review.userAvatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {review.userName?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}

          <View style={styles.userDetails}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{review.userName}</Text>
              {review.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
              {isOwnReview && (
                <View style={styles.ownBadge}>
                  <Text style={styles.ownText}>You</Text>
                </View>
              )}
            </View>

            <View style={styles.ratingContainer}>
              {renderStars(review.rating)}
              <Text style={styles.date}> • {review.date}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
          <Ionicons name="ellipsis-vertical" size={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {review.title && <Text style={styles.title}>{review.title}</Text>}

      <Text style={styles.comment}>{review.comment}</Text>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onMarkHelpful}
          disabled={isOwnReview}
        >
          <Ionicons
            name="thumbs-up-outline"
            size={16}
            color={isOwnReview ? "#d1d5db" : "#6b7280"}
          />
          <Text
            style={[
              styles.actionText,
              isOwnReview && styles.actionTextDisabled,
            ]}
          >
            Helpful{" "}
            {review.helpful && review.helpful > 0 ? `(${review.helpful})` : ""}
          </Text>
        </TouchableOpacity>

        {isOwnReview && (
          <View style={styles.ownActions}>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Ionicons name="pencil" size={14} color="#8B5CF6" />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#047857",
  },
  ownBadge: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ownText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#8B5CF6",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 4,
  },
  moreButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  comment: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  actionTextDisabled: {
    color: "#d1d5db",
  },
  ownActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editText: {
    fontSize: 13,
    color: "#8B5CF6",
    fontWeight: "500",
  },
  deleteButton: {
    padding: 4,
  },
});

export { ReviewCard };

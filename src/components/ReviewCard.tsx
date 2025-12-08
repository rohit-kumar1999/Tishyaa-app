import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from './ui/badge';

interface ReviewCardProps {
  review: {
    id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    date: string;
    verified?: boolean;
  };
  onLike?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onLike, onReport }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? '#fbbf24' : '#d1d5db'}
        />
      );
    }
    return stars;
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
                {review.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          <View style={styles.userDetails}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{review.userName}</Text>
              {review.verified && (
                <Badge variant="secondary" style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified</Text>
                </Badge>
              )}
            </View>
            
            <View style={styles.ratingContainer}>
              {renderStars(review.rating)}
              <Text style={styles.date}> • {review.date}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => onReport?.(review.id)}
        >
          <Ionicons name="ellipsis-vertical" size={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <Text style={styles.comment}>{review.comment}</Text>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike?.(review.id)}
        >
          <Ionicons name="thumbs-up-outline" size={16} color="#6b7280" />
          <Text style={styles.actionText}>Helpful</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  verifiedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  moreButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
});

export { ReviewCard };
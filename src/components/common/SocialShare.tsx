import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import socialService, {
  ShareContent,
  SocialPlatform,
} from "../../services/socialService";

const { width } = Dimensions.get("window");

interface SocialShareProps {
  visible: boolean;
  onClose: () => void;
  content: ShareContent;
  onShareComplete?: (platform: string) => void;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  visible,
  onClose,
  content,
  onShareComplete,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [platforms] = useState<SocialPlatform[]>(
    socialService.getSocialPlatforms()
  );

  const handleShare = async (platform: SocialPlatform) => {
    if (loading) return;

    try {
      setLoading(platform.id);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const success = await socialService.shareTo(platform.id, content);

      if (success) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        onShareComplete?.(platform.id);

        // Track share
        await socialService.trackShare(platform.id, "product", content.url);

        Alert.alert("Shared!", `Content shared via ${platform.name}`);
        onClose();
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Share Failed", `Unable to share via ${platform.name}`);
    } finally {
      setLoading(null);
    }
  };

  const renderPlatform = ({ item: platform }: { item: SocialPlatform }) => (
    <TouchableOpacity
      style={[styles.platformItem, { opacity: platform.available ? 1 : 0.5 }]}
      onPress={() => platform.available && handleShare(platform)}
      disabled={!platform.available || loading !== null}
    >
      <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
        {loading === platform.id ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Ionicons name={platform.icon as any} size={24} color="#FFF" />
        )}
      </View>
      <Text style={styles.platformName}>{platform.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={50} style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.container}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}} // Prevent backdrop close when touching content
            >
              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={styles.title}>Share</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.preview}>
                  <Text style={styles.previewTitle}>{content.title}</Text>
                  <Text style={styles.previewMessage} numberOfLines={3}>
                    {content.message}
                  </Text>
                  {content.hashtags && content.hashtags.length > 0 && (
                    <View style={styles.hashtags}>
                      {content.hashtags
                        .slice(0, 3)
                        .map((tag: string, index: number) => (
                          <View key={index} style={styles.hashtag}>
                            <Text style={styles.hashtagText}>#{tag}</Text>
                          </View>
                        ))}
                    </View>
                  )}
                </View>

                <View style={styles.platformsSection}>
                  <Text style={styles.sectionTitle}>Share via</Text>
                  <FlatList
                    data={platforms}
                    renderItem={renderPlatform}
                    keyExtractor={(item) => item.id}
                    numColumns={4}
                    scrollEnabled={false}
                    contentContainerStyle={styles.platformsList}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </BlurView>
    </Modal>
  );
};

interface ShareButtonProps {
  content: ShareContent;
  style?: any;
  iconSize?: number;
  color?: string;
  onShareComplete?: (platform: string) => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  content,
  style,
  iconSize = 24,
  color = "#666",
  onShareComplete,
}) => {
  const [shareVisible, setShareVisible] = useState(false);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShareVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.shareButton, style]}
        onPress={handlePress}
      >
        <Ionicons name="share-outline" size={iconSize} color={color} />
      </TouchableOpacity>

      <SocialShare
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        content={content}
        onShareComplete={onShareComplete}
      />
    </>
  );
};

interface ReferralShareProps {
  referralCode: string;
  onShare?: () => void;
}

export const ReferralShare: React.FC<ReferralShareProps> = ({
  referralCode,
  onShare,
}) => {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing) return;

    try {
      setSharing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const success = await socialService.shareReferral(referralCode);

      if (success) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        onShare?.();
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.referralContainer}>
      <View style={styles.referralContent}>
        <Text style={styles.referralTitle}>Share & Earn</Text>
        <Text style={styles.referralDescription}>
          Share your referral code and earn rewards when friends join!
        </Text>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Your Code:</Text>
          <Text style={styles.code}>{referralCode}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.referralButton, sharing && styles.referralButtonLoading]}
        onPress={handleShare}
        disabled={sharing}
      >
        {sharing ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            <Ionicons name="gift" size={20} color="#FFF" />
            <Text style={styles.referralButtonText}>Share Code</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropTouchable: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area bottom
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  preview: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  previewMessage: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  hashtags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hashtag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hashtagText: {
    fontSize: 12,
    color: "#C9A961",
    fontWeight: "500",
  },
  platformsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  platformsList: {
    alignItems: "center",
  },
  platformItem: {
    alignItems: "center",
    width: (width - 80) / 4, // 20px padding on each side, 20px gap
    marginBottom: 16,
  },
  platformIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  platformName: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  shareButton: {
    padding: 8,
  },
  referralContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    margin: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  referralContent: {
    marginBottom: 16,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  referralDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },
  codeLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  code: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C9A961",
    flex: 1,
  },
  referralButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C9A961",
    padding: 12,
    borderRadius: 8,
  },
  referralButtonLoading: {
    opacity: 0.7,
  },
  referralButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default {
  SocialShare,
  ShareButton,
  ReferralShare,
};

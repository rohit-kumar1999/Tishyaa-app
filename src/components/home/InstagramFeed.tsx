import {
  useCreateInstagramPost,
  useGetInstagramPosts,
  useUploadFile,
} from "@/services/instagramService";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

export const InstagramFeed = () => {
  // State management
  const [selectedMedia, setSelectedMedia] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploadCompleted, setUploadCompleted] = useState(false);

  // Auth
  const { userId } = useAuth();

  // Use service hooks
  const {
    data: instagramPosts = [],
    isLoading: isLoadingPosts,
    refetch,
  } = useGetInstagramPosts();
  const createPostMutation = useCreateInstagramPost();
  const uploadFileMutation = useUploadFile();

  // Utility functions
  const isVideoFile = (asset: ImagePicker.ImagePickerAsset) => {
    return asset.type === "video";
  };

  const resetUploadState = () => {
    setSelectedMedia(null);
    setUploadCompleted(false);
  };

  const openInstagramPost = async (instagramUrl: string | null) => {
    if (!instagramUrl) {
      Alert.alert("Error", "Instagram post not available");
      return;
    }

    try {
      const appUrl = instagramUrl.replace(
        "https://www.instagram.com",
        "instagram://"
      );
      const canOpen = await Linking.canOpenURL(appUrl);

      if (canOpen) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(instagramUrl);
      }
    } catch {
      try {
        await Linking.openURL(instagramUrl);
      } catch {
        Alert.alert("Error", "Cannot open Instagram post");
      }
    }
  };

  const handleMediaSelect = async () => {
    if (!userId) {
      Alert.alert("Sign In Required", "Please sign in to upload media");
      return;
    }

    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access media library is required!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        const maxImageSize = 10 * 1024 * 1024; // 10MB
        const maxVideoSize = 100 * 1024 * 1024; // 100MB

        if (
          asset.type === "image" &&
          asset.fileSize &&
          asset.fileSize > maxImageSize
        ) {
          Alert.alert("File Too Large", "Image size must be less than 10MB");
          return;
        }

        if (
          asset.type === "video" &&
          asset.fileSize &&
          asset.fileSize > maxVideoSize
        ) {
          Alert.alert("File Too Large", "Video size must be less than 100MB");
          return;
        }

        setSelectedMedia(asset);
        setUploadCompleted(false);
        handleAutoUpload(asset);
      }
    } catch {
      Alert.alert("Error", "Failed to select media. Please try again.");
    }
  };

  const handleAutoUpload = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!userId) {
      Alert.alert("Error", "Please sign in to upload");
      return;
    }

    try {
      // Step 1: Upload file to Cloudinary
      const isVideo = asset.type === "video";
      const formData = new FormData();

      // Handle file upload differently for web vs native
      if (Platform.OS === "web") {
        // For web, we need to fetch the blob first
        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const fileName =
            asset.fileName || `upload-${Date.now()}.${isVideo ? "mp4" : "jpg"}`;
          const file = new File([blob], fileName, {
            type: asset.mimeType || (isVideo ? "video/mp4" : "image/jpeg"),
          });
          formData.append("file", file);
        } catch {
          throw new Error("Failed to process file for upload");
        }
      } else {
        // For native platforms (iOS/Android)
        const fileToUpload: any = {
          uri: asset.uri,
          type: asset.mimeType || (isVideo ? "video/mp4" : "image/jpeg"),
          name:
            asset.fileName || `upload-${Date.now()}.${isVideo ? "mp4" : "jpg"}`,
        };
        formData.append("file", fileToUpload);
      }

      // Note: folderName is added by transformRequest in the service hook

      uploadFileMutation.mutate(formData, {
        onSuccess: (response) => {
          // Step 2: Create Instagram post record
          createPostMutation.mutate(
            {
              userId,
              instagramUrl: null,
              mediaUrl: response.url,
              mediaType: response.media_type,
              isDisplayed: false,
            },
            {
              onSuccess: () => {
                // Refresh the posts list
                refetch();
                // Set upload completed state
                setUploadCompleted(true);
                // Clear the selected file after a delay to show success message
                setTimeout(() => resetUploadState(), 3000);
                Alert.alert(
                  "Success! 🎉",
                  "Thank you! We will post your image/video soon on our Instagram handle! 🎉"
                );
              },
              onError: () => {
                // Clear the selected file and reset state on Instagram API failure
                resetUploadState();
                Alert.alert(
                  "Error",
                  "Failed to create Instagram post. Please try uploading again."
                );
              },
            }
          );
        },
        onError: () => {
          // Clear the selected file and reset state on upload API failure
          resetUploadState();
          Alert.alert(
            "Error",
            "Upload failed. Please select your media again to retry."
          );
        },
      });
    } catch {
      // Clear the selected file and reset state on unexpected error
      resetUploadState();
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  const renderPost = (post: NonNullable<typeof instagramPosts>[0]) => (
    <TouchableOpacity
      key={post.id}
      style={styles.postContainer}
      onPress={() => openInstagramPost(post.instagramUrl)}
      activeOpacity={0.9}
    >
      <View style={styles.postImageContainer}>
        {/* Media Display - exactly like web version */}
        <View style={styles.mediaWrapper}>
          {post.mediaType === "video" ? (
            <Video
              source={{ uri: post.mediaUrl }}
              style={styles.mediaStyle}
              resizeMode={ResizeMode.COVER}
              shouldPlay={true}
              isLooping
              isMuted
              useNativeControls={false}
            />
          ) : (
            <Image
              source={{ uri: post.mediaUrl }}
              style={styles.mediaStyle}
              contentFit="cover"
            />
          )}
        </View>

        {/* Instagram Icon Overlay */}
        <View style={styles.instagramIconOverlay}>
          <View style={styles.instagramIconContainer}>
            <Ionicons name="logo-instagram" size={16} color="#ffffff" />
          </View>
        </View>

        {/* Featured Badge */}
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>Featured</Text>
        </View>

        {/* Visit Post Button */}
        <View style={styles.visitButtonContainer}>
          <TouchableOpacity
            style={styles.visitButton}
            onPress={() => openInstagramPost(post.instagramUrl)}
          >
            <Ionicons name="open-outline" size={12} color="#333" />
            <Text style={styles.visitButtonText}>Visit Post</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom gradient with @tishyaajewels */}
        <View style={styles.bottomGradient}>
          <View style={styles.brandInfo}>
            <Ionicons name="logo-instagram" size={12} color="#ffffff" />
            <Text style={styles.brandText}>@tishyaajewels</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderUploadCard = () => (
    <TouchableOpacity
      style={styles.uploadCardContainer}
      onPress={handleMediaSelect}
      disabled={!userId}
      activeOpacity={0.8}
    >
      <View style={[styles.uploadCard, !userId && styles.uploadCardDisabled]}>
        {selectedMedia ? (
          <View style={styles.selectedMediaContainer}>
            {isVideoFile(selectedMedia) ? (
              <Video
                source={{ uri: selectedMedia.uri }}
                style={styles.selectedMediaPreview}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted
                useNativeControls={false}
              />
            ) : (
              <Image
                source={{ uri: selectedMedia.uri }}
                style={styles.selectedMediaPreview}
                contentFit="cover"
              />
            )}
            <View style={styles.uploadOverlay}>
              {uploadFileMutation.isLoading ? (
                <View style={styles.uploadStatusContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.uploadStatusText}>
                    Uploading {isVideoFile(selectedMedia) ? "video" : "image"}
                    ...
                  </Text>
                </View>
              ) : createPostMutation.isLoading ? (
                <View style={styles.uploadStatusContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.uploadStatusText}>Creating post...</Text>
                </View>
              ) : uploadCompleted ? (
                <View style={styles.uploadStatusContainer}>
                  <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                  <Text style={styles.uploadStatusTitle}>
                    {isVideoFile(selectedMedia) ? "Video" : "Image"} Uploaded!
                  </Text>
                  <Text style={styles.uploadStatusSubtitle}>
                    We'll post this soon on our Instagram handle! 🎉
                  </Text>
                </View>
              ) : (
                <View style={styles.uploadStatusContainer}>
                  <Ionicons name="camera" size={20} color="#ffffff" />
                  <Text style={styles.uploadStatusText}>Ready to upload</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.uploadPrompt}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="camera" size={20} color="#ffffff" />
            </View>
            <Text style={styles.uploadTitle}>Share your moment</Text>
            <Text style={styles.uploadSubtitle}>
              Select photo/video to auto-upload
            </Text>
            {!userId && (
              <Text style={styles.signInPrompt}>Sign in to upload</Text>
            )}
            <View
              style={[
                styles.chooseFileButton,
                !userId && styles.chooseFileButtonDisabled,
              ]}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={14}
                color={userId ? "#E4405F" : "#999"}
              />
              <Text
                style={[
                  styles.chooseFileText,
                  !userId && styles.chooseFileTextDisabled,
                ]}
              >
                Choose File
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Ionicons name="star" size={20} color="#E4405F" />
              <Text style={styles.shineText}>Shine with our brand</Text>
              <Ionicons name="star" size={20} color="#E4405F" />
            </View>
            <Text style={styles.mainTitle}>Share Your Tishyaa Moments</Text>
            <Text style={styles.subtitle}>
              Upload your photos or video wearing our jewelry and get featured
              on our Instagram! See how our beautiful jewelry looks on real
              customers. Click on our featured post below to view the actual
              Instagram reel!
            </Text>
            <TouchableOpacity
              style={styles.instagramButton}
              onPress={() =>
                Linking.openURL("https://www.instagram.com/tishyaajewels/")
              }
            >
              <Ionicons name="logo-instagram" size={16} color="#ffffff" />
              <Text style={styles.instagramButtonText}>@tishyaajewels</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts Grid */}
        <View style={styles.postsGrid}>
          {/* Loading State */}
          {isLoadingPosts && (
            <>
              <View style={styles.loadingContainer}>
                {[1, 2].map((_, index) => (
                  <View key={`loading-${index}`} style={styles.loadingPost}>
                    <View style={styles.loadingPostInner}>
                      <ActivityIndicator size="small" color="#E4405F" />
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.loadingContainer}>
                <View style={styles.loadingPost}>
                  <View style={styles.loadingPostInner}>
                    <ActivityIndicator size="small" color="#E4405F" />
                  </View>
                </View>
                {renderUploadCard()}
              </View>
            </>
          )}

          {/* Real Instagram Posts */}
          {!isLoadingPosts && instagramPosts && instagramPosts.length > 0 && (
            <>
              {/* First row - 2 posts */}
              <View style={styles.postsRow}>
                {instagramPosts?.slice(0, 2).map(renderPost)}
              </View>
              {/* Second row - 3rd post + upload card */}
              <View style={styles.postsRow}>
                {instagramPosts &&
                  instagramPosts.length > 2 &&
                  renderPost(instagramPosts[2])}
                {renderUploadCard()}
              </View>
            </>
          )}

          {/* No posts fallback */}
          {!isLoadingPosts &&
            (!instagramPosts || instagramPosts.length === 0) && (
              <View style={styles.noPostsContainer}>
                <View style={styles.noPostsContent}>
                  <Ionicons name="logo-instagram" size={32} color="#ccc" />
                  <Text style={styles.noPostsText}>No posts yet</Text>
                  <Text style={styles.noPostsSubtext}>Be the first!</Text>
                </View>
                {renderUploadCard()}
              </View>
            )}
        </View>

        {/* Tips and View All Button */}
        <View style={styles.footerContainer}>
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>
              💡 Tag @tishyaajewels and use #TishyaaShine to get featured!
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() =>
              Linking.openURL("https://www.instagram.com/tishyaajewels/")
            }
          >
            <Ionicons name="logo-instagram" size={16} color="#E4405F" />
            <Text style={styles.viewAllButtonText}>View All Posts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF7ED",
    paddingVertical: 40,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginBottom: 32,
  },
  titleContainer: {
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  shineText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E4405F",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  instagramButton: {
    backgroundColor: "#E4405F",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  instagramButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  postsGrid: {
    marginBottom: 24,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  loadingPost: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    padding: 2,
    backgroundColor: "#E4405F",
  },
  loadingPostInner: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  postsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  postContainer: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    padding: 2,
    backgroundColor: "#E4405F",
  },
  postImageContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  mediaWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  mediaStyle: {
    width: "100%",
    height: "100%",
  },
  playIconOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  playIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  instagramIconOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  instagramIconContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#E4405F",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featuredText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "500",
  },
  visitButtonContainer: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  visitButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  visitButtonText: {
    color: "#333",
    fontSize: 10,
    fontWeight: "500",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  brandInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  brandText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "500",
  },
  noPostsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  noPostsContent: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noPostsText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
  noPostsSubtext: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  uploadCardContainer: {
    flex: 1,
  },
  uploadCard: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#FCA5A5",
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadCardDisabled: {
    borderColor: "#D1D5DB",
    backgroundColor: "rgba(249, 250, 251, 0.7)",
  },
  selectedMediaContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  selectedMediaPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  uploadStatusContainer: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  uploadStatusText: {
    color: "#ffffff",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  uploadStatusTitle: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  uploadStatusSubtitle: {
    color: "#ffffff",
    fontSize: 9,
    marginTop: 2,
    textAlign: "center",
    lineHeight: 12,
  },
  uploadPrompt: {
    alignItems: "center",
    padding: 8,
  },
  uploadIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E4405F",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  uploadTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
    textAlign: "center",
  },
  uploadSubtitle: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 6,
    textAlign: "center",
    lineHeight: 12,
  },
  signInPrompt: {
    fontSize: 9,
    color: "#E4405F",
    marginBottom: 6,
    textAlign: "center",
  },
  chooseFileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 6,
    gap: 3,
  },
  chooseFileButtonDisabled: {
    borderColor: "#D1D5DB",
  },
  chooseFileText: {
    fontSize: 9,
    fontWeight: "500",
    color: "#E4405F",
  },
  chooseFileTextDisabled: {
    color: "#9CA3AF",
  },
  footerContainer: {
    alignItems: "center",
    gap: 16,
  },
  tipContainer: {
    maxWidth: 280,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tipText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 20,
    backgroundColor: "#ffffff",
    gap: 6,
  },
  viewAllButtonText: {
    color: "#E4405F",
    fontSize: 14,
    fontWeight: "500",
  },
});

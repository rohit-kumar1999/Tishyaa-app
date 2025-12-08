import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Video, ResizeMode } from 'expo-av';
import {
  useGetInstagramPosts,
  useCreateInstagramPost,
  useUploadFile,
  createInstagramPostData,
} from '@/src/services/instagramService';

const screenWidth = Dimensions.get("window").width;

export const InstagramFeed = () => {
  // State management
  const [videosPlaying, setVideosPlaying] = useState<Record<string, boolean>>({});
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploadCompleted, setUploadCompleted] = useState(false);

  // Use service hooks
  const {
    data: instagramPosts = [],
    isLoading: isLoadingPosts,
    refetch,
  } = useGetInstagramPosts();
  const createPostMutation = useCreateInstagramPost();
  const uploadFileMutation = useUploadFile();

  // Mock user ID for now - replace with actual auth
  const userId = "user123";

  // Utility functions
  const isVideoFile = (asset: ImagePicker.ImagePickerAsset) => {
    return asset.type === 'video';
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
      const appUrl = instagramUrl.replace("https://www.instagram.com", "instagram://");
      const canOpen = await Linking.canOpenURL(appUrl);
      
      if (canOpen) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(instagramUrl);
      }
    } catch (error) {
      console.error("Error opening Instagram:", error);
      try {
        await Linking.openURL(instagramUrl);
      } catch (fallbackError) {
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
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access media library is required!");
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

        if (asset.type === 'image' && asset.fileSize && asset.fileSize > maxImageSize) {
          Alert.alert("File Too Large", "Image size must be less than 10MB");
          return;
        }

        if (asset.type === 'video' && asset.fileSize && asset.fileSize > maxVideoSize) {
          Alert.alert("File Too Large", "Video size must be less than 100MB");
          return;
        }

        setSelectedMedia(asset);
        setUploadCompleted(false);
        handleAutoUpload(asset);
      }
    } catch (error) {
      console.error("Error selecting media:", error);
      Alert.alert("Error", "Failed to select media. Please try again.");
    }
  };

  const handleAutoUpload = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!userId) {
      Alert.alert("Error", "Please sign in to upload");
      return;
    }

    try {
      const isVideo = asset.type === 'video';

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
        name: asset.fileName || `upload.${isVideo ? 'mp4' : 'jpg'}`,
      } as any);

      uploadFileMutation.mutate(formData, {
        onSuccess: (response) => {
          const postData = createInstagramPostData(userId, response.url, response.media_type);

          createPostMutation.mutate(postData, {
            onSuccess: () => {
              refetch();
              setUploadCompleted(true);
              setTimeout(() => resetUploadState(), 3000);
              Alert.alert("Success! 🎉", "Thank you! We will post your media soon on our Instagram handle!");
            },
            onError: (error) => {
              resetUploadState();
              Alert.alert("Error", "Failed to create Instagram post. Please try uploading again.");
            },
          });
        },
        onError: (error) => {
          resetUploadState();
          Alert.alert("Error", "Upload failed. Please select your media again to retry.");
        },
      });
    } catch (error) {
      resetUploadState();
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  // Utility function to check if media is video
  const isVideoFile = (asset: ImagePicker.ImagePickerAsset) => {
    return asset.type === 'video';
  };

  // Helper function to reset upload state and clear media selection
  const resetUploadState = () => {
    setSelectedMedia(null);
    setUploadCompleted(false);
  };

  const openInstagramPost = async (instagramUrl: string | null) => {
    if (!instagramUrl) {
      console.log("Instagram post not available");
      return;
    }

    try {
      // Try to open in Instagram app first
      const appUrl = instagramUrl.replace(
        "https://www.instagram.com",
        "instagram://"
      );

      const supported = await Linking.canOpenURL(appUrl);

      if (supported) {
        await Linking.openURL(appUrl);
      } else {
        // Fallback to web browser
        await Linking.openURL(instagramUrl);
      }
    } catch (error) {
      console.error("Failed to open Instagram post:", error);
      // Fallback to web browser
      try {
        await Linking.openURL(instagramUrl);
      } catch (webError) {
        console.error("Failed to open web URL:", webError);
      }
    }
  };

  const openInstagramProfile = async () => {
    const instagramProfileUrl = "https://www.instagram.com/tishyaa.official";
    try {
      const appUrl = "instagram://user?username=tishyaa.official";
      const supported = await Linking.canOpenURL(appUrl);

      if (supported) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(instagramProfileUrl);
      }
    } catch (error) {
      console.error("Failed to open Instagram profile:", error);
    }
  };

  const renderPost = (post: (typeof instagramPosts)[0]) => (
    <TouchableOpacity
      key={post.id}
      style={styles.postContainer}
      onPress={() => openInstagramPost(post.instagramUrl)}
      activeOpacity={0.9}
    >
      <View style={styles.postImageContainer}>
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.postImage}
          contentFit="cover"
        />

        {/* Video Play Icon */}
        {post.mediaType === "VIDEO" && (
          <View style={styles.playIconOverlay}>
            <View style={styles.playIconContainer}>
              <Ionicons name="play" size={20} color="#ffffff" />
            </View>
          </View>
        )}

        {/* Instagram Icon Overlay */}
        <View style={styles.instagramIconOverlay}>
          <View style={styles.instagramIconContainer}>
            <Ionicons name="logo-instagram" size={16} color="#ffffff" />
          </View>
        </View>

        {/* Post Stats */}
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={12} color="#ffffff" />
            <Text style={styles.statText}>{post.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={12} color="#ffffff" />
            <Text style={styles.statText}>{post.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View style={styles.instagramIconHeader}>
              <Ionicons
                name="logo-instagram"
                size={screenWidth > 640 ? 32 : 28}
                color="#e11d48"
              />
            </View>
            <Text style={styles.sectionTitle}>Follow Us on Instagram</Text>
            <Text style={styles.sectionSubtitle}>
              Get inspired by our community and share your Tishyaa moments
            </Text>
          </View>

          {/* Follow Button */}
          <TouchableOpacity
            style={styles.followButton}
            onPress={openInstagramProfile}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-instagram" size={20} color="#ffffff" />
            <Text style={styles.followButtonText}>
              Follow @tishyaa.official
            </Text>
            <Ionicons name="open-outline" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.postsScrollContainer}
          style={styles.postsScroll}
        >
          {instagramPosts.map(renderPost)}
        </ScrollView>

        {/* Upload Section - Simplified for mobile */}
        <View style={styles.uploadSection}>
          <Text style={styles.uploadTitle}>Share Your Tishyaa Style</Text>
          <Text style={styles.uploadSubtitle}>
            Tag us @tishyaa.official and use #TishyaaStyle to be featured
          </Text>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={openInstagramProfile}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={20} color="#e11d48" />
            <Text style={styles.uploadButtonText}>Post on Instagram</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: screenWidth > 1024 ? 80 : screenWidth > 640 ? 64 : 48,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: screenWidth > 640 ? 40 : 32,
  },
  headerContent: {
    alignItems: "center",
    marginBottom: screenWidth > 640 ? 24 : 20,
  },
  instagramIconHeader: {
    marginBottom: screenWidth > 640 ? 16 : 12,
  },
  sectionTitle: {
    fontSize: screenWidth > 1024 ? 36 : screenWidth > 640 ? 30 : 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: screenWidth > 640 ? 12 : 8,
  },
  sectionSubtitle: {
    color: "#6b7280",
    fontSize: screenWidth > 640 ? 16 : 14,
    textAlign: "center",
    maxWidth: 500,
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e11d48",
    paddingHorizontal: screenWidth > 640 ? 24 : 20,
    paddingVertical: screenWidth > 640 ? 12 : 10,
    borderRadius: 25,
    gap: 8,
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  followButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: screenWidth > 640 ? 16 : 14,
  },
  postsScroll: {
    marginBottom: screenWidth > 640 ? 48 : 32,
  },
  postsScrollContainer: {
    paddingHorizontal: 8,
    gap: screenWidth > 640 ? 20 : 16,
  },
  postContainer: {
    width: screenWidth > 640 ? 200 : 160,
    marginHorizontal: 4,
  },
  postImageContainer: {
    position: "relative",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  playIconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playIconContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  instagramIconOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  instagramIconContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  postStats: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "500",
  },
  uploadSection: {
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: screenWidth > 640 ? 32 : 24,
    borderRadius: 16,
  },
  uploadTitle: {
    fontSize: screenWidth > 640 ? 20 : 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  uploadSubtitle: {
    color: "#6b7280",
    fontSize: screenWidth > 640 ? 14 : 12,
    textAlign: "center",
    marginBottom: screenWidth > 640 ? 20 : 16,
    maxWidth: 300,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e11d48",
    paddingHorizontal: screenWidth > 640 ? 20 : 16,
    paddingVertical: screenWidth > 640 ? 10 : 8,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    color: "#e11d48",
    fontWeight: "600",
    fontSize: screenWidth > 640 ? 14 : 12,
  },
});

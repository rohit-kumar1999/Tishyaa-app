import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import DeleteAccountModal from "../../src/components/ui/DeleteAccountModal";
import { useUserService } from "../../src/services/userService";

interface AccountOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  dangerous?: boolean;
  loading?: boolean;
}

export default function AccountSettingsScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const { deleteCurrentUser } = useUserService();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleBackPress = () => {
    try {
      // Navigate to profile screen instead of using router.back() to avoid GO_BACK error
      router.push("/profile");
    } catch (error) {
      console.error("Navigation back error:", error);
      // Fallback navigation
      router.replace("/profile");
    }
  };

  const handleChangePassword = () => {
    try {
      router.push("/profile/update-password");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };

  const confirmDeleteAccount = async () => {
    if (deletingAccount) return;

    setDeletingAccount(true);

    try {
      const result = await deleteCurrentUser();

      if (result.success) {
        // Close modal and show success message
        setShowDeleteModal(false);
        Toast.show({
          type: "success",
          text1: "Account Deleted",
          text2:
            "Your account has been successfully deleted. Signing you out...",
        });

        // Sign out and navigate after a brief delay
        setTimeout(async () => {
          await signOut();
          router.replace("/auth");
        }, 1500);
      } else {
        console.error("Account deletion failed:", result.message);
        setShowDeleteModal(false);
        Toast.show({
          type: "error",
          text1: "Deletion Failed",
          text2:
            result.message ||
            "Failed to delete account. Please try again or contact support.",
        });
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      setShowDeleteModal(false);
      Toast.show({
        type: "error",
        text1: "Deletion Error",
        text2:
          "An unexpected error occurred while deleting your account. Please try again or contact support.",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    return { cameraStatus, mediaLibraryStatus };
  };

  // Supported image file types
  const SUPPORTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateImageFile = async (
    uri: string
  ): Promise<{ isValid: boolean; error?: string }> => {
    try {
      // Get file info
      const response = await fetch(uri);
      const blob = await response.blob();

      // Check file type
      if (!SUPPORTED_IMAGE_TYPES.includes(blob.type)) {
        return {
          isValid: false,
          error: `Unsupported file type: ${blob.type}. Please use JPG, PNG, or WebP images.`,
        };
      }

      // Check file size
      if (blob.size > MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: `File size too large: ${(blob.size / 1024 / 1024).toFixed(
            2
          )}MB. Maximum allowed size is 5MB.`,
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: "Unable to validate file. Please try again.",
      };
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) {
      // Redirect to sign in if no user
      router.push("/auth");
      return;
    }

    setUploadingImage(true);
    try {
      // Validate file type and size before upload
      const validation = await validateImageFile(uri);
      if (!validation.isValid) {
        console.error("File validation failed:", validation.error);
        return;
      }

      // Convert URI to blob for Clerk
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Clerk using the setProfileImage method
      await user.setProfileImage({ file: blob });
      // TODO: Could show a toast notification or update UI feedback instead
    } catch (error: any) {
      console.error("Profile picture upload error:", error);
      // TODO: Could show a toast notification or update UI feedback instead
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangePhoto = async () => {
    try {
      // Directly access photo library for simplicity
      const { mediaLibraryStatus } = await requestPermissions();
      if (mediaLibraryStatus !== "granted") {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        // Additional validation options
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedAsset = result.assets[0];

        // Additional client-side check for file size (if available)
        if (selectedAsset.fileSize && selectedAsset.fileSize > MAX_FILE_SIZE) {
          return;
        }

        await uploadImage(selectedAsset.uri);
      }
    } catch (error) {
      console.error("Photo library error:", error);
    }
  };

  const accountOptions: AccountOption[] = [
    {
      id: "1",
      title: "Update Password",
      subtitle: "Change your account password",
      icon: "lock-closed-outline",
      onPress: handleChangePassword,
    },
    {
      id: "2",
      title: "Delete Account",
      subtitle: "Permanently delete your account",
      icon: "trash-outline",
      onPress: handleDeleteAccount,
      dangerous: true,
      loading: deletingAccount,
    },
  ];

  // Show loading screen while user data is loading
  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#fdf2f8", "#fce7f3"]} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Settings</Text>
          <View style={styles.editButton} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e11d48" />
          <Text style={styles.loadingText}>Loading account settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#fdf2f8", "#fce7f3"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Account Settings</Text>

        <View style={styles.editButton} />
      </LinearGradient>

      <ScrollView style={styles.scrollContainer}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarSection}>
            <Image
              source={{
                uri:
                  user?.imageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.firstName || "User"
                  )}&background=C9A961&color=ffffff&size=100`,
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={[
                styles.changePhotoButton,
                uploadingImage && styles.changePhotoButtonDisabled,
              ]}
              onPress={handleChangePhoto}
              activeOpacity={0.7}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="camera" size={16} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail}>
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
            <Text style={styles.memberSince}>
              Member since{" "}
              {user?.createdAt
                ? new Date(user.createdAt).getFullYear()
                : "2024"}
            </Text>
          </View>
        </View>

        {/* Account Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          {accountOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                option.dangerous && styles.dangerousOptionItem,
              ]}
              onPress={() => {
                if (option.loading) return; // Prevent action if loading
                try {
                  option.onPress();
                } catch (error) {
                  console.error(
                    `Error executing option ${option.title}:`,
                    error
                  );
                }
              }}
              activeOpacity={0.7}
              disabled={option.loading}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.optionIconContainer,
                    option.dangerous && styles.dangerousIconContainer,
                  ]}
                >
                  {option.loading ? (
                    <ActivityIndicator
                      size="small"
                      color={option.dangerous ? "#ef4444" : "#e11d48"}
                    />
                  ) : (
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={option.dangerous ? "#ef4444" : "#e11d48"}
                    />
                  )}
                </View>
                <View style={styles.optionText}>
                  <Text
                    style={[
                      styles.optionTitle,
                      option.dangerous && styles.dangerousOptionTitle,
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Text
                    style={[
                      styles.optionSubtitle,
                      option.dangerous && styles.dangerousOptionSubtitle,
                    ]}
                  >
                    {option.loading ? "Deleting account..." : option.subtitle}
                  </Text>
                </View>
              </View>
              {!option.loading && (
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={option.dangerous ? "#ef4444" : "#9ca3af"}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={confirmDeleteAccount}
        loading={deletingAccount}
        userName={user?.firstName || "User"}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 64,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  profileSection: {
    backgroundColor: "#ffffff",
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#e11d48",
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#e11d48",
    borderRadius: 12,
    padding: 6,
    zIndex: 10,
  },
  changePhotoButtonDisabled: {
    opacity: 0.7,
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: "#9ca3af",
  },

  optionsSection: {
    backgroundColor: "#ffffff",
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    padding: 20,
    paddingBottom: 12,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },

  // Dangerous option styles for delete account
  dangerousOptionItem: {
    backgroundColor: "#fef2f2",
  },
  dangerousIconContainer: {
    backgroundColor: "#fee2e2",
  },
  dangerousOptionTitle: {
    color: "#ef4444",
  },
  dangerousOptionSubtitle: {
    color: "#dc2626",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});

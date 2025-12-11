import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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

export default function AccountSettingsScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);

  // Log user data for debugging
  useEffect(() => {
    if (user) {
      console.log("User data:", {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.primaryEmailAddress?.emailAddress,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
      });
    }
  }, [user]);

  const handleBackPress = () => {
    console.log("Back button pressed");
    try {
      router.back();
    } catch (error) {
      console.error("Navigation back error:", error);
    }
  };

  const handleChangePassword = () => {
    console.log(
      "🔑 handleChangePassword called - navigating to update password"
    );
    try {
      router.push("/profile/update-password");
    } catch (error) {
      console.error("❌ Navigation error:", error);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    return { cameraStatus, mediaLibraryStatus };
  };

  const uploadImage = async (uri: string) => {
    console.log("uploadImage called with URI:", uri);
    if (!user) {
      console.error("❌ No user found - redirecting to sign in");
      // Direct action: redirect to sign in
      router.push("/(auth)/sign-in");
      return;
    }

    setUploadingImage(true);
    try {
      console.log("Starting image upload...");
      // Convert URI to blob for Clerk
      const response = await fetch(uri);
      const blob = await response.blob();
      console.log("Blob created, uploading to Clerk...");

      // Upload to Clerk using the setProfileImage method
      await user.setProfileImage({ file: blob });
      console.log("Image uploaded successfully");

      console.log("✅ Success: Profile picture updated successfully!");
      // TODO: Could show a toast notification or update UI feedback instead
    } catch (error: any) {
      console.error("Profile picture upload error:", error);
      const errorMessage =
        error?.errors?.[0]?.message ||
        "Failed to update profile picture. Please try again.";
      console.error("❌ Upload Error:", errorMessage);
      // TODO: Could show a toast notification or update UI feedback instead
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangePhoto = async () => {
    console.log("📷 handleChangePhoto called");
    try {
      // Directly access photo library for simplicity
      const { mediaLibraryStatus } = await requestPermissions();
      if (mediaLibraryStatus !== "granted") {
        console.error(
          "❌ Photo library permission denied - cannot select photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Photo library error:", error);
    }
  };

  const accountOptions = [
    {
      id: "1",
      title: "Update Password",
      subtitle: "Change your account password",
      icon: "lock-closed-outline",
      onPress: handleChangePassword,
    },
    {
      id: "2",
      title: "Two-Factor Authentication",
      subtitle: "Add extra security to your account",
      icon: "shield-checkmark-outline",
      onPress: () => {
        console.log("2FA option pressed - opening Clerk dashboard info");
        // Direct action - could navigate to a 2FA settings screen or external link
        console.log(
          "Two-factor authentication can be managed through Clerk's dashboard."
        );
        // TODO: Add navigation to 2FA settings screen or external Clerk dashboard
      },
    },
    {
      id: "3",
      title: "Connected Accounts",
      subtitle: "Manage social login connections",
      icon: "link-outline",
      onPress: () => {
        console.log(
          "Connected accounts option pressed - managing social connections"
        );
        // Direct action - could navigate to connected accounts screen
        console.log("Managing social connections through Clerk's system.");
        // TODO: Add navigation to connected accounts screen
      },
    },
    {
      id: "4",
      title: "Privacy Settings",
      subtitle: "Control your privacy preferences",
      icon: "eye-outline",
      onPress: () => {
        console.log(
          "Privacy settings option pressed - navigating to privacy settings"
        );
        // Direct action - navigate to privacy settings screen when available
        console.log("Privacy settings feature in development");
        // TODO: Add navigation to privacy settings screen
      },
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
              style={styles.optionItem}
              onPress={() => {
                console.log(`🎯 Option pressed: ${option.title}`);
                console.log(`🔍 Option ID: ${option.id}`);
                console.log(`🎪 Function being called:`, option.onPress);
                try {
                  option.onPress();
                } catch (error) {
                  console.error(
                    `❌ Error executing option ${option.title}:`,
                    error
                  );
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionIconContainer}>
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color="#e11d48"
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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

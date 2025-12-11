import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavigation from "../components/common/BottomNavigation";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user } = useUser();
  const { signOut, isSignedIn, isLoaded } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/auth/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleAccountSettings = () => {
    router.push("/profile/account-settings");
  };

  // Handle authentication redirect in useEffect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Use setTimeout to ensure navigation happens after mount
      setTimeout(() => {
        router.replace("/auth/sign-in");
      }, 100);
    }
  }, [isLoaded, isSignedIn]);

  // Show loading while auth is loading or redirecting
  if (!isLoaded || !isSignedIn) {
    return (
      <LinearGradient
        colors={["#fdf2f8", "#fce7f3"]}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#e11d48" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </LinearGradient>
    );
  }

  const menuItems = [
    {
      id: "1",
      title: "My Orders",
      subtitle: "Track your orders",
      icon: "bag-outline",
      onPress: () => {}, // Navigate to orders
    },
    {
      id: "2",
      title: "Wishlist",
      subtitle: "Your saved items",
      icon: "heart-outline",
      onPress: () => {}, // Navigate to wishlist
    },
    {
      id: "3",
      title: "Addresses",
      subtitle: "Manage shipping addresses",
      icon: "location-outline",
      onPress: () => {}, // Navigate to addresses
    },
    {
      id: "4",
      title: "Payment Methods",
      subtitle: "Manage cards and payments",
      icon: "card-outline",
      onPress: () => {}, // Navigate to payments
    },
    {
      id: "5",
      title: "Notifications",
      subtitle: "Notification preferences",
      icon: "notifications-outline",
      onPress: () => {}, // Navigate to notifications
    },
    {
      id: "6",
      title: "Account Settings",
      subtitle: "Manage your account details",
      icon: "settings-outline",
      onPress: handleAccountSettings,
    },
    {
      id: "7",
      title: "Help & Support",
      subtitle: "Get help and support",
      icon: "help-circle-outline",
      onPress: () => navigation.navigate("Help"),
    },
    {
      id: "8",
      title: "Sign Out",
      subtitle: "Sign out of your account",
      icon: "log-out-outline",
      onPress: handleSignOut,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                user?.imageUrl ||
                "https://via.placeholder.com/80x80/C9A961/FFFFFF?text=" +
                  (user?.firstName?.[0] || "U"),
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {user?.firstName || ""} {user?.lastName || ""}
            </Text>
            <Text style={styles.userEmail}>
              {user?.primaryEmailAddress?.emailAddress || ""}
            </Text>
            <Text style={styles.memberSince}>
              Member since{" "}
              {user?.createdAt
                ? new Date(user.createdAt).getFullYear()
                : "2024"}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={20} color="#C9A961" />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={24} color="#C9A961" />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={20} color="#ff4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavigation currentRoute="/profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  profileSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: "#999",
  },
  editButton: {
    padding: 8,
  },
  menuSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ff4444",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    minWidth: 200,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 20,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e11d48",
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
});

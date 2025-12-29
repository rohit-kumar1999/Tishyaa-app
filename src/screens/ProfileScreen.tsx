import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavigation from "../components/common/BottomNavigation";
import { formatDate } from "../utils";

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  showChevron?: boolean;
}

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const { signOut, isSignedIn } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Sign out failed silently
    }
  };

  // Menu items for signed-in users
  const menuItems: MenuItem[] = [
    {
      id: "orders",
      title: "My Orders",
      subtitle: "Track your purchases",
      icon: "bag-outline" as const,
      route: "/profile/orders",
      showChevron: true,
    },
    {
      id: "wishlist",
      title: "My Wishlist",
      subtitle: "Saved items you love",
      icon: "heart-outline" as const,
      route: "/wishlist",
      showChevron: true,
    },
    {
      id: "addresses",
      title: "My Addresses",
      subtitle: "Manage delivery addresses",
      icon: "location-outline" as const,
      route: "/profile/addresses",
      showChevron: true,
    },
    {
      id: "preferences",
      title: "Preferences",
      subtitle: "Notifications & privacy",
      icon: "notifications-outline" as const,
      route: "/profile/preferences",
      showChevron: true,
    },
    {
      id: "account",
      title: "Account Settings",
      subtitle: "Edit profile information",
      icon: "person-outline" as const,
      route: "/profile/account-settings",
      showChevron: true,
    },
    {
      id: "help",
      title: "Help & Support",
      subtitle: "FAQs and contact us",
      icon: "help-circle-outline" as const,
      route: "/help",
      showChevron: true,
    },
  ];

  // Loading state
  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#fdf2f8", "#fce7f3"]} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#fdf2f8", "#fce7f3"]} style={styles.gradient}>
        <ScrollView style={styles.scrollView}>
          <SignedIn>
            {/* Profile Header */}
            <View style={styles.profileSection}>
              <View style={styles.profileCard}>
                <View style={styles.profileInfo}>
                  {user?.imageUrl ? (
                    <Image
                      source={{ uri: user.imageUrl }}
                      style={styles.avatar}
                      cachePolicy="memory-disk"
                      transition={200}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={30} color="#e11d48" />
                    </View>
                  )}

                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.emailAddresses[0]?.emailAddress || "User"}
                    </Text>
                    <Text style={styles.userEmail}>
                      {user?.emailAddresses[0]?.emailAddress}
                    </Text>
                    {user?.createdAt && (
                      <Text style={styles.memberSince}>
                        Member since {formatDate(user.createdAt)}
                      </Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push("/profile/account-settings")}
                >
                  <Ionicons name="pencil-outline" size={20} color="#e11d48" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={item.icon} size={24} color="#e11d48" />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      <Text style={styles.menuItemSubtitle}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                  {item.showChevron && (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9ca3af"
                    />
                  )}
                </TouchableOpacity>
              ))}

              {/* Sign Out Button */}
              <TouchableOpacity
                style={[styles.menuItem, styles.signOutItem]}
                onPress={handleSignOut}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[styles.iconContainer, styles.signOutIconContainer]}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={24}
                      color="#ef4444"
                    />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={[styles.menuItemTitle, styles.signOutText]}>
                      Sign Out
                    </Text>
                    <Text style={styles.menuItemSubtitle}>
                      Sign out of your account
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </SignedIn>

          <SignedOut>
            {/* Sign In Prompt */}
            <View style={styles.signInSection}>
              <View style={styles.signInCard}>
                <View style={styles.signInIconContainer}>
                  <Ionicons
                    name="person-circle-outline"
                    size={80}
                    color="#e11d48"
                  />
                </View>

                <Text style={styles.signInTitle}>Welcome to Tishyaa</Text>
                <Text style={styles.signInSubtitle}>
                  Sign in to access your orders, wishlist, and personalized
                  recommendations
                </Text>

                <View style={styles.signInButtons}>
                  <Link href="/auth" asChild>
                    <TouchableOpacity style={styles.signInButton}>
                      <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>
                  </Link>

                  <Link href="/auth" asChild>
                    <TouchableOpacity style={styles.signUpButton}>
                      <Text style={styles.signUpButtonText}>
                        Create Account
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>

              {/* Guest Menu Items */}
              <View style={styles.guestMenuSection}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => router.push("/help")}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name="help-circle-outline"
                        size={24}
                        color="#e11d48"
                      />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>Help & Support</Text>
                      <Text style={styles.menuItemSubtitle}>
                        FAQs and contact us
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => router.push("/about")}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name="information-circle-outline"
                        size={24}
                        color="#e11d48"
                      />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemTitle}>About Tishyaa</Text>
                      <Text style={styles.menuItemSubtitle}>
                        Learn more about us
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
          </SignedOut>
        </ScrollView>

        <BottomNavigation currentRoute="/profile" />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  profileSection: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: "#9ca3af",
  },
  editButton: {
    padding: 8,
  },
  menuSection: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  guestMenuSection: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  signOutItem: {
    borderBottomWidth: 0,
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
    backgroundColor: "#fdf2f8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  signOutIconContainer: {
    backgroundColor: "#fef2f2",
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  signOutText: {
    color: "#ef4444",
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  signInSection: {
    padding: 20,
  },
  signInCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  signInIconContainer: {
    marginBottom: 20,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  signInSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  signInButtons: {
    width: "100%",
    gap: 12,
  },
  signInButton: {
    backgroundColor: "#e11d48",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpButton: {
    backgroundColor: "transparent",
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e11d48",
    alignItems: "center",
    justifyContent: "center",
  },
  signUpButtonText: {
    color: "#e11d48",
    fontSize: 16,
    fontWeight: "600",
  },
});

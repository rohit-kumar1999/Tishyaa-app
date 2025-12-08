import { Feather } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Badge } from "./ui/badge";

// Placeholder for user authentication - replace with actual auth hook
const useUser = () => {
  // This should be replaced with actual user data from your auth system
  return {
    user: null, // Set to user object when authenticated
  };
};

// Placeholder for admin check - replace with actual auth logic
const isUserAdmin = (user: any) => {
  // Replace with actual admin check logic
  return user?.role === "admin" || user?.isAdmin;
};

// Placeholder for user display info - replace with actual auth logic
const getUserDisplayInfo = (user: any) => {
  return {
    name: user?.name || user?.fullName || "Admin User",
    imageUrl: user?.imageUrl || user?.avatar,
    role: user?.role || "admin",
  };
};

const AdminNavigation: React.FC = () => {
  const { user } = useUser();
  const navigation = useNavigation<NavigationProp<any>>();

  if (!user || !isUserAdmin(user)) {
    return null;
  }

  const userInfo = getUserDisplayInfo(user);

  const adminLinks = [
    {
      title: "Dashboard",
      screen: "AdminDashboard",
      icon: "bar-chart",
      description: "Overview & Analytics",
    },
    {
      title: "Products",
      screen: "AdminProducts",
      icon: "package",
      description: "Manage Inventory",
    },
    {
      title: "Orders",
      screen: "AdminOrders",
      icon: "shopping-cart",
      description: "Order Management",
    },
    {
      title: "Users",
      screen: "AdminUsers",
      icon: "users",
      description: "User Management",
    },
    {
      title: "Coupons",
      screen: "AdminCoupons",
      icon: "tag",
      description: "Coupon Management",
    },
    {
      title: "Settings",
      screen: "AdminSettings",
      icon: "settings",
      description: "Store Configuration",
    },
  ];

  const handleNavigateToScreen = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Admin Info */}
        <View style={styles.adminInfo}>
          <View style={styles.userSection}>
            <Image
              source={{
                uri:
                  userInfo?.imageUrl ||
                  "https://via.placeholder.com/32x32?text=A",
              }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userInfo?.name}</Text>
              <Badge variant="default" style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {userInfo?.role === "admin" ? "Admin" : "User"}
                </Text>
              </Badge>
            </View>
          </View>
        </View>

        {/* Admin Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.actionsContainer}
          contentContainerStyle={styles.actionsContent}
        >
          {adminLinks.map((link) => (
            <TouchableOpacity
              key={link.screen}
              style={styles.actionButton}
              onPress={() => handleNavigateToScreen(link.screen)}
            >
              <Feather name={link.icon as any} size={16} color="#374151" />
              <Text style={styles.actionText}>{link.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adminInfo: {
    flex: 1,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  roleBadge: {
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 10,
    fontWeight: "600",
  },
  actionsContainer: {
    flex: 2,
  },
  actionsContent: {
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "transparent",
    borderRadius: 6,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 12,
    color: "#374151",
    marginLeft: 4,
    fontWeight: "500",
  },
});

export default AdminNavigation;

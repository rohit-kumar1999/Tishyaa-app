import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from "react-native";

interface BottomNavigationProps {
  currentRoute?: string;
}

export default function BottomNavigation({
  currentRoute,
}: BottomNavigationProps) {
  const pathname = usePathname();
  const activeRoute = currentRoute || pathname;

  const navigateTo = (route: string) => {
    router.push(route);
  };

  const tabs = [
    { key: "home", route: "/home", icon: "home", label: "Home" },
    {
      key: "collection",
      route: "/products",
      icon: "diamond-outline",
      label: "Collection",
    },
    {
      key: "category",
      route: "/categories",
      icon: "grid-outline",
      label: "Category",
    },
    {
      key: "new-arrivals",
      route: "/products?newArrivals=true&sortBy=createdAt&sortOrder=desc",
      icon: "sparkles-outline",
      label: "New",
    },
    {
      key: "gifting",
      route: "/gifting",
      icon: "gift-outline",
      label: "Gifting",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 255, 255, 1)"]}
        style={styles.bottomTab}
      >
        {tabs.map((tab) => {
          const isActive = activeRoute.includes(tab.key);
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => navigateTo(tab.route)}
            >
              <Ionicons
                name={
                  isActive
                    ? (tab.icon.replace("-outline", "") as any)
                    : (tab.icon as any)
                }
                size={24}
                color={isActive ? "#6366f1" : "#9ca3af"}
              />
              <Text
                style={[styles.tabLabel, isActive && styles.activeTabLabel]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  bottomTab: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9ca3af",
    marginTop: 4,
  },
  activeTabLabel: {
    color: "#6366f1",
  },
});

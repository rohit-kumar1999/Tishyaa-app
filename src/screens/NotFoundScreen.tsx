import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../types";

type NotFoundScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get("window");

export default function NotFoundScreen() {
  const navigation = useNavigation<NotFoundScreenNavigationProp>();

  const handleGoHome = () => {
    navigation.navigate("Main");
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      handleGoHome();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F9FAFB", "#F3F4F6"]} style={styles.gradient}>
        <View style={styles.content}>
          {/* 404 Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.numberContainer}>
              <Text style={styles.number}>4</Text>
              <View style={styles.zeroContainer}>
                <Ionicons name="search" size={80} color="#E5E7EB" />
              </View>
              <Text style={styles.number}>4</Text>
            </View>
          </View>

          {/* Error Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Oops! Page not found</Text>
            <Text style={styles.subtitle}>
              The page you're looking for doesn't exist or has been moved.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGoHome}
            >
              <Ionicons name="home" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Go to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGoBack}
            >
              <Ionicons name="arrow-back" size={20} color="#C9A961" />
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>

          {/* Helpful Links */}
          <View style={styles.linksContainer}>
            <Text style={styles.linksTitle}>Quick Links:</Text>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => navigation.navigate("Main")}
            >
              <Ionicons name="storefront" size={16} color="#6B7280" />
              <Text style={styles.linkText}>Browse Products</Text>
              <Ionicons name="chevron-forward" size={16} color="#C9A961" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => navigation.navigate("Cart")}
            >
              <Ionicons name="bag" size={16} color="#6B7280" />
              <Text style={styles.linkText}>View Cart</Text>
              <Ionicons name="chevron-forward" size={16} color="#C9A961" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => navigation.navigate("Main")}
            >
              <Ionicons name="person" size={16} color="#6B7280" />
              <Text style={styles.linkText}>My Account</Text>
              <Ionicons name="chevron-forward" size={16} color="#C9A961" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => navigation.navigate("Contact")}
            >
              <Ionicons name="help-circle" size={16} color="#6B7280" />
              <Text style={styles.linkText}>Get Help</Text>
              <Ionicons name="chevron-forward" size={16} color="#C9A961" />
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  illustrationContainer: {
    marginBottom: 40,
  },
  numberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    fontSize: 120,
    fontWeight: "bold",
    color: "#C9A961",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  zeroContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#E5E7EB",
    borderRadius: 60,
    backgroundColor: "white",
    marginHorizontal: 8,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonsContainer: {
    width: "100%",
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C9A961",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#C9A961",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#C9A961",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: "#C9A961",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  linksContainer: {
    width: "100%",
  },
  linksTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
  },
});

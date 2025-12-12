import { SignedOut } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SignIn from "./sign-in";
import SignUp from "./sign-up";

export default function AuthIndexScreen() {
  const [authType, setAuthType] = useState<"signin" | "signup">("signin");
  const router = useRouter();

  const handleTabChange = (type: "signin" | "signup") => {
    console.log("Tab changed from", authType, "to:", type);
    setAuthType(type);
  };

  console.log("Current authType:", authType);

  useEffect(() => {
    console.log("Auth type changed to:", authType);
  }, [authType]);

  return (
    <SignedOut>
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#fdf2f8", "#fce7f3"]}
          style={styles.background}
        >
          <View style={styles.content}>
            {/* App Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.appTitle}>Welcome to Tishyaa</Text>
              <Text style={styles.appSubtitle}>Your Fashion Destination</Text>
            </View>

            {/* Toggle Buttons */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  authType === "signin"
                    ? styles.toggleButtonActive
                    : styles.toggleButtonInactive,
                ]}
                onPress={() => handleTabChange("signin")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    authType === "signin"
                      ? styles.toggleTextActive
                      : styles.toggleTextInactive,
                  ]}
                >
                  Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  authType === "signup"
                    ? styles.toggleButtonActive
                    : styles.toggleButtonInactive,
                ]}
                onPress={() => handleTabChange("signup")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    authType === "signup"
                      ? styles.toggleTextActive
                      : styles.toggleTextInactive,
                  ]}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* Auth Form */}
            <View style={styles.formContainer}>
              {authType === "signin" && <SignIn key="signin" />}
              {authType === "signup" && <SignUp key="signup" />}
            </View>

            {/* Terms for Sign Up */}
            {authType === "signup" && (
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By signing up, you accept our{" "}
                </Text>
                <Pressable onPress={() => router.push("/help/terms")}>
                  <Text style={styles.termsLink}>terms and conditions</Text>
                </Pressable>
              </View>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    </SignedOut>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: "center",
    gap: 32,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "400",
  },

  formContainer: {
    width: "100%",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  termsText: {
    fontSize: 12,
    color: "#6b7280",
  },
  termsLink: {
    fontSize: 12,
    color: "#e11d48",
    textDecorationLine: "underline",
  },

  toggleContainer: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffffff",
    width: "100%",
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  toggleButtonActive: {
    backgroundColor: "#e11d48",
  },

  toggleButtonInactive: {
    backgroundColor: "transparent",
  },

  toggleText: {
    fontSize: 16,
    fontWeight: "600",
  },

  toggleTextActive: {
    color: "#ffffff",
  },

  toggleTextInactive: {
    color: "#4f4e4eaa",
  },
});

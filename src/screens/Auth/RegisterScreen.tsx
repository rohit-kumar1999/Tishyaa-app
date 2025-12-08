import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!acceptedTerms) {
      Alert.alert("Error", "Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    // Simulate registration API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Success", "Account created successfully!");
      router.push("/auth/login");
    }, 2000);
  };

  return (
    <LinearGradient
      colors={["#fdf2f8", "#fce7f3", "#f3e8ff"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Join Sparkle & Shine</Text>
              <Text style={styles.subtitle}>
                Create your account to start shopping
              </Text>
            </View>

            {/* Registration Form */}
            <View style={styles.form}>
              {/* Name Row */}
              <View style={styles.nameRow}>
                <View style={styles.nameInput}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(value) =>
                      handleInputChange("firstName", value)
                    }
                    placeholder="First name"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.nameInput}>
                  <Text style={styles.label}>Last Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(value) =>
                      handleInputChange("lastName", value)
                    }
                    placeholder="Last name"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange("phone", value)}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={formData.password}
                    onChangeText={(value) =>
                      handleInputChange("password", value)
                    }
                    placeholder="Create a password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password *</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      handleInputChange("confirmPassword", value)
                    }
                    placeholder="Confirm your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms and Conditions */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedTerms && styles.checkboxChecked,
                  ]}
                >
                  {acceptedTerms && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </View>
                <Text style={styles.checkboxText}>
                  I agree to the{" "}
                  <Text style={styles.link}>Terms and Conditions</Text> and{" "}
                  <Text style={styles.link}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Register Button */}
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.buttonText}>Creating Account...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login */}
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={20} color="#dc2626" />
                <Text style={styles.socialButtonText}>
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={20} color="#000000" />
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  nameInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  link: {
    color: "#6366f1",
    fontWeight: "500",
  },
  registerButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#6b7280",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  footerLink: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "600",
  },
});

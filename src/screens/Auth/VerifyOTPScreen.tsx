import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { email, phone } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid 6-digit OTP",
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement OTP verification logic
      console.log("Verifying OTP:", otp);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert("Success", "OTP verified successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/home"),
        },
      ]);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Invalid OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      // TODO: Implement resend OTP logic
      console.log("Resending OTP to:", email || phone);
      Alert.alert("Success", "OTP sent successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {email || phone}
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              autoFocus
            />

            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              <Text style={styles.verifyButtonText}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOTP}
            >
              <Text style={styles.resendButtonText}>Resend OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#C9A961",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  form: {
    width: "100%",
  },
  otpInput: {
    borderWidth: 2,
    borderColor: "#C9A961",
    borderRadius: 8,
    padding: 15,
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 8,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
  },
  verifyButton: {
    backgroundColor: "#C9A961",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  resendButton: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  resendButtonText: {
    color: "#C9A961",
    fontSize: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  backButton: {
    paddingVertical: 10,
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
});

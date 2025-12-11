import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { FontAwesome } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { PasswordInput } from "./components/PasswordInput";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      setLoading(true);
      const signInAttempt =
        email && password
          ? await signIn.create({
              identifier: email,
              password,
            })
          : undefined;

      if (signInAttempt?.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(tabs)");
      } else {
        Toast.show({
          type: "error",
          text1: "Sign-in failed",
          text2: "Incomplete sign-in. Try again.",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Sign-in Error",
        text2: err?.errors?.[0]?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password]);

  const onForgotPasswordPress = useCallback(async () => {
    if (!isLoaded || !email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your email address.",
      });
      return;
    }

    try {
      setLoading(true);
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setIsResettingPassword(true);
      Toast.show({
        type: "success",
        text1: "Reset Code Sent",
        text2: "Check your email for the password reset code.",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.errors?.[0]?.message || "Failed to send reset code.",
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email]);

  const onResetPassword = useCallback(async () => {
    if (!isLoaded || !resetCode || !newPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter the reset code and new password.",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setIsResettingPassword(false);
        setResetCode("");
        setNewPassword("");
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Password reset successfully.",
        });
        router.replace("/(tabs)");
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Invalid reset code. Please try again.",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.errors?.[0]?.message || "Failed to reset password.",
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, resetCode, newPassword]);

  const onGoogleSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      setLoadingGoogle(true);
      const redirectUrl = Linking.createURL("/(tabs)", { scheme: "myapp" });
      const { createdSessionId, setActive: setActiveG } = await startOAuthFlow({
        redirectUrl,
      });

      if (createdSessionId) {
        await setActiveG?.({ session: createdSessionId });
        router.replace("/(tabs)");
      } else {
        Toast.show({
          type: "error",
          text1: "Google Sign-In Failed",
          text2: "Unable to complete Google sign-in. Try again.",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Google Sign-In Error",
        text2: err?.errors?.[0]?.message || "Please try again.",
      });
    } finally {
      setLoadingGoogle(false);
    }
  }, [isLoaded, startOAuthFlow]);

  return (
    <View style={styles.container}>
      {!isResettingPassword ? (
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#9ca3af"
            />
            <PasswordInput
              password={password}
              setPassword={setPassword}
              placeholder="Password"
            />
            <Pressable onPress={onForgotPasswordPress}>
              <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
            </Pressable>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.signInButton, loading && styles.disabledButton]}
              onPress={onSignInPress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.googleButton,
                loadingGoogle && styles.disabledButton,
              ]}
              onPress={onGoogleSignInPress}
              disabled={loadingGoogle}
            >
              {loadingGoogle ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <FontAwesome name="google" size={20} color="white" />
                  <Text style={styles.googleButtonText}>
                    Sign in with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={resetCode}
              onChangeText={setResetCode}
              placeholder="Enter reset code"
              placeholderTextColor="#9ca3af"
            />
            <PasswordInput
              password={newPassword}
              setPassword={setNewPassword}
              placeholder="New password"
            />
            <Pressable onPress={() => setIsResettingPassword(false)}>
              <Text style={styles.forgotPasswordLink}>Back to Sign In</Text>
            </Pressable>
          </View>

          <TouchableOpacity
            style={[styles.signInButton, loading && styles.disabledButton]}
            onPress={onResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.signInButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  formContainer: {
    width: "100%",
    gap: 32,
  },
  inputGroup: {
    flexDirection: "column",
    gap: 12,
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    color: "#111827",
  },
  forgotPasswordLink: {
    textDecorationLine: "underline",
    color: "#e11d48",
    paddingLeft: 4,
    fontSize: 14,
  },
  buttonGroup: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    width: "100%",
  },
  signInButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#e11d48",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  signInButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  googleButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#e11d48",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
  },
  googleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.7,
  },
});

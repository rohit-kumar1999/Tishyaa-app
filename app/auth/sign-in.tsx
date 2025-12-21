import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { FontAwesome } from "@expo/vector-icons";
import type { EmailCodeFactor } from "@clerk/types";
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
import { toast } from "../../src/hooks/use-toast";
import { PasswordInput } from "./_components/PasswordInput";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // 2FA state
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [secondFactorCode, setSecondFactorCode] = useState("");

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/home");
      } else if (signInAttempt.status === "needs_second_factor") {
        // Handle Client Trust - find email_code factor and prepare verification
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === "email_code"
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setNeedsSecondFactor(true);
          toast({
            title: "Verification Required",
            description: "A verification code has been sent to your email.",
            variant: "success",
          });
        } else {
          toast({
            title: "Error",
            description: "No email verification method available.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Sign-in failed",
          description: "Incomplete sign-in. Try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Sign-in Error",
        description: err?.errors?.[0]?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password, signIn, setActive]);

  // Handle 2FA code verification
  const onVerifySecondFactor = useCallback(async () => {
    if (!isLoaded || !secondFactorCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: secondFactorCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setNeedsSecondFactor(false);
        setSecondFactorCode("");
        router.replace("/home");
      } else {
        toast({
          title: "Error",
          description: "Verification failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Verification Error",
        description: err?.errors?.[0]?.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, secondFactorCode, signIn, setActive]);

  const onForgotPasswordPress = useCallback(async () => {
    if (!isLoaded || !email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
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
      toast({
        title: "Reset Code Sent",
        description: "Check your email for the password reset code.",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.errors?.[0]?.message || "Failed to send reset code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email]);

  const onResetPassword = useCallback(async () => {
    if (!isLoaded || !resetCode || !newPassword) {
      toast({
        title: "Error",
        description: "Please enter the reset code and new password.",
        variant: "destructive",
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
        toast({
          title: "Success",
          description: "Password reset successfully.",
          variant: "success",
        });
        router.replace("/home");
      } else {
        toast({
          title: "Error",
          description: "Invalid reset code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.errors?.[0]?.message || "Failed to reset password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isLoaded, resetCode, newPassword]);

  const onGoogleSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      setLoadingGoogle(true);
      const redirectUrl = Linking.createURL("/home", { scheme: "myapp" });
      const { createdSessionId, setActive: setActiveG } = await startOAuthFlow({
        redirectUrl,
      });

      if (createdSessionId) {
        await setActiveG?.({ session: createdSessionId });
        router.replace("/home");
      } else {
        toast({
          title: "Google Sign-In Failed",
          description: "Unable to complete Google sign-in. Try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Google Sign-In Error",
        description: err?.errors?.[0]?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingGoogle(false);
    }
  }, [isLoaded, startOAuthFlow]);

  return (
    <View style={styles.container}>
      {needsSecondFactor ? (
        // 2FA Verification Screen
        <View style={styles.formContainer}>
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.subtitle}>
            A verification code has been sent to your email
          </Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={secondFactorCode}
              onChangeText={setSecondFactorCode}
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              maxLength={6}
              placeholderTextColor="#9ca3af"
            />
            <Pressable onPress={() => {
              setNeedsSecondFactor(false);
              setSecondFactorCode("");
            }}>
              <Text style={styles.forgotPasswordLink}>Back to Sign In</Text>
            </Pressable>
          </View>

          <TouchableOpacity
            style={[styles.signInButton, loading && styles.disabledButton]}
            onPress={onVerifySecondFactor}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.signInButtonText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : !isResettingPassword ? (
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: -16,
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

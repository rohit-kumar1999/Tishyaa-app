import { useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { PasswordInput, validatePassword } from "./components/PasswordInput";
import { splitName } from "./utils/nameUtils";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      Toast.show({
        type: "error",
        text1: "Invalid Password",
        text2: passwordError,
      });
      return;
    }

    setLoading(true);

    const { firstName, lastName } = name
      ? splitName(name)
      : { firstName: undefined, lastName: undefined };

    try {
      await signUp.create({
        firstName,
        lastName,
        phoneNumber: phone ? `+91${phone}` : undefined,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      Toast.show({
        type: "success",
        text1: "Verification Code Sent",
        text2: "Check your email for the verification code.",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Sign-up Error",
        text2: err?.errors?.[0]?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(tabs)");
        Toast.show({
          type: "success",
          text1: "Welcome!",
          text2: "Account created successfully.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Verification Error",
          text2: "Verification incomplete. Try again.",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Verification Error",
        text2: err?.errors?.[0]?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Verify your email</Text>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Enter your verification code"
            onChangeText={setCode}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.disabledButton]}
            onPress={onVerifyPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.signUpButtonText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter Your Name..."
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter Your Email..."
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter Your Phone"
            keyboardType="phone-pad"
            placeholderTextColor="#9ca3af"
          />
          <PasswordInput
            password={password}
            setPassword={setPassword}
            placeholder="Enter Your Password"
          />
          {password.length > 0 && (
            <Text style={styles.passwordHint}>
              {validatePassword(password)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.signUpButton, loading && styles.disabledButton]}
          onPress={onSignUpPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.signUpButtonText}>Sign up</Text>
          )}
        </TouchableOpacity>
      </View>
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
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
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
  passwordHint: {
    fontSize: 14,
    color: "#dc2626",
    marginTop: -8,
    paddingLeft: 4,
  },
  signUpButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#e11d48",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginTop: 16,
  },
  signUpButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});

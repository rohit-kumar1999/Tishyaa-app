import { PasswordInput } from "@/components/PasswordInput";
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
import { toast } from "../../src/hooks/use-toast";

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
    setLoading(true);

    try {
      const [firstName, lastName] = name.trim().split(" ");
      await signUp.create({
        firstName,
        lastName,
        phoneNumber: phone ? `+91${phone}` : undefined,
        emailAddress: email,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      toast({
        title: "Sign-up Error",
        description:
          err?.errors?.map((e: any) => e.longMessage).join(", ") ||
          "Please try again.",
        variant: "destructive",
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

        toast({
          title: "Welcome to Tishyaa! 🎉",
          description: "Your account has been created successfully.",
          variant: "success",
        });

        router.replace("/home");
      } else {
        toast({
          title: "Verification Incomplete",
          description: signUpAttempt.unverifiedFields?.length
            ? `Still need to verify: ${signUpAttempt.unverifiedFields.join(
                ", "
              )}`
            : "Please try again or contact support.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Verification Error",
        description:
          err?.errors?.map((e: any) => e.longMessage).join(", ") ||
          "Please try again.",
        variant: "destructive",
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
            keyboardType="numeric"
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
        <Text style={styles.title}>Create Your Account</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter Your Name..."
          placeholderTextColor="#9ca3af"
        />

        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter Your Phone (Optional)"
          keyboardType="phone-pad"
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

        <PasswordInput
          password={password}
          setPassword={setPassword}
          placeholder="Enter Your Password"
        />

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
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    color: "#111827",
    marginBottom: 12,
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

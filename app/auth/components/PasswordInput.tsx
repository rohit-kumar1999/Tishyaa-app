import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface PasswordInputProps {
  password: string;
  setPassword: (password: string) => void;
  placeholder: string;
  style?: any;
}

export function PasswordInput({
  password,
  setPassword,
  placeholder,
  style,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.textInput}
        value={password}
        onChangeText={setPassword}
        placeholder={placeholder}
        secureTextEntry={!showPassword}
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.eyeButton}
        onPress={() => setShowPassword(!showPassword)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={showPassword ? "eye-outline" : "eye-off-outline"}
          size={20}
          color="#9ca3af"
        />
      </TouchableOpacity>
    </View>
  );
}

// Password validation function
export function validatePassword(password: string): string {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  if (password.length < minLength) {
    return "Password must be at least 8 characters long.";
  }
  if (!hasUpperCase) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!hasLowerCase) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!hasNumber) {
    return "Password must contain at least one number.";
  }
  if (!hasSpecialChar) {
    return "Password must contain at least one special character (!@#$%^&*).";
  }
  return "";
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  eyeButton: {
    padding: 12,
  },
});

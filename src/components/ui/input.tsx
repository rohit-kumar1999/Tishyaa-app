import React from "react";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export interface InputProps extends RNTextInputProps {
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

const Input: React.FC<InputProps> = ({
  containerStyle,
  inputStyle,
  variant = "default",
  size = "default",
  ...props
}) => {
  const getContainerStyle = (): ViewStyle => {
    const baseStyle = styles.container;
    const variantStyle = variants[variant];
    const sizeStyle = sizes[size];

    return {
      ...baseStyle,
      ...variantStyle,
      ...sizeStyle,
      ...containerStyle,
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      ...styles.input,
      ...inputStyle,
    };
  };

  return (
    <View style={getContainerStyle()}>
      <RNTextInput
        style={getInputStyle()}
        placeholderTextColor="#9ca3af"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  input: {
    fontSize: 14,
    color: "#000",
    padding: 0,
  },
});

const variants: Record<"default" | "outline", ViewStyle> = {
  default: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  outline: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
};

const sizes: Record<"default" | "sm" | "lg", ViewStyle> = {
  default: {
    height: 40,
  },
  sm: {
    height: 36,
  },
  lg: {
    height: 44,
  },
};

export { Input };

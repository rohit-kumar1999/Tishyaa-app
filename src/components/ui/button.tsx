import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import { TouchableOpacity } from "../common/TouchableOpacity";

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = "default",
  size = "default",
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.base;
    const variantStyle = (styles.variants as Record<string, ViewStyle>)[
      variant
    ];
    const sizeStyle = (styles.sizes as Record<string, ViewStyle>)[size];

    return {
      ...baseStyle,
      ...variantStyle,
      ...sizeStyle,
      ...(disabled && styles.disabled),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = styles.text;
    const variantTextStyle = (styles.textVariants as Record<string, TextStyle>)[
      variant
    ];
    const sizeTextStyle = (styles.textSizes as Record<string, TextStyle>)[size];

    return {
      ...baseTextStyle,
      ...variantTextStyle,
      ...sizeTextStyle,
      ...(disabled && styles.disabledText),
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "default" ? "#fff" : "#000"}
        />
      ) : (
        <Text style={getTextStyle()}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const baseStyles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    flexDirection: "row",
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});

const variants: Record<string, ViewStyle> = {
  default: {
    backgroundColor: "#000",
  },
  destructive: {
    backgroundColor: "#ef4444",
  },
  outline: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "transparent",
  },
  secondary: {
    backgroundColor: "#f3f4f6",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  link: {
    backgroundColor: "transparent",
  },
};

const sizes: Record<string, ViewStyle> = {
  default: {
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sm: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  lg: {
    height: 44,
    paddingHorizontal: 32,
    borderRadius: 6,
  },
  icon: {
    height: 40,
    width: 40,
  },
};

const textVariants: Record<string, TextStyle> = {
  default: {
    color: "#fff",
  },
  destructive: {
    color: "#fff",
  },
  outline: {
    color: "#000",
  },
  secondary: {
    color: "#374151",
  },
  ghost: {
    color: "#000",
  },
  link: {
    color: "#000",
    textDecorationLine: "underline",
  },
};

const textSizes: Record<string, TextStyle> = {
  default: {
    fontSize: 14,
  },
  sm: {
    fontSize: 13,
  },
  lg: {
    fontSize: 16,
  },
  icon: {
    fontSize: 14,
  },
};

const styles = {
  base: baseStyles.base,
  text: baseStyles.text,
  disabled: baseStyles.disabled,
  disabledText: baseStyles.disabledText,
  variants,
  sizes,
  textVariants,
  textSizes,
};

export { Button };

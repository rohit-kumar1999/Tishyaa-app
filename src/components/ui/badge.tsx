import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  style,
  textStyle,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    const baseStyle = styles.base;
    const variantStyle = variants[variant];

    return {
      ...baseStyle,
      ...variantStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = styles.text;
    const variantTextStyle = textVariants[variant];

    return {
      ...baseTextStyle,
      ...variantTextStyle,
      ...textStyle,
    };
  };

  return (
    <View style={getBadgeStyle()}>
      <Text style={getTextStyle()}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});

const variants = {
  default: {
    backgroundColor: "#000",
    borderColor: "transparent",
  },
  secondary: {
    backgroundColor: "#f3f4f6",
    borderColor: "transparent",
  },
  destructive: {
    backgroundColor: "#ef4444",
    borderColor: "transparent",
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: "#d1d5db",
  },
};

const textVariants = {
  default: {
    color: "#fff",
  },
  secondary: {
    color: "#374151",
  },
  destructive: {
    color: "#fff",
  },
  outline: {
    color: "#000",
  },
};

export { Badge };

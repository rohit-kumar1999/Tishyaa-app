import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  text?: string;
  style?: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color = "#C9A961",
  text = "Loading...",
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, { color }]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default LoadingSpinner;

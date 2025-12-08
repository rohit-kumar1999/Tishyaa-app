import React from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color = "#C9A961",
  text = "Loading...",
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text = "Loading...",
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color="#C9A961" />
        <Text style={styles.overlayText}>{text}</Text>
      </View>
    </View>
  );
};

interface SkeletonLoaderProps {
  width?: number | "auto" | `${number}%`;
  height?: number;
  borderRadius?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%" as const,
  height = 20,
  borderRadius = 4,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        { opacity },
      ]}
    />
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
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 120,
  },
  overlayText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  skeleton: {
    backgroundColor: "#E0E0E0",
  },
});

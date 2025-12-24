import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  TouchableOpacity as RNTouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";

interface PressableButtonProps extends Omit<TouchableOpacityProps, "onPress"> {
  /**
   * The function to call when the button is pressed
   */
  onPress?: (event: GestureResponderEvent) => void | Promise<void>;

  /**
   * Minimum delay between clicks in milliseconds (default: 500ms)
   */
  debounceDelay?: number;

  /**
   * Show loading indicator while async operation is in progress
   */
  showLoadingOnAsync?: boolean;

  /**
   * Custom loading indicator color
   */
  loadingColor?: string;

  /**
   * Enable haptic feedback on press
   */
  enableHaptic?: boolean;

  /**
   * Type of haptic feedback
   */
  hapticType?: "light" | "medium" | "heavy";

  /**
   * Disable the button
   */
  disabled?: boolean;

  /**
   * Children elements
   */
  children: React.ReactNode;

  /**
   * Style for the button
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Style when button is disabled
   */
  disabledStyle?: StyleProp<ViewStyle>;

  /**
   * Loading indicator size
   */
  loadingSize?: "small" | "large";

  /**
   * External loading state (useful when parent controls loading)
   */
  isLoading?: boolean;
}

/**
 * A button component with built-in double-click prevention
 *
 * Features:
 * - Prevents rapid successive clicks
 * - Automatic loading state for async handlers
 * - Haptic feedback support
 * - Press animation
 *
 * @example
 * ```tsx
 * <PressableButton
 *   onPress={async () => {
 *     await submitForm();
 *   }}
 *   showLoadingOnAsync
 *   enableHaptic
 * >
 *   <Text>Submit</Text>
 * </PressableButton>
 * ```
 */
export const PressableButton: React.FC<PressableButtonProps> = ({
  onPress,
  debounceDelay = 500,
  showLoadingOnAsync = false,
  loadingColor = "#fff",
  enableHaptic = false,
  hapticType = "light",
  disabled = false,
  children,
  style,
  disabledStyle,
  loadingSize = "small",
  isLoading: externalLoading,
  ...props
}) => {
  const lastClickTime = useRef<number>(0);
  const [internalLoading, setInternalLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isLoading = externalLoading ?? internalLoading;
  const isDisabled = disabled || isLoading;

  const triggerHaptic = useCallback(async () => {
    if (!enableHaptic) return;

    try {
      switch (hapticType) {
        case "light":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "medium":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "heavy":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      // Haptics not available on some devices
    }
  }, [enableHaptic, hapticType]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(
    async (event: GestureResponderEvent) => {
      if (!onPress || isDisabled) return;

      const now = Date.now();

      // Prevent double clicks
      if (now - lastClickTime.current < debounceDelay) {
        return;
      }

      lastClickTime.current = now;

      // Trigger haptic feedback
      await triggerHaptic();

      // Execute the callback
      const result = onPress(event);

      // Handle async operations
      if (result instanceof Promise && showLoadingOnAsync) {
        setInternalLoading(true);
        try {
          await result;
        } finally {
          setInternalLoading(false);
        }
      }
    },
    [onPress, isDisabled, debounceDelay, triggerHaptic, showLoadingOnAsync]
  );

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <RNTouchableOpacity
        {...props}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[style, isDisabled && (disabledStyle || styles.disabledButton)]}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={loadingSize} color={loadingColor} />
          </View>
        ) : (
          children
        )}
      </RNTouchableOpacity>
    </Animated.View>
  );
};

/**
 * A simpler version using Pressable with scale animation
 */
interface SafePressableProps extends Omit<PressableProps, "onPress"> {
  onPress?: (event: GestureResponderEvent) => void | Promise<void>;
  debounceDelay?: number;
  enableHaptic?: boolean;
  children: React.ReactNode;
}

export const SafePressable: React.FC<SafePressableProps> = ({
  onPress,
  debounceDelay = 500,
  enableHaptic = false,
  children,
  disabled,
  style,
  ...props
}) => {
  const lastClickTime = useRef<number>(0);
  const isProcessing = useRef<boolean>(false);

  const handlePress = useCallback(
    async (event: GestureResponderEvent) => {
      if (!onPress || disabled) return;

      const now = Date.now();

      if (now - lastClickTime.current < debounceDelay || isProcessing.current) {
        return;
      }

      lastClickTime.current = now;

      if (enableHaptic) {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          // Haptics not available
        }
      }

      const result = onPress(event);

      if (result instanceof Promise) {
        isProcessing.current = true;
        try {
          await result;
        } finally {
          isProcessing.current = false;
        }
      }
    },
    [onPress, disabled, debounceDelay, enableHaptic]
  );

  return (
    <Pressable
      {...props}
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        typeof style === "function" ? style({ pressed }) : style,
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 20,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default PressableButton;

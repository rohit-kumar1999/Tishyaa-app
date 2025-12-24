/**
 * Drop-in replacement for React Native's TouchableOpacity with built-in double-tap prevention.
 * Simply change your import from:
 *   import { TouchableOpacity } from "react-native"
 * to:
 *   import { TouchableOpacity } from "@/components/common/TouchableOpacity"
 */

import React, { useRef } from "react";
import {
  TouchableOpacity as RNTouchableOpacity,
  TouchableOpacityProps,
  GestureResponderEvent,
  Pressable as RNPressable,
  PressableProps,
  View,
} from "react-native";

// Global last click timestamp to prevent rapid clicks across ALL buttons
let globalLastClickTime = 0;
const GLOBAL_DEBOUNCE_MS = 400;

interface SafeTouchableOpacityProps extends TouchableOpacityProps {
  /**
   * Custom debounce delay in ms (default: 400ms)
   */
  debounceMs?: number;
  /**
   * Disable the double-click prevention
   */
  allowMultipleClicks?: boolean;
}

export const TouchableOpacity = React.forwardRef<View, SafeTouchableOpacityProps>(
  ({ onPress, debounceMs = GLOBAL_DEBOUNCE_MS, allowMultipleClicks = false, ...props }, ref) => {
    const lastClickRef = useRef<number>(0);

    const handlePress = (event: GestureResponderEvent) => {
      if (!onPress) return;

      if (allowMultipleClicks) {
        onPress(event);
        return;
      }

      const now = Date.now();

      // Check both local and global debounce
      if (
        now - lastClickRef.current < debounceMs ||
        now - globalLastClickTime < GLOBAL_DEBOUNCE_MS
      ) {
        return;
      }

      lastClickRef.current = now;
      globalLastClickTime = now;
      onPress(event);
    };

    return <RNTouchableOpacity ref={ref} {...props} onPress={handlePress} />;
  }
);

TouchableOpacity.displayName = "SafeTouchableOpacity";

interface SafePressableProps extends PressableProps {
  debounceMs?: number;
  allowMultipleClicks?: boolean;
}

export const Pressable = React.forwardRef<View, SafePressableProps>(
  ({ onPress, debounceMs = GLOBAL_DEBOUNCE_MS, allowMultipleClicks = false, ...props }, ref) => {
    const lastClickRef = useRef<number>(0);

    const handlePress = (event: GestureResponderEvent) => {
      if (!onPress) return;

      if (allowMultipleClicks) {
        onPress(event);
        return;
      }

      const now = Date.now();

      if (
        now - lastClickRef.current < debounceMs ||
        now - globalLastClickTime < GLOBAL_DEBOUNCE_MS
      ) {
        return;
      }

      lastClickRef.current = now;
      globalLastClickTime = now;
      onPress(event);
    };

    return <RNPressable ref={ref} {...props} onPress={handlePress} />;
  }
);

Pressable.displayName = "SafePressable";

// Export original components if needed
export { RNTouchableOpacity as OriginalTouchableOpacity };
export { RNPressable as OriginalPressable };

export default TouchableOpacity;

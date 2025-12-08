import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  DeviceEventEmitter,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface SwipeGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  enableHaptic?: boolean;
}

export const SwipeGestureHandler: React.FC<SwipeGestureHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 50,
  enableHaptic = true,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [gestureState, setGestureState] = useState<"idle" | "active">("idle");

  const onGestureEvent = useCallback((event: PanGestureHandlerGestureEvent) => {
    const { translationX, translationY } = event.nativeEvent;

    translateX.setValue(translationX * 0.3); // Damping factor
    translateY.setValue(translationY * 0.3);
  }, []);

  const onHandlerStateChange = useCallback(
    async (event: PanGestureHandlerGestureEvent) => {
      const { state, translationX, translationY, velocityX, velocityY } =
        event.nativeEvent;

      if (state === State.ACTIVE && gestureState === "idle") {
        setGestureState("active");
        if (enableHaptic) {
          await Haptics.selectionAsync();
        }
      }

      if (state === State.END) {
        setGestureState("idle");

        // Reset animations
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
          }),
        ]).start();

        // Determine swipe direction
        const absX = Math.abs(translationX);
        const absY = Math.abs(translationY);
        const absVelX = Math.abs(velocityX);
        const absVelY = Math.abs(velocityY);

        // Check if gesture meets threshold
        if (
          absX > swipeThreshold ||
          absY > swipeThreshold ||
          absVelX > 500 ||
          absVelY > 500
        ) {
          if (enableHaptic) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          if (absX > absY) {
            // Horizontal swipe
            if (translationX > 0) {
              onSwipeRight?.();
            } else {
              onSwipeLeft?.();
            }
          } else {
            // Vertical swipe
            if (translationY > 0) {
              onSwipeDown?.();
            } else {
              onSwipeUp?.();
            }
          }
        }
      }
    },
    [
      gestureState,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      swipeThreshold,
      enableHaptic,
    ]
  );

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.gestureContainer,
          {
            transform: [{ translateX }, { translateY }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  refreshing?: boolean;
  colors?: string[];
  tintColor?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing = false,
  colors = ["#C9A961"],
  tintColor = "#C9A961",
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isRefreshing}
          onRefresh={handleRefresh}
          colors={colors}
          tintColor={tintColor}
          title="Pull to refresh"
          titleColor="#666"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

interface ShakeGestureProps {
  children: React.ReactNode;
  onShake?: () => void;
  shakeThreshold?: number;
  timeThreshold?: number;
  enableHaptic?: boolean;
}

export const ShakeGestureHandler: React.FC<ShakeGestureProps> = ({
  children,
  onShake,
  shakeThreshold = 15,
  timeThreshold = 300,
  enableHaptic = true,
}) => {
  const lastShake = useRef<number>(0);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Note: This would need accelerometer setup
    // For now, we'll use a DeviceEventEmitter mock
    const subscription = DeviceEventEmitter.addListener("shake", async () => {
      const now = Date.now();

      if (now - lastShake.current > timeThreshold) {
        lastShake.current = now;

        if (enableHaptic) {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
        }

        // Animate shake effect
        Animated.sequence([
          Animated.timing(shakeAnimation, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();

        onShake?.();
      }
    });

    return () => subscription.remove();
  }, [onShake, timeThreshold, enableHaptic]);

  return (
    <Animated.View
      style={[
        styles.shakeContainer,
        {
          transform: [{ translateX: shakeAnimation }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  position?: "bottomRight" | "bottomLeft" | "topRight" | "topLeft";
  size?: "small" | "medium" | "large";
  backgroundColor?: string;
  enableHaptic?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  position = "bottomRight",
  size = "medium",
  backgroundColor = "#C9A961",
  enableHaptic = true,
}) => {
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(async () => {
    if (enableHaptic) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate press
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  }, [onPress, enableHaptic]);

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return { width: 40, height: 40 };
      case "large":
        return { width: 72, height: 72 };
      default:
        return { width: 56, height: 56 };
    }
  };

  const getPositionStyle = () => {
    const baseStyle = {
      position: "absolute" as const,
      zIndex: 1000,
    };

    switch (position) {
      case "bottomLeft":
        return { ...baseStyle, bottom: 20, left: 20 };
      case "topRight":
        return { ...baseStyle, top: 60, right: 20 };
      case "topLeft":
        return { ...baseStyle, top: 60, left: 20 };
      default:
        return { ...baseStyle, bottom: 20, right: 20 };
    }
  };

  return (
    <Animated.View
      style={[
        styles.fab,
        getSizeStyle(),
        getPositionStyle(),
        { backgroundColor, transform: [{ scale: scaleAnimation }] },
      ]}
    >
      <Animated.View style={styles.fabContent} onTouchEnd={handlePress}>
        {icon}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gestureContainer: {
    flex: 1,
  },
  shakeContainer: {
    flex: 1,
  },
  fab: {
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  fabContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default {
  SwipeGestureHandler,
  PullToRefresh,
  ShakeGestureHandler,
  FloatingActionButton,
};

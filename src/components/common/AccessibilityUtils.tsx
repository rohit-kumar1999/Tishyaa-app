import React from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";

export interface AccessibleViewProps extends ViewProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: "button" | "text" | "image" | "header" | "link" | "none";
  testID?: string;
}

export const AccessibleView: React.FC<AccessibleViewProps> = ({
  children,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = "none",
  testID,
  ...props
}) => {
  return (
    <View
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      testID={testID}
      {...props}
    >
      {children}
    </View>
  );
};

interface AccessibleButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  children: React.ReactNode;
  style?: any;
  disabled?: boolean;
  testID?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onPress,
  accessibilityLabel,
  accessibilityHint,
  children,
  style,
  disabled = false,
  testID,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={style}
      disabled={disabled}
      testID={testID}
    >
      {children}
    </TouchableOpacity>
  );
};

interface AccessibleTextProps {
  children: React.ReactNode;
  accessibilityRole?: "text" | "header";
  accessibilityLevel?: number;
  style?: any;
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  accessibilityRole = "text",
  accessibilityLevel,
  style,
}) => {
  const accessibilityProps: any = {
    accessible: true,
    accessibilityRole,
  };

  if (accessibilityRole === "header" && accessibilityLevel) {
    accessibilityProps.accessibilityLevel = accessibilityLevel;
  }

  return (
    <Text style={style} {...accessibilityProps}>
      {children}
    </Text>
  );
};

export class AccessibilityUtils {
  static announceForAccessibility(message: string): void {
    AccessibilityInfo.announceForAccessibility(message);
  }

  static focusOnElement(element: React.Component | null): void {
    if (element) {
      const reactTag = findNodeHandle(element);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }
  }

  static async isScreenReaderEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isScreenReaderEnabled();
    } catch {
      return false;
    }
  }

  static async isReduceMotionEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isReduceMotionEnabled();
    } catch {
      return false;
    }
  }

  static generateAccessibilityLabel(
    label: string,
    value?: string | number,
    state?: string
  ): string {
    let accessibilityLabel = label;

    if (value !== undefined) {
      accessibilityLabel += `, ${value}`;
    }

    if (state) {
      accessibilityLabel += `, ${state}`;
    }

    return accessibilityLabel;
  }

  static getAccessibilityProps(
    label: string,
    hint?: string,
    role?: string,
    state?: { [key: string]: boolean }
  ) {
    return {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role,
      accessibilityState: state,
    };
  }
}

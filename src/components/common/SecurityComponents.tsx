import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "./TouchableOpacity";
import securityService from "../../services/securityService";

const { width, height } = Dimensions.get("window");

interface AppLockScreenProps {
  visible: boolean;
  onUnlock: () => void;
  onLockout?: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  visible,
  onUnlock,
  onLockout,
}) => {
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState("");

  const handleUnlock = async () => {
    if (unlocking) return;

    try {
      setUnlocking(true);
      setError("");

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const success = await securityService.unlockApp(true);

      if (success) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        onUnlock();
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError("Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Unlock error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("Unable to authenticate. Please try again.");
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={100} style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={64} color="#C9A961" />
            </View>
            <Text style={styles.title}>Tishyaa Jewels</Text>
            <Text style={styles.subtitle}>App is locked for your security</Text>
          </View>

          <View style={styles.unlockSection}>
            <TouchableOpacity
              style={[
                styles.unlockButton,
                unlocking && styles.unlockButtonDisabled,
              ]}
              onPress={handleUnlock}
              disabled={unlocking}
            >
              {unlocking ? (
                <ActivityIndicator size="large" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="finger-print" size={32} color="#FFF" />
                  <Text style={styles.unlockButtonText}>
                    Unlock with Biometric
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Use your fingerprint or face to unlock the app
            </Text>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

interface BiometricPromptProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onError?: (error: string) => void;
}

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  visible,
  title,
  subtitle,
  onSuccess,
  onCancel,
  onError,
}) => {
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    if (visible) {
      handleAuthenticate();
    }
  }, [visible]);

  const handleAuthenticate = async () => {
    try {
      setAuthenticating(true);

      const success = await securityService.authenticateWithBiometric(title);

      if (success) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        onSuccess();
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onCancel();
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      onError?.(
        error instanceof Error ? error.message : "Authentication failed"
      );
      onCancel();
    } finally {
      setAuthenticating(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={50} style={styles.promptContainer}>
        <View style={styles.promptContent}>
          <View style={styles.promptHeader}>
            <Ionicons name="finger-print" size={48} color="#C9A961" />
            <Text style={styles.promptTitle}>{title}</Text>
            {subtitle && <Text style={styles.promptSubtitle}>{subtitle}</Text>}
          </View>

          {authenticating && (
            <View style={styles.authenticatingSection}>
              <ActivityIndicator size="large" color="#C9A961" />
              <Text style={styles.authenticatingText}>Authenticating...</Text>
            </View>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  unlockSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C9A961",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    width: "100%",
    justifyContent: "center",
    marginBottom: 16,
  },
  unlockButtonDisabled: {
    opacity: 0.7,
  },
  unlockButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  promptContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  promptContent: {
    width: width * 0.8,
    maxWidth: 350,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  promptHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  promptSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  authenticatingSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  authenticatingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
});

export default {
  AppLockScreen,
  BiometricPrompt,
};

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "./TouchableOpacity";
import securityService, {
  BiometricType,
  SecuritySettings as SecuritySettingsType,
} from "../../services/securityService";

export const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettingsType>({
    biometricEnabled: false,
    appLockEnabled: false,
    autoLockTimeout: 5,
    requireBiometricForPayments: true,
    requireBiometricForSensitiveData: true,
  });
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<BiometricType>({
    fingerprint: false,
    faceId: false,
    iris: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      setLoading(true);

      // Load current settings
      const currentSettings = securityService.getSecuritySettings();
      setSettings(currentSettings);

      // Check biometric availability
      const available = await securityService.isBiometricAvailable();
      setBiometricAvailable(available);

      // Get biometric types
      const types = await securityService.getBiometricTypes();
      setBiometricTypes(types);
    } catch (error) {
      console.error("Error initializing security settings:", error);
      Alert.alert("Error", "Failed to load security settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof SecuritySettingsType, value: any) => {
    try {
      await Haptics.selectionAsync();

      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      await securityService.updateSecuritySettings({ [key]: value });
    } catch (error) {
      console.error("Error updating setting:", error);
      Alert.alert("Error", "Failed to update setting");
      // Revert on error
      setSettings(settings);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      await Haptics.selectionAsync();

      if (value) {
        const success = await securityService.enableBiometric();
        if (success) {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          updateSetting("biometricEnabled", true);
        } else {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
        }
      } else {
        const success = await securityService.disableBiometric();
        if (success) {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          updateSetting("biometricEnabled", false);
        } else {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
        }
      }
    } catch (error) {
      console.error("Error toggling biometric:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const testBiometric = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const success = await securityService.authenticateWithBiometric(
        "Test biometric authentication"
      );

      if (success) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        Alert.alert("Success", "Biometric authentication test passed!");
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Failed", "Biometric authentication test failed.");
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Biometric test failed");
    }
  };

  const getBiometricDescription = (): string => {
    const availableTypes = [];
    if (biometricTypes.fingerprint) availableTypes.push("Fingerprint");
    if (biometricTypes.faceId) availableTypes.push("Face ID");
    if (biometricTypes.iris) availableTypes.push("Iris");

    if (availableTypes.length === 0) {
      return "No biometric authentication available";
    }

    return `Available: ${availableTypes.join(", ")}`;
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    icon: string,
    disabled = false
  ) => (
    <View style={[styles.settingItem, disabled && styles.disabledItem]}>
      <View style={styles.settingInfo}>
        <Ionicons
          name={icon as any}
          size={24}
          color={disabled ? "#CCC" : "#C9A961"}
          style={styles.settingIcon}
        />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
            {title}
          </Text>
          <Text
            style={[styles.settingDescription, disabled && styles.disabledText]}
          >
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: "#E0E0E0", true: "#C9A961" }}
        thumbColor={value ? "#FFF" : "#FFF"}
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );

  const renderTimeoutSelector = () => (
    <View style={styles.timeoutSelector}>
      <Text style={styles.timeoutLabel}>Auto-lock timeout</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timeoutOptions}>
          {[1, 5, 10, 15, 30].map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.timeoutOption,
                settings.autoLockTimeout === minutes &&
                  styles.selectedTimeoutOption,
              ]}
              onPress={() => updateSetting("autoLockTimeout", minutes)}
            >
              <Text
                style={[
                  styles.timeoutOptionText,
                  settings.autoLockTimeout === minutes &&
                    styles.selectedTimeoutOptionText,
                ]}
              >
                {minutes}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C9A961" />
        <Text style={styles.loadingText}>Loading security settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={32} color="#C9A961" />
        <Text style={styles.headerTitle}>Security Settings</Text>
        <Text style={styles.headerSubtitle}>
          Protect your account and personal information
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Biometric Authentication</Text>
        <Text style={styles.sectionDescription}>
          {getBiometricDescription()}
        </Text>

        {renderSettingItem(
          "Enable Biometric Login",
          "Use fingerprint or face recognition to unlock the app",
          settings.biometricEnabled,
          handleBiometricToggle,
          "finger-print",
          !biometricAvailable
        )}

        {biometricAvailable && (
          <TouchableOpacity style={styles.testButton} onPress={testBiometric}>
            <Ionicons name="checkmark-circle" size={20} color="#C9A961" />
            <Text style={styles.testButtonText}>Test Biometric</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Lock</Text>

        {renderSettingItem(
          "Enable App Lock",
          "Lock the app when it goes to background",
          settings.appLockEnabled,
          (value) => updateSetting("appLockEnabled", value),
          "lock-closed"
        )}

        {settings.appLockEnabled && renderTimeoutSelector()}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Security</Text>

        {renderSettingItem(
          "Biometric for Payments",
          "Require biometric authentication for payments",
          settings.requireBiometricForPayments,
          (value) => updateSetting("requireBiometricForPayments", value),
          "card",
          !biometricAvailable
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Protection</Text>

        {renderSettingItem(
          "Biometric for Sensitive Data",
          "Require authentication to access sensitive information",
          settings.requireBiometricForSensitiveData,
          (value) => updateSetting("requireBiometricForSensitiveData", value),
          "eye-off",
          !biometricAvailable
        )}
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={20} color="#0066CC" />
          <Text style={styles.infoTitle}>Security Tips</Text>
        </View>
        <Text style={styles.infoText}>
          • Enable biometric authentication for enhanced security{"\n"}• Use app
          lock when handling sensitive information{"\n"}• Keep your device's
          biometric settings up to date{"\n"}• Report any suspicious activity
          immediately
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#FFF",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  section: {
    backgroundColor: "#FFF",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    paddingVertical: 8,
    fontStyle: "italic",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  disabledItem: {
    opacity: 0.5,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  disabledText: {
    color: "#CCC",
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  testButtonText: {
    color: "#C9A961",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  timeoutSelector: {
    paddingVertical: 16,
  },
  timeoutLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 12,
  },
  timeoutOptions: {
    flexDirection: "row",
    gap: 12,
  },
  timeoutOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedTimeoutOption: {
    backgroundColor: "#C9A961",
    borderColor: "#C9A961",
  },
  timeoutOptionText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  selectedTimeoutOptionText: {
    color: "#FFF",
  },
  infoSection: {
    backgroundColor: "#E3F2FD",
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0066CC",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1565C0",
    lineHeight: 20,
  },
});

export default SecuritySettings;

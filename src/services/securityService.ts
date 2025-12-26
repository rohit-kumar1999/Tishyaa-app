import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { toast } from "../hooks/use-toast";

export interface BiometricType {
  fingerprint: boolean;
  faceId: boolean;
  iris: boolean;
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  appLockEnabled: boolean;
  autoLockTimeout: number; // in minutes
  requireBiometricForPayments: boolean;
  requireBiometricForSensitiveData: boolean;
}

export interface AppLockState {
  isLocked: boolean;
  lockedAt: Date | null;
  failedAttempts: number;
  lockoutUntil: Date | null;
}

class SecurityService {
  private securitySettings: SecuritySettings = {
    biometricEnabled: false,
    appLockEnabled: false,
    autoLockTimeout: 5, // 5 minutes
    requireBiometricForPayments: true,
    requireBiometricForSensitiveData: true,
  };

  private appLockState: AppLockState = {
    isLocked: false,
    lockedAt: null,
    failedAttempts: 0,
    lockoutUntil: null,
  };

  private maxFailedAttempts = 5;
  private lockoutDuration = 30 * 60 * 1000; // 30 minutes

  /**
   * Initialize security service
   */
  async initialize(): Promise<void> {
    try {
      await this.loadSecuritySettings();
      await this.loadAppLockState();

      // Check if app should be locked based on settings
      await this.checkAutoLock();
    } catch {
      // Silent fail
    }
  }

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      return hasHardware && isEnrolled;
    } catch {
      return false;
    }
  }

  /**
   * Get available biometric types
   */
  async getBiometricTypes(): Promise<BiometricType> {
    try {
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      return {
        fingerprint: types.includes(
          LocalAuthentication.AuthenticationType.FINGERPRINT
        ),
        faceId: types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        ),
        iris: types.includes(LocalAuthentication.AuthenticationType.IRIS),
      };
    } catch {
      return {
        fingerprint: false,
        faceId: false,
        iris: false,
      };
    }
  }

  /**
   * Prompt for biometric authentication
   */
  async authenticateWithBiometric(
    promptMessage: string = "Authenticate to continue"
  ): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();

      if (!isAvailable) {
        toast({
          title: "Biometric Authentication Unavailable",
          description:
            "Please set up biometric authentication in your device settings.",
        });
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: "Cancel",
        fallbackLabel: "Use Passcode",
        disableDeviceFallback: false,
      });

      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Enable biometric authentication
   */
  async enableBiometric(): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();

      if (!isAvailable) {
        toast({
          title: "Biometric Authentication Unavailable",
          description:
            "Please set up fingerprint or face recognition in your device settings first.",
        });
        return false;
      }

      const authenticated = await this.authenticateWithBiometric(
        "Authenticate to enable biometric login"
      );

      if (authenticated) {
        this.securitySettings.biometricEnabled = true;
        await this.saveSecuritySettings();
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<boolean> {
    try {
      const authenticated = await this.authenticateWithBiometric(
        "Authenticate to disable biometric login"
      );

      if (authenticated) {
        this.securitySettings.biometricEnabled = false;
        await this.saveSecuritySettings();
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Lock the app
   */
  async lockApp(): Promise<void> {
    try {
      this.appLockState.isLocked = true;
      this.appLockState.lockedAt = new Date();
      await this.saveAppLockState();
    } catch {
      // Silent fail
    }
  }

  /**
   * Unlock the app
   */
  async unlockApp(requireBiometric: boolean = false): Promise<boolean> {
    try {
      // Check if in lockout period
      if (this.isInLockout()) {
        const remainingTime = this.getRemainingLockoutTime();
        toast({
          title: "Account Locked",
          description: `Too many failed attempts. Please try again in ${Math.ceil(
            remainingTime / 60000
          )} minutes.`,
          variant: "destructive",
        });
        return false;
      }

      let authenticated = false;

      if (
        requireBiometric ||
        (this.securitySettings.biometricEnabled &&
          (await this.isBiometricAvailable()))
      ) {
        authenticated = await this.authenticateWithBiometric(
          "Unlock Tishyaa Jewels"
        );
      } else {
        // For now, we'll assume PIN/password authentication would go here
        // In a real app, you'd implement PIN/password verification
        authenticated = true;
      }

      if (authenticated) {
        this.appLockState.isLocked = false;
        this.appLockState.lockedAt = null;
        this.appLockState.failedAttempts = 0;
        this.appLockState.lockoutUntil = null;
        await this.saveAppLockState();
        return true;
      } else {
        await this.recordFailedAttempt();
        return false;
      }
    } catch {
      await this.recordFailedAttempt();
      return false;
    }
  }

  /**
   * Record failed authentication attempt
   */
  private async recordFailedAttempt(): Promise<void> {
    this.appLockState.failedAttempts++;

    if (this.appLockState.failedAttempts >= this.maxFailedAttempts) {
      this.appLockState.lockoutUntil = new Date(
        Date.now() + this.lockoutDuration
      );

      toast({
        title: "Too Many Failed Attempts",
        description: `Account locked for ${
          this.lockoutDuration / 60000
        } minutes due to multiple failed authentication attempts.`,
        variant: "destructive",
      });
    }

    await this.saveAppLockState();
  }

  /**
   * Check if currently in lockout period
   */
  private isInLockout(): boolean {
    if (!this.appLockState.lockoutUntil) {
      return false;
    }

    return Date.now() < this.appLockState.lockoutUntil.getTime();
  }

  /**
   * Get remaining lockout time in milliseconds
   */
  private getRemainingLockoutTime(): number {
    if (!this.appLockState.lockoutUntil) {
      return 0;
    }

    return Math.max(0, this.appLockState.lockoutUntil.getTime() - Date.now());
  }

  /**
   * Check if app should auto-lock
   */
  async checkAutoLock(): Promise<void> {
    if (!this.securitySettings.appLockEnabled) {
      return;
    }

    if (this.appLockState.lockedAt) {
      const timeSinceLock = Date.now() - this.appLockState.lockedAt.getTime();
      const autoLockTimeout = this.securitySettings.autoLockTimeout * 60 * 1000;

      if (timeSinceLock < autoLockTimeout) {
        // App was locked recently, keep it locked
        this.appLockState.isLocked = true;
      }
    }
  }

  /**
   * Get security settings
   */
  getSecuritySettings(): SecuritySettings {
    return { ...this.securitySettings };
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(
    settings: Partial<SecuritySettings>
  ): Promise<void> {
    this.securitySettings = { ...this.securitySettings, ...settings };
    await this.saveSecuritySettings();
  }

  /**
   * Get app lock state
   */
  getAppLockState(): AppLockState {
    return { ...this.appLockState };
  }

  /**
   * Check if app is locked
   */
  isAppLocked(): boolean {
    return this.appLockState.isLocked;
  }

  /**
   * Securely store sensitive data
   */
  async storeSecureData(key: string, value: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(key, value, {
        requireAuthentication:
          this.securitySettings.requireBiometricForSensitiveData,
        authenticationPrompt: "Authenticate to access secure data",
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieve sensitive data securely
   */
  async getSecureData(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key, {
        requireAuthentication:
          this.securitySettings.requireBiometricForSensitiveData,
        authenticationPrompt: "Authenticate to access secure data",
      });
      return value;
    } catch {
      return null;
    }
  }

  /**
   * Delete secure data
   */
  async deleteSecureData(key: string): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Authenticate for payments
   */
  async authenticateForPayment(): Promise<boolean> {
    if (this.securitySettings.requireBiometricForPayments) {
      return await this.authenticateWithBiometric(
        "Authenticate to complete payment"
      );
    }
    return true;
  }

  /**
   * Save security settings to storage
   */
  private async saveSecuritySettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        "security_settings",
        JSON.stringify(this.securitySettings)
      );
    } catch {
      // Silent fail
    }
  }

  /**
   * Load security settings from storage
   */
  private async loadSecuritySettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem("security_settings");
      if (stored) {
        this.securitySettings = {
          ...this.securitySettings,
          ...JSON.parse(stored),
        };
      }
    } catch {
      // Silent fail
    }
  }

  /**
   * Save app lock state to storage
   */
  private async saveAppLockState(): Promise<void> {
    try {
      const stateToSave = {
        ...this.appLockState,
        lockedAt: this.appLockState.lockedAt?.toISOString(),
        lockoutUntil: this.appLockState.lockoutUntil?.toISOString(),
      };
      await AsyncStorage.setItem("app_lock_state", JSON.stringify(stateToSave));
    } catch {
      // Silent fail
    }
  }

  /**
   * Load app lock state from storage
   */
  private async loadAppLockState(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem("app_lock_state");
      if (stored) {
        const state = JSON.parse(stored);
        this.appLockState = {
          ...state,
          lockedAt: state.lockedAt ? new Date(state.lockedAt) : null,
          lockoutUntil: state.lockoutUntil
            ? new Date(state.lockoutUntil)
            : null,
        };
      }
    } catch {
      // Silent fail
    }
  }

  /**
   * Clear all security data (logout)
   */
  async clearSecurityData(): Promise<void> {
    try {
      this.appLockState = {
        isLocked: false,
        lockedAt: null,
        failedAttempts: 0,
        lockoutUntil: null,
      };

      await AsyncStorage.removeItem("app_lock_state");
    } catch {
      // Silent fail
    }
  }
}

export const securityService = new SecurityService();
export default securityService;

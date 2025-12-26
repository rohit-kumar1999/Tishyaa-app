import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export enum HapticFeedbackType {
  LIGHT = "light",
  MEDIUM = "medium",
  HEAVY = "heavy",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  SELECTION = "selection",
  IMPACT = "impact",
}

class HapticService {
  /**
   * Check if haptic feedback is available on the device
   */
  isAvailable(): boolean {
    return Platform.OS === "ios" || Platform.OS === "android";
  }

  /**
   * Trigger light haptic feedback
   */
  async light(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptic feedback not available
    }
  }

  /**
   * Trigger medium haptic feedback
   */
  async medium(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptic feedback not available
    }
  }

  /**
   * Trigger heavy haptic feedback
   */
  async heavy(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Haptic feedback not available
    }
  }

  /**
   * Trigger success haptic feedback
   */
  async success(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptic feedback not available
    }
  }

  /**
   * Trigger warning haptic feedback
   */
  async warning(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Haptic feedback not available
    }
  }

  /**
   * Trigger error haptic feedback
   */
  async error(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Haptic feedback not available
    }
  }

  /**
   * Trigger selection haptic feedback
   */
  async selection(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptic feedback not available
    }
  }

  /**
   * Trigger haptic feedback based on type
   */
  async trigger(type: HapticFeedbackType): Promise<void> {
    switch (type) {
      case HapticFeedbackType.LIGHT:
        await this.light();
        break;
      case HapticFeedbackType.MEDIUM:
        await this.medium();
        break;
      case HapticFeedbackType.HEAVY:
        await this.heavy();
        break;
      case HapticFeedbackType.SUCCESS:
        await this.success();
        break;
      case HapticFeedbackType.WARNING:
        await this.warning();
        break;
      case HapticFeedbackType.ERROR:
        await this.error();
        break;
      case HapticFeedbackType.SELECTION:
        await this.selection();
        break;
      case HapticFeedbackType.IMPACT:
        await this.medium(); // Default impact
        break;
      default:
        await this.light();
    }
  }

  /**
   * Trigger feedback for button press
   */
  async buttonPress(): Promise<void> {
    await this.light();
  }

  /**
   * Trigger feedback for button long press
   */
  async buttonLongPress(): Promise<void> {
    await this.heavy();
  }

  /**
   * Trigger feedback for successful action
   */
  async actionSuccess(): Promise<void> {
    await this.success();
  }

  /**
   * Trigger feedback for failed action
   */
  async actionError(): Promise<void> {
    await this.error();
  }

  /**
   * Trigger feedback for item selection
   */
  async itemSelect(): Promise<void> {
    await this.selection();
  }

  /**
   * Trigger feedback for swipe gesture
   */
  async swipeGesture(): Promise<void> {
    await this.light();
  }

  /**
   * Trigger feedback for pull to refresh
   */
  async pullToRefresh(): Promise<void> {
    await this.medium();
  }

  /**
   * Trigger feedback for cart operations
   */
  async addToCart(): Promise<void> {
    await this.success();
  }

  async removeFromCart(): Promise<void> {
    await this.warning();
  }

  /**
   * Trigger feedback for navigation
   */
  async navigate(): Promise<void> {
    await this.selection();
  }

  /**
   * Trigger feedback for payment success
   */
  async paymentSuccess(): Promise<void> {
    await this.success();
  }

  /**
   * Trigger feedback for payment failure
   */
  async paymentFailure(): Promise<void> {
    await this.error();
  }

  /**
   * Trigger feedback for shake gesture
   */
  async shakeGesture(): Promise<void> {
    await this.heavy();
  }

  /**
   * Trigger feedback for like/favorite action
   */
  async likeAction(): Promise<void> {
    await this.medium();
  }

  /**
   * Trigger feedback for delete action
   */
  async deleteAction(): Promise<void> {
    await this.warning();
  }

  /**
   * Trigger feedback for notification
   */
  async notification(): Promise<void> {
    await this.medium();
  }

  /**
   * Custom haptic pattern for special actions
   */
  async customPattern(
    pattern: HapticFeedbackType[],
    delays: number[] = []
  ): Promise<void> {
    for (let i = 0; i < pattern.length; i++) {
      await this.trigger(pattern[i]);

      if (i < pattern.length - 1 && delays[i]) {
        await new Promise((resolve) => setTimeout(resolve, delays[i]));
      }
    }
  }

  /**
   * Haptic feedback for order placed
   */
  async orderPlaced(): Promise<void> {
    await this.customPattern(
      [HapticFeedbackType.SUCCESS, HapticFeedbackType.MEDIUM],
      [100]
    );
  }

  /**
   * Haptic feedback for product added to wishlist
   */
  async addToWishlist(): Promise<void> {
    await this.customPattern(
      [HapticFeedbackType.LIGHT, HapticFeedbackType.SUCCESS],
      [50]
    );
  }
}

export const hapticService = new HapticService();
export default hapticService;

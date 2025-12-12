import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
}

export interface ScheduleNotificationOptions extends NotificationData {
  seconds?: number;
  date?: Date;
  repeats?: boolean;
  identifier?: string;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newArrivals: boolean;
  cartReminders: boolean;
  wishlistAlerts: boolean;
  generalNotifications: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  constructor() {
    this.initializeNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service
   */
  private async initializeNotifications() {
    try {
      // Register for push notifications
      await this.registerForPushNotifications();

      // Set up notification listeners
      this.setupNotificationListeners();

      // Load user preferences
      await this.loadNotificationPreferences();
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
    }
  }

  /**
   * Register for push notifications and get token
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Must use physical device for Push Notifications",
      });
      return null;
    }

    try {
      // Skip push token registration in development to avoid project ID issues
      if (__DEV__) {
        console.log("Push notifications disabled in development mode");
        return null;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to get push token for push notification!",
        });
        return null;
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        })
      ).data;
      this.expoPushToken = token;

      // Save token to AsyncStorage
      await AsyncStorage.setItem("expo_push_token", token);

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#C9A961",
        });
      }

      return token;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    }
  }

  /**
   * Set up notification event listeners
   */
  private setupNotificationListeners() {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        // Handle notification received while app is active
        this.handleNotificationReceived(notification);
      }
    );

    // Listener for notification responses (user tapped notification)
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        // Handle notification tap
        this.handleNotificationResponse(response);
      });
  }

  /**
   * Handle notification received while app is active
   */
  private handleNotificationReceived(notification: Notifications.Notification) {
    const { title, body, data } = notification.request.content;

    // You can customize this based on notification type
    if (data?.type === "order_update") {
      // Handle order update notification
    } else if (data?.type === "promotion") {
      // Handle promotion notification
    }
  }

  /**
   * Handle notification tap response
   */
  private handleNotificationResponse(
    response: Notifications.NotificationResponse
  ) {
    const { data } = response.notification.request.content;

    // Navigate to appropriate screen based on notification data
    if (data?.screen) {
      // You would integrate this with your navigation system
      console.log("Navigate to screen:", data.screen);
    }
  }

  /**
   * Send local notification
   */
  async sendLocalNotification(
    options: NotificationData
  ): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data || {},
          sound: options.sound !== false,
          badge: options.badge,
        },
        trigger: null, // Send immediately
      });

      return identifier;
    } catch (error) {
      console.error("Error sending local notification:", error);
      return null;
    }
  }

  /**
   * Schedule notification for later
   */
  async scheduleNotification(
    options: ScheduleNotificationOptions
  ): Promise<string | null> {
    try {
      let trigger: any = null;

      if (options.seconds) {
        trigger = {
          seconds: options.seconds,
          repeats: options.repeats || false,
        };
      } else if (options.date) {
        trigger = { date: options.date, repeats: options.repeats || false };
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data || {},
          sound: options.sound !== false,
          badge: options.badge,
        },
        trigger,
      });

      return identifier;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return null;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling all notifications:", error);
    }
  }

  /**
   * Get pending notifications
   */
  async getPendingNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting pending notifications:", error);
      return [];
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error("Error setting badge count:", error);
    }
  }

  /**
   * Clear badge count
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error("Error clearing badge:", error);
    }
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Save notification preferences
   */
  async saveNotificationPreferences(
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        "notification_preferences",
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error("Error saving notification preferences:", error);
    }
  }

  /**
   * Load notification preferences
   */
  async loadNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem("notification_preferences");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading notification preferences:", error);
    }

    // Default preferences
    return {
      orderUpdates: true,
      promotions: true,
      newArrivals: true,
      cartReminders: true,
      wishlistAlerts: true,
      generalNotifications: true,
    };
  }

  /**
   * Send order update notification
   */
  async sendOrderUpdateNotification(
    orderNumber: string,
    status: string
  ): Promise<void> {
    const preferences = await this.loadNotificationPreferences();

    if (!preferences.orderUpdates) {
      return;
    }

    await this.sendLocalNotification({
      title: "Order Update",
      body: `Order #${orderNumber} is now ${status}`,
      data: {
        type: "order_update",
        orderNumber,
        status,
        screen: "OrderDetails",
      },
    });
  }

  /**
   * Send promotion notification
   */
  async sendPromotionNotification(
    title: string,
    body: string,
    promoData?: any
  ): Promise<void> {
    const preferences = await this.loadNotificationPreferences();

    if (!preferences.promotions) {
      return;
    }

    await this.sendLocalNotification({
      title,
      body,
      data: {
        type: "promotion",
        ...promoData,
        screen: "Products",
      },
    });
  }

  /**
   * Send cart abandonment reminder
   */
  async scheduleCartAbandonmentReminder(cartItems: number): Promise<void> {
    const preferences = await this.loadNotificationPreferences();

    if (!preferences.cartReminders || cartItems === 0) {
      return;
    }

    // Cancel any existing cart reminders
    await this.cancelNotificationsByType("cart_abandonment");

    // Schedule reminder for 1 hour later
    await this.scheduleNotification({
      title: "Don't forget your jewelry!",
      body: `You have ${cartItems} beautiful piece${
        cartItems > 1 ? "s" : ""
      } waiting in your cart`,
      seconds: 3600, // 1 hour
      data: {
        type: "cart_abandonment",
        screen: "Cart",
      },
      identifier: "cart_abandonment_reminder",
    });
  }

  /**
   * Cancel notifications by type
   */
  private async cancelNotificationsByType(type: string): Promise<void> {
    try {
      const pending = await this.getPendingNotifications();
      const toCancel = pending.filter(
        (notification) => notification.content.data?.type === type
      );

      for (const notification of toCancel) {
        await this.cancelNotification(notification.identifier);
      }
    } catch (error) {
      console.error("Error canceling notifications by type:", error);
    }
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;

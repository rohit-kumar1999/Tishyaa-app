import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { AppState, AppStateStatus } from "react-native";

export interface NetworkState {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
}

export interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

class PerformanceOptimizationService {
  private networkState: NetworkState = {
    isConnected: false,
    type: "unknown",
    isInternetReachable: null,
  };

  private offlineQueue: OfflineAction[] = [];
  private appState: AppStateStatus = "active";
  private networkListener: any = null;
  private appStateListener: any = null;

  /**
   * Initialize the performance optimization service
   */
  async initialize(): Promise<void> {
    try {
      // Initialize network monitoring
      await this.initializeNetworkMonitoring();

      // Initialize app state monitoring
      this.initializeAppStateMonitoring();

      // Load offline queue
      await this.loadOfflineQueue();

      // Process offline queue if connected
      if (this.networkState.isConnected) {
        await this.processOfflineQueue();
      }
    } catch (error) {
      console.error(
        "Failed to initialize performance optimization service:",
        error
      );
    }
  }

  /**
   * Initialize network state monitoring
   */
  private async initializeNetworkMonitoring(): Promise<void> {
    try {
      // Get initial network state
      const netState = await NetInfo.fetch();
      this.updateNetworkState(netState);

      // Subscribe to network state changes
      this.networkListener = NetInfo.addEventListener((state: NetInfoState) => {
        this.updateNetworkState(state);
        this.handleNetworkChange(state);
      });
    } catch (error) {
      console.error("Failed to initialize network monitoring:", error);
    }
  }

  /**
   * Initialize app state monitoring
   */
  private initializeAppStateMonitoring(): void {
    this.appStateListener = AppState.addEventListener(
      "change",
      (nextAppState) => {
        this.handleAppStateChange(this.appState, nextAppState);
        this.appState = nextAppState;
      }
    );
  }

  /**
   * Update network state
   */
  private updateNetworkState(state: any): void {
    this.networkState = {
      isConnected: state.isConnected || false,
      type: state.type || "unknown",
      isInternetReachable: state.isInternetReachable,
    };
  }

  /**
   * Handle network state changes
   */
  private async handleNetworkChange(state: any): Promise<void> {
    console.log("Network state changed:", state);

    if (state.isConnected && this.offlineQueue.length > 0) {
      // Process offline queue when connection is restored
      await this.processOfflineQueue();
    }
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange(
    previousState: AppStateStatus,
    nextState: AppStateStatus
  ): void {
    console.log("App state changed from", previousState, "to", nextState);

    if (previousState === "background" && nextState === "active") {
      // App came to foreground - refresh data if needed
      this.onAppForeground();
    } else if (previousState === "active" && nextState === "background") {
      // App went to background - save state
      this.onAppBackground();
    }
  }

  /**
   * Handle app coming to foreground
   */
  private async onAppForeground(): Promise<void> {
    try {
      // Refresh network state
      const netState = await NetInfo.fetch();
      this.updateNetworkState(netState);

      // Process offline queue if connected
      if (this.networkState.isConnected) {
        await this.processOfflineQueue();
      }

      // Emit app foreground event
      console.log("App came to foreground");
    } catch (error) {
      console.error("Error handling app foreground:", error);
    }
  }

  /**
   * Handle app going to background
   */
  private async onAppBackground(): Promise<void> {
    try {
      // Save offline queue
      await this.saveOfflineQueue();

      // Emit app background event
      console.log("App went to background");
    } catch (error) {
      console.error("Error handling app background:", error);
    }
  }

  /**
   * Get current network state
   */
  getNetworkState(): NetworkState {
    return this.networkState;
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return (
      this.networkState.isConnected &&
      this.networkState.isInternetReachable !== false
    );
  }

  /**
   * Check if device is offline
   */
  isOffline(): boolean {
    return !this.isOnline();
  }

  /**
   * Add action to offline queue
   */
  async addToOfflineQueue(
    action: Omit<OfflineAction, "id" | "timestamp">
  ): Promise<void> {
    try {
      const offlineAction: OfflineAction = {
        ...action,
        id: `offline_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
      };

      this.offlineQueue.push(offlineAction);
      await this.saveOfflineQueue();

      console.log("Added action to offline queue:", offlineAction.type);
    } catch (error) {
      console.error("Error adding to offline queue:", error);
    }
  }

  /**
   * Process offline queue
   */
  private async processOfflineQueue(): Promise<void> {
    if (!this.isOnline() || this.offlineQueue.length === 0) {
      return;
    }

    console.log(`Processing ${this.offlineQueue.length} offline actions`);

    try {
      // Process actions in order
      for (const action of this.offlineQueue) {
        try {
          await this.processOfflineAction(action);
          // Remove successful action
          this.offlineQueue = this.offlineQueue.filter(
            (a) => a.id !== action.id
          );
        } catch (error) {
          console.error(
            "Failed to process offline action:",
            action.type,
            error
          );
          // Keep failed action in queue for retry
        }
      }

      // Save updated queue
      await this.saveOfflineQueue();
    } catch (error) {
      console.error("Error processing offline queue:", error);
    }
  }

  /**
   * Process individual offline action
   */
  private async processOfflineAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case "api_call":
        // Process API call
        console.log("Processing offline API call:", action.data);
        // You would implement actual API call here
        break;

      case "analytics_event":
        // Process analytics event
        console.log("Processing offline analytics event:", action.data);
        // You would send analytics event here
        break;

      case "cart_update":
        // Process cart update
        console.log("Processing offline cart update:", action.data);
        // You would sync cart with server here
        break;

      default:
        console.log("Unknown offline action type:", action.type);
    }
  }

  /**
   * Save offline queue to storage
   */
  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        "offline_queue",
        JSON.stringify(this.offlineQueue)
      );
    } catch (error) {
      console.error("Error saving offline queue:", error);
    }
  }

  /**
   * Load offline queue from storage
   */
  private async loadOfflineQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem("offline_queue");
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
        console.log(`Loaded ${this.offlineQueue.length} offline actions`);
      }
    } catch (error) {
      console.error("Error loading offline queue:", error);
      this.offlineQueue = [];
    }
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue(): Promise<void> {
    try {
      this.offlineQueue = [];
      await AsyncStorage.removeItem("offline_queue");
    } catch (error) {
      console.error("Error clearing offline queue:", error);
    }
  }

  /**
   * Get offline queue size
   */
  getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  /**
   * Cache data for offline access
   */
  async cacheData(key: string, data: any, expiry?: number): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiry: expiry || Date.now() + 24 * 60 * 60 * 1000, // 24 hours default
      };

      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error("Error caching data:", error);
    }
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<any | null> {
    try {
      const stored = await AsyncStorage.getItem(`cache_${key}`);

      if (stored) {
        const cacheItem = JSON.parse(stored);

        // Check if cache is still valid
        if (Date.now() < cacheItem.expiry) {
          return cacheItem.data;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(`cache_${key}`);
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting cached data:", error);
      return null;
    }
  }

  /**
   * Clear expired cache
   */
  async clearExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith("cache_"));

      for (const key of cacheKeys) {
        const stored = await AsyncStorage.getItem(key);

        if (stored) {
          const cacheItem = JSON.parse(stored);

          if (Date.now() >= cacheItem.expiry) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error("Error clearing expired cache:", error);
    }
  }

  /**
   * Get app state
   */
  getAppState(): AppStateStatus {
    return this.appState;
  }

  /**
   * Check if app is in foreground
   */
  isAppInForeground(): boolean {
    return this.appState === "active";
  }

  /**
   * Check if app is in background
   */
  isAppInBackground(): boolean {
    return this.appState === "background";
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.networkListener) {
      this.networkListener();
      this.networkListener = null;
    }

    if (this.appStateListener) {
      this.appStateListener.remove();
      this.appStateListener = null;
    }
  }
}

export const performanceOptimizationService =
  new PerformanceOptimizationService();
export default performanceOptimizationService;

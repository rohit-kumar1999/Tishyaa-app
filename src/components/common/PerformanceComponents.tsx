import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import performanceOptimizationService from "../../services/performanceOptimizationService";

const { width } = Dimensions.get("window");

interface NetworkStatusProps {
  onRetry?: () => void;
  showDetails?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  onRetry,
  showDetails = false,
}) => {
  const [networkState, setNetworkState] = useState(
    performanceOptimizationService.getNetworkState()
  );
  const [offlineQueueSize, setOfflineQueueSize] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      setNetworkState(performanceOptimizationService.getNetworkState());
      setOfflineQueueSize(performanceOptimizationService.getOfflineQueueSize());
    };

    // Update status every few seconds
    const interval = setInterval(updateStatus, 3000);
    updateStatus();

    return () => clearInterval(interval);
  }, []);

  const handleRetry = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRetry?.();
  };

  if (networkState.isConnected) {
    return showDetails ? (
      <View style={styles.onlineStatus}>
        <Ionicons name="wifi" size={16} color="#4CAF50" />
        <Text style={styles.onlineText}>Online</Text>
        {offlineQueueSize > 0 && (
          <Text style={styles.queueText}>
            Syncing {offlineQueueSize} items...
          </Text>
        )}
      </View>
    ) : null;
  }

  return (
    <View style={styles.offlineContainer}>
      <View style={styles.offlineHeader}>
        <Ionicons name="wifi-outline" size={20} color="#FFF" />
        <Text style={styles.offlineTitle}>No Internet Connection</Text>
      </View>
      <Text style={styles.offlineMessage}>
        You're offline. Some features may not be available.
      </Text>
      {offlineQueueSize > 0 && (
        <Text style={styles.queueMessage}>
          {offlineQueueSize} action(s) waiting to sync
        </Text>
      )}
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Ionicons name="refresh" size={16} color="#FFF" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number;
  onCancel?: () => void;
}

export const PerformanceLoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = "Loading...",
  progress,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlayContainer}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color="#C9A961" />
        <Text style={styles.overlayMessage}>{message}</Text>

        {progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        )}

        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

interface OfflineIndicatorProps {
  position?: "top" | "bottom";
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = "top",
}) => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      setIsOffline(performanceOptimizationService.isOffline());
    };

    const interval = setInterval(checkStatus, 2000);
    checkStatus();

    return () => clearInterval(interval);
  }, []);

  if (!isOffline) return null;

  return (
    <View
      style={[
        styles.offlineIndicator,
        position === "bottom"
          ? styles.offlineIndicatorBottom
          : styles.offlineIndicatorTop,
      ]}
    >
      <Ionicons name="cloud-offline" size={16} color="#FFF" />
      <Text style={styles.offlineIndicatorText}>Offline</Text>
    </View>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>
          <TouchableOpacity
            style={styles.errorRetryButton}
            onPress={this.handleRetry}
          >
            <Text style={styles.errorRetryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

interface PerformanceMetricsProps {
  visible: boolean;
  onClose: () => void;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  visible,
  onClose,
}) => {
  const [metrics, setMetrics] = useState({
    networkType: "unknown",
    isOnline: false,
    offlineQueueSize: 0,
    appState: "unknown",
  });

  useEffect(() => {
    if (visible) {
      const updateMetrics = () => {
        const networkState = performanceOptimizationService.getNetworkState();
        setMetrics({
          networkType: networkState.type,
          isOnline: networkState.isConnected,
          offlineQueueSize:
            performanceOptimizationService.getOfflineQueueSize(),
          appState: performanceOptimizationService.getAppState(),
        });
      };

      updateMetrics();
      const interval = setInterval(updateMetrics, 1000);

      return () => clearInterval(interval);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.metricsOverlay}>
      <View style={styles.metricsContainer}>
        <View style={styles.metricsHeader}>
          <Text style={styles.metricsTitle}>Performance Metrics</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Network Status:</Text>
          <View style={styles.metricValue}>
            <Ionicons
              name={metrics.isOnline ? "wifi" : "wifi-outline"}
              size={16}
              color={metrics.isOnline ? "#4CAF50" : "#FF6B6B"}
            />
            <Text
              style={[
                styles.metricText,
                { color: metrics.isOnline ? "#4CAF50" : "#FF6B6B" },
              ]}
            >
              {metrics.isOnline ? "Online" : "Offline"} ({metrics.networkType})
            </Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Offline Queue:</Text>
          <Text style={styles.metricText}>
            {metrics.offlineQueueSize} items
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>App State:</Text>
          <Text style={styles.metricText}>{metrics.appState}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  onlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
  },
  onlineText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  queueText: {
    color: "#666",
    fontSize: 10,
    marginLeft: 8,
  },
  offlineContainer: {
    backgroundColor: "#FF6B6B",
    padding: 12,
    alignItems: "center",
  },
  offlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  offlineTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  offlineMessage: {
    color: "#FFF",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  queueMessage: {
    color: "#FFE0E0",
    fontSize: 11,
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: "#FFF",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 200,
  },
  overlayMessage: {
    marginTop: 16,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  progressContainer: {
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#C9A961",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  cancelButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 14,
  },
  offlineIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#FF6B6B",
    paddingVertical: 4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  offlineIndicatorTop: {
    top: 0,
  },
  offlineIndicatorBottom: {
    bottom: 0,
  },
  offlineIndicatorText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#F8F9FA",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  errorRetryButton: {
    backgroundColor: "#C9A961",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorRetryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  metricsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  metricsContainer: {
    backgroundColor: "#FFF",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: width - 40,
    maxWidth: 400,
  },
  metricsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 12,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  metricItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  metricValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 4,
  },
});

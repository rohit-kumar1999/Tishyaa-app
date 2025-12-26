import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface CachedImageProps {
  uri: string;
  style?: any;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  cacheKey?: string;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
}

interface ImageCacheInfo {
  uri: string;
  localPath: string;
  timestamp: number;
  size: number;
}

class ImageCacheManager {
  private static instance: ImageCacheManager;
  private cacheDir = "/tmp/image_cache/";
  private maxCacheSize = 100 * 1024 * 1024; // 100MB
  private maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, {
          intermediates: true,
        });
      }

      // Clean up old cache on initialization
      await this.cleanupOldCache();
    } catch {
      // Silent fail
    }
  }

  private generateCacheKey(uri: string): string {
    return uri.replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now();
  }

  async getCachedImagePath(
    uri: string,
    cacheKey?: string
  ): Promise<string | null> {
    try {
      const key = cacheKey || this.generateCacheKey(uri);
      const localPath = `${this.cacheDir}${key}`;

      const fileInfo = await FileSystem.getInfoAsync(localPath);

      if (fileInfo.exists) {
        // Check if cache is still valid
        const cacheInfo = await this.getCacheInfo(key);
        if (cacheInfo && Date.now() - cacheInfo.timestamp < this.maxCacheAge) {
          return localPath;
        } else {
          // Remove expired cache
          await this.removeCachedImage(key);
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  async cacheImage(uri: string, cacheKey?: string): Promise<string | null> {
    try {
      const key = cacheKey || this.generateCacheKey(uri);
      const localPath = `${this.cacheDir}${key}`;

      // Check if already cached
      const existingPath = await this.getCachedImagePath(uri, key);
      if (existingPath) {
        return existingPath;
      }

      // Download and cache the image
      const downloadResult = await FileSystem.downloadAsync(uri, localPath);

      if (downloadResult.status === 200) {
        // Save cache info
        await this.saveCacheInfo(key, {
          uri,
          localPath,
          timestamp: Date.now(),
          size: downloadResult.headers["content-length"]
            ? parseInt(downloadResult.headers["content-length"])
            : 0,
        });

        // Check cache size and cleanup if needed
        await this.checkCacheSize();

        return localPath;
      }

      return null;
    } catch {
      return null;
    }
  }

  private async saveCacheInfo(
    key: string,
    info: ImageCacheInfo
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(`image_cache_${key}`, JSON.stringify(info));
    } catch {
      // Silent fail
    }
  }

  private async getCacheInfo(key: string): Promise<ImageCacheInfo | null> {
    try {
      const info = await AsyncStorage.getItem(`image_cache_${key}`);
      return info ? JSON.parse(info) : null;
    } catch {
      return null;
    }
  }

  private async removeCachedImage(key: string): Promise<void> {
    try {
      const localPath = `${this.cacheDir}${key}`;
      await FileSystem.deleteAsync(localPath, { idempotent: true });
      await AsyncStorage.removeItem(`image_cache_${key}`);
    } catch {
      // Silent fail
    }
  }

  private async cleanupOldCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith("image_cache_"));

      for (const fullKey of cacheKeys) {
        const key = fullKey.replace("image_cache_", "");
        const info = await this.getCacheInfo(key);

        if (info && Date.now() - info.timestamp > this.maxCacheAge) {
          await this.removeCachedImage(key);
        }
      }
    } catch {
      // Silent fail
    }
  }

  private async checkCacheSize(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith("image_cache_"));

      let totalSize = 0;
      const cacheItems: { key: string; info: ImageCacheInfo }[] = [];

      for (const fullKey of cacheKeys) {
        const key = fullKey.replace("image_cache_", "");
        const info = await this.getCacheInfo(key);

        if (info) {
          totalSize += info.size;
          cacheItems.push({ key, info });
        }
      }

      if (totalSize > this.maxCacheSize) {
        // Sort by timestamp (oldest first) and remove until under limit
        cacheItems.sort((a, b) => a.info.timestamp - b.info.timestamp);

        for (const item of cacheItems) {
          if (totalSize <= this.maxCacheSize) break;

          await this.removeCachedImage(item.key);
          totalSize -= item.info.size;
        }
      }
    } catch {
      // Silent fail
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith("image_cache_"));

      for (const fullKey of cacheKeys) {
        const key = fullKey.replace("image_cache_", "");
        await this.removeCachedImage(key);
      }
    } catch {
      // Silent fail
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith("image_cache_"));

      let totalSize = 0;

      for (const fullKey of cacheKeys) {
        const key = fullKey.replace("image_cache_", "");
        const info = await this.getCacheInfo(key);

        if (info) {
          totalSize += info.size;
        }
      }

      return totalSize;
    } catch {
      return 0;
    }
  }
}

const cacheManager = ImageCacheManager.getInstance();

export const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  style,
  placeholder,
  fallback,
  cacheKey,
  resizeMode = "cover",
  onLoadStart,
  onLoadEnd,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    loadImage();
  }, [uri, cacheKey]);

  const loadImage = async () => {
    if (!uri) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);
      onLoadStart?.();

      // Initialize cache manager
      await cacheManager.initialize();

      // Check if image is already cached
      let cachedPath = await cacheManager.getCachedImagePath(uri, cacheKey);

      if (!cachedPath) {
        // Cache the image
        cachedPath = await cacheManager.cacheImage(uri, cacheKey);
      }

      if (isMounted.current) {
        if (cachedPath) {
          setLocalUri(cachedPath);
        } else {
          // Fallback to original URI if caching fails
          setLocalUri(uri);
        }
        setLoading(false);
        onLoadEnd?.();
      }
    } catch (err) {
      if (isMounted.current) {
        setError(true);
        setLoading(false);
        onError?.(err);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.placeholder, style]}>
        {placeholder || (
          <View style={styles.defaultPlaceholder}>
            <ActivityIndicator size="small" color="#C9A961" />
          </View>
        )}
      </View>
    );
  }

  if (error || !localUri) {
    return (
      <View style={[styles.placeholder, style]}>
        {fallback || (
          <View style={styles.defaultFallback}>
            <Text style={styles.fallbackText}>Image not available</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <Image
      source={{ uri: localUri }}
      style={style}
      resizeMode={resizeMode}
      onLoadStart={() => {
        setLoading(true);
        onLoadStart?.();
      }}
      onLoadEnd={() => {
        setLoading(false);
        onLoadEnd?.();
      }}
      onError={(err) => {
        setError(true);
        setLoading(false);
        onError?.(err);
      }}
    />
  );
};

// Lazy loading image component
interface LazyImageProps extends CachedImageProps {
  threshold?: number;
  onVisibilityChange?: (visible: boolean) => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  threshold = 100,
  onVisibilityChange,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  const viewRef = useRef<View>(null);

  useEffect(() => {
    // Simple visibility detection - in production you might use Intersection Observer equivalent
    const timer = setTimeout(() => {
      setVisible(true);
      onVisibilityChange?.(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [onVisibilityChange]);

  if (!visible) {
    return (
      <View ref={viewRef} style={[styles.placeholder, props.style]}>
        {props.placeholder || (
          <View style={styles.defaultPlaceholder}>
            <ActivityIndicator size="small" color="#C9A961" />
          </View>
        )}
      </View>
    );
  }

  return <CachedImage {...props} />;
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  defaultPlaceholder: {
    padding: 20,
  },
  defaultFallback: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
  },
});

export { cacheManager, ImageCacheManager };
export default CachedImage;

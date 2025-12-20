import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";
import Toast from "react-native-toast-message";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationAddress {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  name?: string;
  district?: string;
  subregion?: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: LocationAddress;
  coordinates: LocationCoordinates;
  phone?: string;
  email?: string;
  hours?: string[];
  services?: string[];
  distance?: number;
}

export interface DeliveryTracking {
  orderId: string;
  currentLocation?: LocationCoordinates;
  estimatedDeliveryTime?: Date;
  status: "picked_up" | "in_transit" | "out_for_delivery" | "delivered";
  trackingHistory: {
    timestamp: Date;
    location: LocationCoordinates;
    status: string;
    description: string;
  }[];
}

class LocationService {
  private currentLocation: Location.LocationObject | null = null;
  private watchingLocation = false;
  private locationWatcher: Location.LocationSubscription | null = null;

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location access to use location-based features like store finder and delivery tracking.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }

      // Request background location if needed (for delivery tracking)
      if (Platform.OS === "ios") {
        const { status: backgroundStatus } =
          await Location.requestBackgroundPermissionsAsync();
      }

      return true;
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  }

  /**
   * Check if location permissions are granted
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error checking location permissions:", error);
      return false;
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.checkPermissions();

      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          return null;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });

      this.currentLocation = location;
      return location;
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please try again."
      );
      return null;
    }
  }

  /**
   * Watch location changes
   */
  async startWatchingLocation(
    callback: (location: Location.LocationObject) => void
  ): Promise<boolean> {
    try {
      if (this.watchingLocation) {
        return true;
      }

      const hasPermission = await this.checkPermissions();

      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          return false;
        }
      }

      this.locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          this.currentLocation = location;
          callback(location);
        }
      );

      this.watchingLocation = true;
      return true;
    } catch (error) {
      console.error("Error watching location:", error);
      return false;
    }
  }

  /**
   * Stop watching location changes
   */
  stopWatchingLocation(): void {
    if (this.locationWatcher) {
      this.locationWatcher.remove();
      this.locationWatcher = null;
    }
    this.watchingLocation = false;
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(
    coordinates: LocationCoordinates
  ): Promise<LocationAddress | null> {
    try {
      const addresses = await Location.reverseGeocodeAsync(coordinates);

      if (addresses.length > 0) {
        const address = addresses[0];
        return {
          street: address.street || undefined,
          city: address.city || undefined,
          region: address.region || undefined,
          country: address.country || undefined,
          postalCode: address.postalCode || undefined,
          name: address.name || undefined,
          district: address.district || undefined,
          subregion: address.subregion || undefined,
        };
      }

      return null;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return null;
    }
  }

  /**
   * Forward geocode address to coordinates
   */
  async geocodeAddress(address: string): Promise<LocationCoordinates | null> {
    try {
      const locations = await Location.geocodeAsync(address);

      if (locations.length > 0) {
        const location = locations[0];
        return {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      }

      return null;
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(
    point1: LocationCoordinates,
    point2: LocationCoordinates
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get nearby stores
   */
  async getNearbyStores(maxDistance: number = 50): Promise<StoreLocation[]> {
    try {
      const currentLocation = await this.getCurrentLocation();

      if (!currentLocation) {
        return this.getAllStores(); // Return all stores if location unavailable
      }

      const allStores = this.getAllStores();
      const userCoords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      // Calculate distances and filter
      const storesWithDistance = allStores
        .map((store) => ({
          ...store,
          distance: this.calculateDistance(userCoords, store.coordinates),
        }))
        .filter((store) => store.distance <= maxDistance);

      // Sort by distance
      return storesWithDistance.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error("Error getting nearby stores:", error);
      return this.getAllStores();
    }
  }

  /**
   * Get all store locations (mock data - replace with API call)
   */
  private getAllStores(): StoreLocation[] {
    return [
      {
        id: "1",
        name: "Tishyaa Jewels - CP",
        address: {
          street: "Connaught Place",
          city: "New Delhi",
          region: "Delhi",
          country: "India",
          postalCode: "110001",
        },
        coordinates: {
          latitude: 28.6315,
          longitude: 77.2167,
        },
        phone: "+91 11 4567 8901",
        hours: ["Mon-Sun: 10:00 AM - 9:00 PM"],
        services: ["Custom Jewelry", "Repairs", "Consultation"],
      },
      {
        id: "2",
        name: "Tishyaa Jewels - Karol Bagh",
        address: {
          street: "Karol Bagh Market",
          city: "New Delhi",
          region: "Delhi",
          country: "India",
          postalCode: "110005",
        },
        coordinates: {
          latitude: 28.6519,
          longitude: 77.1909,
        },
        phone: "+91 11 2345 6789",
        hours: ["Mon-Sun: 10:00 AM - 8:00 PM"],
        services: ["Jewelry Sales", "Gold Exchange", "Cleaning"],
      },
      {
        id: "3",
        name: "Tishyaa Jewels - Mumbai",
        address: {
          street: "Linking Road, Bandra West",
          city: "Mumbai",
          region: "Maharashtra",
          country: "India",
          postalCode: "400050",
        },
        coordinates: {
          latitude: 19.0596,
          longitude: 72.8295,
        },
        phone: "+91 22 3456 7890",
        hours: ["Mon-Sun: 11:00 AM - 9:00 PM"],
        services: ["Designer Jewelry", "Custom Design", "Valuation"],
      },
    ];
  }

  /**
   * Open maps app with directions to store
   */
  async openDirections(store: StoreLocation): Promise<void> {
    try {
      const { coordinates } = store;
      const url = Platform.select({
        ios: `maps://app?daddr=${coordinates.latitude},${coordinates.longitude}&dirflg=d`,
        android: `geo:0,0?q=${coordinates.latitude},${coordinates.longitude}(${store.name})`,
      });

      if (url) {
        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
          await Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
          await Linking.openURL(webUrl);
        }
      }
    } catch (error) {
      console.error("Error opening directions:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to open directions. Please try again.",
      });
    }
  }

  /**
   * Get delivery tracking info (mock implementation)
   */
  async getDeliveryTracking(orderId: string): Promise<DeliveryTracking | null> {
    try {
      // This would typically fetch from your backend
      // For now, return mock data
      const mockTracking: DeliveryTracking = {
        orderId,
        currentLocation: {
          latitude: 28.6139,
          longitude: 77.209,
        },
        estimatedDeliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        status: "in_transit",
        trackingHistory: [
          {
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            location: { latitude: 28.6519, longitude: 77.1909 },
            status: "picked_up",
            description: "Order picked up from Karol Bagh store",
          },
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            location: { latitude: 28.6315, longitude: 77.2167 },
            status: "in_transit",
            description: "Package in transit via Connaught Place hub",
          },
          {
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            location: { latitude: 28.6139, longitude: 77.209 },
            status: "out_for_delivery",
            description: "Out for delivery - arriving soon",
          },
        ],
      };

      return mockTracking;
    } catch (error) {
      console.error("Error getting delivery tracking:", error);
      return null;
    }
  }

  /**
   * Save frequently used addresses
   */
  async saveAddress(name: string, address: LocationAddress): Promise<void> {
    try {
      const saved = await this.getSavedAddresses();
      const updated = [
        ...saved,
        { id: Date.now().toString(), name, ...address },
      ];
      await AsyncStorage.setItem("saved_addresses", JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving address:", error);
    }
  }

  /**
   * Get saved addresses
   */
  async getSavedAddresses(): Promise<
    (LocationAddress & { id: string; name: string })[]
  > {
    try {
      const saved = await AsyncStorage.getItem("saved_addresses");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error getting saved addresses:", error);
      return [];
    }
  }

  /**
   * Get current location coordinates
   */
  getCurrentCoordinates(): LocationCoordinates | null {
    if (this.currentLocation) {
      return {
        latitude: this.currentLocation.coords.latitude,
        longitude: this.currentLocation.coords.longitude,
      };
    }
    return null;
  }
}

export const locationService = new LocationService();
export default locationService;

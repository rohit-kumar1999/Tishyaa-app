import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import locationService, { StoreLocation } from "../../services/locationService";

export const StoreLocator: React.FC = () => {
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);

      // Get user location first
      const location = await locationService.getCurrentLocation();
      if (location) {
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }

      // Get nearby stores
      const nearbyStores = await locationService.getNearbyStores(100); // 100km radius
      setStores(nearbyStores);
    } catch (error) {
      console.error("Error loading stores:", error);
      Alert.alert("Error", "Failed to load store locations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCallStore = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleGetDirections = async (store: StoreLocation) => {
    try {
      await locationService.openDirections(store);
    } catch (error) {
      console.error("Error opening directions:", error);
      Alert.alert("Error", "Unable to open directions. Please try again.");
    }
  };

  const formatAddress = (address: StoreLocation["address"]) => {
    const parts = [
      address.street,
      address.city,
      address.region,
      address.postalCode,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const renderStoreItem = ({ item: store }: { item: StoreLocation }) => (
    <View style={styles.storeCard}>
      <View style={styles.storeHeader}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{store.name}</Text>
          {store.distance !== undefined && (
            <Text style={styles.storeDistance}>
              {store.distance.toFixed(1)} km away
            </Text>
          )}
        </View>
        <View style={styles.storeActions}>
          {store.phone && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCallStore(store.phone)}
            >
              <Ionicons name="call" size={20} color="#C9A961" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleGetDirections(store)}
          >
            <Ionicons name="navigate" size={20} color="#C9A961" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.storeAddress}>{formatAddress(store.address)}</Text>

      {store.hours && store.hours.length > 0 && (
        <View style={styles.storeHours}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.hoursText}>{store.hours[0]}</Text>
        </View>
      )}

      {store.services && store.services.length > 0 && (
        <View style={styles.servicesContainer}>
          <Text style={styles.servicesLabel}>Services:</Text>
          <View style={styles.servicesTags}>
            {store.services.map((service: string, index: number) => (
              <View key={index} style={styles.serviceTag}>
                <Text style={styles.serviceTagText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.directionsButton}
        onPress={() => handleGetDirections(store)}
      >
        <Ionicons name="navigate" size={16} color="#FFF" />
        <Text style={styles.directionsButtonText}>Get Directions</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Ionicons name="location" size={32} color="#C9A961" />
        <Text style={styles.headerTitle}>Find Our Stores</Text>
        <Text style={styles.headerSubtitle}>
          Discover Tishyaa Jewels stores near you
        </Text>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadStores}>
        <Ionicons name="refresh" size={20} color="#C9A961" />
        <Text style={styles.refreshButtonText}>Refresh Location</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="location-outline" size={64} color="#CCC" />
      <Text style={styles.emptyTitle}>No stores found</Text>
      <Text style={styles.emptySubtitle}>
        We couldn't find any stores in your area. Try refreshing your location
        or check back later.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadStores}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C9A961" />
        <Text style={styles.loadingText}>Finding stores near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stores}
        renderItem={renderStoreItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          stores.length === 0 ? styles.emptyListContainer : undefined
        }
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadStores}
      />
    </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerContent: {
    alignItems: "center",
    marginBottom: 16,
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
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#C9A961",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  storeCard: {
    backgroundColor: "#FFF",
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  storeDistance: {
    fontSize: 14,
    color: "#C9A961",
    fontWeight: "500",
  },
  storeActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },
  storeAddress: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  storeHours: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  hoursText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  servicesContainer: {
    marginBottom: 16,
  },
  servicesLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  servicesTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  serviceTag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceTagText: {
    fontSize: 12,
    color: "#666",
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C9A961",
    padding: 12,
    borderRadius: 8,
  },
  directionsButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#C9A961",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default StoreLocator;

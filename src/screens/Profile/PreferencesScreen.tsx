import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavigation from "../../components/common/BottomNavigation";
import {
  UserPreferences,
  useCreateOrUpdatePreferences,
  useGetPreference,
} from "../../services/preferenceService";

export default function PreferencesScreen() {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;

  const { data: userPreferences, isLoading, refetch } = useGetPreference();
  const updatePreferencesMutation = useCreateOrUpdatePreferences();

  const [preferences, setPreferences] = useState<UserPreferences>({
    userId: userId || "",
    newsletter: false,
    promotions: false,
    updates: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update local state when preferences are fetched
  useEffect(() => {
    if (userPreferences) {
      setPreferences({
        userId: userPreferences.userId || userId || "",
        newsletter: userPreferences.newsletter ?? false,
        promotions: userPreferences.promotions ?? false,
        updates: userPreferences.updates ?? false,
      });
    }
  }, [userPreferences, userId]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Handle toggle change
  const handleToggleChange = useCallback(
    (field: keyof Omit<UserPreferences, "userId">) => {
      setPreferences((prev) => ({
        ...prev,
        [field]: !prev[field],
      }));
    },
    []
  );

  // Handle save
  const handleSaveChanges = useCallback(() => {
    setSaveSuccess(false);
    updatePreferencesMutation.mutate(preferences, {
      onSuccess: () => setSaveSuccess(true),
    });
  }, [preferences, updatePreferencesMutation]);

  // Reset success message when preferences change
  useEffect(() => {
    if (hasChanges) {
      setSaveSuccess(false);
    }
  }, [preferences]);

  // Check if preferences have changed
  const hasChanges = userPreferences
    ? preferences.newsletter !== (userPreferences.newsletter ?? false) ||
      preferences.promotions !== (userPreferences.promotions ?? false) ||
      preferences.updates !== (userPreferences.updates ?? false)
    : true;

  // Custom Toggle Component that works properly on Android
  const CustomToggle = ({
    value,
    onToggle,
  }: {
    value: boolean;
    onToggle: () => void;
  }) => {
    const translateX = useRef(new Animated.Value(value ? 24 : 0)).current;

    useEffect(() => {
      Animated.spring(translateX, {
        toValue: value ? 24 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }).start();
    }, [value]);

    return (
      <Pressable
        onPress={onToggle}
        style={[
          styles.toggleTrack,
          { backgroundColor: value ? "#fecdd3" : "#E5E7EB" },
        ]}
      >
        <Animated.View
          style={[
            styles.toggleThumb,
            {
              backgroundColor: value ? "#e11d48" : "#9CA3AF",
              transform: [{ translateX }],
            },
          ]}
        />
      </Pressable>
    );
  };

  // Preference item component
  const PreferenceItem = ({
    icon,
    title,
    description,
    value,
    onToggle,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceIconContainer}>
        <Ionicons name={icon} size={22} color="#e11d48" />
      </View>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <CustomToggle value={value} onToggle={onToggle} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#fdf2f8", "#fce7f3"]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preferences</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={styles.loadingText}>Loading preferences...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#e11d48"
                colors={["#e11d48"]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Email Preferences Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="mail-outline" size={20} color="#e11d48" />
                </View>
                <Text style={styles.sectionTitle}>Email Preferences</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Choose what emails you'd like to receive from us
              </Text>

              <View style={styles.preferencesCard}>
                <PreferenceItem
                  icon="newspaper-outline"
                  title="Newsletter"
                  description="Receive our weekly newsletter with latest trends and tips"
                  value={preferences.newsletter}
                  onToggle={() => handleToggleChange("newsletter")}
                />

                <View style={styles.divider} />

                <PreferenceItem
                  icon="pricetag-outline"
                  title="Promotions"
                  description="Get exclusive promotional emails and special offers"
                  value={preferences.promotions}
                  onToggle={() => handleToggleChange("promotions")}
                />

                <View style={styles.divider} />

                <PreferenceItem
                  icon="cube-outline"
                  title="Order Updates"
                  description="Order updates and shipping notifications"
                  value={preferences.updates}
                  onToggle={() => handleToggleChange("updates")}
                />
              </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#6B7280"
                />
                <Text style={styles.infoText}>
                  You can change these preferences anytime. We respect your
                  privacy and will never share your email with third parties.
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!hasChanges || updatePreferencesMutation.isLoading) &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSaveChanges}
              disabled={!hasChanges || updatePreferencesMutation.isLoading}
            >
              {updatePreferencesMutation.isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.saveButtonText}>Save Preferences</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Success Message */}
            {saveSuccess && !hasChanges && (
              <View style={styles.successMessage}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.successText}>
                  Preferences saved successfully!
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </LinearGradient>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fdf2f8",
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fce7f3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 48,
    marginBottom: 16,
  },
  preferencesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  preferenceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fdf2f8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  preferenceContent: {
    flex: 1,
    marginRight: 12,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  toggleTrack: {
    width: 48,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginLeft: 12,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e11d48",
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
  },
  successText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
    marginLeft: 8,
  },
});

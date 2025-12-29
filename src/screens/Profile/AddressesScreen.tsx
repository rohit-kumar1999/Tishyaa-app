import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavigation from "../../components/common/BottomNavigation";
import { TouchableOpacity } from "../../components/common/TouchableOpacity";
import { useAddressManager } from "../../hooks/useAddressManager";
import { Address, AddressInput } from "../../services/addressService";

// Address type options
const ADDRESS_TYPES = [
  { id: "HOME", label: "Home", icon: "home-outline" },
  { id: "WORK", label: "Work", icon: "business-outline" },
  { id: "OTHER", label: "Other", icon: "location-outline" },
];

export default function AddressesScreen() {
  const router = useRouter();
  const { userId } = useAuth();

  const {
    addresses,
    isLoading,
    refetch,
    isAddressModalOpen,
    setIsAddressModalOpen,
    isEditMode,
    currentAddress,
    isSubmitting,
    isSettingDefault,
    isDeleting,
    handleAddNewAddress,
    handleEditAddress,
    handleAddressSubmit,
    handleSetDefaultAddress,
    handleDeleteAddress,
    resetAndCloseForm,
  } = useAddressManager();

  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<AddressInput>({
    name: "",
    type: "HOME",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: "",
    isDefault: false,
  });

  // Initialize form when modal opens
  React.useEffect(() => {
    if (isAddressModalOpen) {
      if (isEditMode && currentAddress) {
        // Normalize type to uppercase to match ADDRESS_TYPES ids
        const normalizedType = (currentAddress.type || "HOME").toUpperCase();
        setFormData({
          name: currentAddress.name || "",
          type: normalizedType,
          street: currentAddress.street || "",
          city: currentAddress.city || "",
          state: currentAddress.state || "",
          zipCode: currentAddress.zipCode || "",
          country: currentAddress.country || "India",
          phone: currentAddress.phone || "",
          isDefault: currentAddress.isDefault || false,
        });
      } else {
        setFormData({
          name: "",
          type: "HOME",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India",
          phone: "",
          isDefault: addresses.length === 0,
        });
      }
    }
  }, [isAddressModalOpen, isEditMode, currentAddress, addresses.length]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Handle form field change
  const updateField = useCallback(
    (field: keyof AddressInput, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Validate form
  const validateForm = useCallback(() => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.street.trim()) return "Street address is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State is required";
    if (!formData.zipCode.trim()) return "PIN code is required";
    if (!formData.phone.trim()) return "Phone number is required";
    if (!/^\d{6}$/.test(formData.zipCode))
      return "Please enter a valid 6-digit PIN code";
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, "")))
      return "Please enter a valid 10-digit phone number";
    return null;
  }, [formData]);

  // Handle form submit
  const onSubmit = useCallback(() => {
    const error = validateForm();
    if (error) {
      // Show validation error
      return;
    }
    handleAddressSubmit(formData);
  }, [formData, validateForm, handleAddressSubmit]);

  // Render address card
  const renderAddressCard = useCallback(
    ({ item: address }: { item: Address }) => {
      const isSettingThis = isSettingDefault === address.id;
      const isDeletingThis = isDeleting === address.id;
      // Normalize type to uppercase for matching with ADDRESS_TYPES ids
      const normalizedType = (address.type || "OTHER").toUpperCase();
      const addressType =
        ADDRESS_TYPES.find((t) => t.id === normalizedType) || ADDRESS_TYPES[2];

      return (
        <View style={styles.addressCard}>
          {/* Header */}
          <View style={styles.addressHeader}>
            <View style={styles.addressTypeContainer}>
              <View
                style={[
                  styles.typeIconContainer,
                  address.isDefault && styles.defaultTypeIcon,
                ]}
              >
                <Ionicons
                  name={addressType.icon as any}
                  size={18}
                  color={address.isDefault ? "#fff" : "#e11d48"}
                />
              </View>
              <View>
                <View style={styles.typeLabelRow}>
                  <Text style={styles.typeLabel}>{addressType.label}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressName}>{address.name}</Text>
              </View>
            </View>
          </View>

          {/* Address Details */}
          <View style={styles.addressDetails}>
            <Text style={styles.addressText}>{address.street}</Text>
            <Text style={styles.addressText}>
              {address.city}, {address.state} {address.zipCode}
            </Text>
            <Text style={styles.addressText}>{address.country}</Text>
            {address.phone && (
              <View style={styles.phoneRow}>
                <Ionicons name="call-outline" size={14} color="#6B7280" />
                <Text style={styles.phoneText}>{address.phone}</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.addressActions}>
            {!address.isDefault && (
              <TouchableOpacity
                style={styles.setDefaultButton}
                onPress={() => handleSetDefaultAddress(address.id)}
                disabled={isSettingThis}
              >
                {isSettingThis ? (
                  <ActivityIndicator size="small" color="#e11d48" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color="#e11d48"
                    />
                    <Text style={styles.setDefaultText}>Set as Default</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditAddress(address)}
              >
                <Ionicons name="create-outline" size={18} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteAddress(address.id)}
                disabled={isDeletingThis}
              >
                {isDeletingThis ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    },
    [
      isSettingDefault,
      isDeleting,
      handleSetDefaultAddress,
      handleEditAddress,
      handleDeleteAddress,
    ]
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={["#FEE2E2", "#FECACA"]}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="location-outline" size={48} color="#e11d48" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No Addresses Yet</Text>
      <Text style={styles.emptyMessage}>
        Add your delivery address to make checkout faster and easier.
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddNewAddress}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>
    </View>
  );

  // Render address form modal
  const renderAddressModal = () => (
    <Modal
      visible={isAddressModalOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={resetAndCloseForm}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={resetAndCloseForm}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {isEditMode ? "Edit Address" : "Add New Address"}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Address Type Selection */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Address Type</Text>
            <View style={styles.typeOptions}>
              {ADDRESS_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeOption,
                    formData.type === type.id && styles.typeOptionSelected,
                  ]}
                  onPress={() => updateField("type", type.id)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={formData.type === type.id ? "#fff" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.type === type.id &&
                        styles.typeOptionTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Full Name */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => updateField("name", text)}
              placeholder="Enter full name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Phone */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => updateField("phone", text)}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Street Address */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Street Address *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={formData.street}
              onChangeText={(text) => updateField("street", text)}
              placeholder="House no., Building, Street, Area"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={2}
            />
          </View>

          {/* City & State */}
          <View style={styles.formRow}>
            <View style={[styles.formSection, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.formLabel}>City *</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => updateField("city", text)}
                placeholder="City"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={[styles.formSection, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.formLabel}>State *</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) => updateField("state", text)}
                placeholder="State"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* PIN Code & Country */}
          <View style={styles.formRow}>
            <View style={[styles.formSection, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.formLabel}>PIN Code *</Text>
              <TextInput
                style={styles.input}
                value={formData.zipCode}
                onChangeText={(text) => updateField("zipCode", text)}
                placeholder="6-digit PIN"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            <View style={[styles.formSection, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.formLabel}>Country</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.country}
                editable={false}
              />
            </View>
          </View>

          {/* Set as Default */}
          <TouchableOpacity
            style={styles.defaultToggle}
            onPress={() => updateField("isDefault", !formData.isDefault)}
          >
            <View
              style={[
                styles.checkbox,
                formData.isDefault && styles.checkboxChecked,
              ]}
            >
              {formData.isDefault && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
            <Text style={styles.defaultToggleText}>Set as default address</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? "Update Address" : "Save Address"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <LinearGradient
      colors={["#fdf2f8", "#fce7f3"]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>My Addresses</Text>
            {isLoading && (
              <ActivityIndicator
                size="small"
                color="#e11d48"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          <TouchableOpacity
            style={styles.headerAddButton}
            onPress={handleAddNewAddress}
          >
            <Ionicons name="add" size={24} color="#e11d48" />
          </TouchableOpacity>
        </View>

        {/* Address List */}
        {isLoading && addresses.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={styles.loadingText}>Loading addresses...</Text>
          </View>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderAddressCard}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#e11d48"
              />
            }
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={[
              styles.listContainer,
              addresses.length === 0 && styles.emptyListContainer,
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Address Modal */}
        {renderAddressModal()}

        {/* Bottom Navigation */}
        <BottomNavigation currentRoute="/profile" />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerAddButton: {
    padding: 4,
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
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  // Address Card
  addressCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fdf2f8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  defaultTypeIcon: {
    backgroundColor: "#e11d48",
  },
  typeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeLabel: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "uppercase",
    fontWeight: "500",
  },
  defaultBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "600",
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 2,
  },
  addressDetails: {
    paddingLeft: 52,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  phoneText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  addressActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  setDefaultButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  setDefaultText: {
    fontSize: 14,
    color: "#e11d48",
    fontWeight: "500",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e11d48",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#fdf2f8",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  formRow: {
    flexDirection: "row",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    color: "#9CA3AF",
  },
  typeOptions: {
    flexDirection: "row",
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },
  typeOptionSelected: {
    backgroundColor: "#e11d48",
    borderColor: "#e11d48",
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginLeft: 8,
  },
  typeOptionTextSelected: {
    color: "#fff",
  },
  defaultToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#e11d48",
    borderColor: "#e11d48",
  },
  defaultToggleText: {
    fontSize: 14,
    color: "#374151",
  },
  submitButton: {
    backgroundColor: "#e11d48",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

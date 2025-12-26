import { useUser } from "@clerk/clerk-expo";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import {
  Address,
  AddressInput,
  useCreateAddress,
  useDeleteAddress,
  useGetAddresses,
  useUpdateAddress,
} from "../services/addressService";

export const useAddressManager = () => {
  const { user } = useUser();
  const userId = user?.id;

  // Fetch addresses
  const { data: addressesResponse, isLoading, refetch } = useGetAddresses();

  // Handle different response structures:
  // - Array of addresses: [...addresses]
  // - Object with data property: { data: [...addresses] }
  // - Single address: { id: ..., name: ..., ... }
  const addressesRaw: Address[] = Array.isArray(addressesResponse)
    ? addressesResponse
    : Array.isArray(addressesResponse?.data)
    ? addressesResponse.data
    : addressesResponse?.id
    ? [addressesResponse]
    : [];

  // Sort addresses so default address appears first
  const addresses = [...addressesRaw].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  // Mutations
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();

  // UI State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Handle add new address
  const handleAddNewAddress = useCallback(() => {
    setCurrentAddress(null);
    setIsEditMode(false);
    setIsAddressModalOpen(true);
  }, []);

  // Handle edit address
  const handleEditAddress = useCallback((address: Address) => {
    setCurrentAddress(address);
    setIsEditMode(true);
    setIsAddressModalOpen(true);
  }, []);

  // Reset and close form
  const resetAndCloseForm = useCallback(() => {
    setIsAddressModalOpen(false);
    setCurrentAddress(null);
    setIsEditMode(false);
    setIsSubmitting(false);
  }, []);

  // Handle address submit (create or update)
  const handleAddressSubmit = useCallback(
    async (addressData: AddressInput) => {
      if (!userId) {
        Alert.alert("Error", "Please sign in to manage addresses");
        return;
      }

      setIsSubmitting(true);

      try {
        if (isEditMode && currentAddress) {
          // Update existing address
          await updateAddressMutation.mutate({
            ...addressData,
            id: currentAddress.id,
          } as any);
        } else {
          // Create new address
          await createAddressMutation.mutate(addressData);
        }

        resetAndCloseForm();
        refetch();
      } catch {
        Alert.alert(
          "Error",
          isEditMode ? "Failed to update address" : "Failed to add address"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      userId,
      isEditMode,
      currentAddress,
      updateAddressMutation,
      createAddressMutation,
      resetAndCloseForm,
      refetch,
    ]
  );

  // Handle set default address
  const handleSetDefaultAddress = useCallback(
    async (addressId: string) => {
      if (!userId) return;

      setIsSettingDefault(addressId);

      try {
        const address = addresses.find((a) => a.id === addressId);
        if (address) {
          await updateAddressMutation.mutate({
            ...address,
            isDefault: true,
          } as any);
          refetch();
        }
      } catch {
        Alert.alert("Error", "Failed to set default address");
      } finally {
        setIsSettingDefault(null);
      }
    },
    [userId, addresses, updateAddressMutation, refetch]
  );

  // Handle delete address
  const handleDeleteAddress = useCallback(
    async (addressId: string) => {
      Alert.alert(
        "Delete Address",
        "Are you sure you want to delete this address?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setIsDeleting(addressId);
              try {
                await deleteAddressMutation.mutate(addressId);
                refetch();
              } catch {
                Alert.alert("Error", "Failed to delete address");
              } finally {
                setIsDeleting(null);
              }
            },
          },
        ]
      );
    },
    [deleteAddressMutation, refetch]
  );

  return {
    // Data
    addresses,
    isLoading,
    refetch,

    // Modal state
    isAddressModalOpen,
    setIsAddressModalOpen,
    isEditMode,
    currentAddress,

    // Loading states
    isSubmitting,
    isSettingDefault,
    isDeleting,

    // Actions
    handleAddNewAddress,
    handleEditAddress,
    handleAddressSubmit,
    handleSetDefaultAddress,
    handleDeleteAddress,
    resetAndCloseForm,
  };
};

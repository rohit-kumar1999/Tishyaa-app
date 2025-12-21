import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import {
  useApiDeleteMutation,
  useApiMutation,
  useApiPutMutation,
} from "../hooks/useApiQuery";
import api from "../setup/api";

export interface Address {
  id: string;
  name: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  userId?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Make all fields required to match the form values
export type AddressInput = Omit<Address, "id">;

// Ensure endpoint is properly formatted for API calls
const ADDRESSES_ENDPOINT = `/address`;

// Example of direct usage with the API function and useQuery
export const useGetAddresses = () => {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ["address", userId],
    queryFn: () => api.get(`${ADDRESSES_ENDPOINT}?userId=${userId}`),
    // Only execute query if we have a userId
    enabled: !!userId,
  });
};

// Get a single address by ID
export const useGetAddress = (id: string) => {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ["address", id, userId],
    queryFn: () => api.get(`${ADDRESSES_ENDPOINT}/${id}?userId=${userId}`),
    enabled: !!id && !!userId, // Only run if both id and userId are available
  });
};

// Continue with the wrapper hooks pattern for consistency
export const useCreateAddress = () => {
  const { user } = useUser();
  const userId = user?.id;

  return useApiMutation<Address, AddressInput & { userId?: string }>(
    ADDRESSES_ENDPOINT,
    {
      invalidateQueries: ["address"], // Simplified to target the addresses query key
      successMessage: "Address added successfully",
      transformRequest: (data: AddressInput) => ({ ...data, userId }), // Add userId to request payload
    }
  );
};

export const useUpdateAddress = () => {
  const { user } = useUser();
  const userId = user?.id;

  return useApiPutMutation<Address, AddressInput>(ADDRESSES_ENDPOINT, {
    invalidateQueries: ["address"], // Target both addresses list and specific address
    successMessage: "Address updated successfully",
    transformRequest: (data: AddressInput) => ({ ...data, userId }),
  });
};

export const useDeleteAddress = () => {
  const { user } = useUser();
  const userId = user?.id;

  return useApiDeleteMutation<void>(ADDRESSES_ENDPOINT, {
    invalidateQueries: ["address"], // Simplified to target the addresses query key
    successMessage: "Address deleted successfully",
    transformRequest: (id: number) => ({ id, userId }),
  });
};

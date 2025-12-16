import {
  useApiMutation,
  useApiPutMutation,
  useApiDeleteMutation,
} from "@/hooks/useApiQuery";
import { useQuery } from "@tanstack/react-query";
import api from "@/setup/api";
import { useUserData } from "@/hooks/useUserData";

export interface Address {
  id: number;
  name: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// Make all fields required to match the form values
export type AddressInput = Omit<Address, "id">;

export const useGetAddresses = () => {
  return {
    data: [
      {
        id: 1,
        name: "John Doe",
        phone: "+91 9876543210",
        street: "123 Main Street, Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        country: "India",
        isDefault: true,
      },
      {
        id: 2,
        name: "John Doe",
        phone: "+91 9876543210",
        street: "456 Business District",
        city: "Delhi",
        state: "Delhi",
        zipCode: "110001",
        country: "India",
        isDefault: false,
      },
    ] as Address[],
    isLoading: false,
    error: null,
  };
};

// Mock address service
export interface Address {
  id: number;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

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

// Mock admin service for analytics
export const useGetAnalytics = () => {
  return {
    data: {
      totalRevenue: 150000,
      totalOrders: 245,
      conversionRate: 3.2,
      averageOrderValue: 612,
    },
    isLoading: false,
  };
};

export const useGetProfitAnalysis = () => {
  return {
    data: {
      totalProfit: 45000,
      profitMargin: 30,
    },
    isLoading: false,
  };
};

// Mock products service
export const useGetAllProducts = () => {
  return {
    data: [
      {
        id: "1",
        name: "Gold Diamond Ring",
        price: 25000,
        category: "Rings",
        stock: 5,
        image: "https://via.placeholder.com/150",
        description: "Beautiful gold diamond ring",
        status: "active",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Silver Necklace",
        price: 8000,
        category: "Necklaces",
        stock: 12,
        image: "https://via.placeholder.com/150",
        description: "Elegant silver necklace",
        status: "active",
        createdAt: "2024-01-02T00:00:00Z",
      },
    ],
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

export const useDeleteProduct = () => {
  return {
    mutate: (productId: string) => {
      // Mock delete operation
    },
    isLoading: false,
  };
};

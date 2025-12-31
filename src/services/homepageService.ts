import { api } from "@/setup/api";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Category } from "./categoryService";
import { Product, ProductResponse } from "./productService";

// Feature flag to control API vs mock data
const USE_MOCK_DATA = false; // Backend API is ready

// Combined homepage data interface
export interface HomepageData {
  products: Product[];
  featuredProducts: Product[];
  categories: Category[];
  materials: string[];
  occasions: string[];
  pagination: ProductResponse["pagination"];
  meta: ProductResponse["meta"];
}

// Transform API categories to Category interface
const transformApiCategories = (
  apiCategories: Array<{ name: string; count: number }>
): Category[] => {
  return apiCategories.map((category, index) => ({
    id: category.name,
    name: category.name.charAt(0).toUpperCase() + category.name.slice(1),
    description: `Beautiful ${category.name} collection`,
    imageUrl: "", // Local images are used in CategorySection.tsx
    count: category.count,
    isActive: true,
    order: index + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

// Note: Category images are now handled locally in CategorySection.tsx
// imageUrl field is kept for API compatibility but uses empty string as fallback

// Mock data for development (kept minimal since USE_MOCK_DATA = false)
const mockHomepageData: HomepageData = {
  products: [],
  featuredProducts: [],
  categories: [],
  materials: [],
  occasions: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  meta: {
    resultsCount: 0,
    processingTime: "0ms",
    cached: false,
    timestamp: new Date().toISOString(),
  },
};

// Transform API products to Product interface
const transformApiProducts = (apiProducts: any[]): Product[] => {
  return apiProducts.map((product: any) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    productType: product.productType,
    category: product.category,
    subcategory: product.subcategory,
    originalPrice: product.originalPrice,
    price: product.price,
    discountPrice: product.discountPrice,
    discount: product.discount,
    images: product.images || [],
    rating: product.rating,
    ratingCount: product.ratingCount,
    active: product.active,
    inStock: product.inStock,
    stockQuantity: product.stockQuantity,
    specifications: product.specifications,
    attributes: product.attributes,
    hasPromotion: product.hasPromotion,
    promotionText: product.promotionText,
    promotionType: product.promotionType,
    promotionData: product.promotionData,
    tags: product.tags || [],
    keywords: product.keywords || [],
    metadata: product.metadata,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));
};

// Centralized homepage data hook - uses React Query for caching
export const useHomepageData = () => {
  const query = useQuery<HomepageData>({
    queryKey: ["homepage-data"],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockHomepageData;
      }

      // Single API call to get all homepage data
      const response: ProductResponse = await api.post("/product", {
        page: 1,
        limit: 8, // Get more products for both featured and regular display
        sortBy: "rating",
        sortOrder: "desc",
        includeCategories: true,
        includeTotalCount: true,
        includeMaterials: true,
        includeOccasions: true,
        inStock: true,
      });

      const transformedProducts = transformApiProducts(response.products);
      const transformedCategories = transformApiCategories(response.categories);

      // Split products - first 8 for featured, all for general use
      const featuredProducts = transformedProducts.slice(0, 8);

      return {
        products: transformedProducts,
        featuredProducts,
        categories: transformedCategories,
        materials: response.materials,
        occasions: response.occasions,
        pagination: response.pagination,
        meta: response.meta,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnMount: true, // Refetch in background when mounting
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Show stale data while refetching
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });

  // Use cached data or fallback to mock data (shows content immediately)
  const data = query.data;

  const refetch = useCallback(() => {
    query.refetch();
  }, [query]);

  return {
    data,
    products: data?.products,
    featuredProducts: data?.featuredProducts,
    categories: data?.categories,
    materials: data?.materials,
    occasions: data?.occasions,
    pagination: data?.pagination,
    meta: data?.meta,
    // isLoading: true only when pending (no data yet and fetching)
    isLoading: query.isPending && !query.data,
    // isFetching: true when any fetch is happening (including background)
    isFetching: query.isFetching,
    // Only show error if we have no data to display (mock data counts as data)
    error: query.error?.message ?? null,
    refetch,
  };
};

// Convenience hooks that use the centralized data
export const useHomepageCategories = () => {
  const { categories, isLoading, error, refetch } = useHomepageData();

  return {
    categories,
    isLoading,
    error,
    refetch,
  };
};

export const useFeaturedProducts = () => {
  const { featuredProducts, isLoading, error, refetch } = useHomepageData();

  return {
    products: featuredProducts,
    isLoading,
    error,
    refetch,
  };
};

// Backward compatibility - alias for existing usage
export const useGetHomepageCategories = useHomepageCategories;
export const useGetFeaturedProducts = useFeaturedProducts;

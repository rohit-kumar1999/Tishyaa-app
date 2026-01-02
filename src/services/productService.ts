import { api } from "@/setup/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useApiMutation, useApiQuery } from "../hooks/useApiQuery";

export interface Product {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  productType: string;
  category: string;
  subcategory?: string;
  regularPrice: string;
  discountedPrice: number;
  images: string[];
  rating: number;
  ratingCount: number;
  active: boolean;
  stockQuantity: number;
  specifications?: Record<string, any>;
  attributes?: Record<string, any>;
  hasPromotion: boolean;
  tags: string[];
  keywords: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const CART_ENDPOINT = "/cart";

export interface ProductResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  categories: Array<{
    name: string;
    count: number;
  }>;
  materials?: string[];
  occasions?: string[];
  meta: {
    resultsCount: number;
    processingTime: string;
    cached: boolean;
    timestamp: string;
  };
}

// Legacy interface for backward compatibility
export interface CategoryWithCount {
  id: string;
  name: string;
  count: number;
}

// Transform API products to match Product interface
const transformApiProducts = (apiProducts: any[]): Product[] => {
  return apiProducts.map((product: any) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    productType: product.productType,
    category: product.category,
    subcategory: product.subcategory,
    regularPrice: product.regularPrice,
    discountedPrice: product.discountedPrice,
    images: product.images || [],
    rating: product.rating,
    ratingCount: product.ratingCount,
    active: product.active,
    stockQuantity: product.stockQuantity,
    specifications: product.specifications,
    attributes: product.attributes,
    hasPromotion: product.hasPromotion,
    tags: product.tags || [],
    keywords: product.keywords || [],
    metadata: product.metadata,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));
};

// Hook for fetching featured products (trending/bestsellers) - uses React Query
export const useFeaturedProducts = () => {
  const query = useQuery<ProductResponse>({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const response: ProductResponse = await api.post("/product", {
        page: 1,
        limit: 8,
        sortBy: "rating",
        sortOrder: "desc",
        includeCategories: false,
        includeTotalCount: false,
      });
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const products = useMemo(
    () => (query.data ? transformApiProducts(query.data.products) : []),
    [query.data]
  );

  const refetch = useCallback(() => {
    query.refetch();
  }, [query]);

  return {
    products,
    isLoading: query.isPending && !query.data,
    isFetching: query.isFetching,
    // Only show error if we have no products to display
    error: products.length > 0 ? null : query.error?.message ?? null,
    refetch,
  };
};

// Legacy hook for backward compatibility
export const useGetProducts = () => {
  const { products, isLoading, error } = useFeaturedProducts();

  // Transform to legacy format for backward compatibility
  const legacyProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.discountedPrice,
    category: product.category,
    stock: product.stockQuantity,
    image: product.images[0] || "https://via.placeholder.com/150",
    description: product.description || "",
    status: product.active ? "active" : ("inactive" as "active" | "inactive"),
  }));

  return {
    data: legacyProducts,
    isLoading,
    error,
  };
};

// Hook for fetching all products with pagination and filters - uses React Query
export const useProducts = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  category?: string;
  categories?: string[];
  material?: string;
  occasion?: string;
  ratings?: number[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  priceRange?: [number, number];
}) => {
  // Create stable serialized strings for query key
  const queryKeyParams = useMemo(
    () => ({
      page: params?.page || 1,
      limit: params?.limit || 20,
      sortBy: params?.sortBy || "createdAt",
      sortOrder: params?.sortOrder || "desc",
      category: params?.category,
      categories: params?.categories?.sort().join(",") || "",
      material: params?.material || "",
      occasion: params?.occasion || "",
      ratings: params?.ratings?.sort().join(",") || "",
      search: params?.search || "",
      priceRange: params?.priceRange?.join(",") || "",
    }),
    [
      params?.page,
      params?.limit,
      params?.sortBy,
      params?.sortOrder,
      params?.category,
      params?.categories,
      params?.material,
      params?.occasion,
      params?.ratings,
      params?.search,
      params?.priceRange,
    ]
  );

  // Build request body
  const requestBody = useMemo(
    () => ({
      page: params?.page || 1,
      limit: params?.limit || 20,
      sortBy: params?.sortBy || "createdAt",
      sortOrder: params?.sortOrder || "desc",
      includeCategories: true,
      includeTotalCount: true,
      includeMaterials: true,
      includeOccasions: true,
      ...(params?.category && { category: params.category }),
      ...(params?.categories?.length && { categories: params.categories }),
      ...(params?.material && { material: params.material }),
      ...(params?.occasion && { occasion: params.occasion }),
      ...(params?.ratings?.length && {
        minRating: Math.max(...params.ratings),
      }),
      ...(params?.search && { search: params.search }),
      ...(params?.minPrice !== undefined && { minPrice: params.minPrice }),
      ...(params?.maxPrice !== undefined && { maxPrice: params.maxPrice }),
      ...(params?.priceRange && {
        minPrice: params.priceRange[0],
        maxPrice: params.priceRange[1],
      }),
    }),
    [queryKeyParams]
  );

  const query = useQuery<ProductResponse>({
    queryKey: ["products", queryKeyParams],
    queryFn: async () => {
      const response: ProductResponse = await api.post("/product", requestBody);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for product lists (shorter since filters change)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Show stale data while refetching
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const products = useMemo(
    () => (query.data ? transformApiProducts(query.data.products) : []),
    [query.data]
  );

  const refetch = useCallback(() => {
    query.refetch();
  }, [query]);

  // Reset function (no longer needed with React Query, but kept for compatibility)
  const resetCircuitBreaker = useCallback(() => {
    // No-op - React Query handles this
  }, []);

  return {
    data: query.data ?? null,
    products,
    pagination: query.data?.pagination,
    categories: query.data?.categories || [],
    materials: query.data?.materials || [],
    occasions: query.data?.occasions || [],
    meta: query.data?.meta,
    // isLoading: true only when pending (no data yet and fetching)
    isLoading: query.isPending && !query.data,
    isFetching: query.isFetching,
    // Only show error if we have no products to display
    error: products.length > 0 ? null : query.error?.message ?? null,
    refetch,
    resetCircuitBreaker,
  };
};

// Cart Service Hooks
export const useGetCart = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const userId = user?.id;

  const result = useApiQuery<CartItem[]>(`/cart?userId=${userId}`, {
    enabled: !!userId && isSignedIn,
    dependencies: [userId],
    errorMessage: "Failed to load cart",
  });

  return result;
};

export const useAddToCart = () => {
  const { user } = useUser();
  const userId = user?.id;

  return useApiMutation<CartItem, { productId: string; quantity: number }>(
    CART_ENDPOINT,
    {
      invalidateQueries: userId ? [`/cart?userId=${userId}`] : [],
      successMessage: "Added to your cart",
      transformRequest: (data) => ({ ...data, userId }),
    }
  );
};

export const useUpdateCartItem = () => {
  const { user } = useUser();
  const userId = user?.id;

  return useApiMutation<any, { cartId: string; quantity: number }>("/cart", {
    invalidateQueries: userId ? [`/cart?userId=${userId}`] : [],
    successMessage: "Cart updated successfully",
    transformRequest: (data) => ({
      cartId: data.cartId,
      quantity: data.quantity,
      userId: userId,
    }),
  });
};

export const useRemoveFromCart = () => {
  const { user } = useUser();
  const userId = user?.id;

  return useApiMutation<void, { cartId: string }>("/cart", {
    invalidateQueries: userId ? [`/cart?userId=${userId}`] : [],
    successMessage: "Removed from your cart",
    transformRequest: (data: { cartId: string }) => ({
      cartId: data.cartId,
      quantity: 0, // Set quantity to 0 to remove item
      userId: userId,
    }),
  });
};

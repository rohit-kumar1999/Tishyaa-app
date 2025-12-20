import { api } from "@/src/setup/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiMutation, useApiQuery } from "../hooks/useApiQuery";

// Global request tracker to prevent infinite loops across all instances
let globalRequestCount = 0;
let globalResetTimeout: NodeJS.Timeout | null = null;

const resetGlobalCounter = () => {
  globalRequestCount = 0;
};

export interface Product {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  productType: string;
  category: string;
  subcategory?: string;
  originalPrice: string;
  price: number;
  discountPrice?: number | null;
  discount?: number | null;
  images: string[];
  rating: number;
  ratingCount: number;
  active: boolean;
  inStock: boolean;
  stockQuantity: number;
  specifications?: Record<string, any>;
  attributes?: Record<string, any>;
  hasPromotion: boolean;
  promotionText?: string | null;
  promotionType?: string | null;
  promotionData?: Record<string, any> | null;
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
  materials: string[];
  occasions: string[];
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

// Hook for fetching featured products (trending/bestsellers)
export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch products with filters for featured items (trending/bestsellers)
      const response: ProductResponse = await api.post("/product", {
        page: 1,
        limit: 8,
        sortBy: "rating",
        sortOrder: "desc",
        includeCategories: false,
        includeTotalCount: false,
        includeMaterials: false,
        includeOccasions: false,
        inStock: true,
      });

      const transformedProducts = transformApiProducts(response.products);
      setProducts(transformedProducts);
    } catch (err) {
      console.error("Error fetching featured products:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch featured products"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  const refetch = useCallback(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return {
    products,
    isLoading,
    error,
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
    price: product.price,
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

// Hook for fetching all products with pagination and filters
export const useProducts = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  category?: string;
  categories?: string[];
  materials?: string[];
  occasions?: string[];
  discounts?: string[];
  ratings?: number[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  priceRange?: [number, number];
  inStock?: boolean;
}) => {
  const [data, setData] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestCountRef = useRef(0);

  // Create stable serialized strings for array dependencies
  const categoriesString = useMemo(
    () => params?.categories?.join(",") || "",
    [params?.categories]
  );
  const materialsString = useMemo(
    () => params?.materials?.join(",") || "",
    [params?.materials]
  );
  const occasionsString = useMemo(
    () => params?.occasions?.join(",") || "",
    [params?.occasions]
  );
  const discountsString = useMemo(
    () => params?.discounts?.join(",") || "",
    [params?.discounts]
  );
  const ratingsString = useMemo(
    () => params?.ratings?.join(",") || "",
    [params?.ratings]
  );
  const priceRangeString = useMemo(
    () => params?.priceRange?.join(",") || "",
    [params?.priceRange]
  );

  // Memoize the request body to prevent unnecessary re-renders
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
      inStock: params?.inStock !== undefined ? params.inStock : undefined,
      ...(params?.category && { category: params.category }),
      ...(params?.categories?.length && { categories: params.categories }),
      ...(params?.materials?.length && { materials: params.materials }),
      ...(params?.occasions?.length && { occasions: params.occasions }),
      ...(params?.discounts?.length && { discounts: params.discounts }),
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
    [
      params?.page,
      params?.limit,
      params?.sortBy,
      params?.sortOrder,
      params?.category,
      categoriesString,
      materialsString,
      occasionsString,
      discountsString,
      ratingsString,
      params?.search,
      params?.minPrice,
      params?.maxPrice,
      priceRangeString,
      params?.inStock,
    ]
  );

  // Add a simple reset function for the circuit breaker
  const resetCircuitBreaker = useCallback(() => {
    requestCountRef.current = 0;
    setError(null);
  }, []);

  const fetchProducts = useCallback(async () => {
    // Global circuit breaker to prevent infinite loops across all instances
    globalRequestCount += 1;
    requestCountRef.current += 1;

    if (globalRequestCount > 3) {
      console.error(
        `🌍 [ProductService] GLOBAL circuit breaker activated! Total requests: ${globalRequestCount}. Forcing 5 second cooldown.`
      );

      // Clear any existing reset timeout
      if (globalResetTimeout) {
        clearTimeout(globalResetTimeout);
      }

      // Force a longer cooldown period
      globalResetTimeout = setTimeout(resetGlobalCounter, 5000);

      setError(
        "System overload detected. Please wait 5 seconds before trying again."
      );
      setIsLoading(false);
      return;
    }

    if (requestCountRef.current > 2) {
      console.error(
        `🚫 [ProductService] Local circuit breaker activated! Request #${requestCountRef.current}. Resetting.`
      );
      requestCountRef.current = 0;
      setError("Multiple rapid requests detected. System reset automatically.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response: ProductResponse = await api.post("/product", requestBody);
      setData(response);

      // Reset counters on successful request
      requestCountRef.current = 0;

      // Reset global counter gradually
      if (globalResetTimeout) {
        clearTimeout(globalResetTimeout);
      }
      globalResetTimeout = setTimeout(resetGlobalCounter, 2000);
    } catch (err) {
      console.error("❌ [ProductService] Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, [requestBody]);

  // Add throttling to prevent rapid successive calls
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
    }

    // Throttle the API call to prevent rapid successive requests
    throttleTimeoutRef.current = setTimeout(() => {
      fetchProducts();
    }, 300); // 300ms throttle

    // Cleanup timeout on unmount
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [fetchProducts]);

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    data,
    products: data?.products || [],
    pagination: data?.pagination,
    categories: data?.categories || [],
    materials: data?.materials || [],
    occasions: data?.occasions || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
    resetCircuitBreaker, // Expose reset function
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

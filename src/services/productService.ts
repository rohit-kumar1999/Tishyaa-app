import { api } from "@/src/setup/api";
import { useCallback, useEffect, useState } from "react";

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
  inStock?: boolean;
}) => {
  const [data, setData] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const requestBody = {
        page: params?.page || 1,
        limit: params?.limit || 8,
        sortBy: params?.sortBy || "rating",
        sortOrder: params?.sortOrder || "desc",
        includeCategories: true,
        includeTotalCount: true,
        includeMaterials: true,
        includeOccasions: true,
        inStock: params?.inStock !== undefined ? params.inStock : true,
        ...(params?.category && { category: params.category }),
      };

      const response: ProductResponse = await api.post("/product", requestBody);
      setData(response);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
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
  };
};

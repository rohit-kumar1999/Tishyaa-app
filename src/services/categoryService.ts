import { useApiQuery } from "@/hooks/useApiQuery";
import { api } from "@/setup/api";
import { useCallback, useEffect, useState } from "react";

// Feature flag to control API vs mock data
const USE_MOCK_DATA = false; // Backend API is ready

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  count: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategory {
  id?: string;
  name: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  productCount?: number;
  count?: number;
  active?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Mock data for development
const mockCategories: ApiCategory[] = [
  {
    id: "rings",
    name: "rings",
    count: 7,
    isActive: true,
    order: 1,
  },
  {
    id: "necklaces",
    name: "necklaces",
    count: 14,
    isActive: true,
    order: 2,
  },
  {
    id: "earrings",
    name: "earrings",
    count: 8,
    isActive: true,
    order: 3,
  },
  {
    id: "bracelets",
    name: "bracelets",
    count: 13,
    isActive: true,
    order: 4,
  },
  {
    id: "bangles",
    name: "bangles",
    count: 18,
    isActive: true,
    order: 5,
  },
  {
    id: "chains",
    name: "chains",
    count: 13,
    isActive: true,
    order: 6,
  },
];

// Note: Category images are now handled locally in CategorySection.tsx
// The imageUrl field is kept for API compatibility

// Transform API response to our Category interface
const transformApiCategories = (
  apiCategories: ApiCategory[] | null
): Category[] => {
  if (!apiCategories || !Array.isArray(apiCategories)) return [];

  return apiCategories
    .filter((cat) => cat && cat.name) // Filter out invalid categories
    .map((cat, index) => ({
      id: cat.id || cat.name.toLowerCase().replace(/\s+/g, "-"),
      name: cat.name,
      description: cat.description || "",
      imageUrl: cat.image || cat.imageUrl || "", // Local images used in CategorySection.tsx
      count: cat.productCount || cat.count || 0,
      isActive: cat.active ?? cat.isActive ?? true,
      order: cat.sortOrder ?? cat.order ?? index,
      createdAt: cat.createdAt || new Date().toISOString(),
      updatedAt: cat.updatedAt || new Date().toISOString(),
    }))
    .sort((a, b) => a.order - b.order);
};

// Hook to fetch all categories
export const useCategories = () => {
  const { data, isLoading, error, refetch } =
    useApiQuery<ApiCategory[]>("/categories");

  return {
    data: transformApiCategories(data),
    isLoading,
    error,
    refetch,
  };
};

// Hook to fetch active categories only
export const useActiveCategories = () => {
  const { data, isLoading, error, refetch } = useApiQuery<ApiCategory[]>(
    "/categories?status=active"
  );

  return {
    data: transformApiCategories(data),
    isLoading,
    error,
    refetch,
  };
};

// Hook to fetch categories for homepage (featured/top categories)
export const useHomepageCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    if (USE_MOCK_DATA) {
      setCategories(transformApiCategories(mockCategories));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use the same API endpoint and payload as the web app
      const response = await api.post("/product", {
        page: 1,
        limit: 8,
        sortBy: "rating",
        sortOrder: "desc",
        includeCategories: true,
        includeTotalCount: true,
        includeMaterials: true,
        includeOccasions: true,
        inStock: true,
      });

      // Transform the categories from the API response
      const apiCategories: ApiCategory[] =
        response.categories?.map((cat: any) => ({
          id: cat.name,
          name: cat.name,
          count: cat.count,
          isActive: true,
          order: 0,
        })) || [];

      setCategories(transformApiCategories(apiCategories));
    } catch (err) {
      setError(err as Error);
      // Fallback to mock data on error
      setCategories(transformApiCategories(mockCategories));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    data: categories,
    isLoading,
    error,
    refetch: fetchCategories,
  };
};

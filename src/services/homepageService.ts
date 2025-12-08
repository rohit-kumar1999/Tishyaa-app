import { api } from "@/src/setup/api";
import { useCallback, useEffect, useState } from "react";
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
    imageUrl: getCategoryImageUrl(category.name),
    count: category.count,
    isActive: true,
    order: index + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

// Get category image URL based on category name
const getCategoryImageUrl = (categoryName: string): string => {
  const categoryImages: Record<string, string> = {
    rings:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop",
    necklaces:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop",
    earrings:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop",
    bracelets:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop",
    bangles:
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=300&fit=crop",
    chains:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop",
    pendants:
      "https://images.unsplash.com/photo-1588444731373-9b93f29657f8?w=300&h=300&fit=crop",
    anklets:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop",
    "nose-pins":
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=300&h=300&fit=crop",
    "toe-rings":
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=300&h=300&fit=crop",
  };

  return (
    categoryImages[categoryName] ||
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop"
  );
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

// Mock data for development
const mockHomepageData: HomepageData = {
  products: [],
  featuredProducts: [],
  categories: [
    {
      id: "rings",
      name: "Rings",
      description: "Beautiful rings collection",
      imageUrl: getCategoryImageUrl("rings"),
      count: 25,
      isActive: true,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "necklaces",
      name: "Necklaces",
      description: "Elegant necklaces collection",
      imageUrl: getCategoryImageUrl("necklaces"),
      count: 18,
      isActive: true,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
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

// Centralized homepage data hook
export const useHomepageData = () => {
  const [data, setData] = useState<HomepageData>(mockHomepageData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomepageData = useCallback(async () => {
    if (USE_MOCK_DATA) {
      setData(mockHomepageData);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Single API call to get all homepage data
      const response: ProductResponse = await api.post("/product", {
        page: 1,
        limit: 16, // Get more products for both featured and regular display
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

      const homepageData: HomepageData = {
        products: transformedProducts,
        featuredProducts,
        categories: transformedCategories,
        materials: response.materials,
        occasions: response.occasions,
        pagination: response.pagination,
        meta: response.meta,
      };

      setData(homepageData);
    } catch (err) {
      console.error("Error fetching homepage data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch homepage data"
      );
      // Fallback to mock data on error
      setData(mockHomepageData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomepageData();
  }, [fetchHomepageData]);

  const refetch = useCallback(() => {
    fetchHomepageData();
  }, [fetchHomepageData]);

  return {
    data,
    products: data.products,
    featuredProducts: data.featuredProducts,
    categories: data.categories,
    materials: data.materials,
    occasions: data.occasions,
    pagination: data.pagination,
    meta: data.meta,
    isLoading,
    error,
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

import React, { createContext, ReactNode, useContext } from "react";
import { HomepageData, useHomepageData } from "../services/homepageService";

interface HomepageDataContextType {
  data: HomepageData;
  products: HomepageData["products"];
  featuredProducts: HomepageData["featuredProducts"];
  categories: HomepageData["categories"];
  materials: HomepageData["materials"];
  occasions: HomepageData["occasions"];
  pagination: HomepageData["pagination"];
  meta: HomepageData["meta"];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const HomepageDataContext = createContext<HomepageDataContextType | undefined>(
  undefined
);

interface HomepageDataProviderProps {
  children: ReactNode;
}

export const HomepageDataProvider: React.FC<HomepageDataProviderProps> = ({
  children,
}) => {
  const homepageData = useHomepageData();

  return (
    <HomepageDataContext.Provider value={homepageData}>
      {children}
    </HomepageDataContext.Provider>
  );
};

// Hook to use homepage data context
export const useHomepageDataContext = (): HomepageDataContextType => {
  const context = useContext(HomepageDataContext);
  if (context === undefined) {
    throw new Error(
      "useHomepageDataContext must be used within a HomepageDataProvider"
    );
  }
  return context;
};

// Convenience hooks that use the context
export const useHomepageCategoriesContext = () => {
  const { categories, isLoading, error, refetch } = useHomepageDataContext();

  return {
    categories,
    isLoading,
    error,
    refetch,
  };
};

export const useFeaturedProductsContext = () => {
  const { featuredProducts, isLoading, error, refetch } =
    useHomepageDataContext();

  return {
    products: featuredProducts,
    isLoading,
    error,
    refetch,
  };
};

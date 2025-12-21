// Navigation Types
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  ProductDetail: { productId: string };
  Category: { categoryId: string; categoryName: string };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  Search: undefined;
  About: undefined;
  Contact: undefined;
  Help: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Profile: undefined;
  More: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type HelpStackParamList = {
  FAQ: undefined;
  Terms: undefined;
  Privacy: undefined;
  Support: undefined;
};

// Hook and API Types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Payment Types
export interface PaymentMethod {
  id: string;
  type: "card" | "upi" | "netbanking" | "wallet" | "cod";
  name: string;
  isDefault: boolean;
}

export interface PaymentRequest {
  userId: string;
  cartIds: string[];
  addressId: string;
  paymentMethodId: string;
  amount: number;
  currency?: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

// Search Types
export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  rating?: number;
  sortBy?: "price" | "rating" | "name" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
}

// Performance Types
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  items: any[];
  overscan?: number;
}

// Cache Types
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Data Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: "user" | "admin";
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  type: "home" | "work" | "other";
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  inStock: boolean;
  stockQuantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  materials: string[];
  care: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  parentId?: string;
  subcategories?: Category[];
  productCount: number;
  featured: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  tracking?: {
    number: string;
    url: string;
    carrier: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

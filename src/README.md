# React Native Hooks and Contexts Migration

This directory contains all the hooks and contexts migrated from the web React app to React Native, maintaining full functionality while adapting for mobile-specific APIs and patterns.

## 📁 Structure

```
src/
├── hooks/                 # Custom hooks
├── contexts/             # React contexts  
├── setup/               # API setup and configuration
└── types/               # TypeScript type definitions
```

## 🔗 Hooks

### Core Hooks

#### `useIsMobile`
- **Web**: Uses `window.matchMedia` for responsive breakpoints
- **Mobile**: Uses React Native `Dimensions` API
- **Usage**: Detect screen size changes and responsive behavior

```tsx
import { useIsMobile } from '../hooks/use-mobile'

const Component = () => {
  const isMobile = useIsMobile() // Always true on mobile, but useful for tablet detection
}
```

#### `useToast`
- **Web**: Custom toast system with DOM manipulation
- **Mobile**: Uses React Native `Alert` (can be upgraded to react-native-toast-message)
- **Usage**: Show notifications and alerts

```tsx
import { useToast } from '../hooks/use-toast'

const Component = () => {
  const { toast } = useToast()
  
  const showToast = () => {
    toast({
      title: "Success",
      description: "Operation completed successfully",
      variant: "default"
    })
  }
}
```

#### `useLocalStorage`
- **Web**: Uses `localStorage` API
- **Mobile**: Uses `AsyncStorage` from `@react-native-async-storage/async-storage`
- **Usage**: Persist data locally

```tsx
import { useLocalStorage } from '../hooks/useLocalStorage'

const Component = () => {
  const [value, setValue, isLoading] = useLocalStorage('key', 'defaultValue')
  
  // isLoading is true during initial load from AsyncStorage
}
```

### Navigation & UI Hooks

#### `useScrollToTop`
- **Web**: Uses `window.scrollTo()`
- **Mobile**: Uses React Navigation's focus events with ScrollView/FlatList refs
- **Usage**: Auto-scroll to top on navigation

```tsx
import { useScrollToTop } from '../hooks/useScrollToTop'

const ScreenComponent = () => {
  const { scrollRef } = useScrollToTop()
  
  return (
    <ScrollView ref={scrollRef}>
      {/* Content */}
    </ScrollView>
  )
}
```

#### `useProfileCache`
- **Web**: Same logic
- **Mobile**: Same logic (no web dependencies)
- **Usage**: Smart caching for profile tabs

```tsx
import { useProfileCache } from '../hooks/useProfileCache'

const ProfileScreen = () => {
  const { activeTab, setActiveTab, shouldShowLoader } = useProfileCache('orders')
}
```

### Performance Hooks

#### `usePerformanceOptimization`
- **Web**: Uses lodash throttle/debounce
- **Mobile**: Custom throttle/debounce implementations + RN-specific optimizations
- **Features**: Virtual scrolling, image optimization, memory management

```tsx
import { 
  useVirtualScroll, 
  useDebouncedInput, 
  useImageOptimization,
  useScreenDimensions 
} from '../hooks/usePerformanceOptimization'

const OptimizedList = () => {
  const { width, height } = useScreenDimensions()
  const [searchTerm, setSearchTerm] = useDebouncedInput('', 300)
  const { onImageLoad, isImageLoaded } = useImageOptimization()
}
```

### API & Data Hooks

#### `useApiQuery`
- **Web**: Uses React Query (@tanstack/react-query)
- **Mobile**: Custom implementation with native fetch API (can be upgraded to React Query)
- **Features**: Caching, error handling, loading states

```tsx
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery'

const Component = () => {
  const { data, isLoading, error, refetch } = useApiQuery<Product[]>('/products')
  const { mutate } = useApiMutation('/products', {
    successMessage: 'Product created',
    invalidateQueries: ['/products']
  })
}
```

#### `useUserData`
- **Web**: Uses Clerk authentication
- **Mobile**: Uses AsyncStorage with helper functions
- **Features**: User session management, sign in/out

```tsx
import { useUserData, signInUser, signOutUser } from '../hooks/useUserData'

const AuthComponent = () => {
  const { userId, isSignedIn, userFullName, isLoaded } = useUserData()
  
  const handleSignIn = async () => {
    await signInUser({ id: '123', fullName: 'John Doe', email: 'john@example.com' })
  }
}
```

#### `useCart`
- **Web**: Integrates with backend APIs
- **Mobile**: Adapted for mobile with Alert confirmations and AsyncStorage persistence
- **Features**: Add/remove items, quantity updates, processing states

```tsx
import { useCart } from '../hooks/useCart'

const CartComponent = () => {
  const { 
    cartItems, 
    isLoading, 
    addItemToCart, 
    updateItemQuantity, 
    removeItem 
  } = useCart()
}
```

#### `usePayment`
- **Web**: Full Razorpay integration
- **Mobile**: Simplified payment flow with Alert-based confirmations (ready for Razorpay Native SDK)
- **Features**: Multiple payment methods, order creation, payment verification

```tsx
import { usePayment } from '../hooks/usePayment'

const PaymentComponent = () => {
  const { processPayment, isProcessing, paymentStep } = usePayment()
  
  const handlePayment = async () => {
    const success = await processPayment({
      userId: 'user123',
      cartIds: ['cart1'],
      addressId: 'addr1',
      paymentMethod: 'razorpay',
      amount: 1000
    })
  }
}
```

#### `useProductManager`
- **Web**: Wishlist and cart management
- **Mobile**: Adapted with native Alert dialogs and AsyncStorage
- **Features**: Wishlist toggle, bulk operations, cart integration

```tsx
import { useProductManager } from '../hooks/useProductManager'

const ProductComponent = () => {
  const { 
    toggleWishlist, 
    isInWishlist, 
    handleAddToCart, 
    handleQuickActions 
  } = useProductManager()
}
```

## 🏗️ Contexts

### `CartContext`
Enhanced version of the web cart with:
- **AsyncStorage persistence**
- **Tax, shipping, and discount calculations**
- **Alert confirmations for destructive actions**
- **Optimistic updates**
- **Metadata tracking (last updated, etc.)**

```tsx
import { CartProvider, useCart } from '../contexts/CartContext'

// Wrap your app
<CartProvider>
  <App />
</CartProvider>

// Use in components
const CartScreen = () => {
  const { 
    items, 
    total, 
    subtotal, 
    tax, 
    shipping, 
    discount,
    addItem, 
    removeItem, 
    updateQuantity,
    clearCart,
    applyDiscount,
    setTax,
    setShipping
  } = useCart()
}
```

### `HomepageDataContext`
Provides homepage data with caching:
- **Categories with image mapping**
- **Featured products**
- **Loading and error states**
- **Refresh functionality**

```tsx
import { 
  HomepageDataProvider, 
  useHomepageData, 
  useCategories, 
  useFeaturedProducts 
} from '../contexts/HomepageDataContext'

// Wrap your app
<HomepageDataProvider>
  <App />
</HomepageDataProvider>

// Use in components
const HomeScreen = () => {
  const { categories, featuredProducts, isLoading, refresh } = useHomepageData()
  // Or use specific hooks
  const { categories } = useCategories()
  const { featuredProducts } = useFeaturedProducts()
}
```

## ⚙️ Setup & Configuration

### API Configuration
The `setup/api.ts` file provides a simple fetch-based API client:

```tsx
import { api } from '../setup/api'

// GET request
const products = await api.get('/products')

// POST request
const newProduct = await api.post('/products', productData)

// PUT request
const updatedProduct = await api.put('/products/123', updateData)

// DELETE request
await api.delete('/products/123')
```

### Configuration Constants
```tsx
import { CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../setup'

// Use throughout the app
const apiTimeout = CONFIG.API_TIMEOUT
const cartKey = STORAGE_KEYS.CART
const errorMsg = ERROR_MESSAGES.NETWORK_ERROR
```

## 🔄 Migration Notes

### Key Differences from Web Version

1. **Storage**: `localStorage` → `AsyncStorage`
2. **Navigation**: `react-router-dom` → `@react-navigation/native`
3. **Notifications**: Custom toast → `Alert` (upgradeable to react-native-toast-message)
4. **Responsive**: `matchMedia` → `Dimensions`
5. **Scrolling**: `window.scrollTo` → ScrollView/FlatList refs
6. **API**: React Query → Custom fetch (upgradeable to React Query)

### Performance Optimizations

1. **AsyncStorage**: All cart and user data persisted locally
2. **Image Caching**: Built-in image loading optimization
3. **Memory Management**: Hooks for memory monitoring
4. **Virtual Scrolling**: Efficient list rendering
5. **Debounced Inputs**: Reduced API calls

### Future Enhancements

1. **React Query**: Replace custom API implementation
2. **React Native Toast Message**: Better toast notifications
3. **Razorpay SDK**: Native payment integration
4. **Image Caching Library**: Advanced image optimization
5. **Redux Toolkit**: State management for complex scenarios

## 📝 Usage Examples

### Complete App Setup

```tsx
import React from 'react'
import { CartProvider } from './src/contexts/CartContext'
import { HomepageDataProvider } from './src/contexts/HomepageDataContext'

export default function App() {
  return (
    <CartProvider>
      <HomepageDataProvider>
        {/* Your navigation and screens */}
      </HomepageDataProvider>
    </CartProvider>
  )
}
```

### Product Screen with All Features

```tsx
import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { 
  useProductManager, 
  useCart, 
  useToast,
  useScrollToTop 
} from '../hooks'

const ProductDetailScreen = ({ route }) => {
  const { productId } = route.params
  const { scrollRef } = useScrollToTop()
  const { toast } = useToast()
  const { addItemToCart } = useCart()
  const { 
    toggleWishlist, 
    isInWishlist, 
    isWishlistProcessing 
  } = useProductManager()
  
  // ... product loading logic
  
  return (
    <ScrollView ref={scrollRef}>
      <Text>{product.name}</Text>
      
      <TouchableOpacity 
        onPress={() => toggleWishlist(product)}
        disabled={isWishlistProcessing[product.id]}
      >
        <Text>{isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => addItemToCart(product.id, 1)}
      >
        <Text>Add to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
```

This migration provides a complete, production-ready hooks and contexts system for React Native that maintains all the functionality of the web app while being optimized for mobile development.
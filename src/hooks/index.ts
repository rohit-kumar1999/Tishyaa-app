// Export all hooks for easy importing
export { useIsMobile } from './use-mobile'
export { useToast, toast } from './use-toast'
export { useLocalStorage } from './useLocalStorage'
export { useScrollToTop, useAutoScrollToTop } from './useScrollToTop'
export { useProfileCache } from './useProfileCache'
export {
  useVirtualScroll,
  useImageOptimization,
  useDebouncedInput,
  useMemoryOptimization,
  useScreenDimensions,
  throttle,
  debounce,
} from './usePerformanceOptimization'
export {
  useApiQuery,
  useApiMutation,
  useApiPutMutation,
  useApiDeleteMutation,
} from './useApiQuery'
export { useUserData, signInUser, signOutUser } from './useUserData'
export { usePayment } from './usePayment'
export { useCart as useCartHook } from './useCart'
export { useProductManager } from './useProductManager'

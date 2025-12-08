import React from "react"
import { Dimensions } from "react-native"

// Simple throttle function for React Native
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0
  return ((...args: any[]) => {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }) as T
}

// Simple debounce function for React Native
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout | null = null
  return ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

// Virtual Scrolling Hook adapted for React Native FlatList
interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  items: any[]
  overscan?: number
}

export const useVirtualScroll = ({
  itemHeight,
  containerHeight,
  items,
  overscan = 5,
}: VirtualScrollOptions) => {
  const [scrollOffset, setScrollOffset] = React.useState(0)

  const visibleItemsCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.floor(scrollOffset / itemHeight)
  const endIndex = Math.min(
    startIndex + visibleItemsCount + overscan,
    items.length - 1
  )

  const visibleItems = items.slice(
    Math.max(0, startIndex - overscan),
    endIndex + 1
  )

  const totalHeight = items.length * itemHeight
  const offsetY = Math.max(0, startIndex - overscan) * itemHeight

  const handleScroll = React.useCallback(
    throttle((event: any) => {
      const offset = event.nativeEvent.contentOffset.y
      setScrollOffset(offset)
    }, 16), // ~60fps
    []
  )

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex: Math.max(0, startIndex - overscan),
  }
}

// Image Loading Optimization Hook
export const useImageOptimization = () => {
  const [loadedImages, setLoadedImages] = React.useState<Set<string>>(new Set())
  
  const onImageLoad = React.useCallback((uri: string) => {
    setLoadedImages(prev => new Set(prev).add(uri))
  }, [])
  
  const isImageLoaded = React.useCallback((uri: string) => {
    return loadedImages.has(uri)
  }, [loadedImages])
  
  return { onImageLoad, isImageLoaded }
}

// Debounced Input Hook
export const useDebouncedInput = (initialValue: string, delay: number = 300) => {
  const [value, setValue] = React.useState(initialValue)
  const [debouncedValue, setDebouncedValue] = React.useState(initialValue)
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return [debouncedValue, setValue] as const
}

// Memory Management Hook
export const useMemoryOptimization = () => {
  const [memoryWarning, setMemoryWarning] = React.useState(false)
  
  React.useEffect(() => {
    // In a real app, you might use a memory monitoring library
    // For now, this is a placeholder
    const checkMemory = () => {
      // Placeholder memory check logic
      setMemoryWarning(false)
    }
    
    const interval = setInterval(checkMemory, 10000) // Check every 10 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  const clearCache = React.useCallback(() => {
    // Clear any cached data
    setMemoryWarning(false)
  }, [])
  
  return { memoryWarning, clearCache }
}

// Screen Dimensions Hook
export const useScreenDimensions = () => {
  const [dimensions, setDimensions] = React.useState(() => {
    const { width, height } = Dimensions.get('window')
    return { width, height }
  })
  
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height })
    })
    
    return () => subscription?.remove()
  }, [])
  
  return dimensions
}

export { throttle, debounce }

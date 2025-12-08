import { useEffect, useRef } from "react"
import { ScrollView, FlatList } from "react-native"
import { useFocusEffect } from "@react-navigation/native"

export const useScrollToTop = () => {
  const scrollRef = useRef<ScrollView | FlatList | null>(null)

  useFocusEffect(() => {
    // Scroll to top when screen comes into focus
    if (scrollRef.current) {
      if ('scrollToOffset' in scrollRef.current) {
        // FlatList
        scrollRef.current.scrollToOffset({ offset: 0, animated: true })
      } else {
        // ScrollView
        scrollRef.current.scrollTo({ y: 0, animated: true })
      }
    }
  })

  return { scrollRef }
}

// Hook for automatic scroll to top on navigation
export const useAutoScrollToTop = () => {
  useFocusEffect(() => {
    // This will automatically scroll to top when the screen comes into focus
    // Can be used with screens that don't need a ref
  })
}

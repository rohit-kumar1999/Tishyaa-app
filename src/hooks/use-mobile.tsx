import * as React from "react"
import { Dimensions } from "react-native"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const updateDimensions = () => {
      const { width } = Dimensions.get('window')
      setIsMobile(width < MOBILE_BREAKPOINT)
    }

    // Initial check
    updateDimensions()

    // Subscribe to dimension changes
    const subscription = Dimensions.addEventListener('change', updateDimensions)

    return () => {
      subscription?.remove()
    }
  }, [])

  return !!isMobile
}

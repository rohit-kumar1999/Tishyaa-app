import { useState, useCallback, useRef } from "react"

type ProfileTab = "orders" | "addresses" | "wishlist" | "account"

interface ProfileCacheHook {
  activeTab: ProfileTab
  setActiveTab: (tab: ProfileTab) => void
  isTabActive: (tab: ProfileTab) => boolean
  shouldShowLoader: (
    tab: ProfileTab,
    isLoading: boolean,
    hasData: boolean
  ) => boolean
}

/**
 * Smart profile cache hook that manages tab switching and loading states
 * - Shows loaders only on first visit to a tab
 * - Shows cached data immediately on subsequent visits
 * - Allows background refresh without showing loaders
 */
export const useProfileCache = (
  initialTab: ProfileTab = "orders"
): ProfileCacheHook => {
  const [activeTab, setActiveTabState] = useState<ProfileTab>(initialTab)
  const visitedTabs = useRef<Set<ProfileTab>>(new Set())

  const setActiveTab = useCallback((tab: ProfileTab) => {
    setActiveTabState(tab)
    visitedTabs.current.add(tab)
  }, [])

  const isTabActive = useCallback(
    (tab: ProfileTab) => {
      return activeTab === tab
    },
    [activeTab]
  )

  const shouldShowLoader = useCallback(
    (tab: ProfileTab, isLoading: boolean, hasData: boolean) => {
      // Only show loader if:
      // 1. Tab is currently active AND
      // 2. We're loading AND
      // 3. Either we've never visited this tab OR we have no cached data
      if (!isTabActive(tab) || !isLoading) return false

      const hasVisitedBefore = visitedTabs.current.has(tab)
      return !hasVisitedBefore || !hasData
    },
    [isTabActive]
  )

  return {
    activeTab,
    setActiveTab,
    isTabActive,
    shouldShowLoader,
  }
}

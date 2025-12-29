import { useEffect, useState } from "react";
import { Dimensions, ScaledSize } from "react-native";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

interface ResponsiveInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

// Breakpoint values (similar to Tailwind CSS)
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

const getBreakpoint = (width: number): Breakpoint => {
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
};

const getResponsiveInfo = (dimensions: ScaledSize): ResponsiveInfo => {
  const { width, height } = dimensions;
  const breakpoint = getBreakpoint(width);

  return {
    width,
    height,
    breakpoint,
    isXs: breakpoint === "xs",
    isSm: breakpoint === "sm",
    isMd: breakpoint === "md",
    isLg: breakpoint === "lg",
    isXl: breakpoint === "xl",
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    isPortrait: height > width,
    isLandscape: width > height,
  };
};

/**
 * Hook for responsive design utilities
 * Provides breakpoint detection and screen size information
 */
export const useResponsive = (): ResponsiveInfo => {
  const [dimensions, setDimensions] = useState(() =>
    getResponsiveInfo(Dimensions.get("window"))
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(getResponsiveInfo(window));
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

/**
 * Get responsive value based on breakpoint
 * Similar to Tailwind's responsive prefixes
 */
export const useResponsiveValue = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}): T => {
  const { breakpoint } = useResponsive();

  // Check from largest to smallest, fallback to default
  switch (breakpoint) {
    case "xl":
      return (
        values.xl ??
        values.lg ??
        values.md ??
        values.sm ??
        values.xs ??
        values.default
      );
    case "lg":
      return values.lg ?? values.md ?? values.sm ?? values.xs ?? values.default;
    case "md":
      return values.md ?? values.sm ?? values.xs ?? values.default;
    case "sm":
      return values.sm ?? values.xs ?? values.default;
    case "xs":
    default:
      return values.xs ?? values.default;
  }
};

/**
 * Responsive spacing multiplier based on screen width
 */
export const useResponsiveSpacing = (baseSpacing: number): number => {
  const { width } = useResponsive();

  if (width >= BREAKPOINTS.xl) return baseSpacing * 1.5;
  if (width >= BREAKPOINTS.lg) return baseSpacing * 1.25;
  if (width >= BREAKPOINTS.md) return baseSpacing * 1.1;
  return baseSpacing;
};

/**
 * Responsive font scaling based on screen width
 */
export const useResponsiveFontSize = (baseFontSize: number): number => {
  const { width } = useResponsive();

  // Scale font slightly larger on bigger screens
  if (width >= BREAKPOINTS.xl) return baseFontSize * 1.2;
  if (width >= BREAKPOINTS.lg) return baseFontSize * 1.1;
  if (width >= BREAKPOINTS.md) return baseFontSize * 1.05;
  return baseFontSize;
};

/**
 * Get number of columns for grid layouts based on screen width
 */
export const useGridColumns = (options?: {
  min?: number;
  max?: number;
}): number => {
  const { width } = useResponsive();
  const min = options?.min ?? 1;
  const max = options?.max ?? 6;

  let columns = 2; // default for mobile

  if (width >= BREAKPOINTS.xl) columns = 5;
  else if (width >= BREAKPOINTS.lg) columns = 4;
  else if (width >= BREAKPOINTS.md) columns = 3;
  else if (width >= BREAKPOINTS.sm) columns = 2;
  else columns = 2;

  return Math.max(min, Math.min(max, columns));
};

/**
 * Calculate item width for grid layouts
 */
export const useGridItemWidth = (options?: {
  columns?: number;
  gap?: number;
  padding?: number;
}): number => {
  const { width } = useResponsive();
  const columns = options?.columns ?? useGridColumns();
  const gap = options?.gap ?? 12;
  const padding = options?.padding ?? 16;

  const totalGaps = (columns - 1) * gap;
  const totalPadding = padding * 2;
  const availableWidth = width - totalGaps - totalPadding;

  return Math.floor(availableWidth / columns);
};

export default useResponsive;

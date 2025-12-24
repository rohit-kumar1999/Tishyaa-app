import { useCallback, useRef } from "react";

/**
 * Hook to prevent double/multiple clicks on buttons
 *
 * @param callback - The function to call when the button is pressed
 * @param delay - The minimum time (in ms) between clicks (default: 500ms)
 * @returns A wrapped callback that prevents rapid successive calls
 *
 * @example
 * ```tsx
 * const handlePress = usePreventDoubleClick(() => {
 *   // Your action here
 * }, 500);
 *
 * <TouchableOpacity onPress={handlePress}>
 *   <Text>Press Me</Text>
 * </TouchableOpacity>
 * ```
 */
export const usePreventDoubleClick = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): ((...args: Parameters<T>) => void) => {
  const lastClickTime = useRef<number>(0);
  const isProcessing = useRef<boolean>(false);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      // Check if enough time has passed since last click
      if (now - lastClickTime.current < delay) {
        return;
      }

      // Check if a previous async operation is still processing
      if (isProcessing.current) {
        return;
      }

      lastClickTime.current = now;

      // Execute the callback
      const result = callback(...args);

      // If the callback returns a promise, track its completion
      if (result instanceof Promise) {
        isProcessing.current = true;
        result.finally(() => {
          isProcessing.current = false;
        });
      }
    },
    [callback, delay]
  );
};

/**
 * Hook to create a button handler with loading state management
 * Useful for async operations where you want to show a loading indicator
 *
 * @param callback - The async function to call when the button is pressed
 * @param delay - The minimum time (in ms) between clicks (default: 500ms)
 * @returns An object with the wrapped handler and loading state
 *
 * @example
 * ```tsx
 * const { handlePress, isLoading } = useAsyncButtonHandler(async () => {
 *   await submitForm();
 * });
 *
 * <TouchableOpacity onPress={handlePress} disabled={isLoading}>
 *   {isLoading ? <ActivityIndicator /> : <Text>Submit</Text>}
 * </TouchableOpacity>
 * ```
 */
export const useAsyncButtonHandler = <
  T extends (...args: any[]) => Promise<any>
>(
  callback: T,
  delay: number = 500
): {
  handlePress: (...args: Parameters<T>) => void;
  isLoading: boolean;
  reset: () => void;
} => {
  const lastClickTime = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);
  const loadingState = useRef<boolean>(false);

  const handlePress = useCallback(
    async (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastClickTime.current < delay || isProcessingRef.current) {
        return;
      }

      lastClickTime.current = now;
      isProcessingRef.current = true;
      loadingState.current = true;

      try {
        await callback(...args);
      } finally {
        isProcessingRef.current = false;
        loadingState.current = false;
      }
    },
    [callback, delay]
  );

  const reset = useCallback(() => {
    isProcessingRef.current = false;
    loadingState.current = false;
    lastClickTime.current = 0;
  }, []);

  return {
    handlePress,
    isLoading: loadingState.current,
    reset,
  };
};

export default usePreventDoubleClick;

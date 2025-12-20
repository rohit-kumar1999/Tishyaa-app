import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const valueRef = useRef(storedValue);

  // Update ref when value changes
  useEffect(() => {
    valueRef.current = storedValue;
  }, [storedValue]);

  // Load initial value from AsyncStorage
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading AsyncStorage key "${key}":`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  // Return a wrapped version of useState's setter function that persists to AsyncStorage
  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(valueRef.current) : value;
        setStoredValue(valueToStore);
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting AsyncStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue, isLoading] as const;
}

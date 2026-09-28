import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota errors
    }
  }, [key, value]);

  const set = useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof v === 'function' ? (v as (prev: T) => T)(prev) : v));
  }, []);

  return [value, set];
}

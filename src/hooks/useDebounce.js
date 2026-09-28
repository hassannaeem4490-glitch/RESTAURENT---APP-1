// src/hooks/useDebounce.js
import { useEffect, useState } from 'react';

// Returns a debounced copy of `value` that only updates after `delay` ms of inactivity.
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

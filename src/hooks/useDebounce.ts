/**
 * useDebounce – delays updating a value until the caller stops changing it.
 *
 * Used by the search bar to avoid filtering on every keystroke.
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

import { useEffect, useState } from 'react';

/**
 * Hook to handle client-side hydration
 * Prevents hydration mismatches by ensuring components only render after client-side hydration
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

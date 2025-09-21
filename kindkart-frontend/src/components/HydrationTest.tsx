'use client';

import { useHydration } from '@/hooks/useHydration';
import { useAuthStore } from '@/store/authStore';

/**
 * Test component to verify hydration is working correctly
 * This component should not cause hydration mismatches
 */
export function HydrationTest() {
  const isClientHydrated = useHydration();
  const { isHydrated, isAuthenticated, user } = useAuthStore();
  
  const isFullyHydrated = isHydrated && isClientHydrated;

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-2">Hydration Status</h3>
      <div className="space-y-1 text-sm">
        <p>Client Hydrated: {isClientHydrated ? '✅' : '❌'}</p>
        <p>Store Hydrated: {isHydrated ? '✅' : '❌'}</p>
        <p>Fully Hydrated: {isFullyHydrated ? '✅' : '❌'}</p>
        <p>Authenticated: {isAuthenticated ? '✅' : '❌'}</p>
        <p>User: {user ? user.name : 'None'}</p>
      </div>
    </div>
  );
}

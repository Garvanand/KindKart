'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useHydration } from '@/hooks/useHydration';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const isClientHydrated = useHydration();

  // Wait for both Zustand hydration and client-side hydration
  const isFullyHydrated = isHydrated && isClientHydrated;

  useEffect(() => {
    if (!isFullyHydrated) return;

    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  }, [isAuthenticated, isFullyHydrated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">KindKart</h1>
        <p className="text-gray-600">
          {isFullyHydrated ? 'Redirecting...' : 'Loading...'}
        </p>
      </div>
    </div>
  );
}

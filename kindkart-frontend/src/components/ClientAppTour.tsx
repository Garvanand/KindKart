'use client';

import dynamic from 'next/dynamic';

// Client component wrapper for AppTour with dynamic import
const AppTour = dynamic(() => import('@/components/AppTour').then(mod => ({ default: mod.AppTour })), {
  ssr: false,
  loading: () => null,
});

export function ClientAppTour() {
  return <AppTour />;
}


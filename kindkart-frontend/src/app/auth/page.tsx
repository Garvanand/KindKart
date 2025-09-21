'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { ProfileSetupForm } from '@/components/auth/ProfileSetupForm';
import { useAuthStore } from '@/store/authStore';
import { useHydration } from '@/hooks/useHydration';
import { api } from '@/lib/api';

export default function AuthPage() {
  const [authStep, setAuthStep] = useState<'login' | 'profile' | 'complete'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, setUser } = useAuthStore();
  const isClientHydrated = useHydration();

  // Wait for both Zustand hydration and client-side hydration
  const isFullyHydrated = isHydrated && isClientHydrated;

  useEffect(() => {
    if (!isFullyHydrated) return;

    if (isAuthenticated && user) {
      // If user is already authenticated, redirect to dashboard
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, isFullyHydrated, router]);

  const handleLoginSuccess = () => {
    setAuthStep('profile');
  };

  const handleProfileComplete = async (profileData: any) => {
    setIsLoading(true);
    
    try {
      // Update user profile
      const updatedUser = await api.users.updateProfile(profileData);
      setUser(updatedUser.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Profile update failed:', error);
      // Even if profile update fails, user is authenticated, so redirect
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state until fully hydrated
  if (!isFullyHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">KindKart</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {authStep === 'login' && (
          <LoginForm onSuccess={handleLoginSuccess} />
        )}
        
        {authStep === 'profile' && (
          <ProfileSetupForm 
            onComplete={handleProfileComplete}
            isLoading={isLoading}
          />
        )}
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

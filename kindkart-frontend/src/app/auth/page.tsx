'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { ProfileSetupForm } from '@/components/auth/ProfileSetupForm';
import { useAuthStore } from '@/store/authStore';
import { useHydration } from '@/hooks/useHydration';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Users, Zap, ArrowLeft } from 'lucide-react';

const features = [
  { icon: Shield, label: 'Trust-based reputation system' },
  { icon: Users, label: 'Verified community members' },
  { icon: Zap, label: 'Instant help matching' },
];

export default function AuthPage() {
  const [authStep, setAuthStep] = useState<'login' | 'profile' | 'complete'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, setUser } = useAuthStore();
  const isClientHydrated = useHydration();
  const isFullyHydrated = isHydrated && isClientHydrated;

  useEffect(() => {
    if (!isFullyHydrated) return;
    if (isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, isFullyHydrated, router]);

  const handleLoginSuccess = () => setAuthStep('profile');

  const handleProfileComplete = async (profileData: any) => {
    setIsLoading(true);
    try {
      const updatedUser = await api.users.updateProfile(profileData);
      setUser(updatedUser.user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Profile update failed:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => router.push('/dashboard');

  if (!isFullyHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <p className="text-muted-foreground text-sm">Loading KindKart...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-mesh-1 opacity-40" />
      <motion.div
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative min-h-screen flex">
        {/* Left Panel - Branding (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-16"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">KindKart</span>
                <span className="text-xs text-muted-foreground ml-2">Neighborhood OS</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold leading-tight mb-4">
                Welcome to your
                <br />
                <span className="text-gradient-neon">Neighborhood OS</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                Connect with trusted neighbors, get help when you need it, and build a stronger community.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 space-y-4"
            >
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{f.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-xs text-muted-foreground/50">
            Trusted by 50,000+ neighbors in 1,200+ communities
          </motion.div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md"
          >
            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold">KindKart</span>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${authStep === 'login' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>1</div>
                <span className={`text-sm font-medium ${authStep === 'login' ? 'text-foreground' : 'text-muted-foreground'}`}>Sign In</span>
              </div>
              <div className="h-px flex-1 bg-border/50" />
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${authStep === 'profile' ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground'}`}>2</div>
                <span className={`text-sm font-medium ${authStep === 'profile' ? 'text-foreground' : 'text-muted-foreground'}`}>Profile</span>
              </div>
            </div>

            {/* Form card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {authStep === 'login' && (
                  <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <LoginForm onSuccess={handleLoginSuccess} onGuestLogin={handleGuestLogin} />
                  </motion.div>
                )}
                {authStep === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <button onClick={() => setAuthStep('login')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                    <ProfileSetupForm onComplete={handleProfileComplete} isLoading={isLoading} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground/60">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

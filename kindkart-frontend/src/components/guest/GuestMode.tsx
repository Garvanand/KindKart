'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, X, Eye, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function GuestModeBanner() {
  const { isGuest, demoMode } = useAuthStore();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (!isGuest || dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-amber-500/10 via-primary/10 to-violet-500/10 border-b border-amber-500/20"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <Eye className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="text-sm font-medium text-foreground truncate">
            <span className="text-amber-400 font-semibold">Guest Mode</span>
            <span className="hidden sm:inline text-muted-foreground ml-2">— Verify your account to unlock all features</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => router.push('/auth')}>
            <Shield className="h-3 w-3" /> Verify Now
          </Button>
          <button onClick={() => setDismissed(true)} className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function GuestBadge({ className }: { className?: string }) {
  const { isGuest } = useAuthStore();
  if (!isGuest) return null;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase tracking-wider ${className}`}>
      <Eye className="h-2.5 w-2.5" />
      Guest
    </span>
  );
}

export function FloatingUpgradeCTA() {
  const { isGuest } = useAuthStore();
  const router = useRouter();
  const [show, setShow] = useState(true);

  if (!isGuest || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50"
      >
        <div className="relative p-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-primary/20 shadow-2xl max-w-[280px]">
          <button onClick={() => setShow(false)} className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
            <X className="h-3 w-3" />
          </button>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-0.5">Unlock Full KindKart</p>
              <p className="text-[11px] text-muted-foreground leading-snug mb-3">Verify to publish requests, chat, make payments & more.</p>
              <Button size="sm" className="h-7 text-xs w-full gap-1.5" onClick={() => router.push('/auth')}>
                Verify Account <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function GuestRestrictionOverlay({ feature, children }: { feature: string; children: React.ReactNode }) {
  const { isGuest } = useAuthStore();
  const router = useRouter();

  if (!isGuest) return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl">
        <div className="text-center p-6">
          <div className="h-12 w-12 rounded-xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold mb-1">Feature Locked</p>
          <p className="text-xs text-muted-foreground mb-4">{feature} requires a verified account.</p>
          <Button size="sm" className="gap-1.5" onClick={() => router.push('/auth')}>
            <Shield className="h-3.5 w-3.5" /> Verify to Unlock
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DemoModeBanner() {
  const { demoMode } = useAuthStore();
  if (!demoMode) return null;

  return (
    <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Eye className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">Demo Mode Active</p>
        <p className="text-[10px] text-muted-foreground">Showing sample data. Connect to a community for real content.</p>
      </div>
    </div>
  );
}

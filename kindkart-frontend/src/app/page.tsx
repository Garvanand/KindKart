'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PageHeader, HeroSection, PageSection, PremiumCard, StatCard } from '@/components/ui-kit';
import { ArrowRight, MapPin, Users, Heart, Shield, MessageCircle } from 'lucide-react';

function AnimatedCounter({ value, suffix = '+', duration = 1200 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.floor(value / (duration / 16)));
    const t = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(t);
      } else setCount(start);
    }, 16);
    return () => clearInterval(t);
  }, [value, duration]);
  return <span className="text-4xl font-bold">{count}{suffix}</span>;
}

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-society-light-50 via-indigo-50 to-purple-50">
      <PageHeader title="KindKart" description="Neighbors helping neighbors — at scale." />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <HeroSection
          title={<span>Build a safer, stronger <span className="text-primary">community</span></span>}
          subtitle="Connect. Help. Earn reputation. Make your neighborhood resilient and caring."
          primaryAction={{ label: 'Get Started', onClick: () => router.push('/dashboard') }}
          secondaryAction={{ label: 'Join a Community', onClick: () => router.push('/communities/join') }}
        >
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <PremiumCard elevated>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Communities</p>
                    <AnimatedCounter value={1200} />
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <PremiumCard elevated>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Neighbors Connected</p>
                    <AnimatedCounter value={50000} />
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <PremiumCard elevated>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Helps Completed</p>
                    <AnimatedCounter value={100000} />
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          </div>
        </HeroSection>

        <PageSection title="How it works" subtitle="Simple steps to get started">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="rounded-lg p-4 bg-gradient-to-br from-white/60 to-muted/10 border">
                <h4 className="font-semibold">1. Join or create a community</h4>
                <p className="text-sm text-muted-foreground">Create secure communities for neighbors and manage membership.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg p-4 bg-gradient-to-br from-white/60 to-muted/10 border">
                <h4 className="font-semibold">2. Post & discover requests</h4>
                <p className="text-sm text-muted-foreground">Quickly request help or browse nearby requests.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg p-4 bg-gradient-to-br from-white/60 to-muted/10 border">
                <h4 className="font-semibold">3. Secure payments & trust</h4>
                <p className="text-sm text-muted-foreground">Escrow-powered payments and reputation keep everyone safe.</p>
              </div>
            </div>
          </div>
        </PageSection>

        <PageSection title="Featured capabilities">
          <div className="grid gap-6 md:grid-cols-3">
            <PremiumCard>
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2"><MessageCircle className="h-5 w-5 text-primary"/></div>
                <div>
                  <h5 className="font-semibold">Real-time chat</h5>
                  <p className="text-sm text-muted-foreground">Coordinate instantly with neighbors and volunteers.</p>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard>
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2"><Shield className="h-5 w-5 text-primary"/></div>
                <div>
                  <h5 className="font-semibold">Escrow payments</h5>
                  <p className="text-sm text-muted-foreground">Safety-first payments with dispute resolution.</p>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard>
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2"><Users className="h-5 w-5 text-primary"/></div>
                <div>
                  <h5 className="font-semibold">Reputation & badges</h5>
                  <p className="text-sm text-muted-foreground">Recognize neighbors for reliable help and kindness.</p>
                </div>
              </div>
            </PremiumCard>
          </div>
        </PageSection>

        {/* Call to action */}
        <div className="mt-10 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold">Ready to help your neighborhood?</h3>
              <p className="text-sm text-muted-foreground">Join or create a community and start making an impact today.</p>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={() => router.push('/dashboard')}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/communities/join')}>Join community</Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-background border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground">
          © {new Date().getFullYear()} KindKart — Building resilient communities together.
        </div>
      </footer>
    </div>
  );
}

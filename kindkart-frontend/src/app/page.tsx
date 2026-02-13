'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, MapPin, Users, Heart, Shield, MessageCircle,
  ChevronLeft, ChevronRight, Star, Zap, Lock, Trophy,
  Sparkles, Globe, BarChart3, Eye, CheckCircle2, ArrowUpRight,
  Cpu, Fingerprint, Radio, Target
} from 'lucide-react';
import Link from 'next/link';

/* ─── Animated Counter ─── */
function AnimatedCounter({ value, suffix = '+', duration = 1500 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.floor(value / (duration / 16)));
    const t = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(t); }
      else setCount(start);
    }, 16);
    return () => clearInterval(t);
  }, [value, duration, inView]);

  return <span ref={ref} className="tabular-nums">{count.toLocaleString()}{suffix}</span>;
}

/* ─── Floating Particles Background ─── */
function ParticlesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 50, 0],
            x: [0, (Math.random() - 0.5) * 40, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Announcement Ticker ─── */
function AnnouncementTicker() {
  const items = [
    'Trusted by 50,000+ neighbors',
    'Escrow-secured payments',
    '24/7 emergency response',
    'AI-powered help matching',
    'Karma rewards system',
    'Community safety alerts',
  ];
  return (
    <div className="relative overflow-hidden border-y border-border/30 bg-card/30 backdrop-blur-sm py-3">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Main Homepage ─── */
export default function Home() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight">KindKart</span>
              <span className="hidden sm:inline text-[10px] text-muted-foreground ml-2 font-medium">Neighborhood OS</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Community</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/auth')} className="text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
            <Button size="sm" onClick={() => router.push('/auth')} className="bg-primary hover:bg-primary/90 shadow-glow-sm">
              Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden"
      >
        {/* Mesh gradient background */}
        <div className="absolute inset-0 bg-mesh-1" />
        <ParticlesBackground />

        {/* Decorative gradient orbs */}
        <motion.div
          className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]"
          animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px]"
          animate={{ y: [0, -30, 0], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm font-medium text-primary">Now in 1,200+ communities worldwide</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            Your Neighborhood.
            <br />
            <span className="text-gradient-neon">Organized. Trusted.</span>
            <br />
            Powered by Community.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The neighborhood operating system that connects, protects, and empowers your community
            with trust-based reputation, escrow payments, and real-time coordination.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              onClick={() => router.push('/auth')}
              className="h-13 px-8 text-base bg-primary hover:bg-primary/90 shadow-glow rounded-xl"
            >
              Join Your Society <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/communities/create')}
              className="h-13 px-8 text-base rounded-xl border-border/50 hover:bg-muted/50"
            >
              Create Community
            </Button>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            {[
              { label: 'Help Requests Solved', value: 100000, icon: Heart, color: 'text-rose-400' },
              { label: 'Verified Members', value: 50000, icon: Shield, color: 'text-emerald-400' },
              { label: 'Karma Points Earned', value: 250000, icon: Zap, color: 'text-amber-400' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm"
                whileHover={{ y: -4, borderColor: 'hsl(var(--primary) / 0.3)' }}
                transition={{ duration: 0.2 }}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-3xl font-bold text-foreground">
                  <AnimatedCounter value={stat.value} />
                </span>
                <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ ANNOUNCEMENT TICKER ═══ */}
      <AnnouncementTicker />

      {/* ═══ FEATURES SECTION ═══ */}
      <section id="features" className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-mesh-2 opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Cpu className="h-3 w-3" /> PLATFORM CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything your community needs.
              <br />
              <span className="text-muted-foreground">Nothing it doesn&apos;t.</span>
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, title: 'Trust & Reputation', desc: 'Build verifiable trust scores with community-validated badges, reviews, and accountability metrics.', gradient: 'from-emerald-500/20 to-teal-500/10', iconColor: 'text-emerald-400' },
              { icon: Lock, title: 'Escrow Payments', desc: 'Secure transactions with blockchain-grade escrow. Funds release only when both parties confirm.', gradient: 'from-blue-500/20 to-cyan-500/10', iconColor: 'text-blue-400' },
              { icon: Radio, title: 'Emergency Response', desc: 'One-tap emergency alerts notify nearby responders. Real-time safety coordination when it matters.', gradient: 'from-red-500/20 to-rose-500/10', iconColor: 'text-red-400' },
              { icon: Trophy, title: 'Gamified Challenges', desc: 'Earn karma, unlock badges, and climb leaderboards. Make helping your neighborhood addictive.', gradient: 'from-amber-500/20 to-yellow-500/10', iconColor: 'text-amber-400' },
              { icon: Cpu, title: 'AI-Powered Matching', desc: 'Smart algorithms match help requests with the most qualified, available, and trusted neighbors.', gradient: 'from-violet-500/20 to-purple-500/10', iconColor: 'text-violet-400' },
              { icon: MessageCircle, title: 'Real-time Chat', desc: 'Instant messaging with request-specific threads, typing indicators, and file sharing.', gradient: 'from-pink-500/20 to-rose-500/10', iconColor: 'text-pink-400' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-20 sm:py-28 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Target className="h-3 w-3" /> HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Three steps to a better neighborhood</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From joining to helping — it takes less than 2 minutes.</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />

            {[
              { step: '01', title: 'Join or Create', desc: 'Enter your community invite code or create a new gated community for your neighborhood.', icon: Users },
              { step: '02', title: 'Post & Discover', desc: 'Request help or browse open requests. Our AI matches you with the best available neighbors.', icon: Globe },
              { step: '03', title: 'Help & Earn', desc: 'Complete tasks, earn karma, build reputation. Secure escrow payments protect everyone.', icon: Trophy },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MOCK PREVIEW SECTION ═══ */}
      <section className="py-20 sm:py-28 border-t border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Eye className="h-3 w-3" /> LIVE PREVIEW
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">See how your society looks in KindKart</h2>
            <p className="text-muted-foreground">A real-time mission control for your community.</p>
          </motion.div>

          {/* Mock Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                  <div className="h-3 w-3 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    kindkart.app/dashboard
                  </div>
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="p-6 grid grid-cols-12 gap-4">
                {/* Sidebar mock */}
                <div className="col-span-2 space-y-2 hidden sm:block">
                  {['Dashboard', 'Requests', 'Mission', 'Chat', 'Wallet'].map((item, i) => (
                    <div key={item} className={`px-3 py-2 rounded-lg text-xs ${i === 0 ? 'bg-primary/15 text-primary font-semibold' : 'text-muted-foreground'}`}>
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content mock */}
                <div className="col-span-12 sm:col-span-10 space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Active', value: '12', color: 'text-blue-400' },
                      { label: 'Completed', value: '847', color: 'text-emerald-400' },
                      { label: 'Members', value: '1.2K', color: 'text-violet-400' },
                      { label: 'Trust', value: '92%', color: 'text-amber-400' },
                    ].map(s => (
                      <div key={s.label} className="p-3 rounded-xl border border-border/30 bg-muted/20">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Activity mock */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-border/30 bg-muted/10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-semibold text-muted-foreground">LIVE ACTIVITY</span>
                      </div>
                      {['Help request from Block A', 'Payment verified', 'New member joined'].map((a, i) => (
                        <div key={i} className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          {a}
                        </div>
                      ))}
                    </div>
                    <div className="p-4 rounded-xl border border-border/30 bg-muted/10">
                      <p className="text-xs font-semibold text-muted-foreground mb-3">TRUST SCORE</p>
                      <div className="flex items-center justify-center py-3">
                        <div className="h-20 w-20 rounded-full border-4 border-primary/30 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">92</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="testimonials" className="py-20 sm:py-28 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Heart className="h-3 w-3" /> COMMUNITY VOICES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">Loved by neighborhoods everywhere</h2>
          </motion.div>

          <TestimonialCarousel />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 sm:py-28 border-t border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-1 opacity-50" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Ready to transform
              <br />
              <span className="text-gradient-neon">your neighborhood?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join thousands of communities already using KindKart to build safer, stronger, more connected neighborhoods.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => router.push('/auth')}
                className="h-14 px-10 text-base bg-primary hover:bg-primary/90 shadow-glow rounded-xl"
              >
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="h-14 px-10 text-base rounded-xl"
              >
                Explore Demo <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border/30 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">KindKart</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Neighborhood OS built on trust, accountability, and community power.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <div className="space-y-2.5">
                {['Features', 'Trust System', 'Escrow Payments', 'Emergency Response', 'Karma Rewards'].map(item => (
                  <p key={item} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{item}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Community</h4>
              <div className="space-y-2.5">
                {['Community Guidelines', 'Safety Center', 'Help Center', 'Blog', 'Developers'].map(item => (
                  <p key={item} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{item}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <div className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Data Processing', 'Contact Us'].map(item => (
                  <p key={item} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{item}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} KindKart. Building resilient communities together.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Globe className="h-4 w-4 hover:text-foreground cursor-pointer transition-colors" />
              <MessageCircle className="h-4 w-4 hover:text-foreground cursor-pointer transition-colors" />
              <Shield className="h-4 w-4 hover:text-foreground cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Testimonial Carousel ─── */
function TestimonialCarousel() {
  const testimonials = [
    { name: 'Asha Reddy', role: 'Block A President', text: 'KindKart transformed how our 200-unit society operates. From maintenance requests to emergency alerts, everything is streamlined.', avatar: 'AR', stars: 5 },
    { name: 'Marcus Chen', role: 'Community Helper', text: 'I\'ve completed 47 help requests and built a reputation I\'m proud of. The escrow system makes getting paid worry-free.', avatar: 'MC', stars: 5 },
    { name: 'Priya Sharma', role: 'Safety Coordinator', text: 'The emergency response feature saved us during a flood. We coordinated 50 volunteers in under 10 minutes.', avatar: 'PS', stars: 5 },
    { name: 'David Kim', role: 'New Resident', text: 'Just moved in and KindKart helped me connect with neighbors instantly. Found a plumber within 15 minutes!', avatar: 'DK', stars: 5 },
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid gap-5 sm:grid-cols-2">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: t.stars }).map((_, j) => (
                <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-foreground/90 mb-5 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-bold">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

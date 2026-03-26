'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lora, Plus_Jakarta_Sans } from 'next/font/google';
import { motion } from 'framer-motion';
import {
  Home,
  ChevronDown,
  Shield,
  Newspaper,
  Store,
  ArrowRight,
  Eye,
  Users,
  CheckCircle2,
  Compass,
  Sparkles,
  Clock3,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

type LandingVariant = 'conversion' | 'brand';

const trustCards = [
  {
    title: 'Address verification for safer communities.',
    bg:
      'linear-gradient(180deg, rgba(12,24,18,0.12), rgba(12,24,18,0.82)), url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80)',
  },
  {
    title: 'Reliable alerts and local updates from trusted neighbors.',
    bg:
      'linear-gradient(180deg, rgba(16,21,30,0.1), rgba(16,21,30,0.82)), url(https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=80)',
  },
  {
    title: 'Discover local services, helpers, and favorites nearby.',
    bg:
      'linear-gradient(180deg, rgba(31,20,10,0.06), rgba(31,20,10,0.82)), url(https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80)',
  },
];

const storytellingSections = [
  {
    eyebrow: 'Step 01',
    title: 'We verify who belongs in your local graph.',
    body: 'KindKart starts with neighborhood trust: identity signals, locality checks, and clear accountability before requests are posted.',
    metric: '93% of first-time requests receive trusted responses',
    visual:
      'linear-gradient(150deg, rgba(16,50,34,0.55), rgba(16,50,34,0.18)), url(https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80)',
  },
  {
    eyebrow: 'Step 02',
    title: 'Neighbors become fast responders, not passive viewers.',
    body: 'Requests are designed for action: clear context, urgency signals, and instant messaging so someone nearby can help quickly.',
    metric: 'Median first response time: under 14 minutes',
    visual:
      'linear-gradient(150deg, rgba(8,40,55,0.5), rgba(8,40,55,0.2)), url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80)',
  },
  {
    eyebrow: 'Step 03',
    title: 'Reputation compounds with every good deed.',
    body: 'Each completed task strengthens social proof. Over time, your community becomes safer, faster, and more self-reliant.',
    metric: '2.7x higher completion in verified communities',
    visual:
      'linear-gradient(150deg, rgba(66,38,12,0.5), rgba(66,38,12,0.2)), url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80)',
  },
];

const valuePoints = [
  {
    icon: Shield,
    title: 'Verified trust layer',
    desc: 'Identity signals, activity history, and community ratings make every interaction safer.',
  },
  {
    icon: Users,
    title: 'Hyperlocal community graph',
    desc: 'Find real neighbors, not random internet profiles, with locality-first matching.',
  },
  {
    icon: CheckCircle2,
    title: 'Help to action in minutes',
    desc: 'From request to resolution, flows are optimized for quick neighborhood coordination.',
  },
];

function getForcedVariant(value: string | null): LandingVariant | null {
  if (value === 'brand' || value === 'conversion') return value;
  return null;
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAsGuest } = useAuthStore();
  const [variant, setVariant] = useState<LandingVariant>('conversion');

  useEffect(() => {
    const forced = getForcedVariant(searchParams.get('lp'));
    if (forced) {
      setVariant(forced);
      localStorage.setItem('kindkart_lp_variant', forced);
      return;
    }

    const stored = getForcedVariant(localStorage.getItem('kindkart_lp_variant'));
    if (stored) {
      setVariant(stored);
      return;
    }

    const randomized: LandingVariant = Math.random() < 0.5 ? 'conversion' : 'brand';
    setVariant(randomized);
    localStorage.setItem('kindkart_lp_variant', randomized);
  }, [searchParams]);

  const handleGuestMode = () => {
    loginAsGuest();
    router.push('/dashboard');
  };

  const isBrandVariant = variant === 'brand';

  return (
    <div
      className={`${plusJakarta.variable} ${lora.variable} min-h-screen bg-[#f4f5f3] text-[#173024] [font-family:var(--font-plus-jakarta)]`}
      data-lp-variant={variant}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(24,128,78,0.08),transparent_40%),radial-gradient(circle_at_88%_8%,rgba(86,101,92,0.1),transparent_34%),linear-gradient(180deg,#f6f7f5_0%,#eef1ec_100%)]" />

      <header className="sticky top-0 z-40 border-b border-[#dce2db] bg-[#f4f5f3]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-[#1d8b4f]">
            <Home className="h-5 w-5 fill-current" />
            <span className="text-[2rem] font-semibold leading-none tracking-tight [font-family:var(--font-lora)]">kindkart</span>
          </Link>

          <nav className="hidden items-center gap-10 text-[1rem] font-medium text-[#274031] md:flex">
            <button className="inline-flex items-center gap-1 transition-colors hover:text-[#1d8b4f]">
              Partners <ChevronDown className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-1 transition-colors hover:text-[#1d8b4f]">
              Businesses <ChevronDown className="h-4 w-4" />
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="hidden h-10 rounded-full border border-[#cfd6ce] bg-[#edf0ea] px-4 text-sm font-semibold text-[#2a4133] hover:bg-[#e3e8e0] sm:inline-flex"
              onClick={() => router.push(isBrandVariant ? '/?lp=conversion' : '/?lp=brand')}
            >
              {isBrandVariant ? 'View Conversion Variant' : 'View Brand Variant'}
            </Button>
            <Button
              variant="secondary"
              className="h-11 rounded-full border border-[#cfd6ce] bg-[#edf0ea] px-6 text-[1rem] font-semibold text-[#2a4133] hover:bg-[#e3e8e0]"
              onClick={() => router.push('/auth')}
            >
              Log in
            </Button>
            <Button
              className="h-11 rounded-full bg-[#1d8b4f] px-6 text-[1rem] font-semibold text-white hover:bg-[#17723f]"
              onClick={() => router.push('/auth')}
            >
              Sign up
            </Button>
          </div>
        </div>
      </header>

      <main>
        {isBrandVariant ? (
          <section className="mx-auto w-full max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20">
            <div className="overflow-hidden rounded-[1.8rem] border border-[#d5ded4] bg-[#e9ede8]">
              <div className="grid items-stretch lg:grid-cols-[1.05fr_0.95fr]">
                <div className="p-8 sm:p-12 lg:p-14">
                  <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center gap-2 rounded-full border border-[#cad8ca] bg-[#f1f5f0] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2f7e50]"
                  >
                    <Compass className="h-3.5 w-3.5" /> Neighborhood OS
                  </motion.p>

                  <motion.h1
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.45 }}
                    className="mt-5 text-[2.35rem] font-semibold leading-[1.1] text-[#173024] [font-family:var(--font-lora)] sm:text-[3rem]"
                  >
                    A calmer, safer neighborhood experience built for real people.
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.45 }}
                    className="mt-5 max-w-xl text-lg leading-relaxed text-[#4b6153]"
                  >
                    KindKart helps your area coordinate help, reputation, and local commerce in one place so neighbors can act quickly and trust each other more.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.45 }}
                    className="mt-8 flex flex-wrap gap-3"
                  >
                    <Button
                      className="h-12 rounded-full bg-[#1d8b4f] px-7 text-[1rem] font-semibold text-white hover:bg-[#17723f]"
                      onClick={() => router.push('/auth')}
                    >
                      Join KindKart <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-12 rounded-full border border-[#cfd7ce] bg-[#eef2ec] px-7 text-[1rem] font-semibold text-[#2c4335] hover:bg-[#e5ebe3]"
                      onClick={handleGuestMode}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Explore Demo Mode
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28, duration: 0.45 }}
                    className="mt-8 grid gap-3 sm:grid-cols-3"
                  >
                    <div className="rounded-2xl border border-[#d3ddd2] bg-[#f7f9f6] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#567568]">Coverage</p>
                      <p className="mt-2 text-2xl font-bold text-[#173024]">1,200+</p>
                      <p className="text-sm text-[#587264]">communities onboarded</p>
                    </div>
                    <div className="rounded-2xl border border-[#d3ddd2] bg-[#f7f9f6] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#567568]">Response</p>
                      <p className="mt-2 text-2xl font-bold text-[#173024]">14m</p>
                      <p className="text-sm text-[#587264]">average first reply</p>
                    </div>
                    <div className="rounded-2xl border border-[#d3ddd2] bg-[#f7f9f6] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#567568]">Trust</p>
                      <p className="mt-2 text-2xl font-bold text-[#173024]">92%</p>
                      <p className="text-sm text-[#587264]">verified reputation score</p>
                    </div>
                  </motion.div>
                </div>

                <div
                  className="min-h-[28rem] bg-cover bg-center"
                  style={{
                    backgroundImage:
                      'linear-gradient(0deg,rgba(17,30,20,0.24),rgba(17,30,20,0.24)),url(https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1400&q=80)',
                  }}
                />
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24">
            <div className="relative overflow-hidden rounded-[1.8rem] border border-[#d5ded4] bg-[#e9ede8]">
              <div className="grid min-h-[620px] grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
                <div
                  className="hidden bg-cover bg-center lg:block"
                  style={{
                    backgroundImage:
                      'linear-gradient(0deg,rgba(17,30,20,0.25),rgba(17,30,20,0.25)),url(https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=1400&q=80)',
                  }}
                />

                <div className="relative flex items-center justify-center p-5 sm:p-9">
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="w-full max-w-[29rem] rounded-[1.6rem] border border-[#dde4dc] bg-[#f7f8f6] p-6 shadow-[0_20px_60px_rgba(20,44,31,0.15)] sm:p-8"
                  >
                    <h1 className="text-center text-[2.2rem] font-semibold leading-[1.15] text-[#173024] [font-family:var(--font-lora)] sm:text-[2.45rem]">
                      Discover your neighborhood
                    </h1>

                    <div className="mt-7 space-y-3">
                      <button
                        type="button"
                        className="w-full rounded-full border border-[#d6ddd5] bg-[#eef1ec] px-5 py-3 text-left text-[1.02rem] font-semibold text-[#1e362a] transition hover:bg-[#e3e9e1]"
                      >
                        Continue with Google
                      </button>
                      <button
                        type="button"
                        className="w-full rounded-full border border-[#d6ddd5] bg-[#eef1ec] px-5 py-3 text-left text-[1.02rem] font-semibold text-[#1e362a] transition hover:bg-[#e3e9e1]"
                      >
                        Continue with Apple
                      </button>
                    </div>

                    <div className="my-6 flex items-center gap-3 text-[#6a7a70]">
                      <div className="h-px flex-1 bg-[#d8e0d8]" />
                      <span className="text-sm font-medium">or</span>
                      <div className="h-px flex-1 bg-[#d8e0d8]" />
                    </div>

                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Email address"
                        className="h-14 w-full rounded-2xl border border-[#cfd7ce] bg-white px-4 text-[1rem] text-[#173024] outline-none ring-0 transition placeholder:text-[#708377] focus:border-[#56a677]"
                      />
                      <input
                        type="password"
                        placeholder="Create a password"
                        className="h-14 w-full rounded-2xl border border-[#cfd7ce] bg-white px-4 text-[1rem] text-[#173024] outline-none ring-0 transition placeholder:text-[#708377] focus:border-[#56a677]"
                      />
                    </div>

                    <p className="mt-5 text-[0.95rem] leading-relaxed text-[#506156]">
                      By continuing, you agree to KindKart&apos;s Privacy Policy, Cookie Policy, and Member Agreement.
                    </p>

                    <Button
                      className="mt-5 h-14 w-full rounded-full bg-[#1d8b4f] text-[1.06rem] font-semibold text-white hover:bg-[#17723f]"
                      onClick={() => router.push('/auth')}
                    >
                      Continue
                    </Button>

                    <Button
                      variant="ghost"
                      className="mt-3 h-12 w-full rounded-full text-[0.98rem] font-semibold text-[#2c4335] hover:bg-[#e7ede5]"
                      onClick={handleGuestMode}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Try Demo Mode
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <div className="grid gap-6 md:grid-cols-3">
            {trustCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="relative min-h-[24rem] overflow-hidden rounded-[1.3rem] border border-[#ced8cd] bg-cover bg-center"
                style={{ backgroundImage: card.bg }}
              >
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-center text-[1.72rem] font-semibold leading-tight text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)] sm:text-[1.86rem]">
                    {card.title}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#d4ddd3] bg-[#f7f9f6] py-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2e9b5f]">Story</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight text-[#173024] [font-family:var(--font-lora)] sm:text-5xl">
                See how KindKart turns local intent into local action.
              </h2>
            </div>

            <div className="space-y-10">
              {storytellingSections.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: 0.05 }}
                  className={`grid gap-6 rounded-[1.4rem] border border-[#d7dfd6] bg-white p-5 shadow-[0_14px_34px_rgba(20,45,31,0.06)] sm:p-7 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
                >
                  <div className="flex flex-col justify-center">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2e9b5f]">{item.eyebrow}</p>
                    <h3 className="mt-3 text-3xl font-semibold leading-tight text-[#173024] [font-family:var(--font-lora)]">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-[#4f6658]">{item.body}</p>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#d6ded5] bg-[#f2f6f2] px-4 py-2 text-sm font-semibold text-[#2e5943]">
                      <Clock3 className="h-4 w-4" /> {item.metric}
                    </div>
                  </div>

                  <div className="min-h-[15rem] overflow-hidden rounded-2xl border border-[#cfdbd0]">
                    <motion.div
                      whileInView={{ scale: 1.02 }}
                      transition={{ duration: 0.65 }}
                      viewport={{ once: true, amount: 0.3 }}
                      className="h-full min-h-[15rem] w-full bg-cover bg-center"
                      style={{ backgroundImage: item.visual }}
                    />
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#d4ddd3] bg-[#f7f9f6] py-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2e9b5f]">Why KindKart</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight text-[#173024] [font-family:var(--font-lora)] sm:text-5xl">
                Connect with your neighbors, beautifully and safely.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {valuePoints.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-2xl border border-[#d9e1d8] bg-white p-6 shadow-[0_14px_34px_rgba(20,45,31,0.08)]"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f3eb] text-[#1d8b4f]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#183126]">{item.title}</h3>
                  <p className="mt-2 text-[1rem] leading-relaxed text-[#4f6658]">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="rounded-[1.8rem] border border-[#d0dacf] bg-[linear-gradient(145deg,#1a8b4f_0%,#1d7144_55%,#254f36_100%)] p-7 text-white sm:p-10">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                <Sparkles className="h-4 w-4" />
                {isBrandVariant ? 'Brand-first narrative variant' : 'Conversion-first signup variant'}
              </p>
              <h3 className="mt-4 text-4xl font-semibold leading-tight [font-family:var(--font-lora)] sm:text-5xl">
                {isBrandVariant
                  ? 'Build the neighborhood product people want to open every day.'
                  : 'Bring trust, local commerce, and help requests into one place.'}
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-white/80">
                KindKart helps communities coordinate faster with verified members, built-in reputation, and actions that feel as simple as messaging a friend.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  className="h-12 rounded-full bg-white px-6 text-[1rem] font-semibold text-[#165e38] hover:bg-[#edf3ef]"
                  onClick={() => router.push('/auth')}
                >
                  Join KindKart <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 rounded-full border border-white/30 bg-white/10 px-6 text-[1rem] font-semibold text-white hover:bg-white/20"
                  onClick={handleGuestMode}
                >
                  Explore as Guest
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d5ded4] bg-[#eff2ed] py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p className="text-sm text-[#506157]">© {new Date().getFullYear()} kindkart. Designed for better neighborhoods.</p>
          <div className="flex items-center gap-5 text-sm font-medium text-[#314739]">
            <span className="inline-flex items-center gap-1">
              <Shield className="h-4 w-4" /> Safe Communities
            </span>
            <span className="inline-flex items-center gap-1">
              <Newspaper className="h-4 w-4" /> Local News
            </span>
            <span className="inline-flex items-center gap-1">
              <Store className="h-4 w-4" /> Local Business
            </span>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-4 left-4 z-30 hidden items-center gap-2 rounded-full border border-[#d0dacf] bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#385545] shadow-[0_8px_20px_rgba(22,45,31,0.12)] md:inline-flex">
        <MessageCircle className="h-3.5 w-3.5" />
        Variant: {isBrandVariant ? 'Brand-first' : 'Conversion-first'}
      </div>
    </div>
  );
}

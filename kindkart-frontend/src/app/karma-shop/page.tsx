'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader, StatCard } from '@/components/ui-kit';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Zap, ShoppingCart, Sparkles, Trophy, Gift, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

const categories = ['All', 'Coupons', 'Society Perks', 'Premium', 'Donations'];

const shopItems = [
  { id: '1', name: 'Free Pool Access (1 Day)', karma: 50, category: 'Society Perks', icon: '🏊', stock: 12, popular: true },
  { id: '2', name: 'Parking Spot Priority', karma: 100, category: 'Society Perks', icon: '🚗', stock: 5, popular: false },
  { id: '3', name: 'Local Cafe - 20% Off', karma: 30, category: 'Coupons', icon: '☕', stock: 25, popular: true },
  { id: '4', name: 'Gym Membership - 1 Week', karma: 200, category: 'Premium', icon: '💪', stock: 3, popular: false },
  { id: '5', name: 'Community Garden Plot', karma: 150, category: 'Society Perks', icon: '🌱', stock: 8, popular: false },
  { id: '6', name: 'Donate Meal to Senior', karma: 25, category: 'Donations', icon: '🍲', stock: 999, popular: true },
  { id: '7', name: 'Movie Night Tickets x2', karma: 75, category: 'Coupons', icon: '🎬', stock: 15, popular: false },
  { id: '8', name: 'Premium Badge - Gold', karma: 500, category: 'Premium', icon: '🏅', stock: 10, popular: true },
];

interface Redemption {
  id: string;
  itemName: string;
  spent: number;
  at: string;
}

export default function KarmaShopPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [karmaBalance, setKarmaBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Redemption[]>([]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }
    void loadData();
  }, [isAuthenticated, isHydrated, router, user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const rep = await api.reputation.getUserReputation(user.id);
      const points = Number((rep as any)?.totalPoints || (rep as any)?.karmaPoints || 420);
      setKarmaBalance(points);
    } catch (loadError: any) {
      setError(loadError?.message || 'Unable to sync karma balance');
      setKarmaBalance(420);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return shopItems.filter((item) => {
      const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
      const queryMatch = item.name.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && queryMatch;
    });
  }, [search, selectedCategory]);

  const cartItems = useMemo(() => {
    return shopItems.filter((item) => cart.has(item.id));
  }, [cart]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.karma, 0);
  const canCheckout = cartItems.length > 0 && karmaBalance >= cartTotal && !isRedeeming;

  const toggleCart = (id: string) => {
    setCart((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const redeemCart = async () => {
    if (!user || !canCheckout) return;

    setIsRedeeming(true);
    setError(null);

    try {
      for (const item of cartItems) {
        await api.reputation.updateReputation({
          userId: user.id,
          action: 'karma_redemption',
          points: -item.karma,
          context: { itemId: item.id, itemName: item.name },
        });
      }

      setKarmaBalance((prev) => prev - cartTotal);
      setHistory((prev) => [
        ...cartItems.map((item) => ({
          id: `${Date.now()}-${item.id}`,
          itemName: item.name,
          spent: item.karma,
          at: new Date().toISOString(),
        })),
        ...prev,
      ]);
      setCart(new Set());
    } catch (redeemError: any) {
      setError(redeemError?.message || 'Redemption failed. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f4f6f3]">
        <PageHeader
          title="Karma Marketplace"
          description="Redeem points for local perks, donations, and member upgrades"
          icon={<ShoppingBag className="h-6 w-6" />}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={loadData}>
                <RefreshCw className="h-4 w-4" /> Sync
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">{karmaBalance} Karma</span>
              </div>
            </div>
          }
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
          {error && (
            <PremiumCard className="p-3 border-rose-300/50 bg-rose-500/5">
              <p className="text-sm text-rose-300">{error}</p>
            </PremiumCard>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PremiumCard className="p-6 relative overflow-hidden border-[#dbe3db] bg-white">
              <div className="absolute inset-0 bg-gradient-to-r from-[#eff5ef] to-transparent" />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[#1f8a4d] flex items-center justify-center text-3xl">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">Weekly Redemption Boost</h3>
                  <p className="text-sm text-muted-foreground">Society perks are 10% cheaper this weekend for active helpers.</p>
                </div>
                <Badge variant="warning" className="text-[10px]">
                  <Trophy className="h-2.5 w-2.5 mr-1" /> Limited Time
                </Badge>
              </div>
            </PremiumCard>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatCard label="Balance" value={`${karmaBalance}`} icon={<Zap className="h-5 w-5" />} color="warning" />
            <StatCard label="Items in Cart" value={`${cartItems.length}`} icon={<ShoppingCart className="h-5 w-5" />} color="primary" />
            <StatCard label="Total to Redeem" value={`${cartTotal}`} icon={<Gift className="h-5 w-5" />} color="info" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-4">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        'px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all border',
                        selectedCategory === cat
                          ? 'bg-white text-[#24362c] border-[#2e4738]'
                          : 'bg-[#f2f5f1] text-[#607166] border-[#d6dfd6] hover:bg-[#eaf0ea]'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search rewards"
                    className="input-premium pl-9 w-full sm:w-56"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((item, i) => {
                  const selected = cart.has(item.id);
                  const canAfford = karmaBalance >= item.karma;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <PremiumCard interactive elevated className="p-4 relative h-full border-[#dbe3db] bg-white">
                        {item.popular && (
                          <Badge variant="warning" className="absolute top-3 right-3 text-[10px]">
                            <Star className="h-2.5 w-2.5 mr-0.5" /> Popular
                          </Badge>
                        )}
                        <div className="text-4xl mb-3">{item.icon}</div>
                        <h3 className="text-sm font-semibold mb-1 pr-12">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{item.category} · {item.stock} left</p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-sm font-bold text-amber-400">{item.karma}</span>
                          </div>
                          <Button
                            size="sm"
                            variant={selected ? 'default' : 'outline'}
                            className="text-xs h-8"
                            disabled={!canAfford || isRedeeming || isLoading}
                            onClick={() => toggleCart(item.id)}
                          >
                            {selected ? 'Selected' : !canAfford ? 'Not enough' : 'Add'}
                          </Button>
                        </div>
                      </PremiumCard>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <PremiumCard className="p-4 h-fit sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Cart</h3>
                <Badge variant="primary" className="text-[10px]">{cartItems.length} items</Badge>
              </div>

              <div className="space-y-2 max-h-60 overflow-auto pr-1">
                {cartItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Add rewards to redeem them together.</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="p-2 rounded-lg bg-muted/20 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.category}</p>
                      </div>
                      <span className="text-xs font-semibold text-amber-400">{item.karma}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-border/40 mt-4 pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-amber-400">{cartTotal} Karma</span>
                </div>
                <Button className="w-full" disabled={!canCheckout} onClick={redeemCart}>
                  {isRedeeming ? 'Redeeming...' : 'Redeem Now'}
                </Button>
                {!isLoading && cartTotal > karmaBalance && (
                  <p className="text-[10px] text-rose-300">You need {cartTotal - karmaBalance} more karma points.</p>
                )}
              </div>
            </PremiumCard>
          </div>

          <PremiumCard className="p-4">
            <h3 className="text-sm font-semibold mb-3">Recent Redemptions</h3>
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground">No redemptions this session yet.</p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="p-3 rounded-lg bg-muted/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">{entry.itemName}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(entry.at).toLocaleString()}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-400">-{entry.spent}</span>
                  </div>
                ))}
              </div>
            )}
          </PremiumCard>
        </div>
      </div>
    </AppShell>
  );
}

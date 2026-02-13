'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader } from '@/components/ui-kit';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Zap, Gift, Tag, ShoppingCart, Sparkles, Trophy, Heart, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export default function KarmaShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<Set<string>>(new Set());
  const userKarma = 420;

  const filtered = selectedCategory === 'All' ? shopItems : shopItems.filter(i => i.category === selectedCategory);

  const addToCart = (id: string) => {
    setCart(prev => { const n = new Set(prev); n.add(id); return n; });
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Karma Marketplace"
          description="Redeem your karma points for rewards and perks"
          icon={<ShoppingBag className="h-6 w-6" />}
          actions={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">{userKarma} Karma</span>
              </div>
              {cart.size > 0 && (
                <Button size="sm" className="gap-2">
                  <ShoppingCart className="h-4 w-4" /> Cart ({cart.size})
                </Button>
              )}
            </div>
          }
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Category Filter */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                  selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/60'
                )}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Featured Banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PremiumCard className="p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-violet-500/10 to-purple-500/10" />
              <div className="relative flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-3xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Earn More Karma</h3>
                  <p className="text-sm text-muted-foreground">Complete help requests to earn karma points. Top helpers earn 2x karma this week!</p>
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PremiumCard interactive elevated className="p-4 relative">
                  {item.popular && (
                    <Badge variant="warning" className="absolute top-3 right-3 text-[10px]">
                      <Star className="h-2.5 w-2.5 mr-0.5" /> Popular
                    </Badge>
                  )}
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-sm font-semibold mb-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{item.category} &middot; {item.stock} left</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-sm font-bold text-amber-400">{item.karma}</span>
                    </div>
                    <Button
                      size="sm"
                      variant={cart.has(item.id) ? 'default' : 'outline'}
                      className="text-xs h-8"
                      disabled={userKarma < item.karma}
                      onClick={() => addToCart(item.id)}
                    >
                      {cart.has(item.id) ? 'Added' : userKarma < item.karma ? 'Not enough' : 'Redeem'}
                    </Button>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

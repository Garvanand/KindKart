'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader, StatCard } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft, Shield, DollarSign, Lock, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { demoWalletStats, demoWalletTransactions } from '@/lib/demo-data';

interface WalletStats {
  balance: number;
  pendingAmount: number;
  totalEarned: number;
  totalSpent: number;
}

interface WalletTransaction {
  id: string;
  amount: number;
  status: string;
  type: 'payment' | 'earning';
  createdAt: string;
  description: string;
  otherUser?: { name?: string };
  escrowHold?: { status?: string } | null;
}

const fallbackStats: WalletStats = demoWalletStats;

const fallbackTransactions: WalletTransaction[] = demoWalletTransactions;

export default function WalletPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, isGuest, demoMode } = useAuthStore();
  const [stats, setStats] = useState<WalletStats>(fallbackStats);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(fallbackTransactions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }
    void loadWallet();
  }, [isAuthenticated, isHydrated, router, user]);

  const loadWallet = async () => {
    if (!user) return;

    if (isGuest || demoMode) {
      setError(null);
      setStats(fallbackStats);
      setTransactions(fallbackTransactions);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [walletData, transactionData] = await Promise.all([
        api.payments.getWallet(user.id),
        api.payments.getTransactions(),
      ]);

      setStats({
        balance: Number((walletData as any)?.balance || 0),
        pendingAmount: Number((walletData as any)?.pendingAmount || 0),
        totalEarned: Number((walletData as any)?.totalEarned || 0),
        totalSpent: Number((walletData as any)?.totalSpent || 0),
      });

      const safeTransactions = Array.isArray(transactionData) ? (transactionData as WalletTransaction[]) : [];
      setTransactions(safeTransactions.length > 0 ? safeTransactions : fallbackTransactions);
    } catch (loadError: any) {
      setError(loadError?.message || 'Wallet service unavailable, showing demo wallet');
      setStats(fallbackStats);
      setTransactions(fallbackTransactions);
    } finally {
      setIsLoading(false);
    }
  };

  const monthlyEarned = useMemo(
    () => transactions.filter((tx) => tx.type === 'earning').reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const monthlySpent = useMemo(
    () => transactions.filter((tx) => tx.type === 'payment').reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  if (!isAuthenticated || !user) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Wallet"
          description="Manage your escrow balance and transactions"
          icon={<Wallet className="h-6 w-6" />}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={loadWallet}>
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
              <Button variant="outline" size="sm" disabled>
                <CreditCard className="h-4 w-4 mr-2" /> Add Money
              </Button>
              <Button size="sm" disabled>
                <TrendingUp className="h-4 w-4 mr-2" /> Withdraw
              </Button>
            </div>
          }
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {error && (
            <PremiumCard className="p-3 border-rose-300/50 bg-rose-500/5">
              <p className="text-sm text-rose-300">{error}</p>
            </PremiumCard>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PremiumCard className="p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent" />
              <div className="relative">
                <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                <p className="text-4xl font-bold text-foreground mb-1">₹{stats.balance.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-emerald-400 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">+₹{Math.max(0, monthlyEarned - monthlySpent).toLocaleString()} net this cycle</span>
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Earned', value: `₹${stats.totalEarned.toLocaleString()}`, icon: <ArrowDownLeft className="h-5 w-5" />, color: 'success' as const },
              { label: 'Total Spent', value: `₹${stats.totalSpent.toLocaleString()}`, icon: <ArrowUpRight className="h-5 w-5" />, color: 'warning' as const },
              { label: 'In Escrow', value: `₹${stats.pendingAmount.toLocaleString()}`, icon: <Lock className="h-5 w-5" />, color: 'info' as const },
              { label: 'Transactions', value: String(transactions.length), icon: <CheckCircle2 className="h-5 w-5" />, color: 'primary' as const },
            ].map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + index * 0.04 }}>
                <StatCard {...stat} />
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PremiumCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Recent Transactions</h3>
                  <Badge variant="ghost">{transactions.length} total</Badge>
                </div>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-14 rounded-xl bg-muted/20 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className={cn(
                          'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
                          transaction.type === 'earning' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                        )}>
                          {transaction.type === 'earning'
                            ? <ArrowDownLeft className="h-5 w-5 text-emerald-400" />
                            : <ArrowUpRight className="h-5 w-5 text-amber-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(transaction.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={cn('text-sm font-semibold', transaction.type === 'earning' ? 'text-emerald-400' : 'text-foreground')}>
                            {transaction.type === 'earning' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                          </p>
                          <Badge variant={transaction.status === 'completed' ? 'success' : 'warning'} className="text-[10px]">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PremiumCard>
            </div>

            <PremiumCard className="p-5 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Payment Security</h3>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Lock, title: 'Escrow Protection', desc: 'Funds are held until work is verified complete.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { icon: Shield, title: 'Secure Processing', desc: 'Every transaction uses authenticated secure APIs.', color: 'text-primary', bg: 'bg-primary/10' },
                  { icon: DollarSign, title: 'Dispute Resolution', desc: 'Raise disputes directly from your transaction flow.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0', item.bg)}>
                      <item.icon className={cn('h-4 w-4', item.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

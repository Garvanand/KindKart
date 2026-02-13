'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader, StatCard } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Shield, DollarSign, Lock, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockTransactions = [
  { id: '1', type: 'earned', title: 'Plumbing Fix - Block A', amount: 500, from: 'Raj Patel', time: '2 hours ago', status: 'completed' },
  { id: '2', type: 'spent', title: 'Grocery Help Payment', amount: 150, from: 'Mrs. Sharma', time: '5 hours ago', status: 'completed' },
  { id: '3', type: 'escrow', title: 'WiFi Setup (in escrow)', amount: 200, from: 'Priya Singh', time: '1 day ago', status: 'pending' },
  { id: '4', type: 'earned', title: 'Piano Lessons', amount: 300, from: 'Anjali Verma', time: '2 days ago', status: 'completed' },
  { id: '5', type: 'spent', title: 'Community Fund Donation', amount: 100, from: 'Green Fund', time: '3 days ago', status: 'completed' },
];

export default function WalletPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) router.push('/auth');
  }, [isAuthenticated, user, router]);

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
              <Button variant="outline" size="sm"><CreditCard className="h-4 w-4 mr-2" /> Add Money</Button>
              <Button size="sm"><TrendingUp className="h-4 w-4 mr-2" /> Withdraw</Button>
            </div>
          }
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Balance Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PremiumCard className="p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-violet-500/5 to-transparent" />
              <div className="relative">
                <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                <motion.p
                  className="text-4xl font-bold text-foreground mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  &#8377;2,450.00
                </motion.p>
                <div className="flex items-center gap-1 text-emerald-400 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">+&#8377;850 this month</span>
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'This Month Earned', value: '\u20B91,650', icon: <ArrowDownLeft className="h-5 w-5" />, color: 'success' as const },
              { label: 'This Month Spent', value: '\u20B9800', icon: <ArrowUpRight className="h-5 w-5" />, color: 'warning' as const },
              { label: 'In Escrow', value: '\u20B9200', icon: <Lock className="h-5 w-5" />, color: 'info' as const },
              { label: 'Completed', value: '12', icon: <CheckCircle2 className="h-5 w-5" />, color: 'primary' as const },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                <StatCard {...s} />
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Transaction History */}
            <div className="lg:col-span-2">
              <PremiumCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Recent Transactions</h3>
                  <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                </div>
                <div className="space-y-2">
                  {mockTransactions.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
                    >
                      <div className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        tx.type === 'earned' ? 'bg-emerald-500/10' : tx.type === 'escrow' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                      )}>
                        {tx.type === 'earned' ? <ArrowDownLeft className="h-5 w-5 text-emerald-400" /> :
                         tx.type === 'escrow' ? <Lock className="h-5 w-5 text-blue-400" /> :
                         <ArrowUpRight className="h-5 w-5 text-amber-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.title}</p>
                        <p className="text-xs text-muted-foreground">{tx.from} &middot; {tx.time}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn('text-sm font-semibold', tx.type === 'earned' ? 'text-emerald-400' : tx.type === 'escrow' ? 'text-blue-400' : 'text-foreground')}>
                          {tx.type === 'earned' ? '+' : tx.type === 'spent' ? '-' : ''}&#8377;{tx.amount}
                        </p>
                        <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} className="text-[10px]">{tx.status}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </PremiumCard>
            </div>

            {/* Security Panel */}
            <PremiumCard className="p-5 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Payment Security</h3>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Lock, title: 'Escrow Protection', desc: 'Funds held until task is verified complete', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { icon: Shield, title: 'Secure Processing', desc: 'Bank-level encryption on all transactions', color: 'text-primary', bg: 'bg-primary/10' },
                  { icon: DollarSign, title: 'Dispute Resolution', desc: 'Fair mediation for payment disagreements', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map(s => (
                  <div key={s.title} className="flex items-start gap-3">
                    <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0', s.bg)}>
                      <s.icon className={cn('h-4 w-4', s.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
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

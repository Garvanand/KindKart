'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AppShell, PageContainer } from '@/components/layout';
import { WalletCard } from '@/components/payment/WalletCard';
import { TransactionHistory } from '@/components/payment/TransactionHistory';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIAssistant } from '@/components/AIAssistant';
import { CreditCard, TrendingUp } from 'lucide-react';

export default function WalletPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'wallet' | 'transactions'>('wallet');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AppShell>
      <PageContainer className="py-6 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Wallet</h1>
            <p className="text-sm text-muted-foreground">Balance and transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CreditCard className="mr-2 h-4 w-4" />
              Add money
            </Button>
            <Button size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'wallet' | 'transactions')} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="wallet">Wallet overview</TabsTrigger>
            <TabsTrigger value="transactions">Transaction history</TabsTrigger>
          </TabsList>
          <TabsContent value="wallet" className="mt-0">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <WalletCard userId={user.id} />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/15">
                        <TrendingUp className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">This month</p>
                        <p className="text-xl font-semibold text-foreground">₹0</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Active requests</p>
                        <p className="text-xl font-semibold text-foreground">0</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-xl font-semibold text-foreground">0</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-base">Payment security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/15">
                      <CreditCard className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Escrow protection</h4>
                      <p className="text-xs text-muted-foreground">Payments held until work is completed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Secure processing</h4>
                      <p className="text-xs text-muted-foreground">Razorpay, bank-level security</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Dispute resolution</h4>
                      <p className="text-xs text-muted-foreground">Fair process for payment issues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="transactions" className="mt-0">
            <TransactionHistory />
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <AIAssistant context="wallet, payments, and transactions" />
        </div>
      </PageContainer>
    </AppShell>
  );
}

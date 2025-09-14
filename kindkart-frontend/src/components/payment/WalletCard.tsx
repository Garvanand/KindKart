'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { formatAmount } from '@/lib/razorpay';

interface WalletData {
  balance: number;
  pendingAmount: number;
  totalEarned: number;
  totalSpent: number;
}

interface WalletCardProps {
  userId: string;
}

export function WalletCard({ userId }: WalletCardProps) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, [userId]);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const walletData = await api.payments.getWallet(userId);
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Failed to load wallet data</p>
          <Button onClick={loadWalletData} className="mt-2" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Balance */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-green-600">
            {showBalance ? formatAmount(wallet.balance) : '••••'}
          </p>
        </div>

        {/* Pending Amount */}
        {wallet.pendingAmount > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Pending Release</p>
            <p className="text-lg font-semibold text-orange-600">
              {showBalance ? formatAmount(wallet.pendingAmount) : '••••'}
            </p>
            <Badge variant="outline" className="mt-1">
              In Escrow
            </Badge>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Earned</span>
            </div>
            <p className="font-semibold">
              {showBalance ? formatAmount(wallet.totalEarned) : '••••'}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">Spent</span>
            </div>
            <p className="font-semibold">
              {showBalance ? formatAmount(wallet.totalSpent) : '••••'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            Withdraw
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

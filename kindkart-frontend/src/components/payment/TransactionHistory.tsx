'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatAmount } from '@/lib/razorpay';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  type: 'payment' | 'earning' | 'withdrawal' | 'refund';
  createdAt: string;
  description: string;
  request?: {
    id: string;
    title: string;
  };
  otherUser?: {
    id: string;
    name: string;
    profilePhoto?: string;
  };
  escrowHold?: {
    id: string;
    releaseTime: string;
    status: 'held' | 'released' | 'disputed';
  };
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const transactionsData = await api.payments.getTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'refunded':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'failed' || status === 'cancelled') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }

    switch (type) {
      case 'payment':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'earning':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-blue-500" />;
      case 'refund':
        return <ArrowDownLeft className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No transactions yet</p>
            <p className="text-sm">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                {/* Transaction Icon */}
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.type, transaction.status)}
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 truncate">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(transaction.status)}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1">{transaction.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{formatDate(transaction.createdAt)}</span>
                    {transaction.otherUser && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src={transaction.otherUser.profilePhoto} />
                            <AvatarFallback className="text-xs">
                              {getInitials(transaction.otherUser.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{transaction.otherUser.name}</span>
                        </div>
                      </>
                    )}
                    {transaction.request && (
                      <>
                        <span>•</span>
                        <span className="truncate">{transaction.request.title}</span>
                      </>
                    )}
                  </div>

                  {/* Escrow Information */}
                  {transaction.escrowHold && transaction.escrowHold.status === 'held' && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Payment held in escrow until {new Date(transaction.escrowHold.releaseTime).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="flex-shrink-0 text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'earning' || transaction.type === 'refund' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'earning' || transaction.type === 'refund' ? '+' : '-'}
                    {formatAmount(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

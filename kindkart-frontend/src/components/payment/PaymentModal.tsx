'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createPayment, formatAmount } from '@/lib/razorpay';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: string;
    title: string;
    requester: {
      id: string;
      name: string;
    };
    helper: {
      id: string;
      name: string;
    };
  };
  onPaymentSuccess: (transaction: any) => void;
}

export function PaymentModal({ isOpen, onClose, request, onPaymentSuccess }: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthStore();

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create payment order on backend
      const orderResponse = await api.payments.createOrder({
        requestId: request.id,
        amount: parseFloat(amount) * 100, // Convert to paise
        currency: 'INR',
        helperId: request.helper.id
      });

      // Initialize Razorpay payment
      const paymentResponse = await createPayment(
        parseFloat(amount),
        'INR',
        `Payment for: ${request.title}`,
        {
          name: user.name,
          email: user.email || '',
          contact: user.phone || ''
        },
        orderResponse.order.id
      );

      // Verify payment on backend
      const verificationResponse = await api.payments.verifyPayment({
        orderId: orderResponse.order.id,
        paymentId: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature
      });

      onPaymentSuccess(verificationResponse.transaction);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmount('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Secure Payment
          </DialogTitle>
          <DialogDescription>
            Make a secure payment for the help request using our escrow system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Help Request</Label>
                <p className="text-sm text-gray-600">{request.title}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Helper</Label>
                <p className="text-sm text-gray-600">{request.helper.name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500">
              Enter the amount you'd like to pay for this service
            </p>
          </div>

          {/* Escrow Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Escrow Protection</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Payment held securely until work is completed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Automatic release after 20-minute verification window
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Full refund if work is not completed
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          {amount && parseFloat(amount) > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Service Amount</span>
                    <span>{formatAmount(parseFloat(amount))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span>{formatAmount(parseFloat(amount))}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    No additional fees. Payment is held in escrow until completion.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay {amount ? formatAmount(parseFloat(amount)) : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

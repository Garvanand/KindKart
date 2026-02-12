'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, Lock, Zap, Shield, TrendingUp } from 'lucide-react';
import { PremiumCard, StatCard } from '@/components/ui-kit/cards';
import { Badge } from '@/components/ui-kit/badges';
import { AnimatedProgressRing, Pulse } from '@/components/ui-kit/progress';
import { cn } from '@/lib/utils';

/**
 * WalletCard - Premium wallet display card with balance and actions
 */
export interface WalletCardProps {
  balance: number;
  currency?: string;
  locked?: number;
  available?: number;
  lastUpdated?: string;
  onAddMoney?: () => void;
  onWithdraw?: () => void;
}

export function WalletCard({
  balance,
  currency = '₹',
  locked,
  available,
  lastUpdated,
  onAddMoney,
  onWithdraw,
}: WalletCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <PremiumCard elevated className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="space-y-6">
          {/* Main balance display */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Balance</p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <h2 className="text-5xl font-bold text-foreground mb-1">
                {currency}{balance.toLocaleString()}
              </h2>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">Updated {lastUpdated}</p>
              )}
            </motion.div>
          </div>

          {/* Available and locked breakdown */}
          {(available || locked) && (
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-border/50">
              {available !== undefined && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Available</p>
                  <p className="text-2xl font-bold text-success">{currency}{available.toLocaleString()}</p>
                </div>
              )}
              {locked !== undefined && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Locked in Escrow</p>
                  <p className="text-2xl font-bold text-warning">{currency}{locked.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            {onAddMoney && (
              <motion.button
                onClick={onAddMoney}
                className="flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary-dark"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Add Money
              </motion.button>
            )}
            {onWithdraw && (
              <motion.button
                onClick={onWithdraw}
                className="flex-1 py-2 px-4 rounded-lg border border-primary bg-transparent text-primary font-semibold text-sm transition-all hover:bg-primary/5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Withdraw
              </motion.button>
            )}
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
}

/**
 * EscrowTracker - Premium escrow status tracker with stepper UI
 */
export interface EscrowTrackerProps {
  amount: number;
  status: 'pending' | 'locked' | 'released' | 'disputed';
  releaseDate?: string;
  requestTitle?: string;
  helperName?: string;
  onDispute?: () => void;
  onConfirm?: () => void;
}

const escrowSteps = [
  { key: 'pending', label: 'Payment Initiated', icon: Clock },
  { key: 'locked', label: 'Payment Secured', icon: Lock },
  { key: 'released', label: 'Released', icon: CheckCircle2 },
];

export function EscrowTracker({
  amount,
  status,
  releaseDate,
  requestTitle,
  helperName,
  onDispute,
  onConfirm,
}: EscrowTrackerProps) {
  const currentStep = escrowSteps.findIndex((step) => step.key === status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <PremiumCard elevated>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Escrow Payment</h3>
              <Badge variant="primary">
                {status === 'disputed' ? 'Disputed' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            {requestTitle && (
              <p className="text-sm text-muted-foreground">{requestTitle}</p>
            )}
          </div>

          {/* Amount display */}
          <div className="p-4 rounded-lg bg-primary/10">
            <p className="text-xs font-medium text-muted-foreground mb-1">Secured Amount</p>
            <p className="text-3xl font-bold text-primary">₹{amount.toLocaleString()}</p>
          </div>

          {/* Stepper */}
          <div className="space-y-4">
            {escrowSteps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                      isCompleted && 'bg-success/10 text-success',
                      isCurrent && 'bg-primary/15 text-primary ring-2 ring-primary/30',
                      !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <p className={cn(
                        'font-semibold text-sm',
                        isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {step.label}
                      </p>
                      {isCurrent && releaseDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expected release: {releaseDate}
                        </p>
                      )}
                      {isCompleted && (
                        <p className="text-xs text-success mt-1">Completed</p>
                      )}
                    </div>

                    {/* Line connector */}
                    {idx < escrowSteps.length - 1 && (
                      <div className={cn(
                        'absolute left-[19px] top-10 bottom-0 w-0.5 transition-all',
                        isCompleted ? 'bg-success' : 'bg-border'
                      )} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Helper info */}
          {helperName && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-1">Working with</p>
              <p className="text-sm font-semibold text-foreground">{helperName}</p>
            </div>
          )}

          {/* Action buttons */}
          {status === 'locked' && (onDispute || onConfirm) && (
            <div className="flex gap-3 pt-4 border-t border-border/50">
              {onConfirm && (
                <motion.button
                  onClick={onConfirm}
                  className="flex-1 py-2 px-4 rounded-lg bg-success text-white font-semibold text-sm transition-all hover:bg-emerald-600"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirm & Release
                </motion.button>
              )}
              {onDispute && (
                <motion.button
                  onClick={onDispute}
                  className="flex-1 py-2 px-4 rounded-lg border border-emergency bg-transparent text-emergency font-semibold text-sm transition-all hover:bg-emergency/5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Dispute
                </motion.button>
              )}
            </div>
          )}

          {status === 'disputed' && (
            <div className="p-4 rounded-lg bg-emergency/10 border border-emergency/30 flex gap-3">
              <AlertCircle className="h-5 w-5 text-emergency flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-emergency mb-1">Payment Disputed</p>
                <p className="text-xs text-emergency/80">
                  Admin is reviewing this transaction. You'll be notified of the resolution.
                </p>
              </div>
            </div>
          )}
        </div>
      </PremiumCard>
    </motion.div>
  );
}

/**
 * TransactionHistoryItem - Single transaction in history
 */
export interface TransactionHistoryItemProps {
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  description: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'failed';
  reference?: string;
}

export function TransactionHistoryItem({
  type,
  amount,
  description,
  timestamp,
  status = 'completed',
  reference,
}: TransactionHistoryItemProps) {
  const typeConfig = {
    credit: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    debit: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10' },
    refund: { icon: Zap, color: 'text-info', bg: 'bg-info/10' },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0', config.bg)}>
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{description}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{timestamp}</p>
          {reference && (
            <p className="text-xs text-muted-foreground/70 mt-1">Ref: {reference}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        {status !== 'completed' && (
          <Badge variant="ghost">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )}
        <p className={cn('text-lg font-bold', config.color)}>
          {type === 'debit' ? '-' : '+'}₹{amount.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

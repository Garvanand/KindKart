'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, CheckCircle2, HandHeart, WalletCards } from 'lucide-react';

type Kpi = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  icon: React.ElementType;
};

const BASE_KPIS: Kpi[] = [
  {
    id: 'open-requests',
    label: 'Open requests',
    value: '–',
    delta: undefined,
    icon: HandHeart,
  },
  {
    id: 'completed-helps',
    label: 'Helps completed',
    value: '–',
    delta: undefined,
    icon: CheckCircle2,
  },
  {
    id: 'escrow-volume',
    label: 'Escrow volume',
    value: '–',
    delta: undefined,
    icon: WalletCards,
  },
];

export function DashboardKpis() {
  // For now we use static placeholders; can be wired to real stats later.
  const kpis = BASE_KPIS;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.25 }}
          >
            <Card className="card-interactive">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold">{kpi.value}</p>
                  {kpi.delta && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <ArrowUpRight className="h-3 w-3" />
                      {kpi.delta}
                    </p>
                  )}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}


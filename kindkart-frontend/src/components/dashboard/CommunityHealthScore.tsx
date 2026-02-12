'use client';

import { PremiumCard, AnimatedProgressBar, Badge } from '@/components/ui-kit';
import { Activity, Heart, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const healthMetrics = [
  { label: 'Member Engagement', value: 87, color: 'primary' as const },
  { label: 'Request Completion', value: 94, color: 'success' as const },
  { label: 'Community Safety', value: 98, color: 'warning' as const },
];

export function CommunityHealthScore() {
  const overallHealth = Math.round((87 + 94 + 98) / 3);

  return (
    <PremiumCard elevated>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-emergency" />
            Community Health
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">Overall wellness indicators</p>
      </div>

      {/* Overall health display */}
      <motion.div
        className="mb-6 p-4 rounded-lg bg-gradient-to-br from-success/10 to-emerald-500/5 border border-success/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-success">{overallHealth}%</span>
          <span className="text-sm font-medium text-muted-foreground mb-1">Healthy Community</span>
        </div>
      </motion.div>

      {/* Health metrics */}
      <div className="space-y-4">
        {healthMetrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <AnimatedProgressBar
              percentage={metric.value}
              label={metric.label}
              color={metric.color}
              showPercentage
              animated
            />
          </motion.div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-3 gap-2">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-lg font-bold text-foreground">542</p>
          <p className="text-xs text-muted-foreground">Members</p>
        </motion.div>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <p className="text-lg font-bold text-foreground">1.2K</p>
          <p className="text-xs text-muted-foreground">Requests Done</p>
        </motion.div>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg font-bold text-foreground">4.8★</p>
          <p className="text-xs text-muted-foreground">Avg Rating</p>
        </motion.div>
      </div>
    </PremiumCard>
  );
}

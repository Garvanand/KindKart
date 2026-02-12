'use client';

import { PremiumCard, AnimatedProgressRing, Badge } from '@/components/ui-kit';
import { Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const trustMetrics = [
  { label: 'Reliability', score: 92 },
  { label: 'Responsiveness', score: 88 },
  { label: 'Quality', score: 95 },
];

export function TrustScoreVisualization() {
  return (
    <PremiumCard elevated>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">Your Trust Score</h3>
          <Badge variant="success">
            <TrendingUp className="h-3 w-3" />
            +5 this month
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Your community reputation</p>
      </div>

      {/* Main progress ring */}
      <div className="flex justify-center mb-8">
        <AnimatedProgressRing
          percentage={92}
          size="md"
          color="success"
          label="Overall"
          showLabel
        />
      </div>

      {/* Metric breakdown */}
      <div className="space-y-4">
        {trustMetrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-foreground">{metric.label}</span>
              <span className="text-sm font-semibold text-primary">{metric.score}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${metric.score}%` }}
                transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Badges section */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Achievements
        </p>
        <div className="flex flex-wrap gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
          >
            <Badge variant="primary">
              <Star className="h-3 w-3" />
              5-Star Helper
            </Badge>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
          >
            <Badge variant="success">
              <Star className="h-3 w-3" />
              Trusted Member
            </Badge>
          </motion.div>
        </div>
      </div>
    </PremiumCard>
  );
}

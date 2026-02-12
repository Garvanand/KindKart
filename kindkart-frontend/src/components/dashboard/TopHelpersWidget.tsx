'use client';

import { PremiumCard, Badge } from '@/components/ui-kit';
import { Trophy, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const topHelpers = [
  { name: 'Raj Patel', score: 4.9, requests: 47, badge: '⭐ Trusted Helper' },
  { name: 'Sarah Johnson', score: 4.8, requests: 38, badge: '🎖️ Expert' },
  { name: 'Marcus Chen', score: 4.7, requests: 32, badge: '🏆 Top Rated' },
];

export function TopHelpersWidget() {
  return (
    <PremiumCard elevated>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Top Helpers This Week</h3>
        </div>
        <p className="text-sm text-muted-foreground">Rising stars in your community</p>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3 mb-6">
        {topHelpers.map((helper, idx) => (
          <motion.div
            key={helper.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Rank badge */}
              <motion.div
                className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {idx + 1}
              </motion.div>

              {/* Helper info */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{helper.name}</p>
                <p className="text-xs text-muted-foreground">{helper.requests} requests completed</p>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">{helper.score}</p>
              <p className="text-xs text-warning">★★★★★</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Leaderboard */}
      <Button
        variant="outline"
        className="w-full"
      >
        View Full Leaderboard
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </PremiumCard>
  );
}

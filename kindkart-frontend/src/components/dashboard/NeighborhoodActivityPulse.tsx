'use client';

import { motion } from 'framer-motion';
import { PremiumCard, Pulse } from '@/components/ui-kit';
import { HelpCircle, MessageCircle, CheckCircle, Users } from 'lucide-react';

const activities = [
  { icon: HelpCircle, label: 'New help request', time: '2 min ago', color: 'text-blue-500' },
  { icon: MessageCircle, label: 'New message', time: '5 min ago', color: 'text-green-500' },
  { icon: CheckCircle, label: 'Request completed', time: '12 min ago', color: 'text-emerald-500' },
  { icon: Users, label: 'Member joined', time: '28 min ago', color: 'text-purple-500' },
];

export function NeighborhoodActivityPulse() {
  return (
    <PremiumCard elevated>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Live Neighborhood Activity</h3>
          <p className="text-sm text-muted-foreground mt-1">Real-time happenings in your community</p>
        </div>
        <Pulse color="primary" size="md" />
      </div>

      {/* Animated activity feed */}
      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className={`h-2 w-2 rounded-full bg-primary animate-pulse`} />
            <activity.icon className={`h-4 w-4 ${activity.color}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{activity.label}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
            <span className="text-xs font-semibold text-primary">LIVE</span>
          </motion.div>
        ))}
      </div>

      {/* Radar animation background */}
      <motion.div
        className="mt-6 h-32 rounded-lg border border-border/50 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <svg className="w-full h-full" viewBox="0 0 200 128">
          {/* Concentric circles for radar effect */}
          {[1, 2, 3].map((i) => (
            <motion.circle
              key={i}
              cx="100"
              cy="64"
              r={20 * i}
              fill="none"
              stroke="hsl(var(--primary)/0.1)"
              strokeWidth="1"
              animate={{ r: [20 * i, 20 * i + 5, 20 * i] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}

          {/* Animated dots for activity */}
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={`dot-${i}`}
              cx="100"
              cy="64"
              r="2"
              fill="hsl(var(--primary))"
              animate={{
                r: [2, 4, 2],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
              }}
            />
          ))}
        </svg>
      </motion.div>
    </PremiumCard>
  );
}

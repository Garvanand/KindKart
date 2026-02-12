'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ActivityType = 'request' | 'chat' | 'payment' | 'member';

const DOT_TYPES: ActivityType[] = ['request', 'chat', 'payment', 'member'];

export function ActivityPulse() {
  // For now we show a static sample count; this can be wired to real data later.
  const [eventCount] = useState<number>(12);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">Neighborhood Activity Pulse</CardTitle>
        <Badge variant="secondary" className="text-xs">
          Live in your society
        </Badge>
      </CardHeader>
      <CardContent className="grid items-center gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
        <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10">
          {[60, 90, 120].map((radius, idx) => (
            <motion.div
              key={radius}
              className="absolute rounded-full border border-primary/20"
              style={{ width: radius, height: radius }}
              initial={{ opacity: 0.2, scale: 0.9 }}
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.05, 0.9] }}
              transition={{ duration: 6 + idx * 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          {DOT_TYPES.map((type, idx) => (
            <motion.div
              key={type}
              className="absolute h-2.5 w-2.5 rounded-full shadow-glow-sm"
              style={{
                backgroundColor:
                  type === 'request'
                    ? 'hsl(var(--warning))'
                    : type === 'chat'
                    ? 'hsl(var(--accent))'
                    : type === 'payment'
                    ? 'hsl(var(--success))'
                    : 'hsl(var(--info))',
              }}
              initial={{
                x: Math.cos((idx / DOT_TYPES.length) * Math.PI * 2) * 20,
                y: Math.sin((idx / DOT_TYPES.length) * Math.PI * 2) * 20,
              }}
              animate={{
                x: [
                  Math.cos((idx / DOT_TYPES.length) * Math.PI * 2) * 20,
                  Math.cos((idx / DOT_TYPES.length) * Math.PI * 2 + Math.PI / 6) * 40,
                  Math.cos((idx / DOT_TYPES.length) * Math.PI * 2) * 20,
                ],
                y: [
                  Math.sin((idx / DOT_TYPES.length) * Math.PI * 2) * 20,
                  Math.sin((idx / DOT_TYPES.length) * Math.PI * 2 + Math.PI / 6) * 40,
                  Math.sin((idx / DOT_TYPES.length) * Math.PI * 2) * 20,
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          <div className="relative flex flex-col items-center gap-1 text-center">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Live activity
            </span>
            <span className="text-2xl font-semibold">
              {eventCount ? `${eventCount} events` : 'Calm & connected'}
            </span>
            <span className="text-xs text-muted-foreground">
              Requests · Chats · Payments · Members
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Live in your society
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            <div className="flex items-start justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm">
              <div className="mr-2 min-w-0">
                <p className="truncate font-medium">Example request</p>
                <p className="truncate text-xs text-muted-foreground">
                  A neighbor asked for grocery help.
                </p>
              </div>
              <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                request
              </span>
            </div>
            <div className="flex items-start justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm">
              <div className="mr-2 min-w-0">
                <p className="truncate font-medium">New chat</p>
                <p className="truncate text-xs text-muted-foreground">
                  Two members are coordinating help.
                </p>
              </div>
              <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                chat
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


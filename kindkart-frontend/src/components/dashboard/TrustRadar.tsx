'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TrustRadarProps {
  trustScore: number;
  communityVibe: number;
  goodDeeds: number;
  suspiciousAlerts: number;
  className?: string;
}

export function TrustRadar({
  trustScore = 92,
  communityVibe = 87,
  goodDeeds = 34,
  suspiciousAlerts = 1,
  className,
}: TrustRadarProps) {
  const size = 220;
  const center = size / 2;
  const rings = [35, 55, 75, 95];

  return (
    <div className={cn('relative', className)}>
      <div className="p-6 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Trust Radar</h3>
            <p className="text-xs text-muted-foreground">Community trust overview</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs text-emerald-400 font-medium">LIVE</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="absolute inset-0">
              {/* Concentric rings */}
              {rings.map((r, i) => (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke="hsl(var(--border) / 0.3)"
                  strokeWidth="0.5"
                  strokeDasharray="2 4"
                />
              ))}

              {/* Cross lines */}
              <line x1={center} y1={center - 95} x2={center} y2={center + 95} stroke="hsl(var(--border) / 0.2)" strokeWidth="0.5" />
              <line x1={center - 95} y1={center} x2={center + 95} y2={center} stroke="hsl(var(--border) / 0.2)" strokeWidth="0.5" />

              {/* Sweep line */}
              <motion.line
                x1={center}
                y1={center}
                x2={center}
                y2={center - 90}
                stroke="hsl(var(--primary) / 0.6)"
                strokeWidth="1.5"
                style={{ transformOrigin: `${center}px ${center}px` }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />

              {/* Sweep gradient trail */}
              <motion.path
                d={`M ${center} ${center} L ${center} ${center - 90} A 90 90 0 0 1 ${center + 45} ${center - 78}`}
                fill="hsl(var(--primary) / 0.05)"
                stroke="none"
                style={{ transformOrigin: `${center}px ${center}px` }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />

              {/* Data points */}
              {[
                { x: center + 30, y: center - 50, color: '#22c55e', size: 5, label: 'trust' },
                { x: center - 40, y: center - 30, color: '#6366f1', size: 4, label: 'vibe' },
                { x: center + 55, y: center + 20, color: '#f59e0b', size: 4, label: 'deeds' },
                { x: center - 20, y: center + 45, color: '#ef4444', size: 3, label: 'alert' },
              ].map((point, i) => (
                <g key={point.label}>
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r={point.size}
                    fill={point.color}
                    opacity={0.8}
                    animate={{ r: [point.size, point.size + 1.5, point.size], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  />
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r={point.size + 6}
                    fill="none"
                    stroke={point.color}
                    strokeWidth="0.5"
                    opacity={0.3}
                    animate={{ r: [point.size + 6, point.size + 12, point.size + 6], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  />
                </g>
              ))}
            </svg>

            {/* Center score */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.span
                  className="text-3xl font-bold text-foreground block"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                >
                  {trustScore}
                </motion.span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Trust Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics below radar */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { label: 'Community Vibe', value: `${communityVibe}%`, color: 'text-primary', dot: 'bg-primary' },
            { label: 'Good Deeds', value: goodDeeds, color: 'text-amber-400', dot: 'bg-amber-400' },
            { label: 'Trust Score', value: `${trustScore}/100`, color: 'text-emerald-400', dot: 'bg-emerald-400' },
            { label: 'Alerts', value: suspiciousAlerts, color: suspiciousAlerts > 2 ? 'text-red-400' : 'text-muted-foreground', dot: suspiciousAlerts > 2 ? 'bg-red-400' : 'bg-muted-foreground' },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20">
              <span className={cn('h-2 w-2 rounded-full', m.dot)} />
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className={cn('text-sm font-semibold', m.color)}>{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

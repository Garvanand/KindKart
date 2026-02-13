'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader } from '@/components/ui-kit';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Phone, MapPin, Users, Clock, CheckCircle2, Radio, Siren, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const responders = [
  { name: 'Dr. Rajesh Kumar', role: 'Medical', distance: '50m', status: 'online', avatar: 'RK' },
  { name: 'Officer Priya Das', role: 'Security', distance: '120m', status: 'online', avatar: 'PD' },
  { name: 'Vikram Singh', role: 'First Aid', distance: '200m', status: 'online', avatar: 'VS' },
  { name: 'Anita Reddy', role: 'Fire Safety', distance: '350m', status: 'away', avatar: 'AR' },
];

const timeline = [
  { time: '3 days ago', event: 'Gas leak reported - Block B', status: 'resolved', responders: 4 },
  { time: '1 week ago', event: 'Power outage - Sector 7', status: 'resolved', responders: 2 },
  { time: '2 weeks ago', event: 'Medical emergency - Block A', status: 'resolved', responders: 6 },
];

export default function SafetyPage() {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Safety Center"
          description="Emergency response & community safety"
          icon={<Shield className="h-6 w-6" />}
          actions={<Badge variant="success">All Clear</Badge>}
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Emergency Trigger */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PremiumCard className="p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
              <div className="relative">
                <motion.button
                  onClick={() => setIsEmergencyActive(!isEmergencyActive)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'h-32 w-32 rounded-full mx-auto flex items-center justify-center transition-all duration-300 mb-6',
                    isEmergencyActive
                      ? 'bg-red-500 shadow-[0_0_60px_rgba(239,68,68,0.5)]'
                      : 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-2 border-red-500/30 hover:border-red-500/60'
                  )}
                >
                  {isEmergencyActive ? (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                      <Siren className="h-12 w-12 text-white" />
                    </motion.div>
                  ) : (
                    <AlertTriangle className="h-12 w-12 text-red-400" />
                  )}
                </motion.button>
                <h2 className="text-xl font-bold mb-2">
                  {isEmergencyActive ? 'Emergency Alert Active' : 'Emergency Trigger'}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {isEmergencyActive
                    ? 'Alert sent to nearby responders. Help is on the way.'
                    : 'Press the button to alert nearby community responders.'}
                </p>
                {isEmergencyActive && (
                  <Button variant="outline" size="sm" onClick={() => setIsEmergencyActive(false)}>
                    Cancel Alert
                  </Button>
                )}
              </div>
            </PremiumCard>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Phone, label: 'Call Emergency', desc: 'Dial 112', color: 'text-red-400', bg: 'bg-red-500/10' },
              { icon: Heart, label: 'Safe Check-in', desc: 'Mark yourself safe', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: MapPin, label: 'Share Location', desc: 'With responders', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: Radio, label: 'Community Alert', desc: 'Broadcast message', color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map((action, i) => (
              <motion.div key={action.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                <PremiumCard interactive className="p-4 cursor-pointer">
                  <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center mb-3', action.bg)}>
                    <action.icon className={cn('h-5 w-5', action.color)} />
                  </div>
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </PremiumCard>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Nearby Responders */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <PremiumCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm">Nearby Responders</h3>
                  <Badge variant="primary" className="ml-auto">{responders.filter(r => r.status === 'online').length} Online</Badge>
                </div>
                <div className="space-y-3">
                  {responders.map((r, i) => (
                    <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">{r.avatar}</div>
                        <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card', r.status === 'online' ? 'bg-emerald-400' : 'bg-muted-foreground')} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.role} &middot; {r.distance} away</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">Contact</Button>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </motion.div>

            {/* Emergency Timeline */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <PremiumCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm">Emergency History</h3>
                </div>
                <div className="space-y-4">
                  {timeline.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        {i < timeline.length - 1 && <div className="w-px flex-1 bg-border/30 mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">{event.event}</p>
                        <p className="text-xs text-muted-foreground">{event.time} &middot; {event.responders} responders &middot; {event.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-4 rounded-xl bg-muted/20 text-center">
                  <p className="text-2xl font-bold text-emerald-400">0</p>
                  <p className="text-xs text-muted-foreground">Active incidents right now</p>
                </div>
              </PremiumCard>
            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

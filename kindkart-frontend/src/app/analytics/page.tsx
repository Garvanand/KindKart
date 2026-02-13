'use client';

import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader, StatCard } from '@/components/ui-kit';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Clock, CheckCircle2, DollarSign, Award, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const monthlyData = [
  { month: 'Sep', requests: 45, completed: 38, response: 3.2 },
  { month: 'Oct', requests: 62, completed: 55, response: 2.8 },
  { month: 'Nov', requests: 78, completed: 71, response: 2.5 },
  { month: 'Dec', requests: 54, completed: 48, response: 2.9 },
  { month: 'Jan', requests: 89, completed: 82, response: 2.1 },
  { month: 'Feb', requests: 34, completed: 29, response: 1.8 },
];

const topContributors = [
  { name: 'Raj Patel', tasks: 47, score: 4.9, karma: 1250 },
  { name: 'Priya Singh', tasks: 42, score: 4.8, karma: 1100 },
  { name: 'Dr. Kumar', tasks: 38, score: 5.0, karma: 980 },
  { name: 'Vikram Nair', tasks: 35, score: 4.7, karma: 920 },
  { name: 'Anjali Verma', tasks: 31, score: 4.9, karma: 850 },
];

export default function AnalyticsPage() {
  const maxRequests = Math.max(...monthlyData.map(d => d.requests));

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Community Analytics"
          description="Insights and metrics for your neighborhood"
          icon={<BarChart3 className="h-6 w-6" />}
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* KPI Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Success Rate', value: '94.2%', icon: <CheckCircle2 className="h-5 w-5" />, trend: { direction: 'up' as const, value: 3.1 }, color: 'success' as const },
              { label: 'Avg Response Time', value: '2.1h', icon: <Clock className="h-5 w-5" />, trend: { direction: 'up' as const, value: 12 }, color: 'info' as const },
              { label: 'Payment Trust', value: '98.5%', icon: <DollarSign className="h-5 w-5" />, trend: { direction: 'up' as const, value: 0.5 }, color: 'warning' as const },
              { label: 'Active Members', value: '547', icon: <Users className="h-5 w-5" />, trend: { direction: 'up' as const, value: 8 }, color: 'primary' as const },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <StatCard {...stat} />
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Request Success Rate Chart (CSS-based bars) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <PremiumCard className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-sm">Requests Overview</h3>
                    <p className="text-xs text-muted-foreground">Monthly request volume and completion</p>
                  </div>
                  <Badge variant="primary">Last 6 months</Badge>
                </div>
                <div className="flex items-end gap-3 h-40">
                  {monthlyData.map((d, i) => (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '100%', justifyContent: 'flex-end' }}>
                        <motion.div
                          className="w-full rounded-t-md bg-primary/20 relative"
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.requests / maxRequests) * 100}%` }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                        >
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 rounded-t-md bg-primary"
                            initial={{ height: 0 }}
                            animate={{ height: `${(d.completed / d.requests) * 100}%` }}
                            transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                          />
                        </motion.div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{d.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2 text-xs"><span className="h-2 w-2 rounded-full bg-primary" /> Completed</div>
                  <div className="flex items-center gap-2 text-xs"><span className="h-2 w-2 rounded-full bg-primary/20" /> Total</div>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Response Time Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <PremiumCard className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-sm">Response Time Trend</h3>
                    <p className="text-xs text-muted-foreground">Average time to first response</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-semibold">Improving</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {monthlyData.map((d, i) => (
                    <div key={d.month} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-8">{d.month}</span>
                      <div className="flex-1 h-6 bg-muted/20 rounded-lg overflow-hidden">
                        <motion.div
                          className="h-full rounded-lg bg-gradient-to-r from-primary/60 to-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.response / 4) * 100}%` }}
                          transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-10 text-right">{d.response}h</span>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </motion.div>
          </div>

          {/* Top Contributors + Payment Stats */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <PremiumCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-amber-400" />
                  <h3 className="font-semibold text-sm">Top Contributors</h3>
                </div>
                <div className="space-y-3">
                  {topContributors.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                      <span className={cn('h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold', i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-gray-400/20 text-gray-400' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-muted/40 text-muted-foreground')}>
                        #{i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.tasks} tasks &middot; {c.score}★</p>
                      </div>
                      <span className="text-xs font-semibold text-amber-400">{c.karma} karma</span>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <PremiumCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm">Community Sentiment</h3>
                  <Badge variant="ghost" className="ml-auto text-[10px]">AI Analysis</Badge>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-sm font-medium text-emerald-400 mb-1">Overall Positive</p>
                    <p className="text-xs text-muted-foreground">Community sentiment is strong. Members report high satisfaction with response times and helper quality.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Satisfaction', value: '92%', color: 'text-emerald-400' },
                      { label: 'Trust Index', value: '87%', color: 'text-primary' },
                      { label: 'Engagement', value: '78%', color: 'text-amber-400' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-3 rounded-lg bg-muted/20">
                        <p className={cn('text-lg font-bold', s.color)}>{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20">
                    <p className="text-xs text-muted-foreground"><strong className="text-foreground">Key insight:</strong> Response times improved 30% this month. Community challenges are driving 2x more engagement.</p>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

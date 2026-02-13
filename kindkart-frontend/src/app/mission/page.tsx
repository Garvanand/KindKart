'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader } from '@/components/ui-kit';
import { motion } from 'framer-motion';
import { Target, Clock, CheckCircle2, AlertTriangle, Users, Zap, Plus, ChevronRight, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BoardColumn = 'urgent' | 'upcoming' | 'active' | 'verified' | 'challenges';

const columns: { id: BoardColumn; label: string; icon: React.ElementType; color: string; dotColor: string }[] = [
  { id: 'urgent', label: 'Urgent Help', icon: AlertTriangle, color: 'text-red-400', dotColor: 'bg-red-400' },
  { id: 'upcoming', label: 'Upcoming Tasks', icon: Clock, color: 'text-amber-400', dotColor: 'bg-amber-400' },
  { id: 'active', label: 'Active Chats', icon: MessageCircle, color: 'text-blue-400', dotColor: 'bg-blue-400' },
  { id: 'verified', label: 'Verified Requests', icon: CheckCircle2, color: 'text-emerald-400', dotColor: 'bg-emerald-400' },
  { id: 'challenges', label: 'Trending Challenges', icon: Zap, color: 'text-violet-400', dotColor: 'bg-violet-400' },
];

const mockTasks: Record<BoardColumn, { id: string; title: string; user: string; time: string; priority?: string }[]> = {
  urgent: [
    { id: '1', title: 'Medical assistance needed - Block A', user: 'Dr. Kumar', time: '5 min ago', priority: 'critical' },
    { id: '2', title: 'Water pipe burst - immediate help', user: 'Mrs. Sharma', time: '12 min ago', priority: 'high' },
  ],
  upcoming: [
    { id: '3', title: 'Community garden cleanup', user: 'Green Team', time: 'Tomorrow 9AM' },
    { id: '4', title: 'Senior citizen grocery run', user: 'Helping Hands', time: 'Saturday 10AM' },
    { id: '5', title: 'Kids coding workshop setup', user: 'Tech Club', time: 'Next Monday' },
  ],
  active: [
    { id: '6', title: 'Plumbing fix discussion', user: 'Raj + Vikram', time: '2 messages' },
    { id: '7', title: 'Pet sitting coordination', user: 'Priya + Anjali', time: '5 messages' },
  ],
  verified: [
    { id: '8', title: 'WiFi router setup completed', user: 'Priya Singh', time: 'Verified 1h ago' },
    { id: '9', title: 'Piano lessons arranged', user: 'Anjali Verma', time: 'Verified 3h ago' },
    { id: '10', title: 'Tax filing help done', user: 'Vikram Nair', time: 'Verified yesterday' },
  ],
  challenges: [
    { id: '11', title: '7-Day Kindness Streak', user: '142 participants', time: '3 days left' },
    { id: '12', title: 'Help 5 Seniors This Week', user: '89 participants', time: '5 days left' },
  ],
};

export default function MissionPage() {
  const [selectedColumn, setSelectedColumn] = useState<BoardColumn>('urgent');

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Mission Board"
          description="Community tasks organized by priority and status"
          icon={<Target className="h-6 w-6" />}
          actions={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Mission</Button>}
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Mobile column selector */}
          <div className="flex gap-2 overflow-x-auto pb-4 lg:hidden scrollbar-thin">
            {columns.map(col => (
              <button
                key={col.id}
                onClick={() => setSelectedColumn(col.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                  selectedColumn === col.id ? 'bg-primary/15 text-primary' : 'bg-muted/30 text-muted-foreground'
                )}
              >
                <col.icon className="h-4 w-4" />
                {col.label}
                <span className="text-xs opacity-60">{mockTasks[col.id].length}</span>
              </button>
            ))}
          </div>

          {/* Desktop Kanban board */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-4">
            {columns.map((col, colIdx) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIdx * 0.08 }}
                className="space-y-3"
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-2 py-2">
                  <span className={cn('h-2 w-2 rounded-full', col.dotColor)} />
                  <span className={cn('text-sm font-semibold', col.color)}>{col.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{mockTasks[col.id].length}</span>
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  {mockTasks[col.id].map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: colIdx * 0.08 + i * 0.05 }}
                    >
                      <PremiumCard interactive className="p-3 cursor-pointer">
                        {task.priority === 'critical' && (
                          <div className="h-0.5 w-full bg-red-500 rounded-full mb-2" />
                        )}
                        <p className="text-sm font-medium mb-1.5 line-clamp-2">{task.title}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{task.user}</p>
                          <p className="text-[10px] text-muted-foreground/60">{task.time}</p>
                        </div>
                      </PremiumCard>
                    </motion.div>
                  ))}
                </div>

                {/* Add task */}
                <button className="w-full p-2 rounded-xl border border-dashed border-border/40 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors flex items-center justify-center gap-1.5">
                  <Plus className="h-3 w-3" /> Add task
                </button>
              </motion.div>
            ))}
          </div>

          {/* Mobile single column view */}
          <div className="lg:hidden space-y-3">
            {mockTasks[selectedColumn].map((task, i) => (
              <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <PremiumCard interactive className="p-4">
                  <p className="text-sm font-medium mb-1">{task.title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{task.user}</p>
                    <p className="text-xs text-muted-foreground/60">{task.time}</p>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

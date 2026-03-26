'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader, StatCard } from '@/components/ui-kit';
import { motion } from 'framer-motion';
import { Target, Clock, CheckCircle2, AlertTriangle, Plus, MessageCircle, Zap, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

type BoardColumn = 'urgent' | 'upcoming' | 'active' | 'verified' | 'challenges';

type MissionTask = {
  id: string;
  title: string;
  user: string;
  time: string;
  points: number;
  status: 'open' | 'started' | 'done';
  priority?: 'critical' | 'high';
};

const columns: { id: BoardColumn; label: string; icon: React.ElementType; color: string; dotColor: string }[] = [
  { id: 'urgent', label: 'Urgent Help', icon: AlertTriangle, color: 'text-red-400', dotColor: 'bg-red-400' },
  { id: 'upcoming', label: 'Upcoming Tasks', icon: Clock, color: 'text-amber-400', dotColor: 'bg-amber-400' },
  { id: 'active', label: 'Active Chats', icon: MessageCircle, color: 'text-blue-400', dotColor: 'bg-blue-400' },
  { id: 'verified', label: 'Verified Requests', icon: CheckCircle2, color: 'text-emerald-400', dotColor: 'bg-emerald-400' },
  { id: 'challenges', label: 'Trending Challenges', icon: Zap, color: 'text-green-600', dotColor: 'bg-green-600' },
];

const initialTasks: Record<BoardColumn, MissionTask[]> = {
  urgent: [
    { id: '1', title: 'Medical assistance needed - Block A', user: 'Dr. Kumar', time: '5 min ago', points: 80, status: 'open', priority: 'critical' },
    { id: '2', title: 'Water pipe burst - immediate help', user: 'Mrs. Sharma', time: '12 min ago', points: 60, status: 'open', priority: 'high' },
  ],
  upcoming: [
    { id: '3', title: 'Community garden cleanup', user: 'Green Team', time: 'Tomorrow 9AM', points: 30, status: 'open' },
    { id: '4', title: 'Senior citizen grocery run', user: 'Helping Hands', time: 'Saturday 10AM', points: 25, status: 'open' },
  ],
  active: [
    { id: '5', title: 'Plumbing fix discussion', user: 'Raj + Vikram', time: '2 messages', points: 15, status: 'started' },
    { id: '6', title: 'Pet sitting coordination', user: 'Priya + Anjali', time: '5 messages', points: 20, status: 'started' },
  ],
  verified: [
    { id: '7', title: 'WiFi router setup completed', user: 'Priya Singh', time: 'Verified 1h ago', points: 40, status: 'done' },
  ],
  challenges: [
    { id: '8', title: '7-Day Kindness Streak', user: '142 participants', time: '3 days left', points: 100, status: 'open' },
    { id: '9', title: 'Help 5 Seniors This Week', user: '89 participants', time: '5 days left', points: 120, status: 'open' },
  ],
};

export default function MissionPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [selectedColumn, setSelectedColumn] = useState<BoardColumn>('urgent');
  const [tasks, setTasks] = useState<Record<BoardColumn, MissionTask[]>>(initialTasks);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) router.push('/auth');
  }, [isAuthenticated, isHydrated, router, user]);

  const taskSummary = useMemo(() => {
    const allTasks = Object.values(tasks).flat();
    const open = allTasks.filter((task) => task.status === 'open').length;
    const started = allTasks.filter((task) => task.status === 'started').length;
    const done = allTasks.filter((task) => task.status === 'done').length;
    const points = allTasks.filter((task) => task.status === 'done').reduce((sum, task) => sum + task.points, 0);
    return { open, started, done, points };
  }, [tasks]);

  const updateTaskStatus = (taskId: string, nextStatus: MissionTask['status']) => {
    setTasks((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as BoardColumn[]).forEach((key) => {
        updated[key] = updated[key].map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task));
      });
      return updated;
    });
  };

  if (!isAuthenticated || !user) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Mission Board"
          description="Action center for neighborhood tasks"
          icon={<Target className="h-6 w-6" />}
          actions={
            <Button size="sm" className="gap-2" onClick={() => router.push('/requests/create')}>
              <Plus className="h-4 w-4" /> New Mission
            </Button>
          }
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Open Tasks', value: String(taskSummary.open), icon: <AlertTriangle className="h-5 w-5" />, color: 'warning' as const },
              { label: 'In Progress', value: String(taskSummary.started), icon: <PlayCircle className="h-5 w-5" />, color: 'info' as const },
              { label: 'Completed', value: String(taskSummary.done), icon: <CheckCircle2 className="h-5 w-5" />, color: 'success' as const },
              { label: 'Earned Points', value: String(taskSummary.points), icon: <Zap className="h-5 w-5" />, color: 'primary' as const },
            ].map((item) => (
              <StatCard key={item.label} {...item} />
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 lg:hidden scrollbar-thin">
            {columns.map((col) => (
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
                <span className="text-xs opacity-60">{tasks[col.id].length}</span>
              </button>
            ))}
          </div>

          <div className="hidden lg:grid lg:grid-cols-5 gap-4">
            {columns.map((col, colIdx) => (
              <motion.div key={col.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: colIdx * 0.07 }} className="space-y-3">
                <div className="flex items-center gap-2 px-2 py-2">
                  <span className={cn('h-2 w-2 rounded-full', col.dotColor)} />
                  <span className={cn('text-sm font-semibold', col.color)}>{col.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{tasks[col.id].length}</span>
                </div>

                <div className="space-y-2">
                  {tasks[col.id].map((task) => (
                    <PremiumCard key={task.id} interactive className="p-3">
                      {task.priority === 'critical' && <div className="h-0.5 w-full bg-red-500 rounded-full mb-2" />}
                      <p className="text-sm font-medium mb-1.5 line-clamp-2">{task.title}</p>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">{task.user}</p>
                        <p className="text-[10px] text-muted-foreground/70">{task.time}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={task.status === 'done' ? 'success' : task.status === 'started' ? 'info' : 'ghost'}>
                          {task.status}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {task.status !== 'started' && task.status !== 'done' && (
                            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => updateTaskStatus(task.id, 'started')}>
                              Start
                            </Button>
                          )}
                          {task.status !== 'done' && (
                            <Button size="sm" className="h-7 text-[11px]" onClick={() => updateTaskStatus(task.id, 'done')}>
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </PremiumCard>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:hidden space-y-3">
            {tasks[selectedColumn].map((task, i) => (
              <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <PremiumCard interactive className="p-4">
                  <p className="text-sm font-medium mb-1">{task.title}</p>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{task.user}</p>
                    <Badge variant={task.status === 'done' ? 'success' : task.status === 'started' ? 'info' : 'ghost'}>{task.status}</Badge>
                  </div>
                  <div className="flex gap-2">
                    {task.status !== 'started' && task.status !== 'done' && (
                      <Button size="sm" variant="outline" className="h-8" onClick={() => updateTaskStatus(task.id, 'started')}>Start</Button>
                    )}
                    {task.status !== 'done' && (
                      <Button size="sm" className="h-8" onClick={() => updateTaskStatus(task.id, 'done')}>Complete</Button>
                    )}
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

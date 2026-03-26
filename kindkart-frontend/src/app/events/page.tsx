'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader } from '@/components/ui-kit';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: 'Community' | 'Safety' | 'Education' | 'Health' | 'Social';
  color: string;
}

const mockEvents: EventItem[] = [
  { id: '1', title: 'Community Garden Cleanup', date: '2026-02-15', time: '9:00 AM', location: 'Central Garden', attendees: 24, category: 'Community', color: 'bg-emerald-500/15 text-emerald-400' },
  { id: '2', title: 'Neighborhood Safety Workshop', date: '2026-02-18', time: '6:00 PM', location: 'Community Hall', attendees: 45, category: 'Safety', color: 'bg-red-500/15 text-red-400' },
  { id: '3', title: 'Kids Coding Bootcamp', date: '2026-02-20', time: '10:00 AM', location: 'Block A Study Room', attendees: 15, category: 'Education', color: 'bg-blue-500/15 text-blue-400' },
  { id: '4', title: 'Senior Citizens Yoga', date: '2026-02-22', time: '7:00 AM', location: 'Rooftop Garden', attendees: 18, category: 'Health', color: 'bg-emerald-500/15 text-emerald-500' },
  { id: '5', title: 'Monthly Community Potluck', date: '2026-02-25', time: '12:00 PM', location: 'Common Area', attendees: 67, category: 'Social', color: 'bg-amber-500/15 text-amber-400' },
];

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function EventsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [rsvpd, setRsvpd] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [calendarDate, setCalendarDate] = useState(() => new Date(2026, 1, 1));

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) router.push('/auth');
  }, [isAuthenticated, isHydrated, router, user]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'All') return mockEvents;
    return mockEvents.filter((event) => event.category === selectedCategory);
  }, [selectedCategory]);

  const eventDays = useMemo(() => {
    const month = calendarDate.getMonth();
    const year = calendarDate.getFullYear();
    return filteredEvents
      .map((event) => new Date(event.date))
      .filter((date) => date.getMonth() === month && date.getFullYear() === year)
      .map((date) => date.getDate());
  }, [calendarDate, filteredEvents]);

  const monthTitle = calendarDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const firstDay = (new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() + 6) % 7;

  const toggleRsvp = (id: string) => {
    setRsvpd((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const shiftMonth = (offset: number) => {
    setCalendarDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  if (!isAuthenticated || !user) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Community Events"
          description="Plan, discover, and RSVP to neighborhood activities"
          icon={<Calendar className="h-6 w-6" />}
          actions={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Create Event</Button>}
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            {['All', 'Community', 'Safety', 'Education', 'Health', 'Social'].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
              <PremiumCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{monthTitle}</h3>
                  <div className="flex gap-1">
                    <button className="h-7 w-7 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-muted/60 transition-colors" onClick={() => shiftMonth(-1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button className="h-7 w-7 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-muted/60 transition-colors" onClick={() => shiftMonth(1)}>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {dayLabels.map((label) => (
                    <div key={label} className="text-center text-[10px] text-muted-foreground font-medium py-1">{label}</div>
                  ))}
                  {Array.from({ length: firstDay }).map((_, index) => (
                    <div key={`offset-${index}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => (
                    <button
                      key={day}
                      className={cn(
                        'h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors relative',
                        day === new Date().getDate() ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/40',
                        eventDays.includes(day) && day !== new Date().getDate() && 'text-primary'
                      )}
                    >
                      {day}
                      {eventDays.includes(day) && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-sm font-semibold mb-2">{filteredEvents.length} upcoming events</p>
                  <p className="text-xs text-muted-foreground">You&apos;ve RSVP&apos;d to {rsvpd.size} events</p>
                </div>
              </PremiumCard>
            </motion.div>

            <div className="lg:col-span-2 space-y-4">
              {filteredEvents.map((event, index) => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
                  <PremiumCard interactive className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-center">
                        <div className="h-14 w-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                          <span className="text-lg font-bold text-primary">{new Date(event.date).getDate()}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(event.date).toLocaleDateString([], { month: 'short' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold truncate">{event.title}</h3>
                          <Badge variant="ghost" className={cn('text-[10px] flex-shrink-0', event.color)}>{event.category}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {event.attendees + (rsvpd.has(event.id) ? 1 : 0)} attending</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={rsvpd.has(event.id) ? 'default' : 'outline'}
                            onClick={() => toggleRsvp(event.id)}
                            className="text-xs"
                          >
                            {rsvpd.has(event.id) ? '✓ RSVP\'d' : 'RSVP'}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs">View Details</Button>
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

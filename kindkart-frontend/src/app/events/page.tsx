'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader } from '@/components/ui-kit';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Plus, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mockEvents = [
  { id: '1', title: 'Community Garden Cleanup', date: 'Feb 15, 2026', time: '9:00 AM', location: 'Central Garden', attendees: 24, category: 'Community', color: 'bg-emerald-500/15 text-emerald-400' },
  { id: '2', title: 'Neighborhood Safety Workshop', date: 'Feb 18, 2026', time: '6:00 PM', location: 'Community Hall', attendees: 45, category: 'Safety', color: 'bg-red-500/15 text-red-400' },
  { id: '3', title: 'Kids Coding Bootcamp', date: 'Feb 20, 2026', time: '10:00 AM', location: 'Block A Study Room', attendees: 15, category: 'Education', color: 'bg-blue-500/15 text-blue-400' },
  { id: '4', title: 'Senior Citizens Yoga', date: 'Feb 22, 2026', time: '7:00 AM', location: 'Rooftop Garden', attendees: 18, category: 'Health', color: 'bg-violet-500/15 text-violet-400' },
  { id: '5', title: 'Monthly Community Potluck', date: 'Feb 25, 2026', time: '12:00 PM', location: 'Common Area', attendees: 67, category: 'Social', color: 'bg-amber-500/15 text-amber-400' },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const calendarDays = Array.from({ length: 28 }, (_, i) => i + 1);
const eventDays = [3, 6, 8, 12, 15, 18, 20, 22, 25];

export default function EventsPage() {
  const [rsvpd, setRsvpd] = useState<Set<string>>(new Set());

  const toggleRsvp = (id: string) => {
    setRsvpd(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Community Events"
          description="Stay connected with upcoming gatherings and activities"
          icon={<Calendar className="h-6 w-6" />}
          actions={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Create Event</Button>}
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Calendar Widget */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
              <PremiumCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">February 2026</h3>
                  <div className="flex gap-1">
                    <button className="h-7 w-7 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-muted/60 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                    <button className="h-7 w-7 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-muted/60 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map(d => (
                    <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
                  ))}
                  {/* Empty cells for offset (Feb 2026 starts on Sunday => 6 empty) */}
                  {Array.from({ length: 6 }).map((_, i) => <div key={`e${i}`} />)}
                  {calendarDays.map(day => (
                    <button
                      key={day}
                      className={cn(
                        'h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors relative',
                        day === 13 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/40',
                        eventDays.includes(day) && day !== 13 && 'text-primary'
                      )}
                    >
                      {day}
                      {eventDays.includes(day) && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-sm font-semibold mb-2">{mockEvents.length} upcoming events</p>
                  <p className="text-xs text-muted-foreground">You&apos;ve RSVP&apos;d to {rsvpd.size} events</p>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Events List */}
            <div className="lg:col-span-2 space-y-4">
              {mockEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <PremiumCard interactive className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-center">
                        <div className="h-14 w-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                          <span className="text-lg font-bold text-primary">{event.date.split(' ')[1].replace(',', '')}</span>
                          <span className="text-[10px] text-muted-foreground">{event.date.split(' ')[0]}</span>
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
                        <Button
                          size="sm"
                          variant={rsvpd.has(event.id) ? 'default' : 'outline'}
                          onClick={() => toggleRsvp(event.id)}
                          className="text-xs"
                        >
                          {rsvpd.has(event.id) ? '✓ RSVP\'d' : 'RSVP'}
                        </Button>
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

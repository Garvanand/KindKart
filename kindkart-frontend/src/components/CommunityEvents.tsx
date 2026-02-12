'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Plus, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  attendees: number;
  maxAttendees?: number;
  category: 'social' | 'volunteer' | 'meeting' | 'workshop';
}

export function CommunityEvents({ communityId }: { communityId: string }) {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Community Cleanup Day',
      description: 'Join us for a neighborhood cleanup event. We\'ll provide supplies and refreshments.',
      date: '2025-12-01',
      time: '10:00 AM',
      location: 'Community Park',
      attendees: 15,
      maxAttendees: 30,
      category: 'volunteer',
    },
    {
      id: '2',
      title: 'Monthly Community Meeting',
      description: 'Discuss community matters, upcoming events, and share ideas.',
      date: '2025-11-28',
      time: '7:00 PM',
      location: 'Community Center',
      attendees: 8,
      category: 'meeting',
    },
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const categoryColors = {
    social: 'bg-pink-100 text-pink-800',
    volunteer: 'bg-green-100 text-green-800',
    meeting: 'bg-blue-100 text-blue-800',
    workshop: 'bg-purple-100 text-purple-800',
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Community Events
            </CardTitle>
            <CardDescription>Upcoming events and activities</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showCreateForm && (
          <Card className="mb-4 border-2 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Event creation feature coming soon! For now, contact your community admin to add events.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events</p>
              <p className="text-sm mt-2">Create an event to bring the community together!</p>
            </div>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{event.title}</h4>
                        <Badge className={categoryColors[event.category]}>
                          {event.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {event.date} at {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          {event.attendees} {event.maxAttendees ? `of ${event.maxAttendees}` : ''} attending
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4">
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}


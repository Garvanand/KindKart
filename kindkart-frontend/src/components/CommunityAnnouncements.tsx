'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Megaphone, Plus, Pin, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
  pinned: boolean;
}

export function CommunityAnnouncements({ communityId }: { communityId: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Welcome to Our Community!',
      content: 'We\'re excited to have you here. Please read the community guidelines and feel free to reach out if you need anything.',
      author: {
        name: 'Community Admin',
        role: 'admin',
      },
      createdAt: '2025-11-20',
      priority: 'high',
      pinned: true,
    },
    {
      id: '2',
      title: 'Upcoming Maintenance',
      content: 'Scheduled maintenance for community facilities will take place next week. Please plan accordingly.',
      author: {
        name: 'John Doe',
        role: 'admin',
      },
      createdAt: '2025-11-22',
      priority: 'medium',
      pinned: false,
    },
  ]);

  const priorityIcons = {
    high: AlertCircle,
    medium: Info,
    low: CheckCircle,
  };

  const priorityColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-blue-600',
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              Announcements
            </CardTitle>
            <CardDescription>Important updates and news</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAnnouncements.map((announcement) => {
            const PriorityIcon = priorityIcons[announcement.priority];
            return (
              <Card key={announcement.id} className={announcement.pinned ? 'border-2 border-yellow-400' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={announcement.author.avatar} />
                      <AvatarFallback>{announcement.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.pinned && (
                          <Pin className="w-4 h-4 text-yellow-600" />
                        )}
                        <h4 className="font-semibold">{announcement.title}</h4>
                        <PriorityIcon className={`w-4 h-4 ${priorityColors[announcement.priority]}`} />
                        <Badge variant="outline" className="ml-auto">
                          {announcement.author.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                      <p className="text-xs text-gray-400">
                        {announcement.author.name} • {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


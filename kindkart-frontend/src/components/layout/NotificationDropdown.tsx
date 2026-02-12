'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck, HelpCircle, MessageCircle, Wallet, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface NotificationItem {
  id: string;
  type: 'request' | 'payment' | 'message' | 'announcement' | 'event' | 'emergency' | 'dispute';
  title: string;
  body?: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

const typeConfig: Record<NotificationItem['type'], { icon: React.ElementType; label: string }> = {
  request: { icon: HelpCircle, label: 'Request' },
  payment: { icon: Wallet, label: 'Payment' },
  message: { icon: MessageCircle, label: 'Message' },
  announcement: { icon: Bell, label: 'Announcement' },
  event: { icon: Bell, label: 'Event' },
  emergency: { icon: AlertTriangle, label: 'Emergency' },
  dispute: { icon: AlertTriangle, label: 'Dispute' },
};

interface NotificationDropdownProps {
  notifications?: NotificationItem[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  className?: string;
}

const defaultNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'request',
    title: 'Your help request was accepted',
    body: 'John offered to help with groceries.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    link: '/communities/1/requests/1',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment released',
    body: '₹500 was released to the helper.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '3',
    type: 'message',
    title: 'New message',
    body: 'You have a new message in your chat.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

export function NotificationDropdown({
  notifications = defaultNotifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllRead,
  onNotificationClick,
  className,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const count = unreadCount ?? notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <DropdownMenuLabel className="p-0 text-base font-semibold">
            Notifications
          </DropdownMenuLabel>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                onMarkAllRead?.();
                setOpen(false);
              }}
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Bell className="mb-2 h-10 w-10 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex cursor-pointer flex-col items-start gap-0.5 px-4 py-3 focus:bg-accent',
                    !notification.read && 'bg-primary/5'
                  )}
                  onClick={() => {
                    onNotificationClick?.(notification);
                    onMarkAsRead?.(notification.id);
                    if (notification.link) setOpen(false);
                  }}
                >
                  <div className="flex w-full items-start gap-3">
                    <div className="mt-0.5 rounded-md bg-muted p-1.5">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm', !notification.read && 'font-medium')}>
                        {notification.title}
                      </p>
                      {notification.body && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {notification.body}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

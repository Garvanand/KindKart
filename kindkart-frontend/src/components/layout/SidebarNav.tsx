'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  HelpCircle,
  MessageCircle,
  Wallet,
  Award,
  Calendar,
  Megaphone,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/reputation', label: 'Reputation', icon: Award },
];

const secondaryNavItems = [
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/emergency', label: 'Emergency', icon: AlertTriangle },
];

interface SidebarNavProps {
  communityId?: string | null;
  className?: string;
  collapsed?: boolean;
}

export function SidebarNav({ communityId, className, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex h-full w-56 flex-col border-r bg-card',
        className
      )}
    >
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">KindKart</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-auto p-2">
        <div className="space-y-0.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {communityId && (
          <>
            <div className="my-2 h-px bg-border" />
            <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Community
            </p>
            <Link
              href={`/communities/${communityId}`}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === `/communities/${communityId}`
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Users className="h-4 w-4 shrink-0" />
              Community
            </Link>
            <Link
              href={`/communities/${communityId}/requests`}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith(`/communities/${communityId}/requests`)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              Requests
            </Link>
          </>
        )}

        <div className="my-2 h-px bg-border" />
        <div className="space-y-0.5">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

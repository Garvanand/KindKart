'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, HelpCircle, MessageCircle, Wallet, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard', label: 'Requests', icon: HelpCircle }, // From dashboard user goes to community -> requests
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/reputation', label: 'Profile', icon: Award },
];

export function MobileTabNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-14 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5px]')} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

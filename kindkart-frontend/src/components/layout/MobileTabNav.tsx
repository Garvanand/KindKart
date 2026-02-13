'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, HelpCircle, MessageCircle, Wallet, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const tabs = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/requests', label: 'Requests', icon: HelpCircle },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 glass-strong md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5px]')} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

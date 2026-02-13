'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  HelpCircle,
  MessageCircle,
  Wallet,
  Award,
  Calendar,
  AlertTriangle,
  Target,
  ShoppingBag,
  BarChart3,
  Shield,
  Users,
  Compass,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const mainNavItems = [
  { href: '/dashboard', label: 'Mission Control', icon: LayoutDashboard, badge: null },
  { href: '/requests', label: 'Requests', icon: HelpCircle, badge: null },
  { href: '/mission', label: 'Mission Board', icon: Target, badge: 'NEW' },
  { href: '/chat', label: 'Chat', icon: MessageCircle, badge: null },
  { href: '/wallet', label: 'Wallet', icon: Wallet, badge: null },
  { href: '/reputation', label: 'Reputation', icon: Award, badge: null },
];

const secondaryNavItems = [
  { href: '/karma-shop', label: 'Karma Shop', icon: ShoppingBag, badge: null },
  { href: '/events', label: 'Events', icon: Calendar, badge: null },
  { href: '/safety', label: 'Safety Center', icon: Shield, badge: null },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, badge: null },
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

  const NavItem = ({ item, index }: { item: typeof mainNavItems[0]; index: number }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        <Link
          href={item.href}
          className={cn(
            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 relative',
            active
              ? 'bg-primary/12 text-primary shadow-glow-sm'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          )}
          title={collapsed ? item.label : undefined}
        >
          {active && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-colors', active && 'text-primary')} />
          {!collapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-primary/20 text-primary">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Link>
      </motion.div>
    );
  };

  return (
    <aside className={cn('flex h-full flex-col', className)}>
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center px-4 mb-2">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg gradient-neon flex-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground tracking-tight">KindKart</span>
              <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">Neighborhood OS</span>
            </div>
          )}
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-0.5 overflow-auto px-3 scrollbar-thin">
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-3 py-2 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
              Main
            </p>
          )}
          {mainNavItems.map((item, idx) => (
            <NavItem key={item.href} item={item} index={idx} />
          ))}
        </div>

        {/* Community section */}
        {communityId && (
          <div className="mt-4">
            <div className="my-2 h-px bg-border/50" />
            {!collapsed && (
              <p className="px-3 py-2 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                Community
              </p>
            )}
            <NavItem
              item={{ href: `/communities/${communityId}`, label: 'Hub', icon: Users, badge: null }}
              index={0}
            />
            <NavItem
              item={{ href: `/communities/${communityId}/requests`, label: 'Requests', icon: HelpCircle, badge: null }}
              index={1}
            />
          </div>
        )}

        {/* Secondary nav */}
        <div className="mt-4">
          <div className="my-2 h-px bg-border/50" />
          {!collapsed && (
            <p className="px-3 py-2 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
              Explore
            </p>
          )}
          {secondaryNavItems.map((item, idx) => (
            <NavItem key={item.href} item={item} index={idx + mainNavItems.length} />
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="p-3 mt-auto">
          <Link
            href="/onboarding"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 text-foreground hover:border-primary/40 transition-all group"
          >
            <Compass className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-xs font-semibold">Get Started</p>
              <p className="text-[10px] text-muted-foreground">Setup your profile</p>
            </div>
            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>
      )}
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  HelpCircle,
  MessageCircle,
  Wallet,
  Award,
  Calendar,
  AlertTriangle,
  ShoppingBag,
  BarChart3,
  Shield,
  Users,
  Newspaper,
  Handshake,
  Settings,
  LifeBuoy,
  UserPlus,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const mainNavItems = [
  { href: '/dashboard', label: 'Home', icon: Home, badge: null },
  { href: '/communities', label: 'Groups', icon: Users, badge: null },
  { href: '/events', label: 'Events', icon: Calendar, badge: null },
  { href: '/requests', label: 'Requests', icon: HelpCircle, badge: null },
  { href: '/chat', label: 'Chat', icon: MessageCircle, badge: null },
  { href: '/safety', label: 'Alerts', icon: AlertTriangle, badge: null },
  { href: '/karma-shop', label: 'For Sale & Free', icon: ShoppingBag, badge: null },
  { href: '/analytics', label: 'Local Insights', icon: Newspaper, badge: null },
  { href: '/mission', label: 'Tasks', icon: Handshake, badge: null },
];

const secondaryNavItems = [
  { href: '/wallet', label: 'Wallet', icon: Wallet, badge: null },
  { href: '/reputation', label: 'Profile', icon: Award, badge: null },
  { href: '/onboarding', label: 'Settings', icon: Settings, badge: null },
  { href: '/communities/join', label: 'Invite neighbors', icon: UserPlus, badge: null },
  { href: '/safety', label: 'Safety Center', icon: Shield, badge: null },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, badge: null },
  { href: '/help-center', label: 'Help Center', icon: LifeBuoy, badge: null },
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
            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all duration-200 relative',
            active
              ? 'bg-[#ebf4ec] text-[#1f8a4d]'
              : 'text-[#304235] hover:bg-[#eff3ed] hover:text-[#223228]'
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
          <Icon className={cn('h-[19px] w-[19px] shrink-0 transition-colors', active && 'text-[#1f8a4d]')} />
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
      <div className="h-2" />

      {/* Main nav */}
      <nav className="flex-1 space-y-0.5 overflow-auto px-3 scrollbar-thin">
        {!collapsed && (
          <div className="px-1 pb-3">
            <Button
              className="h-11 w-full rounded-full bg-[#1f8a4d] text-white hover:bg-[#176f3d]"
              onClick={() => (window.location.href = '/requests/create')}
            >
              <Plus className="h-4 w-4 mr-2" /> Post
            </Button>
          </div>
        )}

        <div className="space-y-0.5">
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
          {secondaryNavItems.map((item, idx) => (
            <NavItem key={item.href} item={item} index={idx + mainNavItems.length} />
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="p-3 mt-auto space-y-1 text-[14px] text-[#304235]">
          <Link href="/onboarding" className="block rounded-lg px-3 py-2 hover:bg-[#eff3ed]">Settings</Link>
          <Link href="/help-center" className="block rounded-lg px-3 py-2 hover:bg-[#eff3ed]">Help Center</Link>
          <Link href="/communities/join" className="block rounded-lg px-3 py-2 hover:bg-[#eff3ed]">Invite neighbors</Link>
        </div>
      )}
    </aside>
  );
}

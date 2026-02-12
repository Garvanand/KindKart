'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { SidebarNav } from './SidebarNav';
import { MobileTabNav } from './MobileTabNav';
import { GlobalSearchModal } from './GlobalSearchModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
  /** Optional community ID to show community-specific sidebar links */
  communityId?: string | null;
  /** Hide sidebar (e.g. on auth page) */
  hideSidebar?: boolean;
  /** Extra class for main content area */
  contentClassName?: string;
}

export function AppShell({
  children,
  communityId = null,
  hideSidebar = false,
  contentClassName,
}: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Extract community ID from pathname when inside /communities/[id]/...
  const resolvedCommunityId =
    communityId ??
    (pathname.match(/^\/communities\/([^/]+)/)?.[1] ?? null);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AppHeader
        onMenuClick={() => setSidebarOpen((o) => !o)}
        showSearch={!hideSidebar}
        onSearchOpen={() => setSearchOpen(true)}
      />

      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      <div className="flex flex-1">
        {/* Desktop sidebar - hidden on mobile with smooth animation */}
        {!hideSidebar && (
          <>
            {/* Sidebar backdrop for mobile */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                  aria-hidden
                />
              )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <motion.div
              className={cn(
                'fixed inset-y-0 left-0 z-50 border-r bg-card transition-all duration-300 ease-out hidden lg:flex flex-col',
                'pt-16',
                sidebarCollapsed ? 'w-20' : 'w-56'
              )}
              initial={{ x: 0 }}
              animate={{ x: 0 }}
            >
              <SidebarNav
                communityId={resolvedCommunityId}
                className={cn('flex-1 overflow-y-auto scrollbar-thin', sidebarCollapsed && 'hidden')}
                collapsed={sidebarCollapsed}
              />
              {/* Collapse button */}
              <div className="border-t p-2 flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-9 w-9"
                  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <motion.div
                    animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.div>
                </Button>
              </div>
            </motion.div>

            {/* Mobile sidebar with slide animation */}
            <AnimatePresence>
              <motion.div
                className={cn(
                  'fixed inset-y-0 left-0 z-50 w-56 border-r bg-card lg:hidden',
                  'pt-16'
                )}
                initial={{ x: -224 }}
                animate={{ x: sidebarOpen ? 0 : -224 }}
                exit={{ x: -224 }}
                transition={{ duration: 0.3, ease: "smooth-bounce" }}
              >
                <SidebarNav
                  communityId={resolvedCommunityId}
                  className="h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin"
                />
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {/* Main content - offset when sidebar is visible */}
        <main
          className={cn(
            'flex-1 flex flex-col min-h-[calc(100vh-4rem)]',
            !hideSidebar && (sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-56'),
            contentClassName
          )}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile bottom tabs - only when sidebar layout is used */}
      {!hideSidebar && <MobileTabNav />}

      {/* Spacer for mobile bottom nav so content isn't hidden behind it */}
      {!hideSidebar && <div className="h-16 md:hidden" />}
    </div>
  );
}

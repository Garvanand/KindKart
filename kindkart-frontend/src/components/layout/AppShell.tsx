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
import { PanelLeftClose, PanelLeft } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  communityId?: string | null;
  hideSidebar?: boolean;
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

  const resolvedCommunityId =
    communityId ??
    (pathname.match(/^\/communities\/([^/]+)/)?.[1] ?? null);

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
        {!hideSidebar && (
          <>
            {/* Mobile backdrop */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                  aria-hidden
                />
              )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <div
              className={cn(
                'fixed inset-y-0 left-0 z-50 border-r border-border/50 transition-all duration-300 ease-out hidden lg:flex flex-col',
                'pt-16 bg-card/95 backdrop-blur-xl',
                sidebarCollapsed ? 'w-[72px]' : 'w-60'
              )}
            >
              <SidebarNav
                communityId={resolvedCommunityId}
                className="flex-1 overflow-y-auto scrollbar-thin"
                collapsed={sidebarCollapsed}
              />
              <div className="border-t border-border/50 p-2 flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {sidebarCollapsed ? (
                    <PanelLeft className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile sidebar */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  className="fixed inset-y-0 left-0 z-50 w-60 border-r border-border/50 bg-card/95 backdrop-blur-xl lg:hidden pt-16"
                  initial={{ x: -240 }}
                  animate={{ x: 0 }}
                  exit={{ x: -240 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <SidebarNav
                    communityId={resolvedCommunityId}
                    className="h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Main content */}
        <main
          className={cn(
            'flex-1 flex flex-col min-h-[calc(100vh-4rem)]',
            !hideSidebar && (sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-60'),
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

      {!hideSidebar && <MobileTabNav />}
      {!hideSidebar && <div className="h-16 md:hidden" />}
    </div>
  );
}

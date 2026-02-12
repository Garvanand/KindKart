'use client';

import { useState, useEffect } from 'react';
import { Search, Menu, Plus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileDropdown } from './ProfileDropdown';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
  onSearchOpen?: () => void;
  className?: string;
}

export function AppHeader({ onMenuClick, showSearch = true, onSearchOpen, className }: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for search - Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onSearchOpen?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 sm:gap-6 sm:px-6',
        isScrolled && 'shadow-sm border-border/80',
        className
      )}
    >
      {/* Mobile menu button - only visible on small screens when sidebar is hidden */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Global search - enhanced with keyboard shortcut hint */}
      {showSearch && (
        <div className="hidden flex-1 md:flex md:max-w-sm lg:max-w-md xl:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search (Ctrl+K)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={onSearchOpen}
              readOnly
              className="h-9 w-full pl-9 pr-4 cursor-pointer bg-secondary hover:bg-muted transition-colors"
              aria-label="Search"
            />
          </div>
        </div>
      )}

      {/* Mobile search button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-9 w-9"
        onClick={onSearchOpen}
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Spacer for flex layout */}
      <div className="flex-1" />

      {/* Quick create button - visible on md+ */}
      <Button
        size="sm"
        className="hidden sm:flex gap-2 h-9"
        variant="default"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden md:inline">Create</span>
      </Button>

      {/* Right side actions */}
      <div className="flex items-center gap-1 md:gap-2">
        <ThemeSwitcher />
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
}


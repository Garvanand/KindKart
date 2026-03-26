'use client';

import { useState, useEffect } from 'react';
import { Search, Menu, Plus, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileDropdown } from './ProfileDropdown';
import { GuestBadge } from '@/components/guest/GuestMode';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
  onSearchOpen?: () => void;
  className?: string;
}

export function AppHeader({ onMenuClick, showSearch = true, onSearchOpen, className }: AppHeaderProps) {
  const router = useRouter();
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
        'sticky top-0 z-40 border-b border-[#dfe5dd] bg-[#f4f6f3] transition-all duration-300',
        isScrolled && 'shadow-sm border-border/80',
        className
      )}
    >
      <div className="mx-auto flex h-[66px] w-full max-w-[1500px] items-center gap-3 px-3 sm:px-5">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <button onClick={() => router.push('/dashboard')} className="hidden items-center gap-2.5 text-[#1f8a4d] lg:flex">
          <Home className="h-4 w-4 fill-current" />
          <span className="text-[2rem] font-semibold tracking-tight [font-family:var(--font-lora,inherit)]">kindkart</span>
        </button>

        {showSearch && (
          <div className="hidden flex-1 justify-center md:flex">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647065] pointer-events-none" />
              <Input
                type="search"
                placeholder="Search people, requests, services (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={onSearchOpen}
                readOnly
                className="h-11 w-full rounded-full border-[#cfd8cf] bg-white pl-11 pr-4 text-[15px] text-[#25382e] cursor-pointer shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                aria-label="Search"
              />
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={onSearchOpen}
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>

        <div className="flex-1 md:hidden" />

        <Button
          size="sm"
          className="hidden sm:flex gap-2 h-10 rounded-full bg-[#1f8a4d] hover:bg-[#176f3d] px-5"
          variant="default"
          onClick={() => router.push('/requests/create')}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Post</span>
        </Button>

        {/* Right side actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <GuestBadge className="mr-1" />
          <NotificationDropdown />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}


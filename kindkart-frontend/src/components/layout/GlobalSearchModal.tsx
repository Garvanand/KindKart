'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, MessageSquare, Calendar, Megaphone, HelpCircle, Loader2, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: 'request' | 'member' | 'chat' | 'event' | 'announcement';
  icon: React.ReactNode;
  href: string;
  metadata?: string;
}

// Mock search results - in production, this would be an API call
const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Help with Home Painting',
    description: 'Professional painter needed for 2 BHK apartment',
    category: 'request',
    icon: <HelpCircle className="h-4 w-4" />,
    href: '/requests/1',
    metadata: '₹500 • Urgent',
  },
  {
    id: '2',
    title: 'John Doe',
    description: 'Trusted helper • 4.8 rating',
    category: 'member',
    icon: <Users className="h-4 w-4" />,
    href: '/community/members/john-doe',
    metadata: '156 reputation',
  },
  {
    id: '3',
    title: 'Community Chat #general',
    description: 'Main community discussion channel',
    category: 'chat',
    icon: <MessageSquare className="h-4 w-4" />,
    href: '/chat/general',
    metadata: '2.5K members',
  },
  {
    id: '4',
    title: 'Annual Fest 2025',
    description: 'Society annual celebration event',
    category: 'event',
    icon: <Calendar className="h-4 w-4" />,
    href: '/events/fest-2025',
    metadata: 'Feb 28',
  },
  {
    id: '5',
    title: 'New Security Guidelines',
    description: 'Updated safety protocols for the community',
    category: 'announcement',
    icon: <Megaphone className="h-4 w-4" />,
    href: '/announcements/security-2025',
    metadata: '2 hours ago',
  },
];

const categoryConfig = {
  request: { label: 'Requests', color: 'text-blue-500' },
  member: { label: 'Members', color: 'text-purple-500' },
  chat: { label: 'Chats', color: 'text-green-500' },
  event: { label: 'Events', color: 'text-orange-500' },
  announcement: { label: 'Announcements', color: 'text-pink-500' },
};

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter and group results
  const groupedResults = useMemo(() => {
    const filtered = mockResults.filter(
      (result) =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description?.toLowerCase().includes(query.toLowerCase())
    );

    const grouped = {
      request: filtered.filter((r) => r.category === 'request'),
      member: filtered.filter((r) => r.category === 'member'),
      chat: filtered.filter((r) => r.category === 'chat'),
      event: filtered.filter((r) => r.category === 'event'),
      announcement: filtered.filter((r) => r.category === 'announcement'),
    };

    return grouped;
  }, [query]);

  const allResults = useMemo(() => {
    return Object.values(groupedResults).flat();
  }, [groupedResults]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % allResults.length || 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length || 0);
          break;
        case 'Enter':
          e.preventDefault();
          if (allResults[selectedIndex]) {
            handleSelectResult(allResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, allResults, onOpenChange]);

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.href);
    onOpenChange(false);
    setQuery('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setQuery('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl sm:rounded-2xl">
        <div className="flex flex-col h-full">
          {/* Search input */}
          <div className="flex items-center border-b border-border px-6 py-4">
            <Search className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
            <Input
              autoFocus
              placeholder="Search requests, members, chats, events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
            />
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>

          {/* Results or empty state */}
          <div className="overflow-y-auto max-h-[400px] scrollbar-thin">
            {query.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Start typing to search</p>
                <p className="text-xs text-muted-foreground">
                  Find requests, members, chats, events, and announcements
                </p>
              </div>
            ) : allResults.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-sm font-medium text-foreground">No results found</p>
                <p className="text-xs text-muted-foreground">Try searching for something else</p>
              </div>
            ) : (
              <div className="px-2 py-2">
                {/* Group results by category */}
                {Object.entries(groupedResults).map(([category, results]) =>
                  results.length > 0 ? (
                    <div key={category} className="mb-2">
                      {/* Category header */}
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {categoryConfig[category as keyof typeof categoryConfig].label}
                        </p>
                      </div>

                      {/* Category results */}
                      <div className="space-y-1">
                        {results.map((result, idx) => {
                          const globalIdx = allResults.indexOf(result);
                          return (
                            <motion.button
                              key={result.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => handleSelectResult(result)}
                              className={cn(
                                'w-full px-4 py-2 text-left rounded-lg transition-all duration-200',
                                'flex items-start justify-between gap-3',
                                globalIdx === selectedIndex
                                  ? 'bg-primary/15 text-primary'
                                  : 'hover:bg-muted text-foreground'
                              )}
                            >
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className={cn(
                                  'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                  globalIdx === selectedIndex ? 'bg-primary/20' : 'bg-muted'
                                )}>
                                  {result.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{result.title}</p>
                                  {result.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {result.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {result.metadata && (
                                  <span className="text-xs text-muted-foreground">{result.metadata}</span>
                                )}
                                {globalIdx === selectedIndex && (
                                  <ArrowRight className="h-4 w-4" />
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>

          {/* Footer with hints */}
          {allResults.length > 0 && (
            <div className="border-t border-border px-6 py-3 flex justify-between items-center bg-muted/30">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-background rounded border border-border text-xs font-mono">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-background rounded border border-border text-xs font-mono">Enter</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-background rounded border border-border text-xs font-mono">Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedIndex + 1} of {allResults.length}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

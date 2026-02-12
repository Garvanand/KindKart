'use client';

import { Moon, Sparkles, SunMedium } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change theme">
          {theme === 'society-light' && <SunMedium className="h-5 w-5" />}
          {theme === 'midnight-elite' && <Moon className="h-5 w-5" />}
          {theme === 'neon-trust' && <Sparkles className="h-5 w-5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('society-light')}>
          <SunMedium className="mr-2 h-4 w-4" />
          Society Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('midnight-elite')}>
          <Moon className="mr-2 h-4 w-4" />
          Midnight Elite
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('neon-trust')}>
          <Sparkles className="mr-2 h-4 w-4" />
          Neon Trust
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


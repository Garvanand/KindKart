'use client';

import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, Wallet, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface ProfileDropdownProps {
  className?: string;
}

export function ProfileDropdown({ className }: ProfileDropdownProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  if (!isAuthenticated || !user) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push('/auth')} className={className}>
        Log in
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn('relative h-9 w-9 rounded-full', className)}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            {user.isGuest && (
              <p className="text-xs text-amber-600 dark:text-amber-400">Guest mode</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <User className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/wallet')}>
          <Wallet className="mr-2 h-4 w-4" />
          Wallet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/reputation')}>
          <Award className="mr-2 h-4 w-4" />
          Reputation
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

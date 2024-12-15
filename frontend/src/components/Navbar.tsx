'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="w-full bg-background text-foreground p-4 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-lg font-bold text-primary">Woolies Watcher</h1>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-8 h-8 cursor-pointer">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name || 'User'}
                    className="rounded-full"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name
                      ? user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-popover rounded-lg shadow-md">
                <DropdownMenuLabel className="font-semibold">
                  {user.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => alert('Navigate to Watchlist')}
                >
                  Watchlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert('Navigate to Settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-destructive"
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button onClick={() => signIn()} className="text-sm">
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

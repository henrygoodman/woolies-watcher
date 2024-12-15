'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  return (
    <header className="w-full bg-background text-foreground p-4 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Clickable Logo */}
        <h1
          className="text-lg font-bold text-primary cursor-pointer"
          onClick={() => router.push('/')}
        >
          Woolies Watcher
        </h1>

        <div className="flex items-center space-x-4">
          {/* Home Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="hidden sm:block"
          >
            Home
          </Button>

          {/* Theme Toggle */}
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

                {/* Navigate to Watchlist */}
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
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
            <button
              onClick={() => signIn()}
              className="text-sm font-medium hover:underline"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

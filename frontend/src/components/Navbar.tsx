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
import { SearchBar } from '@/components/ui/search-bar';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="w-full bg-background text-foreground p-4 drop-shadow-2xl">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <h1
          className="text-lg font-bold text-primary cursor-pointer"
          onClick={() => router.push('/')}
        >
          Woolies Watcher
        </h1>

        {/* Centered Search Bar */}
        <div className="flex-grow mx-4 flex justify-center">
          <SearchBar
            value=""
            onSearch={handleSearch}
            className="max-w-lg w-full" // Cap width and make it responsive
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="hidden sm:block"
          >
            Home
          </Button>

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
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  Watchlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
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
              onClick={() => signIn('google', { callbackUrl: '/' })}
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

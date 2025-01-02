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
import { SearchBar } from '@/components/ui/search-bar';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="w-full bg-background text-foreground p-4 drop-shadow-xl">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-8 h-8 cursor-pointer">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name || 'User'}
                    loading="lazy"
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
                  {user.name || 'User'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/watchlist')}>
                  Watchlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
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

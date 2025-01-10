'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchBar } from '@/components/ui/search-bar';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const [logo, setLogo] = useState('/images/logo.png');

  useEffect(() => {
    const updateLogo = () => {
      const isDarkTheme =
        document.documentElement.getAttribute('data-theme') === 'dark';
      setLogo(isDarkTheme ? '/images/logo_dark.png' : '/images/logo.png');
    };

    // Set initial logo
    updateLogo();

    // Listen for theme changes
    const observer = new MutationObserver(updateLogo);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="w-full bg-background text-foreground px-12 py-2 drop-shadow-md subpixel-antialiased">
      <div className="flex flex-wrap items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center flex-1 min-w-0">
          <img
            src={logo}
            alt="Logo"
            className="w-16 h-16 cursor-pointer -mr-2 flex-shrink-0"
            onClick={() => router.push('/')}
          />
          <h1
            className="text-lg font-bold text-primary cursor-pointer mr-12 whitespace-nowrap flex-shrink-0"
            onClick={() => router.push('/')}
          >
            Woolies Watcher
          </h1>
          <nav className="flex items-center space-x-6 flex-shrink hidden sm:flex">
            <button
              className="hidden lg:block text-lg font-medium transition-transform transform hover:scale-105 hover:text-primary"
              onClick={() => router.push('/discounts')}
            >
              Discounts
            </button>
            <button
              className="hidden lg:block text-lg font-medium transition-transform transform hover:scale-105 hover:text-primary"
              onClick={() => router.push('/markups')}
            >
              Markups
            </button>
          </nav>
        </div>

        {/* Center Section */}
        <div className="flex-1 flex justify-center">
          <SearchBar
            value=""
            onSearch={handleSearch}
            className="max-w-lg w-full"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-10 h-10 cursor-pointer">
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
              className="text-lg font-medium hover:underline"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

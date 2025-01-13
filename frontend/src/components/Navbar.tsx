'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchBar } from '@/components/ui/search-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkTheme } = useTheme();

  const [logo, setLogo] = useState('/images/logo.png');
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const themeLogo = isDarkTheme
      ? '/images/logo_dark.png'
      : '/images/logo.png';
    setLogo(themeLogo);
  }, [isDarkTheme]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false); // Hide navbar on scroll down
      } else {
        setShowNavbar(true); // Show navbar on scroll up or at top
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSignOut = async () => {
    Cookies.remove('theme');
    await signOut({ callbackUrl: '/' });
  };

  const isActive = (route: string) => pathname === route;

  return (
    <>
      {/* Spacer for the navbar height */}
      <div className="h-16" />

      {/* Fixed Navbar */}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <header className="w-full bg-background text-foreground py-2 drop-shadow-lg">
          <div className="container mx-auto flex items-center justify-between px-4 md:px-8">
            {/* Left Section */}
            <div className="flex items-center flex-shrink-0">
              <img
                src={logo}
                alt="Logo"
                className="w-12 h-12 cursor-pointer"
                onClick={() => router.push('/')}
              />
              <h1
                className="text-xl font-bold text-primary cursor-pointer whitespace-nowrap hidden sm:block"
                onClick={() => router.push('/')}
              >
                woolies watcher
              </h1>
            </div>

            {/* Center Section - Search Bar */}
            <div className="flex-1 mx-4">
              <SearchBar
                value=""
                onSearch={handleSearch}
                className="w-full max-w-lg mx-auto"
              />
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-10 h-10 cursor-pointer">
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
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuLabel>{user.name || 'User'}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/watchlist')}>
                      Watchlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive"
                    >
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  className="text-md font-medium hover:underline"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Sub-Navbar */}
        <nav className="w-full bg-muted text-muted-foreground py-2">
          <div className="container mx-auto flex justify-center space-x-8">
            <button
              className={`text-sm md:text-base font-medium hover:text-primary border-b-2 ${
                isActive('/discounts') ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => router.push('/discounts')}
            >
              Discounts
            </button>
            <button
              className={`text-sm md:text-base font-medium hover:text-primary border-b-2 ${
                isActive('/markups') ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => router.push('/markups')}
            >
              Markups
            </button>
            {user && (
              <button
                className={`text-sm md:text-base font-medium hover:text-primary border-b-2 ${
                  isActive('/watchlist')
                    ? 'border-primary'
                    : 'border-transparent'
                }`}
                onClick={() => router.push('/watchlist')}
              >
                Watchlist
              </button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { AuthButton } from '@/components/AuthButton';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

export const Navbar: React.FC = () => {
  const [isGreenTheme, setIsGreenTheme] = useState<boolean | null>(null);

  useEffect(() => {
    const savedTheme = sessionStorage.getItem('theme') || 'green';
    setIsGreenTheme(savedTheme === 'green');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeToggle = (checked: boolean) => {
    const theme = checked ? 'dark-green' : 'green';
    setIsGreenTheme(!checked);
    document.documentElement.setAttribute('data-theme', theme);
    sessionStorage.setItem('theme', theme);
  };

  if (isGreenTheme === null) {
    return null;
  }

  return (
    <header className="w-full bg-background text-foreground p-4 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-lg font-bold text-primary">Woolies Watcher</h1>

        <NavigationMenu>
          <NavigationMenuList className="flex items-center space-x-4">
            <NavigationMenuItem>
              <AuthButton />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <div className="flex items-center space-x-2">
                {isGreenTheme ? (
                  <SunIcon className="w-5 h-5 text-accent" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-accent" />
                )}

                <Switch
                  checked={!isGreenTheme}
                  onCheckedChange={handleThemeToggle}
                  aria-label="Toggle theme"
                />
              </div>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

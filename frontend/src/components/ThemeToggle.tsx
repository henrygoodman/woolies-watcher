'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';

export const ThemeToggle: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean | null>(null);

  useEffect(() => {
    const savedTheme = Cookies.get('theme') || '';
    setIsDarkTheme(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeToggle = (checked: boolean) => {
    const theme = checked ? 'dark' : '';
    setIsDarkTheme(checked);
    document.documentElement.setAttribute('data-theme', theme);
    Cookies.set('theme', theme, { expires: 365 }); // Cookie expires in 1 year
  };

  if (isDarkTheme === null) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {!isDarkTheme ? (
        <SunIcon className="w-5 h-5 text-primary" />
      ) : (
        <MoonIcon className="w-5 h-5 text-primary" />
      )}
      <Switch
        checked={isDarkTheme}
        onCheckedChange={handleThemeToggle}
        aria-label="Toggle theme"
      />
    </div>
  );
};

'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

export const ThemeToggle: React.FC = () => {
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
  );
};

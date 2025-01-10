'use client';

import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDarkTheme, toggleTheme } = useTheme();

  const handleToggle = (checked: boolean) => {
    toggleTheme(checked);
  };

  return (
    <div className="flex items-center space-x-2">
      {isDarkTheme ? (
        <MoonIcon className="w-5 h-5 text-primary" />
      ) : (
        <SunIcon className="w-5 h-5 text-primary" />
      )}
      <Switch
        checked={isDarkTheme}
        onCheckedChange={handleToggle}
        aria-label="Toggle theme"
      />
    </div>
  );
};

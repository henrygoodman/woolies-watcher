'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { fetchUserApi, updateUserApi } from '@/lib/api/userApi';
import { useSession } from 'next-auth/react';

type ThemeContextType = {
  isDarkTheme: boolean;
  toggleTheme: (isDark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const user = session?.user;

  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    const initializeTheme = async () => {
      let themeDark = false;

      try {
        if (user) {
          const fetchedUser = await fetchUserApi();
          themeDark = fetchedUser.theme_dark;
        } else {
          const savedTheme = Cookies.get('theme') || 'light';
          themeDark = savedTheme === 'dark';
        }
      } catch (error) {
        console.error('Failed to fetch user theme:', error);
      }

      const theme = themeDark ? 'dark' : 'light';
      setIsDarkTheme(themeDark);
      document.documentElement.setAttribute('data-theme', theme);
      Cookies.set('theme', theme, { expires: 365 });
      setIsThemeReady(true);
    };

    initializeTheme();
  }, [user]);

  const toggleTheme = async (isDark: boolean) => {
    const theme = isDark ? 'dark' : 'light';
    setIsDarkTheme(isDark);
    document.documentElement.setAttribute('data-theme', theme);
    Cookies.set('theme', theme, { expires: 365 });

    if (user) {
      try {
        await updateUserApi({ theme_dark: isDark });
      } catch (error) {
        console.error('Failed to update user theme:', error);
      }
    }
  };

  if (!isThemeReady) {
    // Completely block rendering until the theme is initialized
    return <div style={{ visibility: 'hidden' }} />;
  }

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

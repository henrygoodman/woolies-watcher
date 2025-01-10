'use client';

import { SessionProvider } from 'next-auth/react';
import { WatchlistProvider } from '@/contexts/WatchlistContext';
import { SessionErrorProvider } from '@/contexts/SessionErrorContext';
import { GlobalAlert } from '@/components/GlobalAlert';
import { ThemeProvider } from './ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionErrorProvider>
        <WatchlistProvider>
          <ThemeProvider>
            <GlobalAlert />
            {children}
          </ThemeProvider>
        </WatchlistProvider>
      </SessionErrorProvider>
    </SessionProvider>
  );
}

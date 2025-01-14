'use client';

import { SessionProvider } from 'next-auth/react';
import { WatchlistProvider } from '@/contexts/WatchlistContext';
import { SessionErrorProvider } from '@/contexts/SessionErrorContext';
import { GlobalAlert } from '@/components/GlobalAlert';
import { ThemeProvider } from './ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionErrorProvider>
        <QueryClientProvider client={queryClient}>
          <WatchlistProvider>
            <ThemeProvider>
              <GlobalAlert />
              {children}
            </ThemeProvider>
          </WatchlistProvider>
        </QueryClientProvider>
      </SessionErrorProvider>
    </SessionProvider>
  );
}

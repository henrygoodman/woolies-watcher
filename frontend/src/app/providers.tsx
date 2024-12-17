'use client';

import { WatchlistProvider } from '@/contexts/WatchlistContext';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WatchlistProvider>{children}</WatchlistProvider>
    </SessionProvider>
  );
}

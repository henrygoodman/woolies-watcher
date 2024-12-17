'use client';

import { useMemo } from 'react';
import { useWatchlistContext } from '@/contexts/WatchlistContext';
import { useSession } from 'next-auth/react';
import { DBProduct } from '@shared-types/db';

export const useWatchlist = (product: DBProduct) => {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const {
    watchlist,
    addToWatchlist: contextAdd,
    removeFromWatchlist: contextRemove,
  } = useWatchlistContext();

  // Check if product is in the watchlist
  const isInWatchlist = useMemo(
    () => watchlist.some((item) => item.id === product.id),
    [watchlist, product.id]
  );

  const toggleWatchlist = async () => {
    if (!isLoggedIn) {
      console.warn('User must be logged in to modify the watchlist.');
      return;
    }

    try {
      if (isInWatchlist) {
        await contextRemove(product);
      } else {
        await contextAdd(product);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  return { isInWatchlist, toggleWatchlist };
};

'use client';

import { useEffect, useState } from 'react';
import { useWatchlistContext } from '@/contexts/WatchlistContext';
import { useSession } from 'next-auth/react';
import { DBProduct } from '@shared-types/db';

export const useWatchlist = (productId: number) => {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const {
    watchlist,
    addToWatchlist: contextAdd,
    removeFromWatchlist: contextRemove,
  } = useWatchlistContext();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  useEffect(() => {
    const checkWatchlist = () => {
      if (!isLoggedIn) {
        setWatchlistLoading(false);
        return;
      }

      const found = watchlist.some((item: DBProduct) => item.id === productId);
      setIsInWatchlist(found);
      setWatchlistLoading(false);
    };

    checkWatchlist();
  }, [productId, watchlist, isLoggedIn]);

  const toggleWatchlist = async (productName: string) => {
    if (!isLoggedIn) {
      console.warn('User must be logged in to modify the watchlist.');
      return;
    }

    setWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        await contextRemove(productId, productName);
        setIsInWatchlist(false);
      } else {
        await contextAdd(productId, productName);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setWatchlistLoading(false);
    }
  };

  return { isInWatchlist, toggleWatchlist, watchlistLoading };
};

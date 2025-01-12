import { useMemo } from 'react';
import { useWatchlistContext } from '@/contexts/WatchlistContext';
import { useSession } from 'next-auth/react';
import { DBProduct } from '@shared-types/db';

export const useWatchlist = (product: DBProduct | null) => {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const {
    watchlist,
    addToWatchlist: contextAdd,
    removeFromWatchlist: contextRemove,
  } = useWatchlistContext();

  // Check if product is in the watchlist, default to false if product is null
  const isInWatchlist = useMemo(
    () => !!product && watchlist.some((item) => item.id === product.id),
    [watchlist, product]
  );

  const toggleWatchlist = async () => {
    if (!isLoggedIn || !product) {
      console.warn('User must be logged in and product must be defined.');
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

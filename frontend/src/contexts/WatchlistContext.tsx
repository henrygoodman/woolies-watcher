'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getWatchlist,
  addToWatchlist as apiAddToWatchlist,
  removeFromWatchlist as apiRemoveFromWatchlist,
} from '@/lib/api/watchlistApi';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { DBProduct } from '@shared-types/db';

interface WatchlistContextProps {
  watchlist: DBProduct[];
  isLoading: boolean;
  addToWatchlist: (product: DBProduct) => Promise<void>;
  removeFromWatchlist: (product: DBProduct) => Promise<void>;
  refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextProps | undefined>(
  undefined
);

export const WatchlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [watchlist, setWatchlist] = useState<DBProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWatchlist = async () => {
    if (!isLoggedIn) return;

    try {
      const data = await getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [isLoggedIn]);

  const addToWatchlist = async (product: DBProduct) => {
    await apiAddToWatchlist(product.id);
    setWatchlist((prev) => [...prev, product]);
    toast({
      title: 'Added to Watchlist',
      description: `${product.product_name} has been added to your watchlist.`,
    });
  };

  const removeFromWatchlist = async (product: DBProduct) => {
    await apiRemoveFromWatchlist(product.id);
    setWatchlist((prev) => prev.filter((item) => item.id !== product.id));
    toast({
      title: 'Removed from Watchlist',
      description: `${product.product_name} has been removed from your watchlist.`,
      variant: 'destructive',
    });
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        isLoading,
        addToWatchlist,
        removeFromWatchlist,
        refreshWatchlist: fetchWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlistContext = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error(
      'useWatchlistContext must be used within a WatchlistProvider'
    );
  }
  return context;
};

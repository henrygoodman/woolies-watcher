'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '@/lib/api/watchlistApi';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { DBProduct } from '@shared-types/db';

interface WatchlistContextProps {
  watchlist: DBProduct[];
  isLoading: boolean;
  addToWatchlist: (id: number, productName: string) => Promise<void>;
  removeFromWatchlist: (id: number, productName: string) => Promise<void>;
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

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!isLoggedIn) return;

      try {
        const data = await getWatchlist();
        setWatchlist(data.watchlist || []); // Directly assign DBProduct[]
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlist();
  }, [isLoggedIn]);

  const addProductToWatchlist = async (id: number, productName: string) => {
    try {
      await addToWatchlist(id);
      setWatchlist((prev) => [
        ...prev,
        { id, product_name: productName } as DBProduct,
      ]);
      toast({
        title: 'Added to Watchlist',
        description: `${productName} has been added to your watchlist.`,
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeProductFromWatchlist = async (
    id: number,
    productName: string
  ) => {
    try {
      await removeFromWatchlist(id);
      setWatchlist((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: 'Removed from Watchlist',
        description: `${productName} has been removed from your watchlist.`,
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        isLoading,
        addToWatchlist: addProductToWatchlist,
        removeFromWatchlist: removeProductFromWatchlist,
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

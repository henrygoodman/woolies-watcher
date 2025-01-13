'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { columns } from '@/app/watchlist/watchlistColumns';
import { getWatchlist } from '@/lib/api/watchlistApi';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorMessage } from './ErrorMessage';
import { DBProduct } from '@shared-types/db';
import { useWatchlistContext } from '@/contexts/WatchlistContext';

export const Watchlist: React.FC = () => {
  const { removeFromWatchlist } = useWatchlistContext();
  const [watchlist, setWatchlist] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const data = await getWatchlist();
        setWatchlist(data);
      } catch (err) {
        setError('Failed to load watchlist: ' + err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Watchlist</h2>
      <p className="text-sm text-muted-foreground italic mb-4">
        Notification emails occur daily at 8am AEST.
      </p>
      <DataTable
        columns={columns(setWatchlist, removeFromWatchlist)}
        data={watchlist}
      />
    </div>
  );
};

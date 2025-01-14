'use client';

import { DataTable } from '@/components/DataTable';
import { columns } from '@/app/watchlist/watchlistColumns';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorMessage } from './ErrorMessage';
import { useWatchlistContext } from '@/contexts/WatchlistContext';
import { useState } from 'react';

export const Watchlist: React.FC = () => {
  const { watchlist, isLoading, removeFromWatchlist } = useWatchlistContext();
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 20;

  if (isLoading) return <LoadingIndicator />;
  if (!watchlist) return <ErrorMessage error="Failed to load watchlist." />;

  const paginatedData = watchlist.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Watchlist</h2>
      <p className="text-sm text-muted-foreground italic mb-4">
        Notification emails occur daily at 8am AEST.
      </p>
      <DataTable
        columns={columns(removeFromWatchlist)}
        data={paginatedData}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
      />
    </div>
  );
};

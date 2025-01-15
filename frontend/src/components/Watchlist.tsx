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

  const paginatedData = watchlist
    ? watchlist.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
    : [];

  return (
    <div className="container mx-auto">
      {/* Static Content */}
      <h2 className="text-2xl font-bold mb-6">Your Watchlist</h2>
      <p className="text-sm text-muted-foreground italic mb-4">
        Notification emails occur daily at 8am AEST.
      </p>

      {/* Dynamic Content */}
      <div className="relative">
        {isLoading ? (
          <div className="flex justify-center">
            <LoadingIndicator />
          </div>
        ) : !watchlist ? (
          <div className="flex justify-center">
            <ErrorMessage error="Failed to load watchlist." />
          </div>
        ) : (
          <DataTable
            columns={columns(removeFromWatchlist)}
            data={paginatedData}
            pageIndex={pageIndex}
            pageSize={pageSize}
            setPageIndex={setPageIndex}
          />
        )}
      </div>
    </div>
  );
};

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { DBProduct } from '@shared-types/db';

export const columns = (
  removeFromWatchlist: (product: DBProduct) => void
): ColumnDef<DBProduct>[] => {
  return [
    {
      accessorKey: 'product_name',
      header: 'Product Name',
      cell: ({ row }) => {
        const { product_name, id } = row.original;

        return (
          <Link
            href={`/product/${id}`}
            className="text-primary hover:underline truncate block w-96"
          >
            {product_name}
          </Link>
        );
      },
    },
    {
      accessorKey: 'product_brand',
      header: 'Brand',
      cell: ({ row }) => (
        <div className="truncate w-36">
          {' '}
          {/* Set width and truncate */}
          {row.getValue('product_brand') || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'current_price',
      header: 'Price',
      cell: ({ row }) => {
        const price = parseFloat(row.getValue('current_price') || '0');
        return (
          <div className="truncate w-28">
            {/* Set width and truncate */}
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'AUD',
              currencyDisplay: 'narrowSymbol', // Use narrow symbol for compact currency display
            }).format(price)}
          </div>
        );
      },
    },
    {
      id: 'remove',
      header: '',
      cell: ({ row }) => {
        const item = row.original;

        const handleRemove = () => {
          try {
            removeFromWatchlist(item);
          } catch (error) {
            console.error('Error removing item from watchlist:', error);
          }
        };

        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-1 rounded-full bg-transparent hover:bg-muted transition-colors"
                aria-label="Remove from watchlist"
              >
                <Trash className="text-destructive h-5 w-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove from Watchlist?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove{' '}
                  <strong>{item.product_name}</strong> from your watchlist? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemove}>
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ];
};

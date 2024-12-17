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
import { removeFromWatchlist } from '@/lib/api/watchlistApi';
import Link from 'next/link';
import { DBProduct } from '@shared-types/db';

export const columns = (
  setWatchlist: React.Dispatch<React.SetStateAction<DBProduct[]>>
): ColumnDef<DBProduct>[] => [
  {
    accessorKey: 'product_name',
    header: 'Product Name',
    cell: ({ row }) => {
      const { product_name, id } = row.original;

      return (
        <Link href={`/product/${id}`} className="text-primary hover:underline">
          {product_name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'product_brand',
    header: 'Brand',
  },
  {
    accessorKey: 'current_price',
    header: 'Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('current_price'));
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'AUD',
      }).format(price);
    },
  },
  {
    id: 'remove',
    header: '', // Empty header for the icon column
    cell: ({ row }) => {
      const item = row.original;

      const handleRemove = async () => {
        try {
          await removeFromWatchlist(item.id);
          console.log(`Removed ${item.product_name} from watchlist.`);
          setWatchlist((prev) =>
            prev.filter((product) => product.id !== item.id)
          );
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

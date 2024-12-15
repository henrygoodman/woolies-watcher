'use client';

import { ColumnDef } from '@tanstack/react-table';

export type WatchlistItem = {
  product_id: number;
  product_name: string;
  product_brand: string;
  current_price: number;
  image_url: string;
};

export const columns: ColumnDef<WatchlistItem>[] = [
  {
    accessorKey: 'product_name',
    header: 'Product Name',
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
];

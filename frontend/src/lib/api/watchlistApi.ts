import { getSession } from 'next-auth/react';
import { WatchlistRequest } from '@shared-types/api';
import { DBProduct, DBProductSchema } from '@shared-types/db';

/**
 * Add a product to the user's watchlist.
 * @param product_id - The ID of the product to add to the watchlist.
 * @returns A promise that resolves to the updated watchlist or success message.
 * @throws Will throw an error if the user is not authenticated or the fetch fails.
 */
export const addToWatchlist = async (
  product_id: number | undefined
): Promise<DBProduct[]> => {
  if (!product_id) throw new Error('No product ID specified');

  const session = await getSession();
  if (!session) throw new Error('User is not authenticated');

  const body: WatchlistRequest = { product_id };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watchlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as DBProduct[];
};

/**
 * Remove a product from the user's watchlist.
 * @param productId - The ID of the product to remove from the watchlist.
 * @returns A promise that resolves to the updated watchlist or success message.
 * @throws Will throw an error if the user is not authenticated or the fetch fails.
 */
export const removeFromWatchlist = async (
  productId: number | undefined
): Promise<DBProduct[]> => {
  if (!productId) throw new Error('No product ID specified');

  const session = await getSession();
  if (!session) throw new Error('User is not authenticated');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/watchlist?product_id=${productId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as DBProduct[];
};

/**
 * Get the user's watchlist.
 * @returns A promise that resolves to the user's watchlist.
 * @throws Will throw an error if the user is not authenticated or the fetch fails.
 */
export const getWatchlist = async (): Promise<DBProduct[]> => {
  const session = await getSession();
  if (!session) throw new Error('User is not authenticated');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watchlist`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return data.map((item: unknown) => DBProductSchema.parse(item));
};

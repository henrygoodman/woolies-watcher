import { getSession } from 'next-auth/react';
import { WatchlistRequest, WatchlistResponse } from '@shared-types/api';

/**
 * Add a product to the user's watchlist.
 * @param product_id - The ID of the product to add to the watchlist.
 * @returns A promise that resolves to the updated watchlist or success message.
 * @throws Will throw an error if the user is not authenticated or the fetch fails.
 */
export const addToWatchlist = async (
  product_id: number | undefined
): Promise<WatchlistResponse> => {
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
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as WatchlistResponse;
};

/**
 * Remove a product from the user's watchlist.
 * @param productId - The ID of the product to remove from the watchlist.
 * @returns A promise that resolves to the updated watchlist or success message.
 * @throws Will throw an error if the user is not authenticated or the fetch fails.
 */
export const removeFromWatchlist = async (
  productId: number | undefined
): Promise<WatchlistResponse> => {
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
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as WatchlistResponse;
};

/**
 * Get the user's watchlist.
 * @returns A promise that resolves to the user's watchlist.
 * @throws Will throw an error if the user is not authenticated or the fetch fails.
 */
export const getWatchlist = async (): Promise<WatchlistResponse> => {
  const session = await getSession();
  if (!session) throw new Error('User is not authenticated');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watchlist`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as WatchlistResponse;
};

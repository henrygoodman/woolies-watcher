import { getSession } from 'next-auth/react';
import { WatchlistRequest } from '@shared-types/api';

export const addToWatchlist = async (productId: number | undefined) => {
  try {
    const session = await getSession();
    if (!session) throw new Error('User is not authenticated');
    if (!productId) throw new Error('No product id specified');

    const body: WatchlistRequest = { id: productId };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/watchlist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok)
      throw new Error(`Error: ${response.status} ${response.statusText}`);

    return await response.json();
  } catch (err) {
    console.error('Error in addToWatchlist:', err);
    throw err;
  }
};

export const removeFromWatchlist = async (productId: number | undefined) => {
  try {
    const session = await getSession();
    if (!session) throw new Error('User is not authenticated');
    if (!productId) throw new Error('No product id specified');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/watchlist?product_id=${productId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok)
      throw new Error(`Error: ${response.status} ${response.statusText}`);

    return await response.json();
  } catch (err) {
    console.error('Error in removeFromWatchlist:', err);
    throw err;
  }
};

export const getWatchlist = async () => {
  try {
    const session = await getSession();
    if (!session) throw new Error('User is not authenticated');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/watchlist`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok)
      throw new Error(`Error: ${response.status} ${response.statusText}`);

    return await response.json();
  } catch (err) {
    console.error('Error in getWatchlist:', err);
    throw err;
  }
};

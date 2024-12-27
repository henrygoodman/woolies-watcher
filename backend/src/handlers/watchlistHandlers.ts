import { RequestHandler } from 'express';
import watchlistRepository from '@/db/watchlistRepository';
import { WatchlistRequest } from '@shared-types/api';
import { DBProduct } from '@shared-types/db';

export const handleWatchlistAdd: RequestHandler = async (req, res) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    return;
  }

  const { id: user_id } = user;
  const { product_id }: WatchlistRequest = req.body;

  if (!product_id) {
    res.status(400).json({ error: 'product_id is required' });
    return;
  }

  try {
    await watchlistRepository.addToWatchlist(user_id, product_id);
    res.status(200).json({ message: 'Product added to watchlist', product_id });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: 'Failed to add product to watchlist' });
  }
};

export const handleWatchlistDelete: RequestHandler = async (req, res) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    return;
  }

  const productId = req.query.product_id;

  if (!productId) {
    res.status(400).json({ error: 'product_id is required' });
    return;
  }

  try {
    const productInWatchlist = await watchlistRepository.removeFromWatchlist(
      user.id,
      Number(productId)
    );
    if (!productInWatchlist) {
      res.status(404).json({ error: 'Product not found in watchlist' });
      return;
    }

    res.status(200).json({
      message: 'Product removed from watchlist',
      product_id: productId,
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove product from watchlist' });
  }
};

export const handleWatchlistGet: RequestHandler = async (req, res) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    return;
  }

  try {
    const watchlist: DBProduct[] = await watchlistRepository.getWatchlist(
      user.id
    );
    res.status(200).json(watchlist);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
};

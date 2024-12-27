import { RequestHandler } from 'express';
import priceRepository from '@/db/priceRepository';

/**
 * Fetch price updates for a specific product by product ID.
 */
export const handleGetPriceUpdates: RequestHandler = async (req, res) => {
  const { productId } = req.params;

  if (!productId || isNaN(Number(productId))) {
    res.status(400).json({ error: 'Invalid product ID' });
    return;
  }

  try {
    const priceUpdates = await priceRepository.getPriceUpdatesByProduct(
      Number(productId)
    );
    res.json(priceUpdates);
  } catch (error) {
    console.error('Error fetching price updates:', error);
    res.status(500).json({ error: 'Failed to fetch price updates' });
  }
};

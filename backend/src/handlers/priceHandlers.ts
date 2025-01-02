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

/**
 * Fetch the top price increases and discounts for the current day.
 */
export const handleGetTopDailyPriceChanges: RequestHandler = async (
  req,
  res
) => {
  const { limit } = req.query;

  const parsedLimit = parseInt(limit as string, 10);
  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    res.status(400).json({ error: 'Invalid or missing limit parameter' });
    return;
  }

  try {
    const [topDiscounts, topIncreases] = await Promise.all([
      priceRepository.getTopDailyDiscounts(parsedLimit),
      priceRepository.getTopDailyPriceIncreases(parsedLimit),
    ]);

    res.json({
      topDiscounts,
      topIncreases,
    });
  } catch (error) {
    console.error('Error fetching top daily price changes:', error);
    res.status(500).json({ error: 'Failed to fetch top daily price changes' });
  }
};

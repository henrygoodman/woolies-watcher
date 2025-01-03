import { RequestHandler } from 'express';
import priceRepository from '@/db/priceRepository';
import productRepository from '@/db/productRepository';
import { TopPriceUpdatesWithProductsSchema } from '@shared-types/api';

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
  const { limit, days } = req.query;

  const parsedLimit = parseInt(limit as string, 10);
  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    res.status(400).json({ error: 'Invalid or missing limit parameter' });
    return;
  }

  const parsedDays = parseInt(days as string, 10);
  if (isNaN(parsedDays) || parsedDays <= 0) {
    res.status(400).json({ error: 'Invalid or missing days paremeter' });
    return;
  }

  try {
    const [topDiscounts, topIncreases] = await Promise.all([
      priceRepository.getTopPriceDec(parsedLimit, parsedDays),
      priceRepository.getTopPriceInc(parsedLimit, parsedDays),
    ]);

    const enrichWithProduct = async (priceUpdates: typeof topDiscounts) => {
      return Promise.all(
        priceUpdates.map(async (update) => {
          const product = await productRepository.findById(update.product_id);
          if (!product) {
            throw new Error(`Product not found for ID ${update.product_id}`);
          }
          return {
            ...update,
            product,
          };
        })
      );
    };

    const [enrichedDiscounts, enrichedIncreases] = await Promise.all([
      enrichWithProduct(topDiscounts),
      enrichWithProduct(topIncreases),
    ]);

    const topPriceUpdates = TopPriceUpdatesWithProductsSchema.parse({
      topDiscounts: enrichedDiscounts,
      topIncreases: enrichedIncreases,
    });

    res.json(topPriceUpdates);
  } catch (error) {
    console.error('Error fetching top daily price changes:', error);
    res.status(500).json({ error: 'Failed to fetch top daily price changes' });
  }
};

import { RequestHandler } from 'express';
import priceRepository from '@/db/priceRepository';
import productRepository from '@/db/productRepository';
import {
  PaginatedPriceUpdateWithProduct,
  PaginatedPriceUpdateWithProductSchema,
  PriceUpdateWithProduct,
  TopPriceUpdateWithProductSchema,
} from '@shared-types/api';
import { DBPriceUpdateSchema } from '@shared-types/db';

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
    res.status(400).json({ error: 'Invalid or missing days parameter' });
    return;
  }

  try {
    const [discountResults, increaseResults] = await Promise.all([
      priceRepository.getTopPriceDec(parsedLimit, parsedDays),
      priceRepository.getTopPriceInc(parsedLimit, parsedDays),
    ]);

    const enrichWithProduct = async (
      priceUpdates: typeof discountResults.data
    ) => {
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

    // Enrich products for discounts and increases
    const [enrichedDiscounts, enrichedIncreases] = await Promise.all([
      enrichWithProduct(discountResults.data),
      enrichWithProduct(increaseResults.data),
    ]);

    const topPriceUpdates = TopPriceUpdateWithProductSchema.parse({
      topDiscounts: enrichedDiscounts,
      topIncreases: enrichedIncreases,
    });

    res.json(topPriceUpdates);
  } catch (error) {
    console.error('Error fetching top daily price changes:', error);
    res.status(500).json({ error: 'Failed to fetch top daily price changes' });
  }
};

/**
 * Fetch paginated discounts with products and return a structured paginated response.
 */
export const handleGetPaginatedDiscounts: RequestHandler = async (req, res) => {
  const { limit, offset, days, sortRaw } = req.query;

  const parsedLimit = parseInt(limit as string, 10);
  const parsedOffset = parseInt(offset as string, 10);
  const parsedDays = parseInt(days as string, 10);
  const parsedSortRaw = sortRaw === 'true';

  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    res.status(400).json({ error: 'Invalid or missing limit parameter' });
    return;
  }

  if (isNaN(parsedOffset) || parsedOffset < 0) {
    res.status(400).json({ error: 'Invalid or missing offset parameter' });
    return;
  }

  if (isNaN(parsedDays) || parsedDays <= 0) {
    res.status(400).json({ error: 'Invalid or missing days parameter' });
    return;
  }

  try {
    const { total, data } = await priceRepository.getTopPriceDec(
      parsedLimit,
      parsedDays,
      parsedOffset,
      parsedSortRaw
    );

    const totalPages = Math.ceil(total / parsedLimit);

    // Enrich results with product data
    const enrichedDiscounts: PriceUpdateWithProduct[] = await Promise.all(
      data.map(async (update) => {
        const product = await productRepository.findById(update.product_id);
        if (!product) {
          throw new Error(`Product not found for ID ${update.product_id}`);
        }
        return { ...update, product };
      })
    );

    const response: PaginatedPriceUpdateWithProduct = {
      page: Math.floor(parsedOffset / parsedLimit) + 1,
      size: parsedLimit,
      total_results: total,
      total_pages: totalPages,
      results: enrichedDiscounts,
    };

    PaginatedPriceUpdateWithProductSchema.parse(response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching paginated discounts:', error);
    res.status(500).json({ error: 'Failed to fetch paginated discounts' });
  }
};

/**
 * Fetch paginated markups with products and return a structured paginated response.
 */
export const handleGetPaginatedMarkups: RequestHandler = async (req, res) => {
  const { limit, offset, days, sortRaw } = req.query;

  const parsedLimit = parseInt(limit as string, 10);
  const parsedOffset = parseInt(offset as string, 10);
  const parsedDays = parseInt(days as string, 10);
  const parsedSortRaw = sortRaw === 'true';

  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    res.status(400).json({ error: 'Invalid or missing limit parameter' });
    return;
  }

  if (isNaN(parsedOffset) || parsedOffset < 0) {
    res.status(400).json({ error: 'Invalid or missing offset parameter' });
    return;
  }

  if (isNaN(parsedDays) || parsedDays <= 0) {
    res.status(400).json({ error: 'Invalid or missing days parameter' });
    return;
  }

  try {
    const { total, data } = await priceRepository.getTopPriceInc(
      parsedLimit,
      parsedDays,
      parsedOffset,
      parsedSortRaw
    );

    const totalPages = Math.ceil(total / parsedLimit);

    // Enrich results with product data
    const enrichedMarkups: PriceUpdateWithProduct[] = await Promise.all(
      data.map(async (update) => {
        const product = await productRepository.findById(update.product_id);
        if (!product) {
          throw new Error(`Product not found for ID ${update.product_id}`);
        }
        return { ...update, product };
      })
    );

    const response: PaginatedPriceUpdateWithProduct = {
      page: Math.floor(parsedOffset / parsedLimit) + 1,
      size: parsedLimit,
      total_results: total,
      total_pages: totalPages,
      results: enrichedMarkups,
    };

    PaginatedPriceUpdateWithProductSchema.parse(response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching paginated markups:', error);
    res.status(500).json({ error: 'Failed to fetch paginated markups' });
  }
};

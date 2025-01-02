import express from 'express';
import {
  handleGetPriceUpdates,
  handleGetTopDailyPriceChanges,
} from '@/handlers/priceHandlers';

const router = express.Router();

/**
 * Route to fetch price updates for a specific product by product ID.
 * Example: GET /price/123
 */
router.get('/:productId', handleGetPriceUpdates);

/**
 * Route to fetch top daily price increases and discounts.
 * Example: GET /price/daily-changes?limit=5
 */
router.get('/daily-changes', handleGetTopDailyPriceChanges);

export default router;

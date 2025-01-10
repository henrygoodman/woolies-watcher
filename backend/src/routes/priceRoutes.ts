import express from 'express';
import {
  handleGetPaginatedDiscounts,
  handleGetPaginatedMarkups,
  handleGetPriceUpdates,
  handleGetTopDailyPriceChanges,
} from '@/handlers/priceHandlers';

const router = express.Router();

/**
 * Route to fetch top daily price increases and discounts.
 * This endpoint combines price increases and discounts for the current day.
 * Query Parameters:
 * - limit (number, required): Maximum number of results to return.
 * - days (number, optional): Number of days to look back (default: 1).
 * Example: GET /price/daily-changes?limit=5&days=1
 */
router.get('/daily-changes', handleGetTopDailyPriceChanges);

/**
 * Route to fetch paginated discounts.
 * This endpoint returns a paginated list of the largest price decreases.
 * Query Parameters:
 * - limit (number, required): Maximum number of results to return.
 * - offset (number, optional): Number of results to skip for pagination (default: 0).
 * - days (number, required): Number of days to look back for price changes.
 * Example: GET /price/discounts?limit=10&offset=0&days=7
 */
router.get('/discounts', handleGetPaginatedDiscounts);

/**
 * Route to fetch paginated markups.
 * This endpoint returns a paginated list of the largest price increases.
 * Query Parameters:
 * - limit (number, required): Maximum number of results to return.
 * - offset (number, optional): Number of results to skip for pagination (default: 0).
 * - days (number, required): Number of days to look back for price changes.
 * Example: GET /price/markups?limit=10&offset=0&days=7
 */
router.get('/markups', handleGetPaginatedMarkups);

/**
 * Route to fetch price updates for a specific product by product ID.
 * This endpoint retrieves all price updates associated with a single product.
 * URL Parameters:
 * - productId (number, required): The ID of the product to fetch price updates for.
 * Example: GET /price/product/123
 */
router.get('/product/:productId', handleGetPriceUpdates);

export default router;

import { PRICE_CHANGE_CUTOFF_TIME_UTC } from '@/constants/sync';
import { GenericRepository } from '@/db/GenericRepository';
import pool from '@/db/pool';
import { DBPriceUpdate, DBPriceUpdateSchema } from '@shared-types/db';

class PriceUpdateRepository extends GenericRepository<DBPriceUpdate> {
  constructor() {
    super('price_updates', DBPriceUpdateSchema);
  }

  /**
   * Creates price update only if one does not already exist recently (1 minute)
   * (preventative measure for some race conditions that were occurring)
   * @param DBPriceUpdate - price update object
   * @returns The saved price update
   */
  async create(priceUpdate: DBPriceUpdate): Promise<DBPriceUpdate> {
    const recentUpdateQuery = `
      SELECT id
      FROM price_updates
      WHERE product_id = $1
        AND updated_at >= NOW() - INTERVAL '1 minute';
    `;
    try {
      const recentUpdate = await pool.query(recentUpdateQuery, [
        priceUpdate.product_id,
      ]);

      if (recentUpdate.rows.length > 0) {
        console.log(
          `Skipping insert for product_id ${priceUpdate.product_id} as a recent update exists.`
        );
        return DBPriceUpdateSchema.parse(recentUpdate.rows[0]);
      }

      console.log(
        'Adding price update:',
        priceUpdate.product_id,
        priceUpdate.old_price,
        priceUpdate.new_price
      );

      const insertQuery = `
        INSERT INTO price_updates (product_id, old_price, new_price, updated_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *;
      `;
      const result = await pool.query(insertQuery, [
        priceUpdate.product_id,
        priceUpdate.old_price,
        priceUpdate.new_price,
      ]);

      return DBPriceUpdateSchema.parse(result.rows[0]);
    } catch (error) {
      console.error('Error creating price update:', error);
      throw new Error('Failed to create price update');
    }
  }

  /**
   * Fetch all price updates for a specific product, ordered by update time.
   * @param productId - The ID of the product.
   * @returns A list of price updates for the product.
   */
  async getPriceUpdatesByProduct(productId: number): Promise<DBPriceUpdate[]> {
    const query = `
      SELECT id, product_id, old_price, new_price, updated_at
      FROM price_updates
      WHERE product_id = $1
      ORDER BY updated_at DESC;
    `;
    try {
      const result = await pool.query(query, [productId]);
      return result.rows.map((row) => DBPriceUpdateSchema.parse(row));
    } catch (error) {
      console.error('Error fetching price updates:', error);
      throw new Error('Failed to fetch price updates');
    }
  }

  /**
   * Fetch the top N largest discounts for the past `days` days.
   * Only considers price updates after the daily cutoff time.
   * Ensures one entry per product with the largest percentage change.
   */
  async getTopPriceDec(limit: number, days: number): Promise<DBPriceUpdate[]> {
    const query = `
    SELECT DISTINCT ON (product_id) *, 
           ((old_price - new_price) / old_price) * 100 AS percentage_change
    FROM price_updates
    WHERE old_price > 0
      AND new_price < old_price
      AND updated_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '${days} days'
    ORDER BY product_id, percentage_change DESC
    LIMIT $1;
  `;
    try {
      const result = await pool.query(query, [limit]);
      return result.rows.map((row) => DBPriceUpdateSchema.parse(row));
    } catch (error) {
      console.error('Error fetching top discounts:', error);
      throw new Error('Failed to fetch top discounts');
    }
  }

  /**
   * Fetch the top N largest price increases for the past `days` days.
   * Only considers price updates after the daily cutoff time.
   * Ensures one entry per product with the largest percentage change.
   */
  async getTopPriceInc(limit: number, days: number): Promise<DBPriceUpdate[]> {
    const query = `
    SELECT DISTINCT ON (product_id) *, 
           ((new_price - old_price) / old_price) * 100 AS percentage_change
    FROM price_updates
    WHERE old_price > 0
      AND new_price > old_price
      AND updated_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '${days} days'
    ORDER BY product_id, percentage_change DESC
    LIMIT $1;
  `;
    try {
      const result = await pool.query(query, [limit]);
      return result.rows.map((row) => DBPriceUpdateSchema.parse(row));
    } catch (error) {
      console.error('Error fetching top price increases:', error);
      throw new Error('Failed to fetch top price increases');
    }
  }
}

export default new PriceUpdateRepository();

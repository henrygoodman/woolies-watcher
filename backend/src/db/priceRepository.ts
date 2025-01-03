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
   * Fetch the top N largest price increases for the past `days` days.
   * Aggregates multiple updates into a single DBPriceUpdate-like object.
   */
  async getTopPriceInc(limit: number, days: number): Promise<DBPriceUpdate[]> {
    const query = `
    WITH aggregated_changes AS (
      SELECT 
        product_id,
        MIN(old_price) AS min_old_price,
        MAX(new_price) AS max_new_price,
        ((MAX(new_price) - MIN(old_price)) / MIN(old_price)) * 100 AS percentage_change,
        MAX(updated_at) AS updated_at
      FROM price_updates
      WHERE old_price > 0
        AND updated_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '${days} days'
      GROUP BY product_id
      HAVING MAX(new_price) > MIN(old_price)
    )
    SELECT *
    FROM aggregated_changes
    ORDER BY percentage_change DESC
    LIMIT $1;
  `;

    try {
      const result = await pool.query(query, [limit]);

      const priceUpdates = result.rows.map((row) => ({
        product_id: row.product_id,
        old_price: row.min_old_price,
        new_price: row.max_new_price,
        updated_at: row.updated_at,
      }));

      return priceUpdates.map((update) => DBPriceUpdateSchema.parse(update));
    } catch (error) {
      console.error('Error fetching top price increases:', error);
      throw new Error('Failed to fetch top price increases');
    }
  }

  /**
   * Fetch the top N largest price decreases for the past `days` days.
   * Aggregates multiple updates into a single DBPriceUpdate-like object.
   */
  async getTopPriceDec(limit: number, days: number): Promise<DBPriceUpdate[]> {
    const query = `
    WITH aggregated_changes AS (
      SELECT 
        product_id,
        MIN(old_price) AS min_old_price,
        MAX(new_price) AS max_new_price,
        ((MIN(old_price) - MAX(new_price)) / MIN(old_price)) * 100 AS percentage_change,
        MAX(updated_at) AS updated_at
      FROM price_updates
      WHERE old_price > 0
        AND updated_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '${days} days'
      GROUP BY product_id
      HAVING MAX(new_price) < MIN(old_price)
    )
    SELECT *
    FROM aggregated_changes
    ORDER BY percentage_change DESC
    LIMIT $1;
  `;

    try {
      const result = await pool.query(query, [limit]);

      const priceUpdates = result.rows.map((row) => ({
        product_id: row.product_id,
        old_price: row.min_old_price,
        new_price: row.max_new_price,
        updated_at: row.updated_at,
      }));

      return priceUpdates.map((update) => DBPriceUpdateSchema.parse(update));
    } catch (error) {
      console.error('Error fetching top price decreases:', error);
      throw new Error('Failed to fetch top price decreases');
    }
  }
}

export default new PriceUpdateRepository();

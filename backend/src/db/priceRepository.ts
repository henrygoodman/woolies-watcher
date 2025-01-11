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
   * Fetch the top N largest price increases for the past `days` days with pagination.
   * Aggregates multiple updates into a single DBPriceUpdate-like object.
   */
  async getTopPriceInc(
    limit: number,
    days: number,
    offset: number = 0,
    sortRaw: boolean = false
  ): Promise<{ total: number; data: DBPriceUpdate[] }> {
    const baseQuery = `
      WITH filtered_updates AS (
        SELECT *
        FROM price_updates
        WHERE updated_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '${days} days'
      ),
      first_and_last_updates AS (
        SELECT
          product_id,
          MIN(updated_at) AS first_update_time,
          MAX(updated_at) AS last_update_time
        FROM filtered_updates
        GROUP BY product_id
      ),
      aggregated_updates AS (
        SELECT
          u.product_id,
          MIN(u.old_price) FILTER (WHERE u.updated_at = f.first_update_time) AS start_price,
          MAX(u.new_price) FILTER (WHERE u.updated_at = f.last_update_time) AS end_price,
          f.last_update_time AS updated_at
        FROM filtered_updates u
        INNER JOIN first_and_last_updates f
        ON u.product_id = f.product_id
        GROUP BY u.product_id, f.last_update_time
      )
      SELECT
        product_id,
        start_price,
        end_price,
        ((end_price - start_price) / start_price) * 100 AS percentage_change,
        (end_price - start_price) AS raw_increase,
        updated_at
      FROM aggregated_updates
      WHERE start_price < end_price -- Only include valid increases
      ORDER BY ${sortRaw ? 'raw_increase' : 'percentage_change'} DESC
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `
      WITH filtered_updates AS (
        SELECT *
        FROM price_updates
        WHERE updated_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '${days} days'
      ),
      first_and_last_updates AS (
        SELECT
          product_id,
          MIN(updated_at) AS first_update_time,
          MAX(updated_at) AS last_update_time
        FROM filtered_updates
        GROUP BY product_id
      ),
      aggregated_updates AS (
        SELECT
          u.product_id,
          MIN(u.old_price) FILTER (WHERE u.updated_at = f.first_update_time) AS start_price,
          MAX(u.new_price) FILTER (WHERE u.updated_at = f.last_update_time) AS end_price
        FROM filtered_updates u
        INNER JOIN first_and_last_updates f
        ON u.product_id = f.product_id
        GROUP BY u.product_id
      )
      SELECT COUNT(*) AS total
      FROM aggregated_updates
      WHERE start_price < end_price;
    `;

    try {
      const [dataResult, countResult] = await Promise.all([
        pool.query(baseQuery, [limit, offset]),
        pool.query(countQuery),
      ]);

      const data = dataResult.rows.map((row) => ({
        product_id: row.product_id,
        old_price: row.start_price,
        new_price: row.end_price,
        percentage_change: row.percentage_change,
        raw_increase: row.raw_increase,
        updated_at: row.updated_at,
      }));

      const total = parseInt(countResult.rows[0].total, 10);

      return {
        total,
        data: data.map((update) => DBPriceUpdateSchema.parse(update)),
      };
    } catch (error) {
      console.error('Error fetching top price increases:', error);
      throw new Error('Failed to fetch top price increases');
    }
  }

  /**
   * Fetch the top N largest price decreases for the past `days` days with pagination.
   * Aggregates multiple updates into a single DBPriceUpdate-like object.
   */
  async getTopPriceDec(
    limit: number,
    days: number,
    offset: number = 0,
    sortRaw: boolean = false
  ): Promise<{ total: number; data: DBPriceUpdate[] }> {
    const baseQuery = `
      WITH filtered_updates AS (
        SELECT *
        FROM price_updates
        WHERE updated_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '${days} days'
      ),
      first_and_last_updates AS (
        SELECT
          product_id,
          MIN(updated_at) AS first_update_time,
          MAX(updated_at) AS last_update_time
        FROM filtered_updates
        GROUP BY product_id
      ),
      aggregated_updates AS (
        SELECT
          u.product_id,
          MIN(u.old_price) FILTER (WHERE u.updated_at = f.first_update_time) AS start_price,
          MAX(u.new_price) FILTER (WHERE u.updated_at = f.last_update_time) AS end_price,
          f.last_update_time AS updated_at
        FROM filtered_updates u
        INNER JOIN first_and_last_updates f
        ON u.product_id = f.product_id
        GROUP BY u.product_id, f.last_update_time
      )
      SELECT
        product_id,
        start_price,
        end_price,
        ((start_price - end_price) / start_price) * 100 AS percentage_change,
        (start_price - end_price) AS raw_discount,
        updated_at
      FROM aggregated_updates
      WHERE start_price > end_price -- Only include valid discounts
      ORDER BY ${sortRaw ? 'raw_discount' : 'percentage_change'} DESC
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `
      WITH filtered_updates AS (
        SELECT *
        FROM price_updates
        WHERE updated_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '${days} days'
      ),
      first_and_last_updates AS (
        SELECT
          product_id,
          MIN(updated_at) AS first_update_time,
          MAX(updated_at) AS last_update_time
        FROM filtered_updates
        GROUP BY product_id
      ),
      aggregated_updates AS (
        SELECT
          u.product_id,
          MIN(u.old_price) FILTER (WHERE u.updated_at = f.first_update_time) AS start_price,
          MAX(u.new_price) FILTER (WHERE u.updated_at = f.last_update_time) AS end_price
        FROM filtered_updates u
        INNER JOIN first_and_last_updates f
        ON u.product_id = f.product_id
        GROUP BY u.product_id
      )
      SELECT COUNT(*) AS total
      FROM aggregated_updates
      WHERE start_price > end_price;
    `;

    try {
      const [dataResult, countResult] = await Promise.all([
        pool.query(baseQuery, [limit, offset]),
        pool.query(countQuery),
      ]);

      const data = dataResult.rows.map((row) => ({
        product_id: row.product_id,
        old_price: row.start_price,
        new_price: row.end_price,
        percentage_change: row.percentage_change,
        raw_discount: row.raw_discount,
        updated_at: row.updated_at,
      }));

      const total = parseInt(countResult.rows[0].total, 10);

      return {
        total,
        data: data.map((update) => DBPriceUpdateSchema.parse(update)),
      };
    } catch (error) {
      console.error('Error fetching top price decreases:', error);
      throw new Error('Failed to fetch top price decreases');
    }
  }
}

export default new PriceUpdateRepository();

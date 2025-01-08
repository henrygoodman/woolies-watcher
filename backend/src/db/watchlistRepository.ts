import { GenericRepository } from './GenericRepository';
import pool from './pool';
import { DBProduct, DBWatchlist } from '@shared-types/db';

class WatchlistRepository extends GenericRepository<DBWatchlist> {
  constructor() {
    super('watchlist');
  }

  /**
   * Add a product to a user's watchlist.
   * Idempotent: Ensures no duplicate entries.
   * @param userId - The user's ID.
   * @param productId - The product's ID.
   */
  async addToWatchlist(userId: number, productId: number): Promise<void> {
    try {
      const query = `
      WITH insert_watchlist AS (
        INSERT INTO watchlist (user_id, product_id, date_added)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, product_id) DO NOTHING
        RETURNING user_id
      )
      UPDATE products
      SET watch_count = watch_count + 1
      WHERE id = $2 AND EXISTS (SELECT 1 FROM insert_watchlist);
    `;
      await pool.query(query, [userId, productId]);
    } catch (error) {
      console.error('Error adding product to watchlist:', error);
      throw new Error('Failed to add product to watchlist.');
    }
  }

  /**
   * Remove a product from a user's watchlist.
   * @param userId - The user's ID.
   * @param productId - The product's ID.
   * @returns True if the product was removed, false otherwise.
   */
  async removeFromWatchlist(
    userId: number,
    productId: number
  ): Promise<boolean> {
    try {
      // Use the `delete` method from the generic repository
      const deleted = await this.deleteCompoundKey({
        user_id: userId,
        product_id: productId,
      });

      if (deleted) {
        const query = `
          UPDATE products
          SET watch_count = GREATEST(watch_count - 1, 0)
          WHERE id = $1
        `;
        await pool.query(query, [productId]);
      }

      return deleted;
    } catch (error) {
      console.error('Error removing product from watchlist:', error);
      throw new Error('Failed to remove product from watchlist.');
    }
  }

  /**
   * Get a user's watchlist.
   * Leverages the `findAll` method with a custom filter.
   * @param userId - The user's ID.
   * @returns The list of products in the user's watchlist.
   */
  async getWatchlist(userId: number): Promise<DBProduct[]> {
    try {
      const query = `
        SELECT p.*
        FROM products p
        INNER JOIN watchlist w ON p.id = w.product_id
        WHERE w.user_id = $1
        ORDER BY w.date_added ASC;
      `;
      const { rows } = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw new Error('Failed to fetch watchlist.');
    }
  }

  /**
   * Get the count of users watching a product.
   * Uses a direct query for optimal performance.
   * @param productId - The product's ID.
   * @returns The count of users watching the product.
   */
  async getWatchlistCountForProduct(productId: number): Promise<number> {
    const query = `
      SELECT COUNT(*)
      FROM watchlist
      WHERE product_id = $1
    `;
    try {
      const result = await pool.query(query, [productId]);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error fetching watchlist count for product:', error);
      throw new Error('Failed to fetch watchlist count for product.');
    }
  }

  /**
   * Get all user watchlists for users with enabled emails.
   * @returns A list of all user watchlists for users whose enable_emails flag is true.
   */
  async getAllUserWatchlists(): Promise<
    {
      email: string;
      watchlist: (DBProduct & { old_price?: number })[];
    }[]
  > {
    const query = `
    SELECT 
      COALESCE(u.destination_email, u.email) AS email,
      p.*,
      pu.old_price
    FROM users u
    INNER JOIN watchlist w ON u.id = w.user_id
    INNER JOIN products p ON w.product_id = p.id
    LEFT JOIN LATERAL (
      SELECT old_price
      FROM price_updates
      WHERE product_id = p.id
        AND updated_at >= NOW() - INTERVAL '24 hours'
      ORDER BY updated_at DESC
      LIMIT 1
    ) pu ON true
    WHERE u.enable_emails = true
    ORDER BY email, w.date_added ASC;
  `;

    try {
      const { rows } = await pool.query(query);
      const userWatchlists: Record<
        string,
        (DBProduct & { old_price?: number })[]
      > = {};

      for (const row of rows) {
        const email = row.email;

        if (!userWatchlists[email]) {
          userWatchlists[email] = [];
        }

        userWatchlists[email].push({
          id: row.id,
          barcode: row.barcode,
          product_name: row.product_name,
          product_brand: row.product_brand,
          current_price: parseFloat(row.current_price),
          product_size: row.product_size,
          url: row.url,
          image_url: row.image_url,
          last_updated: row.last_updated,
          old_price: row.old_price ? parseFloat(row.old_price) : undefined,
        });
      }

      return Object.entries(userWatchlists).map(([email, watchlist]) => ({
        email,
        watchlist,
      }));
    } catch (error) {
      console.error('Error fetching all user watchlists:', error);
      throw new Error('Failed to fetch user watchlists.');
    }
  }

  async getWatchedProducts(): Promise<DBProduct[]> {
    const query = `
      SELECT DISTINCT p.*
      FROM products p
      INNER JOIN watchlist w ON p.id = w.product_id
      ORDER BY p.last_updated DESC;
    `;

    try {
      const { rows } = await pool.query(query);
      return rows.map((row) => ({
        id: row.id,
        barcode: row.barcode,
        product_name: row.product_name,
        product_brand: row.product_brand,
        current_price: parseFloat(row.current_price),
        product_size: row.product_size,
        url: row.url,
        image_url: row.image_url,
        last_updated: row.last_updated,
      }));
    } catch (error) {
      console.error('Error fetching watched products:', error);
      throw new Error('Failed to fetch watched products.');
    }
  }
}

export default new WatchlistRepository();

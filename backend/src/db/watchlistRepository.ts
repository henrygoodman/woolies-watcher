import { GenericRepository } from './GenericRepository';
import pool from './pool';
import { DBProduct, DBWatchlist } from '@shared-types/db';

class WatchlistRepository extends GenericRepository<DBWatchlist> {
  constructor() {
    super('watchlist');
  }

  /**
   * Add a product to a user's watchlist.
   * Leverages the generic `create` method to insert the record.
   * @param userId - The user's ID.
   * @param productId - The product's ID.
   */
  async addToWatchlist(userId: number, productId: number): Promise<void> {
    try {
      // Use `create` to insert into the watchlist table
      await this.create({ user_id: userId, product_id: productId });

      // Update the watch count in the `products` table
      const query = `
        UPDATE products
        SET watch_count = watch_count + 1
        WHERE id = $1
      `;
      await pool.query(query, [productId]);
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
   * Get all user watchlists.
   * @returns A list of all user watchlists.
   */
  async getAllUserWatchlists(): Promise<
    { email: string; watchlist: DBProduct[] }[]
  > {
    const query = `
      SELECT 
        COALESCE(uc.config_value, u.email) AS email, 
        p.*
      FROM users u
      INNER JOIN watchlist w ON u.id = w.user_id
      INNER JOIN products p ON w.product_id = p.id
      LEFT JOIN user_config uc ON u.id = uc.user_id AND uc.config_key = 'destinationEmail'
      ORDER BY email, w.date_added ASC;
    `;
    try {
      const { rows } = await pool.query(query);
      const userWatchlists: Record<string, DBProduct[]> = {};

      for (const row of rows) {
        const email = row.email;

        if (!userWatchlists[email]) {
          userWatchlists[email] = [];
        }

        userWatchlists[email].push(row);
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

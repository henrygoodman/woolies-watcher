import { DBProduct } from '@shared-types/db';
import pool from './pool';
import { resourceLimits } from 'worker_threads';

export const addToWatchlist = async (
  user_id: number,
  product_id: number
): Promise<void> => {
  const query = `
    WITH insert_watchlist AS (
      INSERT INTO watchlist (user_id, product_id, date_added)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING
      RETURNING product_id
    )
    UPDATE products
    SET watch_count = watch_count + 1
    WHERE id = (SELECT product_id FROM insert_watchlist)
  `;
  try {
    await pool.query(query, [user_id, product_id]);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error adding product to watchlist:', error.message);
      throw new Error('Failed to add product to watchlist.');
    }
    throw error;
  }
};

export const removeFromWatchlist = async (
  user_id: number,
  product_id: number
): Promise<boolean> => {
  const query = `
    WITH delete_watchlist AS (
      DELETE FROM watchlist
      WHERE user_id = $1 AND product_id = $2
      RETURNING product_id
    )
    UPDATE products
    SET watch_count = GREATEST(watch_count - 1, 0)
    WHERE id = (SELECT product_id FROM delete_watchlist)
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [user_id, product_id]);
    return result.rowCount != null && result.rowCount > 0;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error removing product from watchlist:', error.message);
      throw new Error('Failed to remove product from watchlist.');
    }
    throw error;
  }
};

export const getWatchlist = async (userId: number): Promise<DBProduct[]> => {
  const query = `
    SELECT p.*
    FROM products p
    INNER JOIN watchlist w ON p.id = w.product_id
    WHERE w.user_id = $1
    ORDER BY w.date_added ASC;
  `;
  try {
    const { rows } = await pool.query(query, [userId]);
    return rows as DBProduct[];
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    throw new Error('Failed to fetch watchlist.');
  }
};

export const getWatchlistCountForProduct = async (
  product_id: number
): Promise<number> => {
  const query = `
    SELECT COUNT(*)
    FROM watchlist
    WHERE product_id = $1
  `;
  try {
    const result = await pool.query(query, [product_id]);
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        'Error fetching watchlist count for product:',
        error.message
      );
      throw new Error('Failed to fetch watchlist count for product.');
    }
    throw error;
  }
};

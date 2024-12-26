import { DBProduct } from '@shared-types/db';
import pool from './pool';

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

interface UserWatchlist {
  email: string;
  watchlist: DBProduct[];
}

// TODO: Change from user email to the set email in user config
export const getAllUserWatchlists = async (): Promise<UserWatchlist[]> => {
  const query = `
    SELECT u.email, p.*
    FROM users u
    INNER JOIN watchlist w ON u.id = w.user_id
    INNER JOIN products p ON w.product_id = p.id
    ORDER BY u.email, w.date_added ASC;
  `;

  try {
    const { rows } = await pool.query(query);

    const userWatchlists: Record<string, DBProduct[]> = {};

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
};

export const getWatchedProducts = async (): Promise<DBProduct[]> => {
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
};

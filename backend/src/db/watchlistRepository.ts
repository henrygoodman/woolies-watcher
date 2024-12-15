import pool from './pool';

export const addToWatchlist = async (
  user_id: number,
  product_id: number
): Promise<void> => {
  const query = `
    INSERT INTO watchlist (user_id, product_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
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
      DELETE FROM watchlist
      WHERE user_id = $1 AND product_id = $2
      RETURNING *
    `;
  try {
    const result = await pool.query(query, [user_id, product_id]);

    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error removing product from watchlist:', error.message);
      throw new Error('Failed to remove product from watchlist.');
    }
    throw error;
  }
};

export const getWatchlist = async (userId: number) => {
  const query = `
    SELECT
      w.product_id,
      p.product_name,
      p.product_brand,
      p.current_price,
      p.image_url,
      w.added_at
    FROM
      watchlist w
    JOIN
      products p ON w.product_id = p.id
    WHERE
      w.user_id = $1
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
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

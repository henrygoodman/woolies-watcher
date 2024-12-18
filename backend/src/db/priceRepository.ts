import pool from '@/db/pool';
import { PriceUpdate } from '@shared-types/db';

export async function getPriceUpdatesByProduct(
  productId: number
): Promise<PriceUpdate[]> {
  const query = `
      SELECT id, product_id, old_price, new_price, updated_at
      FROM price_updates
      WHERE product_id = $1
      ORDER BY updated_at DESC
    `;
  try {
    const result = await pool.query(query, [productId]);
    return result.rows as PriceUpdate[];
  } catch (error) {
    console.error('Error fetching price updates:', error);
    throw new Error('Failed to fetch price updates');
  }
}

export async function addPriceUpdate(
  productId: number,
  oldPrice: number,
  newPrice: number
) {
  const query = `
    INSERT INTO price_updates (product_id, old_price, new_price, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  try {
    const result = await pool.query(query, [productId, oldPrice, newPrice]);
    return result.rows[0];
  } catch (error) {
    console.error('Error adding price update:', error);
    throw new Error('Failed to add price update');
  }
}

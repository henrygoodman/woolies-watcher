import { GenericRepository } from '@/db/GenericRepository';
import pool from '@/db/pool';
import { DBPriceUpdate, DBPriceUpdateSchema } from '@shared-types/db';

class PriceUpdateRepository extends GenericRepository<DBPriceUpdate> {
  constructor() {
    super('price_updates', DBPriceUpdateSchema);
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
}

export default new PriceUpdateRepository();

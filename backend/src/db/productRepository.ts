import pool from './pool';
import { GenericRepository } from './GenericRepository';
import { DBProduct, DBProductSchema } from '@shared-types/db';
import priceRepository from '@/db/priceRepository';

class ProductRepository extends GenericRepository<DBProduct> {
  constructor() {
    super('products', DBProductSchema);
  }

  /**
   * Find a product by its name and URL.
   * @param product_name - The product's name.
   * @param url - The product's URL.
   * @returns The product if found, otherwise null.
   */
  async findByFields(
    product_name: string,
    url: string
  ): Promise<DBProduct | null> {
    const query = `
      SELECT * FROM products
      WHERE product_name = $1 AND url = $2
    `;
    try {
      const result = await pool.query(query, [product_name, url]);
      return result.rows.length > 0
        ? DBProductSchema.parse(result.rows[0])
        : null;
    } catch (error) {
      console.error('Error querying product by fields:', error);
      throw error;
    }
  }

  /**
   * Save or update a product in the database.
   * @param product - The product object.
   * @returns The saved or updated product.
   */
  async create(product: DBProduct): Promise<DBProduct> {
    const existingProduct = await this.findByFields(
      product.product_name,
      product.url
    );

    if (existingProduct) {
      if (existingProduct.current_price !== product.current_price) {
        console.log('Price change detected', product.id, product.product_name);
        await priceRepository.create({
          product_id: existingProduct.id!,
          old_price: existingProduct.current_price,
          new_price: product.current_price,
          updated_at: new Date(),
        });
      }
    }

    const query = `
      INSERT INTO products 
        (product_name, barcode, product_brand, current_price, product_size, url, image_url, last_updated)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (product_name, url)
      DO UPDATE SET
        barcode = EXCLUDED.barcode,
        product_brand = EXCLUDED.product_brand,
        current_price = EXCLUDED.current_price,
        product_size = EXCLUDED.product_size,
        image_url = EXCLUDED.image_url,
        last_updated = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, [
        product.product_name,
        product.barcode,
        product.product_brand,
        product.current_price,
        product.product_size,
        product.url,
        product.image_url,
      ]);

      const savedProduct = DBProductSchema.parse(result.rows[0]);

      // If the product is new, create an initial price update
      if (!existingProduct) {
        console.log(
          'New product detected',
          savedProduct.id,
          savedProduct.product_name
        );
        await priceRepository.create({
          product_id: savedProduct.id!,
          old_price: savedProduct.current_price,
          new_price: savedProduct.current_price,
          updated_at: new Date(),
        });
      }

      return savedProduct;
    } catch (error) {
      console.error('Error saving product to database:', error);
      throw error;
    }
  }
}

export default new ProductRepository();

import pool from './pool';
import { DBProductSchema, DBProduct } from '@shared-types/db';
import { addPriceUpdate } from '@/db/priceRepository';

export async function findProductByFields(
  product_name: string,
  url: string
): Promise<DBProduct | null> {
  const query = `
    SELECT * FROM products
    WHERE product_name = $1
    AND url = $2
  `;
  try {
    const result = await pool.query(query, [product_name, url]);

    if (result.rows.length === 0) {
      return null;
    }

    return DBProductSchema.parse(result.rows[0]);
  } catch (error) {
    console.error('Error querying product by fields:', error);
    throw error;
  }
}

export const getProductFromDB = async (
  productId: number
): Promise<DBProduct | null> => {
  const query = `
    SELECT *
    FROM products
    WHERE id = $1
    LIMIT 1;
  `;

  try {
    const result = await pool.query(query, [productId]);

    if (result.rows.length === 0) {
      return null;
    }

    return DBProductSchema.parse(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product from database:', error);
    throw new Error('Failed to fetch product from the database');
  }
};

export async function saveProductToDB(product: DBProduct): Promise<DBProduct> {
  const existingProduct = await findProductByFields(
    product.product_name,
    product.url
  );

  if (existingProduct) {
    if (
      existingProduct.current_price !== product.current_price &&
      existingProduct.url === product.url
    ) {
      await addPriceUpdate(
        existingProduct.id!,
        existingProduct.current_price,
        product.current_price
      );
    }
  }

  const query = `
    INSERT INTO products (product_name, product_brand, current_price, product_size, url, image_url, last_updated)
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    ON CONFLICT (product_name, url)
    DO UPDATE SET
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
      product.product_brand,
      product.current_price,
      product.product_size,
      product.url,
      product.image_url,
    ]);

    return DBProductSchema.parse(result.rows[0]);
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
}

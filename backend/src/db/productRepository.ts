import pool from './pool';
import { DBProduct } from '@shared-types/db';
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

    const dbProduct = result.rows[0];
    return {
      id: dbProduct.id,
      barcode: dbProduct.barcode,
      product_name: dbProduct.product_name,
      product_brand: dbProduct.product_brand,
      current_price: parseFloat(dbProduct.current_price),
      product_size: dbProduct.product_size,
      url: dbProduct.url,
      image_url: dbProduct.image_url,
      last_updated: dbProduct.last_updated,
    };
  } catch (error) {
    console.error('Error querying product by fields:', error);
    throw error;
  }
}

export const getProductFromDB = async (
  productId: number
): Promise<DBProduct | null> => {
  const query = `
    SELECT id, barcode, product_name, product_brand, current_price, 
           product_size, url, image_url, last_updated
    FROM products
    WHERE id = $1
    LIMIT 1;
  `;

  try {
    const result = await pool.query(query, [productId]);

    if (result.rows.length === 0) {
      return null;
    }

    const dbProduct = result.rows[0];

    return {
      id: dbProduct.id,
      barcode: dbProduct.barcode,
      product_name: dbProduct.product_name,
      product_brand: dbProduct.product_brand,
      current_price: parseFloat(dbProduct.current_price),
      product_size: dbProduct.product_size,
      url: dbProduct.url,
      image_url: dbProduct.image_url,
      last_updated: dbProduct.last_updated,
    };
  } catch (error) {
    console.error('Error fetching product from database:', error);
    throw new Error('Failed to fetch product from the database');
  }
};

/**
 * Save product to DB and track price updates
 */
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
      // Track price update
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

    const updatedProduct = result.rows[0];
    updatedProduct.current_price = parseFloat(updatedProduct.current_price);

    return updatedProduct as DBProduct;
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
}

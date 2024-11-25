import pool from './pool';
import { Product } from '@shared-types/api';

export async function findProductByFields(
  barcode: string | null,
  product_name: string
): Promise<Product | null> {
  const query = `
    SELECT * FROM products
    WHERE (barcode = $1 OR $1 IS NULL)
    AND product_name = $2
    LIMIT 1
  `;
  try {
    const result = await pool.query(query, [barcode, product_name]);

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

export async function getProductFromDB(id: number): Promise<Product | null> {
  const query = 'SELECT * FROM products WHERE id = $1';
  try {
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const dbProduct = result.rows[0];
    const product: Product = {
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

    return product;
  } catch (error) {
    console.error('Error querying database:', error);
    throw error;
  }
}

export async function saveProductToDB(product: Product): Promise<void> {
  const query = `
    INSERT INTO products (barcode, product_name, product_brand, current_price, product_size, url, image_url, last_updated)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    ON CONFLICT (barcode)
    DO UPDATE SET
      product_name = $2,
      product_brand = $3,
      current_price = $4,
      product_size = $5,
      url = $6,
      image_url = $7,
      last_updated = CURRENT_TIMESTAMP
  `;
  try {
    await pool.query(query, [
      product.barcode,
      product.product_name,
      product.product_brand,
      product.current_price,
      product.product_size,
      product.url,
      product.image_url,
    ]);
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
}

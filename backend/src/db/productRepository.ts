import pool from './pool';
import { DBProduct } from '@shared-types/db';
import { addPriceUpdate } from '@/db/priceRepository';

export async function findProductByFields(
  barcode: string | null,
  product_name: string
): Promise<DBProduct | null> {
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

export async function findProductsByIdentifiers(
  ids: number[],
  barcodes: string[],
  productNames: string[]
): Promise<DBProduct[]> {
  const query = `
    SELECT id, barcode, product_name, image_url 
    FROM products 
    WHERE id = ANY($1::int[]) OR (barcode = ANY($2::text[]) AND product_name = ANY($3::text[]))
  `;
  try {
    const { rows } = await pool.query(query, [ids, barcodes, productNames]);
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
    console.error('Error fetching products by identifiers:', error);
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
  const existingProduct = product.barcode
    ? await findProductByFields(product.barcode, product.product_name)
    : null;

  if (
    existingProduct &&
    existingProduct.current_price !== product.current_price
  ) {
    addPriceUpdate(
      existingProduct.id!,
      existingProduct.current_price,
      product.current_price
    );
  }

  const query = `
    INSERT INTO products (barcode, product_name, product_brand, current_price, product_size, url, image_url, last_updated)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    ON CONFLICT (barcode)
    DO UPDATE SET
      product_name = EXCLUDED.product_name,
      product_brand = EXCLUDED.product_brand,
      current_price = EXCLUDED.current_price,
      product_size = EXCLUDED.product_size,
      url = EXCLUDED.url,
      image_url = EXCLUDED.image_url,
      last_updated = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [
      product.barcode,
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

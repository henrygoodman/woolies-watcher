import { RequestHandler } from 'express';
import pool from '@/db/pool';

export const handleProductUpdates: RequestHandler = async (req, res) => {
  const { productIdentifiers } = req.body; // Assume an array of objects { id, barcode, product_name }

  if (
    !productIdentifiers ||
    !Array.isArray(productIdentifiers) ||
    !productIdentifiers.every(
      (p) =>
        typeof p === 'object' &&
        ('id' in p || ('barcode' in p && 'product_name' in p))
    )
  ) {
    res.status(400).json({ error: 'Invalid product identifiers' });
    return;
  }

  try {
    const query = `
        SELECT id, barcode, product_name, image_url 
        FROM products 
        WHERE id = ANY($1::int[]) OR (barcode = ANY($2::text[]) AND product_name = ANY($3::text[]))
      `;

    const ids = productIdentifiers.map((p) => p.id).filter((id) => id !== 0);
    const barcodes = productIdentifiers
      .map((p) => p.barcode)
      .filter((barcode) => barcode);
    const productNames = productIdentifiers
      .map((p) => p.product_name)
      .filter((name) => name);

    const { rows: products } = await pool.query(query, [
      ids,
      barcodes,
      productNames,
    ]);

    res.json(products);
  } catch (error) {
    console.error('Error fetching product updates:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
};

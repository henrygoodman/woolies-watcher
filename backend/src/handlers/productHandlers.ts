import { RequestHandler } from 'express';
import {
  findProductsByIdentifiers,
  getProductFromDB,
} from '@/db/productRepository';

export const handleProductGet: RequestHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await getProductFromDB(Number(id));
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const handleProductUpdates: RequestHandler = async (req, res) => {
  const { productIdentifiers } = req.body;

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
    const ids = productIdentifiers.map((p) => p.id).filter((id) => id !== 0);
    const barcodes = productIdentifiers
      .map((p) => p.barcode)
      .filter((barcode) => barcode);
    const productNames = productIdentifiers
      .map((p) => p.product_name)
      .filter((name) => name);

    const products = await findProductsByIdentifiers(
      ids,
      barcodes,
      productNames
    );
    res.json(products);
  } catch (error) {
    console.error('Error fetching product updates:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
};

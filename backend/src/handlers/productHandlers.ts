import { RequestHandler } from 'express';
import { findProductByFields, getProductFromDB } from '@/db/productRepository';
import { ProductIdentifier } from '@shared-types/api';

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

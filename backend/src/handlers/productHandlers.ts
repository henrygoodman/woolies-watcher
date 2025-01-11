import { RequestHandler } from 'express';
import productRepository from '@/db/productRepository';

export const handleProductGet: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await productRepository.findById(Number(id));
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

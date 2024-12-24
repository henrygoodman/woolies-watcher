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

export const handleProductUpdates: RequestHandler = async (req, res) => {
  const productIdentifiers = req.body as ProductIdentifier[];

  try {
    const products = [];

    for (const identifier of productIdentifiers) {
      const { product_name, url } = identifier;

      try {
        const product = await findProductByFields(product_name, url);
        if (product) {
          products.push(product);
        }
      } catch (error) {
        console.error(
          `Error fetching product with name "${product_name}" and URL "${url}":`,
          error
        );
      }
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching product updates:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
};

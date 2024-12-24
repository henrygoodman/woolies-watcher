import { RequestHandler } from 'express';
import {
  fetchProducts,
  fetchProductsByNameAndUrl,
} from '@/services/product/productService';
import { parseQueryParams } from '@/utils/parseQueryParams';

/**
 * Handles product search requests with pagination.
 */
export const handleSearchProducts: RequestHandler = async (req, res) => {
  try {
    const queryParams = parseQueryParams(req);
    if (!queryParams) {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    const { query, page, size } = queryParams;

    if (!query) {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    const searchResults = await fetchProducts(query, page, size);
    res.status(200).json(searchResults);
  } catch (error) {
    console.error('Error occurred during product search:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};

export const handleSearchProductByNameAndUrl: RequestHandler = async (
  req,
  res
) => {
  const { product_name, url } = req.body;

  if (!product_name || !url) {
    res.status(400).json({ error: 'Product name and URL are required' });
    return;
  }

  try {
    const updatedProduct = await fetchProductsByNameAndUrl(product_name, url);

    if (!updatedProduct) {
      res
        .status(404)
        .json({ error: 'Product not found or could not be updated' });
      return;
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error fetching product by name and URL:', error);
    res.status(500).json({ error: 'Failed to fetch or update product' });
  }
};

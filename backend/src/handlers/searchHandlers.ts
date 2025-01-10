import { RequestHandler } from 'express';
import {
  fetchProducts,
  fetchProductsByNameAndUrl,
} from '@/services/product/productService';
import { parseQueryParams } from '@/utils/parseQueryParams';
import { ApiRateLimitExceededError } from '@/utils/apiRateLimitHandler';
import {
  ProductSearchRequestSchema,
  ProductSearchResponseSchema,
} from '@shared-types/api';

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
    ProductSearchResponseSchema.parse(searchResults);
    res.status(200).json(searchResults);
  } catch (error: any) {
    if (error instanceof ApiRateLimitExceededError) {
      console.error('429:', error.message);
      res.status(429).json({ error: error.message });
    } else {
      console.error('500:', error.message);
      res.status(500).json({ error: 'Failed to fetch data.' });
    }
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
    const product = await fetchProductsByNameAndUrl(product_name, url);
    res.status(200).json(product);
  } catch (error: any) {
    if (error instanceof ApiRateLimitExceededError) {
      console.error('429:', error.message);
      res.status(429).json({ error: error.message });
    } else {
      console.error('500:', error);
      res.status(500).json({ error: 'Failed to fetch or update product' });
    }
  }
};

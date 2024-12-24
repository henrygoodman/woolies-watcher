import { RequestHandler } from 'express';
import axios from 'axios';
import { findProductByFields, saveProductToDB } from '@/db/productRepository';
import { parseQueryParams } from '@/utils/parseQueryParams';
import { DBProduct } from '@shared-types/db';
import { ProductIdentifier, ProductSearchResponse } from '@shared-types/api';
import { isStaleProduct } from '@/utils/staleProductCheck';

let apiUsageExceeded = false;
let resetTimeout: NodeJS.Timeout | null = null;

const handleApiRateLimit = (headers: any) => {
  const remainingRequests = parseInt(
    headers['x-ratelimit-requests-remaining'],
    10
  );

  console.log('Performing API call (no cache or stale)', remainingRequests);

  const resetTime = parseInt(headers['x-ratelimit-requests-reset'], 10);

  if (remainingRequests === 0) {
    apiUsageExceeded = true;

    if (resetTimeout) clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
      apiUsageExceeded = false;
      console.log('API quota reset. Resuming requests.');
    }, resetTime * 1000);
  }
};

export const handleSearchProducts: RequestHandler = async (req, res) => {
  if (apiUsageExceeded) {
    res
      .status(429)
      .json({ error: 'API usage limit reached. Please try again later.' });
    return;
  }

  const queryParams = parseQueryParams(req);
  if (!queryParams) {
    res.status(400).json({ error: 'Query parameter is required' });
    return;
  }

  const { query, page, size } = queryParams;

  try {
    const response = await axios.get(
      'https://woolworths-products-api.p.rapidapi.com/woolworths/product-search/',
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'woolworths-products-api.p.rapidapi.com',
        },
        params: { query, page, size },
      }
    );

    handleApiRateLimit(response.headers);

    const results = await Promise.all(
      response.data.results.map(async (product: any) => {
        const product_url = product.url;
        const product_name = product.product_name;
        const barcode = product.barcode ? String(product.barcode) : null;

        let cachedProduct = await findProductByFields(
          product_name,
          product_url
        );

        const productId = product_url.split('/').pop();
        const image_url = `https://assets.woolworths.com.au/images/1005/${productId}.jpg?impolicy=wowsmkqiema&w=600&h=600`;

        const productToSave: DBProduct = {
          id: cachedProduct?.id,
          barcode: barcode,
          product_name,
          product_brand: product.product_brand,
          current_price: parseFloat(product.current_price),
          product_size: product.product_size,
          url: product_url,
          image_url,
          last_updated: new Date().toISOString(),
        };

        const savedProduct = await saveProductToDB(productToSave);

        return savedProduct;
      })
    );

    res.json({
      query,
      page,
      size,
      total_results: response.data.total_results,
      total_pages: response.data.total_pages,
      results,
    } as ProductSearchResponse);
  } catch (error) {
    console.error('Error occurred during search request:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};

export const handleSearchProductByNameAndUrl: RequestHandler = async (
  req,
  res
) => {
  if (apiUsageExceeded) {
    res
      .status(429)
      .json({ error: 'API usage limit reached. Please try again later.' });
    return;
  }

  const { product_name, url } = req.body as ProductIdentifier;

  try {
    let cachedProduct = await findProductByFields(product_name, url);

    if (cachedProduct && !isStaleProduct(cachedProduct.last_updated)) {
      res.json(cachedProduct);
      return;
    }

    const response = await axios.get(
      'https://woolworths-products-api.p.rapidapi.com/woolworths/product-search/',
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'woolworths-products-api.p.rapidapi.com',
        },
        params: { query: product_name, page: 1, size: 1 },
      }
    );

    handleApiRateLimit(response.headers);

    const results = response.data.results;
    if (!results || results.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const product = results.find((p: any) => p.url === url);
    if (!product) {
      res
        .status(404)
        .json({ error: 'No matching product found for the provided URL' });
      return;
    }

    const productId = url.split('/').pop();
    const image_url = `https://assets.woolworths.com.au/images/1005/${productId}.jpg?impolicy=wowsmkqiema&w=600&h=600`;

    const productToSave: DBProduct = {
      id: cachedProduct?.id,
      barcode: product.barcode ? String(product.barcode) : null,
      product_name: product.product_name,
      product_brand: product.product_brand,
      current_price: parseFloat(product.current_price),
      product_size: product.product_size,
      url: product.url,
      image_url,
      last_updated: new Date().toISOString(),
    };

    const savedProduct = await saveProductToDB(productToSave);

    res.json(savedProduct);
  } catch (error) {
    console.error('Error fetching product by name and URL:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

import axios from 'axios';
import { findProductByFields, saveProductToDB } from '@/db/productRepository';
import { DBProduct } from '@shared-types/db';
import { isStaleProduct } from '@/utils/staleProductCheck';
import { ProductSearchResponse } from '@shared-types/api';
import {
  isApiUsageExceeded,
  handleApiRateLimit,
} from '@/utils/apiRateLimitHandler';

/**
 * Fetch products from the third-party API, perform caching, and handle stale updates.
 * @param query - Search query string.
 * @param page - Current page for pagination.
 * @param size - Number of results per page.
 * @returns A promise resolving to the processed product search response.
 */
export const fetchProducts = async (
  query: string,
  page: number,
  size: number
): Promise<ProductSearchResponse> => {
  if (isApiUsageExceeded()) {
    console.warn('API usage limit reached. Skipping product fetch.');
    throw new Error('API usage limit exceeded');
  }

  if (!query) {
    console.warn('Query parameter is missing.');
    throw new Error('Query parameter is required');
  }

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

        if (cachedProduct && !isStaleProduct(cachedProduct.last_updated)) {
          return cachedProduct;
        }

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

        return await saveProductToDB(productToSave);
      })
    );

    return {
      query,
      page,
      size,
      total_results: response.data.total_results,
      total_pages: response.data.total_pages,
      results,
    };
  } catch (error) {
    console.error('Error fetching and processing products:', error);
    throw new Error('Failed to fetch and process products');
  }
};

/**
 * Searches for a product by name and URL, updates its price if stale,
 * and saves it to the database.
 */
export const fetchProductsByNameAndUrl = async (
  product_name: string,
  url: string
): Promise<DBProduct | null> => {
  if (isApiUsageExceeded()) {
    console.warn('API usage limit reached. Skipping search.');
    return null;
  }

  if (!product_name || !url) {
    console.warn('Product name or URL is missing. Skipping search.');
    return null;
  }

  try {
    let cachedProduct = await findProductByFields(product_name, url);

    if (cachedProduct && !isStaleProduct(cachedProduct.last_updated)) {
      return cachedProduct; // Return the cached product if it's not stale
    }

    const response = await axios.get(
      'https://woolworths-products-api.p.rapidapi.com/woolworths/product-search/',
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'woolworths-products-api.p.rapidapi.com',
        },
        params: { query: product_name, page: 1, size: 18 },
      }
    );

    handleApiRateLimit(response.headers);

    const results = response.data.results;
    if (!results || results.length === 0) {
      console.warn('No results found for product:', product_name);
      return null;
    }

    const apiProduct = results.find((p: any) => p.url === url);
    if (!apiProduct) {
      console.warn('No matching product found for URL:', url);
      return null;
    }

    const productId = url.split('/').pop();
    const image_url = `https://assets.woolworths.com.au/images/1005/${productId}.jpg?impolicy=wowsmkqiema&w=600&h=600`;

    const productToSave: DBProduct = {
      id: cachedProduct?.id,
      barcode: apiProduct.barcode ? String(apiProduct.barcode) : null,
      product_name: apiProduct.product_name,
      product_brand: apiProduct.product_brand,
      current_price: parseFloat(apiProduct.current_price),
      product_size: apiProduct.product_size,
      url: apiProduct.url,
      image_url,
      last_updated: new Date().toISOString(),
    };

    return await saveProductToDB(productToSave);
  } catch (error) {
    console.error('Error fetching product by name and URL:', error);
    throw new Error('Failed to fetch or update product.');
  }
};

/**
 * Searches for a product by its barcode, updates its price if stale,
 * and saves it to the database.
 */
export const fetchProductsByBarcode = async (
  product: DBProduct
): Promise<DBProduct | null> => {
  if (isApiUsageExceeded()) {
    console.warn('API usage limit reached. Skipping search.');
    return null;
  }

  if (!product.barcode) {
    console.warn('Product barcode is missing. Skipping search.');
    return null;
  }

  try {
    let cachedProduct = await findProductByFields(
      product.product_name,
      product.url
    );

    if (cachedProduct && !isStaleProduct(cachedProduct.last_updated)) {
      return cachedProduct;
    }

    const response = await axios.get(
      `https://woolworths-products-api.p.rapidapi.com/woolworths/product-search/`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'woolworths-products-api.p.rapidapi.com',
        },
        params: { barcode: product.barcode, page: 1, size: 1 },
      }
    );

    handleApiRateLimit(response.headers);

    const results = response.data.results;
    if (!results || results.length === 0) {
      console.warn('No results found for barcode:', product.barcode);
      return null;
    }

    const apiProduct = results[0];
    const productId = apiProduct.url.split('/').pop();
    const image_url = `https://assets.woolworths.com.au/images/1005/${productId}.jpg?impolicy=wowsmkqiema&w=600&h=600`;

    const productToSave: DBProduct = {
      id: cachedProduct?.id,
      barcode: product.barcode,
      product_name: apiProduct.product_name,
      product_brand: apiProduct.product_brand,
      current_price: parseFloat(apiProduct.current_price),
      product_size: apiProduct.product_size,
      url: apiProduct.url,
      image_url,
      last_updated: new Date().toISOString(),
    };

    return await saveProductToDB(productToSave);
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    throw new Error('Failed to fetch or update product.');
  }
};

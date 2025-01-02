import productRepository from '@/db/productRepository';
import { DBProduct, DBProductSchema } from '@shared-types/db';
import { isStaleProduct } from '@/services/product/staleProductCheck';
import { ProductSearchResponse } from '@shared-types/api';
import { rateLimiter } from '@/utils/apiRateLimitHandler';

export class NoProductsFoundError extends Error {
  constructor(message = 'No products found for the given query') {
    super(message);
    this.name = 'NoProductsFoundError';
  }
}

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
  if (!query) {
    console.warn('Query parameter is missing.');
    throw new Error('Query parameter is required');
  }

  try {
    const response = await rateLimiter.fetch({
      method: 'GET',
      url: 'https://woolworths-products-api.p.rapidapi.com/woolworths/product-search/',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
        'x-rapidapi-host': 'woolworths-products-api.p.rapidapi.com',
      },
      params: { query, page, size },
    });

    if (!Array.isArray(response.data.results)) {
      throw new Error('Invalid API response');
    }

    const results: DBProduct[] = await Promise.all(
      response.data.results.map(async (apiProduct: unknown) => {
        const validatedProduct = preprocessAndValidateProduct(apiProduct);

        const cachedProduct = await productRepository.findByFields(
          validatedProduct.product_name,
          validatedProduct.url
        );

        if (cachedProduct && !isStaleProduct(cachedProduct.last_updated)) {
          return cachedProduct;
        }

        const image_url = generateImageUrl(validatedProduct.url);

        return await productRepository.create({
          ...validatedProduct,
          id: cachedProduct?.id,
          image_url,
        });
      })
    );

    return {
      page,
      size: response.data.total_results,
      total: response.data.total_pages,
      results,
    };
  } catch (error: any) {
    // 3rd party API throws a 500 for no results instead of 200
    if (
      error.response?.status === 500 &&
      error.response?.data?.detail === '404: No products found'
    ) {
      return { page, size: 0, total: 0, results: [] };
    }
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
  if (!product_name || !url) {
    console.warn('Product name or URL is missing. Skipping search.');
    return null;
  }

  try {
    const cachedProduct = await productRepository.findByFields(
      product_name,
      url
    );

    if (cachedProduct && !isStaleProduct(cachedProduct.last_updated)) {
      return cachedProduct;
    }

    const response = await rateLimiter.fetch({
      method: 'GET',
      url: 'https://woolworths-products-api.p.rapidapi.com/woolworths/product-search/',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
        'x-rapidapi-host': 'woolworths-products-api.p.rapidapi.com',
      },
      params: { query: product_name, page: 1, size: 18 },
    });

    if (!Array.isArray(response.data.results)) {
      return null;
    }

    const apiProduct = response.data.results.find((p: any) => p.url === url);
    if (!apiProduct) {
      return null;
    }

    const validatedProduct = preprocessAndValidateProduct(apiProduct);

    const image_url = generateImageUrl(validatedProduct.url);

    return await productRepository.create({
      ...validatedProduct,
      id: cachedProduct?.id,
      image_url,
    });
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
  if (!product.barcode) {
    console.warn('Product barcode is missing. Skipping search.');
    return null;
  }

  try {
    const cachedProduct = await productRepository.findByFields(
      product.product_name,
      product.url
    );

    if (cachedProduct && !isStaleProduct(cachedProduct.last_updated)) {
      return cachedProduct;
    }

    const response = await rateLimiter.fetch({
      method: 'GET',
      url: `https://woolworths-products-api.p.rapidapi.com/woolworths/barcode-search/${product.barcode}`,
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
        'x-rapidapi-host': 'woolworths-products-api.p.rapidapi.com',
      },
    });

    if (!response.data?.results || response.data.results.length === 0) {
      return null;
    }

    const apiProduct = response.data.results[0];
    const validatedProduct = preprocessAndValidateProduct(apiProduct);

    const image_url = generateImageUrl(validatedProduct.url);

    return await productRepository.create({
      ...validatedProduct,
      id: cachedProduct?.id,
      image_url,
    });
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    throw new Error('Failed to fetch or update product.');
  }
};

/**
 * Preprocesses and validates an API product object.
 * @param apiProduct - The raw product object from the API.
 * @returns A validated and preprocessed DBProduct.
 */
const preprocessAndValidateProduct = (apiProduct: unknown): DBProduct => {
  if (typeof apiProduct !== 'object' || apiProduct === null) {
    throw new Error('Invalid API product format');
  }

  const preprocessedProduct = {
    ...apiProduct,
    barcode: (apiProduct as any).barcode
      ? String((apiProduct as any).barcode)
      : null,
    last_updated: new Date(),
  };

  return DBProductSchema.parse(preprocessedProduct);
};

/**
 * Generates an image URL for the product.
 * @param url - The product URL.
 * @returns The generated image URL.
 */
const generateImageUrl = (url: string): string => {
  const productId = url.split('/').pop();
  return `https://assets.woolworths.com.au/images/1005/${productId}.jpg?impolicy=wowsmkqiema&w=600&h=600`;
};

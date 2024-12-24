import {
  ProductIdentifier,
  ProductSearchRequest,
  ProductSearchResponse,
} from '@shared-types/api';
import { DBProduct } from '@shared-types/db';

/**
 * Fetch product details by ID.
 * @param id - The ID of the product.
 * @returns A promise that resolves to the product details.
 * @throws Will throw an error if the fetch fails.
 */
export const fetchProductDetailsApi = async (
  id: number
): Promise<DBProduct> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/product/${id}`
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as DBProduct;
};

/**
 * Fetch products based on search query, page, and size.
 * @param query - Search term for products.
 * @param page - Page number for pagination.
 * @param size - Number of results per page.
 * @returns A promise that resolves to the search response.
 * @throws Will throw an error if the fetch fails.
 */
export const fetchProductsApi = async (
  query: ProductSearchRequest['query'],
  page: ProductSearchRequest['page'],
  size: ProductSearchRequest['size']
): Promise<ProductSearchResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/search?query=${query}&page=${page}&size=${size}`
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as ProductSearchResponse;
};

/**
 * Fetch a product by name and URL.
 * @param name - The exact product name to search for.
 * @param url - The product URL to disambiguate similar products.
 * @returns A promise that resolves to the fetched product details.
 * @throws Will throw an error if the fetch fails.
 */
export const fetchProductByNameAndUrlApi = async (
  product_name: string,
  url: string
): Promise<DBProduct> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/search/name`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_name, url } as ProductIdentifier),
    }
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as DBProduct;
};

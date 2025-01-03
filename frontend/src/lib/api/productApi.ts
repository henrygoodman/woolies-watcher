import {
  ProductIdentifier,
  ProductSearchRequest,
  ProductSearchResponse,
} from '@shared-types/api';
import { DBProduct, DBProductSchema } from '@shared-types/db';
import { z } from 'zod';

export class ApiRateLimitError extends Error {
  title: string;

  constructor(
    message: string = 'Whoa! You’re searching too quickly.\nTry again later, and slow down or you may be permanently blocked.'
  ) {
    super(message);
    this.name = 'ApiRateLimitError';
    this.title = 'Too Many Requests';
  }
}

export class ApiBlocklistError extends Error {
  title: string;

  constructor() {
    const message = `Your IP address has been blocked from this function due to repeated API abuse.\n \
                    If you believe this is a mistake, please contact us to resolve the issue.`;
    super(message);
    this.name = 'ApiBlocklistError';
    this.title = 'Access Denied';
  }
}

/**
 * Fetch product details by ID.
 * @param id - The ID of the product.
 * @returns A promise that resolves to the product details.
 * @throws Will throw an error if the fetch fails or validation fails.
 */
export const fetchProductApi = async (id: number): Promise<DBProduct> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/product/${id}`
  );

  if (!response.ok) {
    if (response.status === 403) {
      throw new ApiBlocklistError();
    } else if (response.status === 429) {
      throw new ApiRateLimitError();
    }
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  return DBProductSchema.parse(json);
};

/**
 * Fetch products based on search query, page, and size.
 * @param query - Search term for products.
 * @param page - Page number for pagination.
 * @param size - Number of results per page.
 * @returns A promise that resolves to the search response.
 * @throws Will throw an error if the fetch fails or validation fails.
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
    if (response.status === 403) {
      throw new ApiBlocklistError();
    } else if (response.status === 429) {
      throw new ApiRateLimitError();
    }
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  const ProductSearchResponseSchema = z.object({
    results: z.array(DBProductSchema),
    total: z.number(),
    page: z.number(),
    size: z.number(), // the count of results
  });
  return ProductSearchResponseSchema.parse(json);
};

/**
 * Fetch a product by name and URL.
 * @param name - The exact product name to search for.
 * @param url - The product URL to disambiguate similar products.
 * @returns A promise that resolves to the fetched product details.
 * @throws Will throw an error if the fetch fails or validation fails.
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
    if (response.status === 403) {
      throw new ApiBlocklistError();
    } else if (response.status === 429) {
      throw new ApiRateLimitError();
    }
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  return DBProductSchema.parse(json);
};

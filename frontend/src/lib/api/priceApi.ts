import {
  PaginatedPriceUpdateWithProduct,
  PaginatedPriceUpdateWithProductSchema,
  TopPriceUpdatesWithProducts,
  TopPriceUpdateWithProductSchema,
} from '@shared-types/api';
import { DBPriceUpdate, DBPriceUpdateSchema } from '@shared-types/db';

/**
 * Fetch price updates for a product by ID.
 * @param productId - The ID of the product.
 * @returns A promise that resolves to an array of price updates.
 * @throws Will throw an error if the fetch fails or if the data is invalid.
 */
export const fetchPriceUpdatesApi = async (
  productId: number
): Promise<DBPriceUpdate[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/price/product/${productId}`
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return data.map((item: unknown) => DBPriceUpdateSchema.parse(item));
};

/**
 * Fetch the recent price changes (increases/decreases)
 * ranked by percentage, including full product details.
 * @returns A promise that resolves to an object containing arrays of discounts and increases.
 * @throws Will throw an error if the fetch fails or data is invalid.
 */
export const fetchGlobalPriceUpdatesApi = async (
  limit: number,
  days: number
): Promise<TopPriceUpdatesWithProducts> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/price/daily-changes?limit=${limit}&days=${days}`
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return TopPriceUpdateWithProductSchema.parse(data);
};

/**
 * Fetch paginated discounts.
 * @param limit - Maximum number of results to return.
 * @param offset - Number of results to skip for pagination.
 * @param days - Number of days to look back for price changes.
 * @returns A promise that resolves to a paginated response of discounts.
 * @throws Will throw an error if the fetch fails or if the data is invalid.
 */
export const fetchDiscountsApi = async (
  limit: number,
  offset: number,
  days: number
): Promise<PaginatedPriceUpdateWithProduct> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/price/discounts?limit=${limit}&offset=${offset}&days=${days}`
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return PaginatedPriceUpdateWithProductSchema.parse(data);
};

/**
 * Fetch paginated markups.
 * @param limit - Maximum number of results to return.
 * @param offset - Number of results to skip for pagination.
 * @param days - Number of days to look back for price changes.
 * @returns A promise that resolves to a paginated response of markups.
 * @throws Will throw an error if the fetch fails or if the data is invalid.
 */
export const fetchMarkupsApi = async (
  limit: number,
  offset: number,
  days: number
): Promise<PaginatedPriceUpdateWithProduct> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/price/markups?limit=${limit}&offset=${offset}&days=${days}`
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return PaginatedPriceUpdateWithProductSchema.parse(data);
};

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
    `${process.env.NEXT_PUBLIC_API_URL}/price/${productId}`
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return data.map((item: unknown) => DBPriceUpdateSchema.parse(item));
};

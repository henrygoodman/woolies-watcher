import { ProductIdentifier } from '@shared-types/api';

export const fetchProductUpdates = async (
  productIdentifiers: ProductIdentifier[]
) => {
  try {
    const response = await fetch('/api/product/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIdentifiers }),
    });

    if (!response.ok)
      throw new Error(`Error: ${response.status} ${response.statusText}`);

    return await response.json();
  } catch (err) {
    console.error('Error in fetchProductUpdates:', err);
    throw err;
  }
};

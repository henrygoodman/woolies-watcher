export const fetchProductUpdates = async (productIdentifiers: any[]) => {
  const response = await fetch('/api/product/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productIdentifiers }),
  });
  if (!response.ok)
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  return await response.json();
};

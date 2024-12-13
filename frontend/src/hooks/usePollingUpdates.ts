import { useEffect } from 'react';
import { Product } from '@shared-types/api';

export const usePollingUpdates = (
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  useEffect(() => {
    const pollForUpdates = async () => {
      try {
        const productsToUpdate = products.filter(
          (product) => product.image_url === null
        );

        if (productsToUpdate.length === 0) {
          return;
        }

        const productIdentifiers = productsToUpdate.map((product) => ({
          id: product.id,
          barcode: product.barcode,
          product_name: product.product_name,
        }));

        const response = await fetch('/api/product/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productIdentifiers }),
        });

        if (!response.ok) {
          console.error(
            `Polling failed: ${response.status} ${response.statusText}`
          );
          const errorResponse = await response.text();
          console.error('Server response:', errorResponse);
          return;
        }

        const updatedProducts: Product[] = await response.json();

        setProducts((prevProducts) =>
          prevProducts.map((product) => {
            const updatedProduct = updatedProducts.find(
              (p) =>
                (p.id === product.id && product.id !== 0) ||
                (p.barcode === product.barcode &&
                  p.product_name === product.product_name)
            );

            if (
              updatedProduct &&
              updatedProduct.image_url !== product.image_url
            ) {
              return {
                ...product,
                image_url: updatedProduct.image_url,
              };
            }

            return product;
          })
        );
      } catch (err) {
        console.error('Error polling for updates:', err);
      }
    };

    const interval = setInterval(pollForUpdates, 1000);

    return () => clearInterval(interval);
  }, [products, setProducts]);
};

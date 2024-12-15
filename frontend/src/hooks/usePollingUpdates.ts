import { useEffect, useRef } from 'react';
import { Product, ProductIdentifier } from '@shared-types/api';
import { fetchProductUpdates } from '@/lib/api/productApi';

export const usePollingUpdates = (
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  const productsRef = useRef(products);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    const pollForUpdates = async () => {
      try {
        const productsToUpdate = productsRef.current.filter(
          (product) => product.image_url === null
        );

        if (productsToUpdate.length === 0) return;

        const productIdentifiers: ProductIdentifier[] = productsToUpdate.map(
          (product) => ({
            id: product.id!,
            barcode: product.barcode!,
            product_name: product.product_name,
          })
        );

        const updatedProducts: Product[] =
          await fetchProductUpdates(productIdentifiers);

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

    const interval = setInterval(pollForUpdates, 2000);

    return () => clearInterval(interval);
  }, [setProducts]);
};

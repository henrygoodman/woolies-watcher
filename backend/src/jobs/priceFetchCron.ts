import cron from 'node-cron';
import watchlistRepository from '@/db/watchlistRepository';
import {
  fetchProductsByBarcode,
  fetchProductsByNameAndUrl,
} from '@/services/product/productService';

export const scheduleDailyProductUpdates = () => {
  cron.schedule(
    '0 2 * * *',
    async () => {
      console.log('Starting daily product update job...');

      let productsUpdated = 0;
      let errorsOccurred = 0;

      try {
        const watchedProducts = await watchlistRepository.getWatchedProducts();

        await Promise.all(
          watchedProducts.map(async (product) => {
            try {
              if (product.barcode) {
                const updatedProduct = await fetchProductsByBarcode(product);
                if (updatedProduct) productsUpdated++;
              } else {
                const updatedProduct = await fetchProductsByNameAndUrl(
                  product.product_name,
                  product.url!
                );
                if (updatedProduct) productsUpdated++;
              }
            } catch (error) {
              errorsOccurred++;
              console.error(
                `Error updating product: ${product.product_name}`,
                error
              );
            }
          })
        );

        console.log(
          `Daily product update job completed. Products updated: ${productsUpdated}, Errors: ${errorsOccurred}.`
        );
      } catch (error) {
        console.error(
          'Error during daily product update job initialization:',
          error
        );
      }
    },
    {
      scheduled: true,
      timezone: 'Australia/Sydney',
    }
  );
  console.log('Initialized priceFetchCron');
};

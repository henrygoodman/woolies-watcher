import cron from 'node-cron';
import watchlistRepository from '@/db/watchlistRepository';
import { fetchProductsByNameAndUrl } from '@/services/product/productService';
import { PRODUCT_UPDATE_CRON_UTC } from '@/constants/sync';

/**
 * Schedules a daily job to update product information in the watchlist.
 *
 * The job runs 30 minutes after the cutoff, which aligns with the cutoff time of 5 AM UTC for stale product data.
 * It updates products using either their barcode or name and URL, logging the results.
 */
export const scheduleDailyProductUpdates = () => {
  cron.schedule(
    PRODUCT_UPDATE_CRON_UTC,
    async () => {
      console.log('Starting daily product update job...');

      let productsUpdated = 0;
      let errorsOccurred = 0;

      try {
        const watchedProducts = await watchlistRepository.getWatchedProducts();

        await Promise.all(
          watchedProducts.map(async (product) => {
            try {
              const updatedProduct = await fetchProductsByNameAndUrl(
                product.product_name,
                product.url!
              );
              if (updatedProduct) productsUpdated++;
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
      timezone: 'UTC',
    }
  );
  console.log('Initialized priceFetchCron');
};

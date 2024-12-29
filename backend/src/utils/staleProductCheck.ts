import { CUTOFF_HOUR_UTC } from '@/constants/sync';

/**
 * Determines whether a product is considered stale based on its last updated timestamp.
 *
 * A product is stale if it was last updated before UTC cutoff of the most recent applicable day.
 * If the current time is before cutoff, the cutoff is from the previous day.
 *
 * (for reference, the priceFetch cron job runs at )
 *
 * @param lastUpdated - A string or Date representing the last updated timestamp of the product.
 * @returns A boolean value: `true` if the product is stale, `false` otherwise.
 */
export const isStaleProduct = (lastUpdated: string | Date): boolean => {
  const now = new Date();

  const cutoff = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      CUTOFF_HOUR_UTC
    )
  );
  if (now < cutoff) {
    cutoff.setUTCDate(cutoff.getUTCDate() - 1);
  }

  return new Date(lastUpdated) < cutoff;
};

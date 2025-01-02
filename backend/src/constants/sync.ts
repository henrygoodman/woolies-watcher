/**
 * The cutoff hour in UTC for determining stale products.
 * Products are considered stale if last updated before this time.
 * This is set to align just before the daily product update job runs.
 */
export const CUTOFF_HOUR_UTC = 17;

/**
 * Cron expression for the daily product update job.
 * Scheduled to run at 5:30 PM UTC, shortly after the 3rd party API updates prices.
 * This timing ensures that the cache is refreshed with the latest prices.
 */
export const PRODUCT_UPDATE_CRON_UTC = '30 17 * * *';

/**
 * Cutoff time in UTC for considering "daily" price increases and decreases.
 * This marks the start of the day for price change calculations, ensuring that
 * only price updates after this time are considered for the current day's increases/drops.
 * Typically set shortly after the daily product update cron completes (e.g., 6:00 PM UTC).
 */
export const PRICE_CHANGE_CUTOFF_TIME_UTC = '18:00';

/**
 * Cron expression for the daily watchlist email job.
 * Scheduled to run at 8:00 AM Australia/Sydney time (10 PM UTC).
 */
export const WATCHLIST_EMAIL_CRON_UTC = '0 22 * * *';

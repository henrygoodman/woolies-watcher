/**
 * The cutoff hour in UTC for determining stale products.
 * Products are considered stale if last updated before this time.
 * This should align with the schedule of the product update cron job.
 */
export const CUTOFF_HOUR_UTC = 17;

/**
 * Cron expression for the daily product update job.
 * Scheduled to run at 2:00 AM Australia/Sydney time (4 PM UTC).
 * This timing ensures updates occur just before the 5 PM UTC cutoff.
 */
export const PRODUCT_UPDATE_CRON = '0 2 * * *';

/**
 * Cron expression for the daily watchlist email job.
 * Scheduled to run at 8:00 AM Australia/Sydney time (10 PM UTC).
 */
export const WATCHLIST_EMAIL_CRON = '0 8 * * *';

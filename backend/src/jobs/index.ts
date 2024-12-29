import { scheduleDailyWatchlistEmails } from './emailCron';
import { scheduleDailyProductUpdates } from './priceFetchCron';

/**
 * Initialize all scheduled cron jobs.
 */
export const initializeCronJobs = () => {
  console.log('Initializing cron jobs...');
  scheduleDailyProductUpdates();
  scheduleDailyWatchlistEmails();
  console.log('All cron jobs initialized successfully.');
};

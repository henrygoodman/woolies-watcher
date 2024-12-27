import cron from 'node-cron';
import watchlistRepository from '@/db/watchlistRepository';
import { getEmailService } from '@/services/email/index';

export const scheduleDailyWatchlistEmails = () => {
  cron.schedule(
    '0 8 * * *',
    async () => {
      console.log('Starting daily watchlist email job...');

      let emailsSent = 0;
      let errorsOccurred = 0;

      try {
        const userWatchlists = await watchlistRepository.getAllUserWatchlists();

        await Promise.all(
          userWatchlists.map(async ({ email, watchlist }) => {
            console.log('Sending', email, watchlist);
            if (watchlist.length > 0) {
              try {
                await getEmailService().sendWatchlistEmail(email, watchlist);
                emailsSent++;
              } catch (error) {
                errorsOccurred++;
                console.error(`Error sending email to ${email}:`, error);
              }
            }
          })
        );

        console.log(
          `Daily watchlist email job completed. Emails sent: ${emailsSent}, Errors: ${errorsOccurred}.`
        );
      } catch (error) {
        console.error(
          'Error during daily watchlist email job initialization:',
          error
        );
      }
    },
    {
      scheduled: true,
      timezone: 'Australia/Sydney',
    }
  );
  console.log('Initialized emailCron');
};

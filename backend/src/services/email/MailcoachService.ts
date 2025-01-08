import axios from 'axios';
import { DBProduct } from '@shared-types/db';
import { generateWatchlistEmail } from './templates';
import { EmailService } from './EmailService';

export class MailcoachService implements EmailService {
  private apiUrl: string;
  private apiToken: string;
  private apiFromAddress: string;

  constructor() {
    const apiUrl = process.env.MAILCOACH_API_URL || '';
    const apiToken = process.env.MAILCOACH_API_TOKEN || '';
    const fromAddress = process.env.MAILCOACH_API_FROM || '';

    if (!apiUrl || !apiToken || !fromAddress) {
      throw new Error(
        'MAILCOACH_API_URL, MAILCOACH_API_TOKEN, and MAILCOACH_API_FROM must be provided'
      );
    }

    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
    this.apiFromAddress = fromAddress;
  }

  async sendWatchlistEmail(
    recipient: string,
    watchlist: (DBProduct & { old_price?: number })[]
  ): Promise<void> {
    const emailHtml = generateWatchlistEmail(watchlist);

    const payload = {
      to: recipient,
      from: `Woolies Watcher <${this.apiFromAddress}>`,
      subject: 'Your Daily Watchlist Update',
      html: emailHtml,
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/transactional-mails/send`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        console.error(
          `Unexpected response from Mailcoach API: ${response.status} ${response.statusText}`
        );
        throw new Error('Failed to send email.');
      }
    } catch (error) {
      console.error(`Error sending email to ${recipient}:`, error);
      throw new Error('Failed to send email.');
    }
  }
}

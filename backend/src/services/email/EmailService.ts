import { DBProduct } from '@shared-types/db';

export interface EmailService {
  sendWatchlistEmail(
    recipient: string,
    watchlist: (DBProduct & { old_price?: number })[]
  ): Promise<void>;
}

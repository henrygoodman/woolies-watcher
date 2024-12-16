import { DBProduct } from '@shared-types/db';

export interface WatchlistRequest {
  product_id: number;
}

export interface WatchlistRequest {
  product_id: number;
}

export interface WatchlistResponse {
  watchlist: DBProduct[];
}

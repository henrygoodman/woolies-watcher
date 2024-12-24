import { DBProduct } from '../db/product';

import { PaginatedResponse, PaginationParams } from '../common';

export interface ProductSearchRequest extends PaginationParams {
  query: string;
}

export type ProductSearchResponse = PaginatedResponse<DBProduct>;

export type ProductIdentifier = {
  product_name: string;
  url: string;
};

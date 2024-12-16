import { DBProduct } from '../db/product';

import { PaginatedResponse, PaginationParams } from '../common';

export interface ProductSearchRequest extends PaginationParams {
  query: string;
}

export type ProductSearchResponse = PaginatedResponse<DBProduct>;

export interface ProductUpdateRequest {
  productIdentifiers: Array<{
    id?: number;
    barcode?: string;
    product_name?: string;
  }>;
}

export interface ProductUpdateResponse {
  updatedProducts: DBProduct[];
}

export type ProductIdentifier = Pick<
  DBProduct,
  'id' | 'barcode' | 'product_name'
>;

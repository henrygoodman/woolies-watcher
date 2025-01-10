import { z } from 'zod';
import { DBProductSchema } from '../db/product';
import { PaginatedResponseSchema } from '@shared-types/common';

export const ProductIdentifierSchema = z.object({
  product_name: z.string(),
  url: z.string(),
});

export const ProductSearchRequestSchema = z.object({
  query: z.string(),
  page: z.number().min(1),
  size: z.number().min(1),
});

export const ProductSearchResponseSchema =
  PaginatedResponseSchema(DBProductSchema);

export type ProductIdentifier = z.infer<typeof ProductIdentifierSchema>;
export type ProductSearchRequest = z.infer<typeof ProductSearchRequestSchema>;
export type ProductSearchResponse = z.infer<typeof ProductSearchResponseSchema>;

import { z } from 'zod';
import { DBProductSchema } from '../db/product';

export const ProductIdentifierSchema = z.object({
  product_name: z.string(),
  url: z.string(),
});

export const ProductSearchRequestSchema = z.object({
  query: z.string(),
  page: z.number().min(1),
  size: z.number().min(1),
});

export const ProductSearchResponseSchema = z.object({
  results: z.array(DBProductSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
});

export type ProductIdentifier = z.infer<typeof ProductIdentifierSchema>;
export type ProductSearchRequest = z.infer<typeof ProductSearchRequestSchema>;
export type ProductSearchResponse = z.infer<typeof ProductSearchResponseSchema>;

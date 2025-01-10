import { z } from 'zod';
import { DBPriceUpdateSchema, DBProductSchema } from '@shared-types/db';
import { PaginatedResponseSchema } from '@shared-types/common';

export const PriceUpdateWithProductSchema = DBPriceUpdateSchema.extend({
  product: DBProductSchema,
}).omit({ product_id: true });

export const TopPriceUpdateWithProductSchema = z.object({
  topDiscounts: z.array(PriceUpdateWithProductSchema),
  topIncreases: z.array(PriceUpdateWithProductSchema),
});

export const PaginatedPriceUpdateWithProductSchema = PaginatedResponseSchema(
  PriceUpdateWithProductSchema
);

export type PriceUpdateWithProduct = z.infer<
  typeof PriceUpdateWithProductSchema
>;

export type TopPriceUpdatesWithProducts = z.infer<
  typeof TopPriceUpdateWithProductSchema
>;

export type PaginatedPriceUpdateWithProduct = z.infer<
  typeof PaginatedPriceUpdateWithProductSchema
>;

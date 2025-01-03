import { z } from 'zod';
import { DBPriceUpdateSchema, DBProductSchema } from '@shared-types/db';

export const PriceUpdateWithProductSchema = DBPriceUpdateSchema.extend({
  product: DBProductSchema,
}).omit({ product_id: true });

export const TopPriceUpdatesWithProductsSchema = z.object({
  topDiscounts: z.array(PriceUpdateWithProductSchema),
  topIncreases: z.array(PriceUpdateWithProductSchema),
});

export type PriceUpdateWithProduct = z.infer<
  typeof PriceUpdateWithProductSchema
>;
export type TopPriceUpdatesWithProducts = z.infer<
  typeof TopPriceUpdatesWithProductsSchema
>;

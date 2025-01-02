import { z } from 'zod';

export const DBPriceUpdateSchema = z.object({
  id: z.number().optional(),
  product_id: z.number(),
  old_price: z.number(),
  new_price: z.number(),
  updated_at: z.preprocess(
    (value) => (typeof value === 'string' ? new Date(value) : value),
    z.date()
  ) as z.ZodType<Date, z.ZodTypeDef, Date>,
});

export type DBPriceUpdate = z.infer<typeof DBPriceUpdateSchema>;
